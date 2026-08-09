import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, X, MessageCircle, Users, Bell } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface MessageRequest {
  id: string;
  sender_id: string;
  status: string;
  created_at: string;
  sender_profile?: {
    display_name: string;
    avatar_url: string;
  };
}

interface GroupInvite {
  id: string;
  group_id: string;
  inviter_id: string;
  status: string;
  created_at: string;
  group?: {
    name: string;
    image_url: string;
  };
  inviter_profile?: {
    display_name: string;
  };
}

interface MessageRequestsProps {
  onAcceptRequest?: (userId: string) => void;
}

export const MessageRequests = ({ onAcceptRequest }: MessageRequestsProps = {}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messageRequests, setMessageRequests] = useState<MessageRequest[]>([]);
  const [groupInvites, setGroupInvites] = useState<GroupInvite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    if (!user) return;

    try {
      // Fetch pending message requests
      const { data: msgRequests } = await supabase
        .from('message_requests')
        .select('*')
        .eq('receiver_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      // Fetch sender profiles
      if (msgRequests && msgRequests.length > 0) {
        const senderIds = msgRequests.map(r => r.sender_id);
        const { data: profiles } = await supabase
          .from('public_profiles')
          .select('user_id, display_name, avatar_url')
          .in('user_id', senderIds);

        const requestsWithProfiles = msgRequests.map(req => ({
          ...req,
          sender_profile: profiles?.find(p => p.user_id === req.sender_id)
        }));
        setMessageRequests(requestsWithProfiles);
      } else {
        setMessageRequests([]);
      }

      // Fetch pending group invites
      const { data: invites } = await supabase
        .from('group_invites')
        .select('*')
        .eq('invitee_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (invites && invites.length > 0) {
        const groupIds = invites.map(i => i.group_id);
        const inviterIds = invites.map(i => i.inviter_id);

        const [{ data: groups }, { data: profiles }] = await Promise.all([
          supabase.from('user_groups').select('id, name, image_url').in('id', groupIds),
          supabase.from('public_profiles').select('user_id, display_name').in('user_id', inviterIds)
        ]);

        const invitesWithData = invites.map(inv => ({
          ...inv,
          group: groups?.find(g => g.id === inv.group_id),
          inviter_profile: profiles?.find(p => p.user_id === inv.inviter_id)
        }));
        setGroupInvites(invitesWithData);
      } else {
        setGroupInvites([]);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMessageRequest = async (requestId: string, senderId: string, action: 'approved' | 'declined') => {
    try {
      await supabase
        .from('message_requests')
        .update({ 
          status: action, 
          responded_at: new Date().toISOString() 
        })
        .eq('id', requestId);

      toast({ title: action === 'approved' ? 'Message request approved!' : 'Message request declined' });
      
      if (action === 'approved' && onAcceptRequest) {
        onAcceptRequest(senderId);
      }
      
      fetchRequests();
    } catch (error) {
      toast({ title: 'Error updating request', variant: 'destructive' });
    }
  };

  const handleGroupInvite = async (inviteId: string, groupId: string, action: 'accepted' | 'declined') => {
    try {
      await supabase
        .from('group_invites')
        .update({ 
          status: action, 
          responded_at: new Date().toISOString() 
        })
        .eq('id', inviteId);

      // If accepted, add user to group
      if (action === 'accepted' && user) {
        await supabase
          .from('group_members')
          .insert({
            group_id: groupId,
            user_id: user.id,
            role: 'member'
          });
      }

      toast({ title: action === 'accepted' ? 'Joined group!' : 'Invite declined' });
      fetchRequests();
    } catch (error) {
      toast({ title: 'Error updating invite', variant: 'destructive' });
    }
  };

  const totalPending = messageRequests.length + groupInvites.length;

  if (loading) {
    return <div className="p-4 text-center text-muted-foreground">Loading requests...</div>;
  }

  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Requests
          {totalPending > 0 && (
            <Badge variant="destructive" className="ml-auto">{totalPending}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="py-2">
        <Tabs defaultValue="messages">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="messages" className="text-xs">
              <MessageCircle className="h-3 w-3 mr-1" />
              DMs ({messageRequests.length})
            </TabsTrigger>
            <TabsTrigger value="groups" className="text-xs">
              <Users className="h-3 w-3 mr-1" />
              Groups ({groupInvites.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="messages">
            <ScrollArea className="h-[200px]">
              {messageRequests.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">
                  No pending message requests
                </p>
              ) : (
                <div className="space-y-2">
                  {messageRequests.map((request) => (
                    <div key={request.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={request.sender_profile?.avatar_url || ''} />
                        <AvatarFallback>
                          {request.sender_profile?.display_name?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium truncate block">
                          {request.sender_profile?.display_name || 'Unknown'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          wants to message you
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-7 w-7"
                          onClick={() => handleMessageRequest(request.id, request.sender_id, 'approved')}
                        >
                          <Check className="h-4 w-4 text-green-500" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-7 w-7"
                          onClick={() => handleMessageRequest(request.id, request.sender_id, 'declined')}
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="groups">
            <ScrollArea className="h-[200px]">
              {groupInvites.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">
                  No pending group invites
                </p>
              ) : (
                <div className="space-y-2">
                  {groupInvites.map((invite) => (
                    <div key={invite.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={invite.group?.image_url || ''} />
                        <AvatarFallback>{invite.group?.name?.[0] || '?'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium truncate block">
                          {invite.group?.name || 'Unknown Group'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          invited by {invite.inviter_profile?.display_name || 'Unknown'}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-7 w-7"
                          onClick={() => handleGroupInvite(invite.id, invite.group_id, 'accepted')}
                        >
                          <Check className="h-4 w-4 text-green-500" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-7 w-7"
                          onClick={() => handleGroupInvite(invite.id, invite.group_id, 'declined')}
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
