import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { MessageSquare, Send, ArrowLeft, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useOnlinePresence } from '@/hooks/useOnlinePresence';

interface Conversation {
  id: string;
  other_user_id: string;
  other_user_name: string;
  other_user_avatar: string | null;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface CommunityMessagingProps {
  initialUserId?: string | null;
  onClose?: () => void;
}

export const CommunityMessaging = ({ initialUserId, onClose }: CommunityMessagingProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isOnline } = useOnlinePresence();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchConversations();
      if (initialUserId) {
        startConversationWith(initialUserId);
      }
    }
  }, [user, initialUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('community-messages-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `receiver_id=eq.${user.id}`
        },
        (payload) => {
          const newMsg = payload.new as Message;
          
          if (selectedConversation?.other_user_id === newMsg.sender_id) {
            setMessages(prev => [...prev, newMsg]);
            // The conversation is already open, so mark this message read right away
            // instead of leaving a stale unread badge until the user reopens it.
            supabase
              .from('direct_messages')
              .update({ is_read: true })
              .eq('id', newMsg.id)
              .then(() => fetchConversations());
          } else {
            fetchConversations();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, selectedConversation]);

  const fetchConversations = async () => {
    if (!user) return;
    
    try {
      const { data: allMessages } = await supabase
        .from('direct_messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (!allMessages) {
        setConversations([]);
        setLoading(false);
        return;
      }

      const conversationMap = new Map<string, any>();
      
      for (const msg of allMessages) {
        const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        
        if (!conversationMap.has(otherId)) {
          conversationMap.set(otherId, {
            other_user_id: otherId,
            last_message: msg.content,
            last_message_at: msg.created_at,
            unread_count: msg.receiver_id === user.id && !msg.is_read ? 1 : 0
          });
        } else if (msg.receiver_id === user.id && !msg.is_read) {
          conversationMap.get(otherId).unread_count++;
        }
      }

      const otherIds = Array.from(conversationMap.keys());
      const { data: profilesData } = otherIds.length > 0
        ? await supabase.from('profiles').select('user_id, display_name, avatar_url').in('user_id', otherIds)
        : { data: [] as { user_id: string; display_name: string; avatar_url: string | null }[] };

      const convos: Conversation[] = otherIds.map((otherId) => {
        const data = conversationMap.get(otherId);
        const profile = profilesData?.find(p => p.user_id === otherId);
        return {
          id: otherId,
          other_user_id: otherId,
          other_user_name: profile?.display_name || 'User',
          other_user_avatar: profile?.avatar_url || null,
          last_message: data.last_message,
          last_message_at: data.last_message_at,
          unread_count: data.unread_count,
        };
      });

      setConversations(convos.sort((a, b) => 
        new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
      ));
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const startConversationWith = async (userId: string) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, avatar_url')
      .eq('user_id', userId)
      .maybeSingle();

    const convo: Conversation = {
      id: userId,
      other_user_id: userId,
      other_user_name: profile?.display_name || 'User',
      other_user_avatar: profile?.avatar_url,
      last_message: '',
      last_message_at: new Date().toISOString(),
      unread_count: 0
    };

    setSelectedConversation(convo);
    fetchMessages(userId);
  };

  const fetchMessages = async (otherUserId: string) => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('direct_messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      setMessages(data || []);

      await supabase
        .from('direct_messages')
        .update({ is_read: true })
        .eq('sender_id', otherUserId)
        .eq('receiver_id', user.id);

      // Refresh conversations to update unread counts
      fetchConversations();

    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!user || !selectedConversation || !newMessage.trim()) return;

    try {
      const { data, error } = await supabase
        .from('direct_messages')
        .insert({
          sender_id: user.id,
          receiver_id: selectedConversation.other_user_id,
          content: newMessage.trim()
        })
        .select()
        .single();

      if (error) throw error;

      setMessages(prev => [...prev, data as Message]);
      setNewMessage('');
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({ title: 'Error sending message', variant: 'destructive' });
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    return date.toLocaleDateString();
  };

  if (!user) {
    return null;
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="h-4 w-4" />
            Messages
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-2 border-b flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setSelectedConversation(null)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="relative">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={selectedConversation.other_user_avatar || undefined} />
                  <AvatarFallback className="text-xs">{selectedConversation.other_user_name[0]}</AvatarFallback>
                </Avatar>
                <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background ${
                  isOnline(selectedConversation.other_user_id) ? 'bg-green-500' : 'bg-gray-400'
                }`} />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{selectedConversation.other_user_name}</p>
                <p className={`text-xs ${isOnline(selectedConversation.other_user_id) ? 'text-green-500' : 'text-muted-foreground'}`}>
                  {isOnline(selectedConversation.other_user_id) ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-2">
              <div className="space-y-2">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-2 rounded-lg text-sm ${
                        msg.sender_id === user.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p className={`text-[10px] mt-0.5 ${
                        msg.sender_id === user.id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}>
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-2 border-t flex gap-1">
              <Input
                placeholder="Type..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                className="h-8 text-sm"
              />
              <Button onClick={sendMessage} disabled={!newMessage.trim()} size="sm" className="h-8 w-8 p-0">
                <Send className="h-3 w-3" />
              </Button>
            </div>
          </>
        ) : (
          <ScrollArea className="flex-1">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground text-sm">Loading...</div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                No conversations yet
              </div>
            ) : (
              <div className="divide-y">
                {conversations.map((convo) => (
                  <button
                    key={convo.id}
                    onClick={() => {
                      setSelectedConversation(convo);
                      fetchMessages(convo.other_user_id);
                    }}
                    className="w-full p-2 flex items-center gap-2 hover:bg-muted/50 text-left transition-colors"
                  >
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={convo.other_user_avatar || undefined} />
                        <AvatarFallback className="text-xs">{convo.other_user_name[0]}</AvatarFallback>
                      </Avatar>
                      <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background ${
                        isOnline(convo.other_user_id) ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm truncate">
                          {convo.other_user_name}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatTime(convo.last_message_at)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {convo.last_message}
                      </p>
                    </div>
                    {convo.unread_count > 0 && (
                      <Badge variant="default" className="shrink-0 text-xs h-5 w-5 p-0 flex items-center justify-center">
                        {convo.unread_count}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
