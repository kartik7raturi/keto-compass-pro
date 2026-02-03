import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, Send, UserPlus, Settings, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface GroupChatProps {
  groupId: string;
  onBack: () => void;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  sender_profile?: {
    display_name: string;
    avatar_url: string;
  };
}

interface Member {
  user_id: string;
  role: string;
  profile?: {
    display_name: string;
    avatar_url: string;
  };
}

interface GroupInfo {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  member_count: number;
}

export const GroupChat = ({ groupId, onBack }: GroupChatProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [group, setGroup] = useState<GroupInfo | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [inviteUserId, setInviteUserId] = useState('');
  const [showMembers, setShowMembers] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchGroupData();
    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`group_messages:${groupId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'group_messages',
        filter: `group_id=eq.${groupId}`
      }, (payload) => {
        fetchMessages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchGroupData = async () => {
    try {
      const [{ data: groupData }, { data: membersData }] = await Promise.all([
        supabase.from('user_groups').select('*').eq('id', groupId).single(),
        supabase.from('group_members').select('user_id, role').eq('group_id', groupId)
      ]);

      setGroup(groupData);

      if (membersData && membersData.length > 0) {
        const userIds = membersData.map(m => m.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, display_name, avatar_url')
          .in('user_id', userIds);

        const membersWithProfiles = membersData.map(m => ({
          ...m,
          profile: profiles?.find(p => p.user_id === m.user_id)
        }));
        setMembers(membersWithProfiles);
      }
    } catch (error) {
      console.error('Error fetching group data:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const { data: messagesData } = await supabase
        .from('group_messages')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (messagesData && messagesData.length > 0) {
        const senderIds = [...new Set(messagesData.map(m => m.sender_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, display_name, avatar_url')
          .in('user_id', senderIds);

        const messagesWithProfiles = messagesData.map(msg => ({
          ...msg,
          sender_profile: profiles?.find(p => p.user_id === msg.sender_id)
        }));
        setMessages(messagesWithProfiles);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!user || !newMessage.trim()) return;

    try {
      await supabase.from('group_messages').insert({
        group_id: groupId,
        sender_id: user.id,
        content: newMessage.trim()
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({ title: 'Error sending message', variant: 'destructive' });
    }
  };

  const inviteUser = async () => {
    if (!user || !inviteUserId.trim()) return;

    try {
      await supabase.from('group_invites').insert({
        group_id: groupId,
        inviter_id: user.id,
        invitee_id: inviteUserId.trim()
      });

      toast({ title: 'Invite sent!' });
      setInviteUserId('');
    } catch (error) {
      console.error('Error sending invite:', error);
      toast({ title: 'Error sending invite', variant: 'destructive' });
    }
  };

  const isOwner = group?.owner_id === user?.id;

  if (loading) {
    return <div className="p-4 text-center">Loading chat...</div>;
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="py-3 border-b">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <CardTitle className="text-base">{group?.name}</CardTitle>
            <span className="text-xs text-muted-foreground">
              {group?.member_count} members
            </span>
          </div>
          <Dialog open={showMembers} onOpenChange={setShowMembers}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Users className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Group Members</DialogTitle>
              </DialogHeader>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {members.map((member) => (
                    <div key={member.user_id} className="flex items-center gap-3 p-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.profile?.avatar_url || ''} />
                        <AvatarFallback>
                          {member.profile?.display_name?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="flex-1">{member.profile?.display_name || 'Unknown'}</span>
                      {member.role === 'owner' && (
                        <span className="text-xs text-yellow-500">Owner</span>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
              {isOwner && (
                <div className="pt-4 border-t">
                  <label className="text-sm font-medium">Invite User (User ID)</label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={inviteUserId}
                      onChange={(e) => setInviteUserId(e.target.value)}
                      placeholder="Enter user ID..."
                    />
                    <Button onClick={inviteUser} size="icon">
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => {
              const isMe = message.sender_id === user?.id;
              return (
                <div
                  key={message.id}
                  className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}
                >
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={message.sender_profile?.avatar_url || ''} />
                    <AvatarFallback>
                      {message.sender_profile?.display_name?.[0] || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`max-w-[70%] ${isMe ? 'text-right' : ''}`}>
                    <span className="text-xs text-muted-foreground">
                      {message.sender_profile?.display_name || 'Unknown'}
                    </span>
                    <div className={`p-2 rounded-lg mt-1 ${
                      isMe 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        <div className="p-3 border-t flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <Button onClick={sendMessage} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
