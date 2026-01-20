import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
const ContactForm = () => {
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const [category, setCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: 'Please sign in to send a message',
        variant: 'destructive'
      });
      return;
    }
    if (!category || !subject || !message) {
      toast({
        title: 'Please fill in all fields',
        variant: 'destructive'
      });
      return;
    }
    setLoading(true);
    try {
      const {
        error
      } = await supabase.from('user_messages').insert({
        user_id: user.id,
        category,
        subject,
        message
      });
      if (error) throw error;
      toast({
        title: 'Message sent successfully! We\'ll get back to you soon.'
      });
      setCategory('');
      setSubject('');
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error sending message',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  return <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Send us a suggestion                                 
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recipes">Recipe Suggestions</SelectItem>
                <SelectItem value="suggestions">App Suggestions</SelectItem>
                <SelectItem value="issues">App Issues / Bugs</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Subject</label>
            <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Brief description of your query" />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Message</label>
            <Textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Tell us more details..." rows={4} />
          </div>

          <Button type="submit" className="w-full" disabled={loading || !user}>
            <Send className="h-4 w-4 mr-2" />
            {loading ? 'Sending...' : 'Send Message'}
          </Button>

          {!user && <p className="text-sm text-muted-foreground text-center">
              Please sign in to send a message
            </p>}
        </form>
      </CardContent>
    </Card>;
};
export default ContactForm;