import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, Plus, Search, UserPlus, MessageCircle, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Group {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  owner_id: string;
  is_public: boolean;
  member_count: number;
}

interface UserGroupsProps {
  onSelectGroup: (groupId: string) => void;
  selectedGroupId: string | null;
}

export const UserGroups = ({ onSelectGroup, selectedGroupId }: UserGroupsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [groups, setGroups] = useState<Group[]>([]);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');

  useEffect(() => {
    if (user) {
      fetchGroups();
    }
  }, [user]);

  const fetchGroups = async () => {
    if (!user) return;
    
    try {
      // Fetch all public groups
      const { data: publicGroups } = await supabase
        .from('user_groups')
        .select('*')
        .eq('is_public', true)
        .order('member_count', { ascending: false });

      // Fetch groups user is member of
      const { data: membershipData } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id);

      const memberGroupIds = membershipData?.map(m => m.group_id) || [];

      if (memberGroupIds.length > 0) {
        const { data: memberGroups } = await supabase
          .from('user_groups')
          .select('*')
          .in('id', memberGroupIds);
        
        setMyGroups(memberGroups || []);
      }

      setGroups(publicGroups || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async () => {
    if (!user || !newGroupName.trim()) return;

    try {
      const { data: newGroup, error } = await supabase
        .from('user_groups')
        .insert({
          name: newGroupName.trim(),
          description: newGroupDescription.trim() || null,
          owner_id: user.id,
          is_public: true,
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as first member
      await supabase
        .from('group_members')
        .insert({
          group_id: newGroup.id,
          user_id: user.id,
          role: 'owner'
        });

      toast({ title: 'Group created successfully!' });
      setCreateDialogOpen(false);
      setNewGroupName('');
      setNewGroupDescription('');
      fetchGroups();
    } catch (error) {
      console.error('Error creating group:', error);
      toast({ title: 'Error creating group', variant: 'destructive' });
    }
  };

  const joinGroup = async (groupId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: user.id,
          role: 'member'
        });

      toast({ title: 'Joined group successfully!' });
      fetchGroups();
    } catch (error) {
      console.error('Error joining group:', error);
      toast({ title: 'Error joining group', variant: 'destructive' });
    }
  };

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isInGroup = (groupId: string) => myGroups.some(g => g.id === groupId);

  if (loading) {
    return <div className="p-4 text-center text-muted-foreground">Loading groups...</div>;
  }

  return (
    <div className="space-y-4">
      {/* My Groups */}
      {myGroups.length > 0 && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              My Groups
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <ScrollArea className="h-[150px]">
              <div className="space-y-2">
                {myGroups.map((group) => (
                  <div
                    key={group.id}
                    onClick={() => onSelectGroup(group.id)}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                      selectedGroupId === group.id 
                        ? 'bg-primary/10 border border-primary' 
                        : 'hover:bg-muted'
                    }`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={group.image_url || ''} />
                      <AvatarFallback>{group.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium truncate">{group.name}</span>
                        {group.owner_id === user?.id && (
                          <Crown className="h-3 w-3 text-yellow-500" />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {group.member_count} members
                      </span>
                    </div>
                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Create Group Button */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Create New Group
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a New Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Group Name</label>
              <Input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Enter group name..."
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                placeholder="What's this group about?"
              />
            </div>
            <Button onClick={createGroup} className="w-full" disabled={!newGroupName.trim()}>
              Create Group
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Discover Groups */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm">Discover Groups</CardTitle>
        </CardHeader>
        <CardContent className="py-2 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search groups..."
              className="pl-9"
            />
          </div>
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {filteredGroups.map((group) => (
                <div
                  key={group.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={group.image_url || ''} />
                    <AvatarFallback>{group.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium truncate block">{group.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {group.member_count} members
                    </span>
                  </div>
                  {isInGroup(group.id) ? (
                    <Badge variant="secondary" className="text-xs">Joined</Badge>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={() => joinGroup(group.id)}>
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {filteredGroups.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-4">
                  No groups found
                </p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
