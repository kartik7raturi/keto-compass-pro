import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MessageSquare, Eye, Reply, Clock, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface UserMessage {
  id: string;
  user_id: string;
  category: string;
  subject: string;
  message: string;
  status: string;
  admin_response: string | null;
  created_at: string;
}

export const AdminMessages = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<UserMessage | null>(null);
  const [response, setResponse] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data } = await supabase
        .from('user_messages')
        .select('*')
        .order('created_at', { ascending: false });
      setMessages(data as UserMessage[] || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const openMessageDialog = (message: UserMessage) => {
    setSelectedMessage(message);
    setResponse(message.admin_response || '');
    setDialogOpen(true);
  };

  const sendResponse = async () => {
    if (!selectedMessage || !response.trim()) {
      toast({ title: 'Please enter a response', variant: 'destructive' });
      return;
    }

    try {
      const { error } = await supabase
        .from('user_messages')
        .update({ 
          admin_response: response,
          status: 'responded'
        })
        .eq('id', selectedMessage.id);

      if (error) throw error;

      // Get user email for notification
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, display_name')
        .eq('user_id', selectedMessage.user_id)
        .maybeSingle();

      // Send email notification via edge function
      if (profile?.email) {
        await supabase.functions.invoke('send-notification-email', {
          body: {
            to: profile.email,
            subject: `Response to: ${selectedMessage.subject}`,
            userName: profile.display_name || 'User',
            messageSubject: selectedMessage.subject,
            adminResponse: response,
          }
        });
      }

      // Create in-app notification
      await supabase.from('notifications').insert({
        user_id: selectedMessage.user_id,
        title: 'Response to Your Message',
        message: `We've responded to your message: "${selectedMessage.subject}"`,
        type: 'info',
      });

      toast({ title: 'Response sent successfully!' });
      setDialogOpen(false);
      fetchMessages();
    } catch (error) {
      console.error('Error sending response:', error);
      toast({ title: 'Error sending response', variant: 'destructive' });
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('user_messages')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      fetchMessages();
      toast({ title: `Status updated to ${status}` });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'recipes': return 'bg-green-100 text-green-800';
      case 'suggestions': return 'bg-blue-100 text-blue-800';
      case 'issues': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'responded': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading messages...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          User Messages
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.map((message) => (
              <TableRow key={message.id}>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(message.created_at), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  <Badge className={getCategoryColor(message.category)}>
                    {message.category}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium max-w-[200px] truncate">
                  {message.subject}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(message.status)}>
                    {message.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openMessageDialog(message)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    {message.status === 'pending' && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => updateStatus(message.id, 'in_progress')}
                      >
                        <Clock className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {messages.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No messages yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Message Details</DialogTitle>
            </DialogHeader>
            {selectedMessage && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Badge className={getCategoryColor(selectedMessage.category)}>
                    {selectedMessage.category}
                  </Badge>
                  <Badge className={getStatusColor(selectedMessage.status)}>
                    {selectedMessage.status}
                  </Badge>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Subject</label>
                  <p className="font-medium">{selectedMessage.subject}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Message</label>
                  <p className="text-sm bg-muted p-3 rounded-lg">{selectedMessage.message}</p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Your Response</label>
                  <Textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Type your response..."
                    rows={4}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={sendResponse} className="flex-1">
                    <Reply className="h-4 w-4 mr-2" />
                    Send Response
                  </Button>
                  {selectedMessage.status !== 'closed' && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        updateStatus(selectedMessage.id, 'closed');
                        setDialogOpen(false);
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Close
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};