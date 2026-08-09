import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Crown, Flame, Timer, Dumbbell, Droplet } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  points: number;
  challenges_completed: number;
}

interface ChallengeLeaderboardProps {
  category?: string;
}

const ChallengeLeaderboard = ({ category = 'all' }: ChallengeLeaderboardProps) => {
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly'>('monthly');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();

    const channel = supabase
      .channel('leaderboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_challenges' }, () => fetchLeaderboard())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'challenge_daily_logs' }, () => fetchLeaderboard())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [category, timeframe]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const startDate = timeframe === 'weekly'
        ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        : new Date(now.getFullYear(), now.getMonth(), 1);

      const { data: completedChallenges } = await supabase
        .from('user_challenges')
        .select('user_id, challenge_id, is_completed, challenges(challenge_type, reward_points)')
        .eq('is_completed', true)
        .gte('created_at', startDate.toISOString());

      const filtered = category === 'all'
        ? completedChallenges
        : completedChallenges?.filter((c: any) => c.challenges?.challenge_type?.toLowerCase() === category);

      const userStats: Record<string, { points: number; count: number }> = {};
      filtered?.forEach((c: any) => {
        if (!userStats[c.user_id]) userStats[c.user_id] = { points: 0, count: 0 };
        userStats[c.user_id].points += c.challenges?.reward_points || 50;
        userStats[c.user_id].count += 1;
      });

      const userIds = Object.keys(userStats);
      if (userIds.length === 0) { setLeaderboard([]); setLoading(false); return; }

      const { data: profiles } = await supabase
        .from('public_profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', userIds);

      const leaderboardData: LeaderboardEntry[] = profiles?.map(p => ({
        user_id: p.user_id,
        display_name: p.display_name || 'Anonymous',
        avatar_url: p.avatar_url,
        points: userStats[p.user_id]?.points || 0,
        challenges_completed: userStats[p.user_id]?.count || 0,
      })) || [];

      leaderboardData.sort((a, b) => b.points - a.points);
      // Top 5 only per spec
      setLeaderboard(leaderboardData.slice(0, 5));
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (index === 1) return <Medal className="h-5 w-5 text-gray-400" />;
    if (index === 2) return <Medal className="h-5 w-5 text-amber-600" />;
    return <span className="w-5 text-center font-bold text-muted-foreground">{index + 1}</span>;
  };

  const getCategoryIcon = () => {
    switch (category) {
      case 'keto': return <Flame className="h-5 w-5 text-orange-500" />;
      case 'fasting': return <Timer className="h-5 w-5 text-blue-500" />;
      case 'workout': return <Dumbbell className="h-5 w-5 text-purple-500" />;
      case 'water': return <Droplet className="h-5 w-5 text-cyan-500" />;
      default: return <Trophy className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {getCategoryIcon()}
          <span className="capitalize">{category === 'all' ? 'Overall' : category} Leaderboard</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as 'weekly' | 'monthly')}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="weekly">This Week</TabsTrigger>
            <TabsTrigger value="monthly">This Month</TabsTrigger>
          </TabsList>

          <TabsContent value="weekly" className="mt-0">
            <LeaderboardList entries={leaderboard} loading={loading} getRankIcon={getRankIcon} />
          </TabsContent>
          <TabsContent value="monthly" className="mt-0">
            <LeaderboardList entries={leaderboard} loading={loading} getRankIcon={getRankIcon} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

interface LeaderboardListProps {
  entries: LeaderboardEntry[];
  loading: boolean;
  getRankIcon: (index: number) => React.ReactNode;
}

const LeaderboardList = ({ entries, loading, getRankIcon }: LeaderboardListProps) => {
  if (loading) {
    return <div className="text-center py-4 text-muted-foreground">Loading...</div>;
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No participants yet. Be the first!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry, index) => (
        <div 
          key={entry.user_id} 
          className={`flex items-center gap-3 p-2 rounded-lg ${
            index === 0 ? 'bg-yellow-50 dark:bg-yellow-900/20' : 
            index === 1 ? 'bg-gray-50 dark:bg-gray-800/50' : 
            index === 2 ? 'bg-amber-50 dark:bg-amber-900/20' : ''
          }`}
        >
          <div className="w-6 flex justify-center">{getRankIcon(index)}</div>
          <Avatar className="h-8 w-8">
            <AvatarImage src={entry.avatar_url || undefined} />
            <AvatarFallback className="text-xs">{entry.display_name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{entry.display_name}</p>
            <p className="text-xs text-muted-foreground">
              {entry.challenges_completed} challenge{entry.challenges_completed !== 1 ? 's' : ''}
            </p>
          </div>
          <Badge variant="secondary" className="shrink-0">{entry.points} pts</Badge>
        </div>
      ))}
    </div>
  );
};

export default ChallengeLeaderboard;
