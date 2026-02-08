import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Send, X, Headphones } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';

interface Message {
  id: string;
  message: string;
  is_from_support: boolean;
  created_at: string;
}

interface SupportChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportChat = ({ isOpen, onClose }: SupportChatProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && isOpen) {
      fetchMessages();
      
      // Subscribe to real-time updates
      const channel = supabase
        .channel('support-chat')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'support_chats',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            setMessages(prev => [...prev, payload.new as Message]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('support_chats')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    setMessages(data || []);
  };

  const sendMessage = async () => {
    if (!user || !newMessage.trim()) return;

    setSending(true);
    try {
      await supabase.from('support_chats').insert({
        user_id: user.id,
        message: newMessage.trim(),
        is_from_support: false
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 md:w-96">
      <Card className="shadow-2xl border-2">
        <CardHeader className="bg-primary text-primary-foreground rounded-t-lg py-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Headphones className="h-5 w-5" />
              24/7 Support Chat
            </CardTitle>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={onClose}
              className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs opacity-80">We typically reply in a few minutes</p>
        </CardHeader>
        
        <CardContent className="p-0">
          <ScrollArea className="h-80 p-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Start a conversation with our support team</p>
                <p className="text-xs mt-1">We're here to help 24/7!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.is_from_support ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`flex gap-2 max-w-[80%] ${msg.is_from_support ? '' : 'flex-row-reverse'}`}>
                      <Avatar className="h-7 w-7 shrink-0">
                        {msg.is_from_support ? (
                          <>
                            <AvatarImage src="/lovable-uploads/dc216a6c-e2aa-4f21-aea2-95bf0fc22104.png" />
                            <AvatarFallback>K</AvatarFallback>
                          </>
                        ) : (
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {user?.email?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div
                        className={`rounded-lg px-3 py-2 text-sm ${
                          msg.is_from_support
                            ? 'bg-muted'
                            : 'bg-primary text-primary-foreground'
                        }`}
                      >
                        {msg.message}
                        <div className={`text-[10px] mt-1 ${msg.is_from_support ? 'text-muted-foreground' : 'opacity-70'}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="p-3 border-t flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              disabled={sending}
              className="flex-1"
            />
            <Button 
              onClick={sendMessage} 
              disabled={sending || !newMessage.trim()}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const SupportChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  if (!user) return null;

  return (
    <>
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full shadow-lg"
          size="icon"
        >
          <Headphones className="h-6 w-6" />
        </Button>
      )}
      <SupportChat isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default SupportChat;
