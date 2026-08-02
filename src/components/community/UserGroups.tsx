import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, Plus, Search, UserPlus, MessageCircle, Crown, Edit, Trash2, Upload, Link2 } from 'lucide-react';
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
  onSelectGroup: (groupId: string | null) => void;
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
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [groupImageFile, setGroupImageFile] = useState<File | null>(null);
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupDescription, setEditGroupDescription] = useState('');
  const [editGroupImageFile, setEditGroupImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (user) fetchGroups();
  }, [user]);

  const fetchGroups = async () => {
    if (!user) return;
    try {
      const { data: publicGroups } = await supabase
        .from('user_groups').select('*').eq('is_public', true)
        .order('member_count', { ascending: false });

      const { data: membershipData } = await supabase
        .from('group_members').select('group_id').eq('user_id', user.id);

      const memberGroupIds = membershipData?.map(m => m.group_id) || [];
      if (memberGroupIds.length > 0) {
        const { data: memberGroups } = await supabase
          .from('user_groups').select('*').in('id', memberGroupIds);
        setMyGroups(memberGroups || []);
      } else {
        setMyGroups([]);
      }
      setGroups(publicGroups || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadGroupImage = async (file: File): Promise<string | null> => {
    if (!user) return null;
    const ext = file.name.split('.').pop();
    const path = `groups/${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('community-media').upload(path, file);
    if (error) { toast({ title: 'Image upload failed', variant: 'destructive' }); return null; }
    const { data } = supabase.storage.from('community-media').getPublicUrl(path);
    return data.publicUrl;
  };

  const createGroup = async () => {
    if (!user || !newGroupName.trim()) return;
    try {
      let imageUrl: string | null = null;
      if (groupImageFile) imageUrl = await uploadGroupImage(groupImageFile);

      const { data: newGroup, error } = await supabase
        .from('user_groups')
        .insert({
          name: newGroupName.trim(),
          description: newGroupDescription.trim() || null,
          image_url: imageUrl,
          owner_id: user.id,
          is_public: true,
        })
        .select()
        .single();

      if (error) throw error;

      await supabase.from('group_members').insert({
        group_id: newGroup.id, user_id: user.id, role: 'owner'
      });

      toast({ title: 'Group created successfully!' });
      setCreateDialogOpen(false);
      setNewGroupName('');
      setNewGroupDescription('');
      setGroupImageFile(null);
      fetchGroups();
    } catch (error: any) {
      console.error('Error creating group:', error);
      toast({ title: 'Error creating group', description: error.message, variant: 'destructive' });
    }
  };

  const openEditGroup = (group: Group) => {
    setEditingGroup(group);
    setEditGroupName(group.name);
    setEditGroupDescription(group.description || '');
    setEditGroupImageFile(null);
    setEditDialogOpen(true);
  };

  const updateGroup = async () => {
    if (!user || !editingGroup || !editGroupName.trim()) return;
    try {
      let imageUrl = editingGroup.image_url;
      if (editGroupImageFile) {
        const newUrl = await uploadGroupImage(editGroupImageFile);
        if (newUrl) imageUrl = newUrl;
      }
      const { error } = await supabase.from('user_groups').update({
        name: editGroupName.trim(),
        description: editGroupDescription.trim() || null,
        image_url: imageUrl,
      }).eq('id', editingGroup.id);
      if (error) throw error;
      toast({ title: 'Group updated!' });
      setEditDialogOpen(false);
      setEditingGroup(null);
      fetchGroups();
    } catch (error: any) {
      toast({ title: 'Error updating group', description: error.message, variant: 'destructive' });
    }
  };

  const deleteGroup = async (groupId: string) => {
    if (!user) return;
    if (!window.confirm('Delete this group permanently? This removes it for all members and cannot be undone.')) return;
    try {
      // Delete members first, then group
      await supabase.from('group_members').delete().eq('group_id', groupId);
      await supabase.from('user_groups').delete().eq('id', groupId);
      toast({ title: 'Group deleted' });
      fetchGroups();
    } catch (error) {
      toast({ title: 'Error deleting group', variant: 'destructive' });
    }
  };

  const joinGroup = async (groupId: string) => {
    if (!user) return;
    try {
      await supabase.from('group_members').insert({ group_id: groupId, user_id: user.id, role: 'member' });
      toast({ title: 'Joined group successfully!' });
      fetchGroups();
    } catch (error) {
      toast({ title: 'Error joining group', variant: 'destructive' });
    }
  };

  const leaveGroup = async (groupId: string) => {
    if (!user) return;
    if (!window.confirm('Leave this group?')) return;
    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user.id);
      if (error) throw error;
      toast({ title: 'Left group' });
      if (selectedGroupId === groupId) onSelectGroup(null);
      fetchGroups();
    } catch (error) {
      toast({ title: 'Error leaving group', variant: 'destructive' });
    }
  };

  const copyInviteLink = (groupId: string) => {
    const link = `${window.location.origin}/community/join/${groupId}`;
    navigator.clipboard.writeText(link);
    toast({ title: 'Invite link copied!', description: 'Share it with friends to invite them to the group.' });
  };

  const filteredGroups = groups.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const isInGroup = (groupId: string) => myGroups.some(g => g.id === groupId);

  if (loading) return <div className="p-4 text-center text-muted-foreground">Loading groups...</div>;

  return (
    <div className="space-y-4">
      {myGroups.length > 0 && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4" />My Groups</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <ScrollArea className="h-[150px]">
              <div className="space-y-2">
                {myGroups.map((group) => (
                  <div key={group.id} onClick={() => onSelectGroup(group.id)}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${selectedGroupId === group.id ? 'bg-primary/10 border border-primary' : 'hover:bg-muted'}`}>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={group.image_url || ''} />
                      <AvatarFallback>{group.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium truncate">{group.name}</span>
                        {group.owner_id === user?.id && <Crown className="h-3 w-3 text-yellow-500" />}
                      </div>
                      <span className="text-xs text-muted-foreground">{group.member_count} members</span>
                    </div>
                    {group.is_public && (
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0" title="Copy invite link" onClick={(e) => { e.stopPropagation(); copyInviteLink(group.id); }}>
                        <Link2 className="h-3 w-3" />
                      </Button>
                    )}
                    {group.owner_id === user?.id ? (
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={(e) => { e.stopPropagation(); openEditGroup(group); }}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive" onClick={(e) => { e.stopPropagation(); deleteGroup(group.id); }}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="ghost" className="h-6 px-2 text-xs text-muted-foreground" onClick={(e) => { e.stopPropagation(); leaveGroup(group.id); }}>
                        Leave
                      </Button>
                    )}
                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Create Group */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full" variant="outline"><Plus className="h-4 w-4 mr-2" />Create New Group</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader><DialogTitle>Create a New Group</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Group Image</label>
              <label className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-muted transition-colors mt-1">
                <Upload className="h-4 w-4" />
                <span className="text-sm">{groupImageFile ? groupImageFile.name : 'Upload Image'}</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setGroupImageFile(e.target.files?.[0] || null)} />
              </label>
            </div>
            <div>
              <label className="text-sm font-medium">Group Name</label>
              <Input value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} placeholder="Enter group name..." />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea value={newGroupDescription} onChange={(e) => setNewGroupDescription(e.target.value)} placeholder="What's this group about?" />
            </div>
            <Button onClick={createGroup} className="w-full" disabled={!newGroupName.trim()}>Create Group</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Group */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Group</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Group Image</label>
              <label className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-muted transition-colors mt-1">
                <Upload className="h-4 w-4" />
                <span className="text-sm">{editGroupImageFile ? editGroupImageFile.name : 'Change Image'}</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setEditGroupImageFile(e.target.files?.[0] || null)} />
              </label>
            </div>
            <div>
              <label className="text-sm font-medium">Group Name</label>
              <Input value={editGroupName} onChange={(e) => setEditGroupName(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea value={editGroupDescription} onChange={(e) => setEditGroupDescription(e.target.value)} />
            </div>
            <Button onClick={updateGroup} className="w-full" disabled={!editGroupName.trim()}>Update Group</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Discover Groups */}
      <Card>
        <CardHeader className="py-3"><CardTitle className="text-sm">Discover Groups</CardTitle></CardHeader>
        <CardContent className="py-2 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search groups..." className="pl-9" />
          </div>
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {filteredGroups.map((group) => (
                <div key={group.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={group.image_url || ''} />
                    <AvatarFallback>{group.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium truncate block">{group.name}</span>
                    <span className="text-xs text-muted-foreground">{group.member_count} members</span>
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
              {filteredGroups.length === 0 && <p className="text-center text-sm text-muted-foreground py-4">No groups found</p>}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
