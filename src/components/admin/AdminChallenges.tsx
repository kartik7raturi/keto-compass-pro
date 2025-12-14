import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Target, Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Challenge {
  id: string;
  title: string;
  description: string;
  duration_days: number;
  challenge_type: string;
  target_value: number | null;
  target_unit: string | null;
  reward_points: number;
  reward_badge_id: string | null;
}

interface Badge {
  id: string;
  name: string;
  icon: string;
}

export const AdminChallenges = () => {
  const { toast } = useToast();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationDays, setDurationDays] = useState('30');
  const [challengeType, setChallengeType] = useState('keto');
  const [targetValue, setTargetValue] = useState('');
  const [targetUnit, setTargetUnit] = useState('');
  const [rewardPoints, setRewardPoints] = useState('50');
  const [rewardBadgeId, setRewardBadgeId] = useState('');

  useEffect(() => {
    fetchChallenges();
    fetchBadges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const { data } = await supabase.from('challenges').select('*').order('created_at', { ascending: false });
      setChallenges(data as Challenge[] || []);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBadges = async () => {
    try {
      const { data } = await supabase.from('badges').select('id, name, icon');
      setBadges(data || []);
    } catch (error) {
      console.error('Error fetching badges:', error);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDurationDays('30');
    setChallengeType('keto');
    setTargetValue('');
    setTargetUnit('');
    setRewardPoints('50');
    setRewardBadgeId('');
    setEditingChallenge(null);
  };

  const openEditDialog = (challenge: Challenge) => {
    setEditingChallenge(challenge);
    setTitle(challenge.title);
    setDescription(challenge.description || '');
    setDurationDays(challenge.duration_days.toString());
    setChallengeType(challenge.challenge_type || 'keto');
    setTargetValue(challenge.target_value?.toString() || '');
    setTargetUnit(challenge.target_unit || '');
    setRewardPoints(challenge.reward_points?.toString() || '50');
    setRewardBadgeId(challenge.reward_badge_id || '');
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!title || !durationDays) {
      toast({ title: 'Please fill in required fields', variant: 'destructive' });
      return;
    }

    const challengeData = {
      title,
      description,
      duration_days: parseInt(durationDays),
      challenge_type: challengeType,
      target_value: targetValue ? parseFloat(targetValue) : null,
      target_unit: targetUnit || null,
      reward_points: parseInt(rewardPoints) || 50,
      reward_badge_id: rewardBadgeId || null,
    };

    try {
      if (editingChallenge) {
        const { error } = await supabase
          .from('challenges')
          .update(challengeData)
          .eq('id', editingChallenge.id);
        if (error) throw error;
        toast({ title: 'Challenge updated successfully!' });
      } else {
        const { error } = await supabase.from('challenges').insert(challengeData);
        if (error) throw error;
        toast({ title: 'Challenge created successfully!' });
      }

      setDialogOpen(false);
      resetForm();
      fetchChallenges();
    } catch (error) {
      console.error('Error saving challenge:', error);
      toast({ title: 'Error saving challenge', variant: 'destructive' });
    }
  };

  const deleteChallenge = async (id: string) => {
    if (!confirm('Are you sure you want to delete this challenge?')) return;

    try {
      const { error } = await supabase.from('challenges').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Challenge deleted successfully!' });
      fetchChallenges();
    } catch (error) {
      console.error('Error deleting challenge:', error);
      toast({ title: 'Error deleting challenge', variant: 'destructive' });
    }
  };

  const getChallengeTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'keto': return 'bg-orange-100 text-orange-800';
      case 'fasting': return 'bg-blue-100 text-blue-800';
      case 'workout': return 'bg-purple-100 text-purple-800';
      case 'water': return 'bg-cyan-100 text-cyan-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading challenges...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Manage Challenges
        </CardTitle>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Challenge
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingChallenge ? 'Edit Challenge' : 'Create New Challenge'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="text-sm font-medium mb-1 block">Title *</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Challenge title" />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Description</label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Challenge description" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Duration (days) *</label>
                  <Input type="number" value={durationDays} onChange={(e) => setDurationDays(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Type</label>
                  <Select value={challengeType} onValueChange={setChallengeType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="keto">Keto</SelectItem>
                      <SelectItem value="fasting">Fasting</SelectItem>
                      <SelectItem value="workout">Workout</SelectItem>
                      <SelectItem value="water">Water</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Target Value</label>
                  <Input type="number" value={targetValue} onChange={(e) => setTargetValue(e.target.value)} placeholder="e.g., 8" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Target Unit</label>
                  <Input value={targetUnit} onChange={(e) => setTargetUnit(e.target.value)} placeholder="e.g., glasses" />
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  Rewards
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Reward Points</label>
                    <Input type="number" value={rewardPoints} onChange={(e) => setRewardPoints(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Reward Badge</label>
                    <Select value={rewardBadgeId} onValueChange={setRewardBadgeId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select badge" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {badges.map(badge => (
                          <SelectItem key={badge.id} value={badge.id}>
                            {badge.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Button onClick={handleSubmit} className="w-full">
                {editingChallenge ? 'Update Challenge' : 'Create Challenge'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Reward</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {challenges.map((challenge) => (
              <TableRow key={challenge.id}>
                <TableCell className="font-medium">{challenge.title}</TableCell>
                <TableCell>
                  <Badge className={getChallengeTypeColor(challenge.challenge_type)}>
                    {challenge.challenge_type}
                  </Badge>
                </TableCell>
                <TableCell>{challenge.duration_days} days</TableCell>
                <TableCell>{challenge.reward_points} pts</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(challenge)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteChallenge(challenge.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {challenges.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No challenges yet. Create your first challenge!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};