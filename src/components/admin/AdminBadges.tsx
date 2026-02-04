import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Award, Star, Trophy, Medal, Target, Flame, Zap, Crown, Heart, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Badge {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  badge_type: string;
  requirement_type: string | null;
  requirement_value: number | null;
}

const ICON_OPTIONS = [
  { value: 'award', label: 'Award', icon: Award },
  { value: 'star', label: 'Star', icon: Star },
  { value: 'trophy', label: 'Trophy', icon: Trophy },
  { value: 'medal', label: 'Medal', icon: Medal },
  { value: 'target', label: 'Target', icon: Target },
  { value: 'flame', label: 'Flame', icon: Flame },
  { value: 'zap', label: 'Zap', icon: Zap },
  { value: 'crown', label: 'Crown', icon: Crown },
  { value: 'heart', label: 'Heart', icon: Heart },
  { value: 'sparkles', label: 'Sparkles', icon: Sparkles },
];

const getIconComponent = (iconName: string) => {
  const iconOption = ICON_OPTIONS.find(opt => opt.value === iconName);
  if (iconOption) {
    const IconComponent = iconOption.icon;
    return <IconComponent className="h-5 w-5" />;
  }
  return <Award className="h-5 w-5" />;
};

export const AdminBadges = () => {
  const { toast } = useToast();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('award');
  const [badgeType, setBadgeType] = useState('achievement');
  const [requirementType, setRequirementType] = useState('');
  const [requirementValue, setRequirementValue] = useState('');

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const { data } = await supabase.from('badges').select('*').order('created_at', { ascending: false });
      setBadges(data || []);
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setIcon('award');
    setBadgeType('achievement');
    setRequirementType('');
    setRequirementValue('');
    setEditingBadge(null);
  };

  const openEditDialog = (badge: Badge) => {
    setEditingBadge(badge);
    setName(badge.name);
    setDescription(badge.description || '');
    setIcon(badge.icon);
    setBadgeType(badge.badge_type);
    setRequirementType(badge.requirement_type || '');
    setRequirementValue(badge.requirement_value?.toString() || '');
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!name) {
      toast({ title: 'Please enter a badge name', variant: 'destructive' });
      return;
    }

    const badgeData = {
      name,
      description: description || null,
      icon,
      badge_type: badgeType,
      requirement_type: requirementType || null,
      requirement_value: requirementValue ? parseInt(requirementValue) : null,
    };

    try {
      if (editingBadge) {
        const { error } = await supabase
          .from('badges')
          .update(badgeData)
          .eq('id', editingBadge.id);
        if (error) throw error;
        toast({ title: 'Badge updated successfully!' });
      } else {
        const { error } = await supabase.from('badges').insert(badgeData);
        if (error) throw error;
        toast({ title: 'Badge created successfully!' });
      }

      setDialogOpen(false);
      resetForm();
      fetchBadges();
    } catch (error) {
      console.error('Error saving badge:', error);
      toast({ title: 'Error saving badge', variant: 'destructive' });
    }
  };

  const deleteBadge = async (id: string) => {
    if (!confirm('Are you sure you want to delete this badge?')) return;

    try {
      const { error } = await supabase.from('badges').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Badge deleted successfully!' });
      fetchBadges();
    } catch (error) {
      console.error('Error deleting badge:', error);
      toast({ title: 'Error deleting badge', variant: 'destructive' });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading badges...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Manage Badges
        </CardTitle>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Badge
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingBadge ? 'Edit Badge' : 'Create New Badge'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Name *</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Badge name" />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Description</label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Badge description" />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Icon</label>
                <div className="grid grid-cols-5 gap-2">
                  {ICON_OPTIONS.map(opt => {
                    const IconComp = opt.icon;
                    return (
                      <Button
                        key={opt.value}
                        type="button"
                        variant={icon === opt.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setIcon(opt.value)}
                        className="flex flex-col items-center p-2 h-auto"
                      >
                        <IconComp className="h-5 w-5 mb-1" />
                        <span className="text-xs">{opt.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Badge Type</label>
                  <Select value={badgeType} onValueChange={setBadgeType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="achievement">Achievement</SelectItem>
                      <SelectItem value="challenge">Challenge</SelectItem>
                      <SelectItem value="streak">Streak</SelectItem>
                      <SelectItem value="milestone">Milestone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Requirement Type</label>
                  <Select value={requirementType || "none"} onValueChange={(val) => setRequirementType(val === "none" ? "" : val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="days_completed">Days Completed</SelectItem>
                      <SelectItem value="challenges_completed">Challenges Completed</SelectItem>
                      <SelectItem value="weight_lost">Weight Lost</SelectItem>
                      <SelectItem value="posts_created">Posts Created</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {requirementType && (
                <div>
                  <label className="text-sm font-medium mb-1 block">Requirement Value</label>
                  <Input 
                    type="number" 
                    value={requirementValue} 
                    onChange={(e) => setRequirementValue(e.target.value)} 
                    placeholder="e.g., 7 for 7 days" 
                  />
                </div>
              )}

              <Button onClick={handleSubmit} className="w-full">
                {editingBadge ? 'Update Badge' : 'Create Badge'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Icon</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Type</TableHead>
                <TableHead className="hidden md:table-cell">Requirement</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {badges.map((badge) => (
                <TableRow key={badge.id}>
                  <TableCell>{getIconComponent(badge.icon)}</TableCell>
                  <TableCell className="font-medium">{badge.name}</TableCell>
                  <TableCell className="hidden md:table-cell capitalize">{badge.badge_type}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {badge.requirement_type ? `${badge.requirement_value} ${badge.requirement_type.replace('_', ' ')}` : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(badge)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteBadge(badge.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {badges.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No badges yet. Create your first badge!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
