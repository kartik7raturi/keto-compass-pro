import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Send, Users, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SupportConversation {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  email: string | null;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

interface SupportMessage {
  id: string;
  message: string;
  is_from_support: boolean;
  created_at: string;
}

export const AdminSupportChats = () => {
  const { toast } = useToast();
  const [conversations, setConversations] = useState<SupportConversation[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      fetchMessages(selectedUserId);
    }
  }, [selectedUserId]);

  const fetchConversations = async () => {
    try {
      // Get all support chats grouped by user
      const { data: chats } = await supabase
        .from('support_chats')
        .select('user_id, message, created_at, is_from_support')
        .order('created_at', { ascending: false });

      if (!chats || chats.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      // Group by user and get latest message
      const userMap = new Map<string, { last_message: string; last_message_time: string; unread_count: number }>();
      
      chats.forEach(chat => {
        if (!userMap.has(chat.user_id)) {
          userMap.set(chat.user_id, {
            last_message: chat.message,
            last_message_time: chat.created_at,
            unread_count: 0
          });
        }
        // Count unread messages from users
        if (!chat.is_from_support) {
          const existing = userMap.get(chat.user_id)!;
          existing.unread_count++;
        }
      });

      // Fetch user profiles
      const userIds = Array.from(userMap.keys());
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url, email')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      const conversationList: SupportConversation[] = userIds.map(userId => {
        const profile = profileMap.get(userId);
        const chatInfo = userMap.get(userId)!;
        return {
          user_id: userId,
          display_name: profile?.display_name || null,
          avatar_url: profile?.avatar_url || null,
          email: profile?.email || null,
          ...chatInfo
        };
      });

      setConversations(conversationList.sort((a, b) => 
        new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime()
      ));
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId: string) => {
    const { data } = await supabase
      .from('support_chats')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    setMessages(data || []);
  };

  const sendMessage = async () => {
    if (!selectedUserId || !newMessage.trim()) return;

    setSending(true);
    try {
      // Admins insert with their own auth but set user_id to the conversation user
      // We need to use a different approach - insert as the user but mark is_from_support
      const { error } = await supabase.from('support_chats').insert({
        user_id: selectedUserId,
        message: newMessage.trim(),
        is_from_support: true
      });

      if (error) throw error;

      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        message: newMessage.trim(),
        is_from_support: true,
        created_at: new Date().toISOString()
      }]);
      setNewMessage('');
      toast({ title: 'Reply sent!' });
    } catch (error: any) {
      toast({ title: 'Error sending reply', description: error.message, variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading support chats...</div>;
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Conversations List */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Support Conversations
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            {conversations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No support conversations yet
              </div>
            ) : (
              <div className="divide-y">
                {conversations.map((conv) => (
                  <button
                    key={conv.user_id}
                    onClick={() => setSelectedUserId(conv.user_id)}
                    className={`w-full p-3 text-left hover:bg-muted transition-colors ${
                      selectedUserId === conv.user_id ? 'bg-muted' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conv.avatar_url || ''} />
                        <AvatarFallback>{conv.display_name?.[0] || conv.email?.[0] || '?'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-sm truncate">
                            {conv.display_name || conv.email || 'Unknown User'}
                          </span>
                          {conv.unread_count > 0 && (
                            <Badge variant="destructive" className="text-[10px] h-5 px-1.5">
                              {conv.unread_count}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {conv.last_message}
                        </p>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          {new Date(conv.last_message_time).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Window */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-3 border-b">
          {selectedUserId ? (
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={conversations.find(c => c.user_id === selectedUserId)?.avatar_url || ''} />
                <AvatarFallback>
                  {conversations.find(c => c.user_id === selectedUserId)?.display_name?.[0] || '?'}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base">
                  {conversations.find(c => c.user_id === selectedUserId)?.display_name || 'User'}
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {conversations.find(c => c.user_id === selectedUserId)?.email}
                </p>
              </div>
            </div>
          ) : (
            <CardTitle className="text-base text-muted-foreground">
              Select a conversation
            </CardTitle>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {selectedUserId ? (
            <>
              <ScrollArea className="h-[400px] p-4">
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.is_from_support ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${
                          msg.is_from_support
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        {msg.message}
                        <div className={`text-[10px] mt-1 ${msg.is_from_support ? 'opacity-70' : 'text-muted-foreground'}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="p-3 border-t flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your reply..."
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  disabled={sending}
                />
                <Button onClick={sendMessage} disabled={sending || !newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="h-[450px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Select a conversation to view messages</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
