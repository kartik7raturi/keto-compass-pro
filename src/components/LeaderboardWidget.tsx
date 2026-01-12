import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Medal, Crown, Flame, Star, Target, TrendingUp, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { UserProfileDialog } from '@/components/UserProfileDialog';

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  total_points: number;
  current_level: number;
  challenges_completed: number;
  current_streak: number;
}

const LeaderboardWidget = () => {
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'alltime'>('weekly');
  const [category, setCategory] = useState<'points' | 'challenges' | 'streaks'>('points');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingUser, setViewingUser] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchLeaderboard();
  }, [timeframe, category]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const now = new Date();
      let startDate: Date | null = null;
      
      if (timeframe === 'weekly') {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (timeframe === 'monthly') {
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('user_id, total_points, current_level')
        .order('total_points', { ascending: false })
        .limit(50);

      if (progressError) throw progressError;

      let challengeQuery = supabase
        .from('user_challenges')
        .select('user_id')
        .eq('is_completed', true);
      
      if (startDate) {
        challengeQuery = challengeQuery.gte('created_at', startDate.toISOString());
      }

      const { data: challengeData } = await challengeQuery;

      const challengeCounts: Record<string, number> = {};
      challengeData?.forEach(c => {
        challengeCounts[c.user_id] = (challengeCounts[c.user_id] || 0) + 1;
      });

      let streakQuery = supabase
        .from('keto_streaks')
        .select('user_id, date, completed')
        .eq('completed', true)
        .order('date', { ascending: false });

      if (startDate) {
        streakQuery = streakQuery.gte('date', startDate.toISOString().split('T')[0]);
      }

      const { data: streakData } = await streakQuery;

      const streakCounts: Record<string, number> = {};
      const userStreakDates: Record<string, string[]> = {};
      
      streakData?.forEach(s => {
        if (!userStreakDates[s.user_id]) {
          userStreakDates[s.user_id] = [];
        }
        userStreakDates[s.user_id].push(s.date);
      });

      Object.entries(userStreakDates).forEach(([userId, dates]) => {
        const sortedDates = dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
        let streak = 0;
        const today = new Date().toISOString().split('T')[0];
        
        for (let i = 0; i < sortedDates.length; i++) {
          const expectedDate = new Date(new Date(today).getTime() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          if (sortedDates.includes(expectedDate)) {
            streak++;
          } else {
            break;
          }
        }
        streakCounts[userId] = streak;
      });

      const allUserIds = new Set<string>();
      progressData?.forEach(p => allUserIds.add(p.user_id));
      Object.keys(challengeCounts).forEach(id => allUserIds.add(id));
      Object.keys(streakCounts).forEach(id => allUserIds.add(id));

      if (allUserIds.size === 0) {
        setLeaderboard([]);
        setLoading(false);
        return;
      }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', Array.from(allUserIds));

      const leaderboardData: LeaderboardEntry[] = Array.from(allUserIds).map(userId => {
        const profile = profiles?.find(p => p.user_id === userId);
        const progress = progressData?.find(p => p.user_id === userId);
        
        return {
          user_id: userId,
          display_name: profile?.display_name || 'Anonymous',
          avatar_url: profile?.avatar_url || null,
          total_points: progress?.total_points || 0,
          current_level: progress?.current_level || 1,
          challenges_completed: challengeCounts[userId] || 0,
          current_streak: streakCounts[userId] || 0,
        };
      });

      if (category === 'points') {
        leaderboardData.sort((a, b) => b.total_points - a.total_points);
      } else if (category === 'challenges') {
        leaderboardData.sort((a, b) => b.challenges_completed - a.challenges_completed);
      } else {
        leaderboardData.sort((a, b) => b.current_streak - a.current_streak);
      }

      setLeaderboard(leaderboardData.slice(0, 10));
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
    return <span className="w-5 text-center font-bold text-muted-foreground text-sm">{index + 1}</span>;
  };

  const getCategoryIcon = () => {
    switch (category) {
      case 'points': return <Star className="h-4 w-4 text-yellow-500" />;
      case 'challenges': return <Target className="h-4 w-4 text-green-500" />;
      case 'streaks': return <Flame className="h-4 w-4 text-orange-500" />;
    }
  };

  const getCategoryValue = (entry: LeaderboardEntry) => {
    switch (category) {
      case 'points': return `${entry.total_points} pts`;
      case 'challenges': return `${entry.challenges_completed}`;
      case 'streaks': return `${entry.current_streak}d`;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Category Selection */}
        <div className="flex flex-wrap gap-1 mb-4">
          <Button
            variant={category === 'points' ? 'default' : 'outline'}
            onClick={() => setCategory('points')}
            size="sm"
            className="gap-1 text-xs h-7"
          >
            <Star className="h-3 w-3" />
            Points
          </Button>
          <Button
            variant={category === 'challenges' ? 'default' : 'outline'}
            onClick={() => setCategory('challenges')}
            size="sm"
            className="gap-1 text-xs h-7"
          >
            <Target className="h-3 w-3" />
            Challenges
          </Button>
          <Button
            variant={category === 'streaks' ? 'default' : 'outline'}
            onClick={() => setCategory('streaks')}
            size="sm"
            className="gap-1 text-xs h-7"
          >
            <Flame className="h-3 w-3" />
            Streaks
          </Button>
        </div>

        <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as 'weekly' | 'monthly' | 'alltime')}>
          <TabsList className="grid w-full grid-cols-3 mb-4 h-8">
            <TabsTrigger value="weekly" className="text-xs gap-1">
              <Calendar className="h-3 w-3" />
              Week
            </TabsTrigger>
            <TabsTrigger value="monthly" className="text-xs gap-1">
              <TrendingUp className="h-3 w-3" />
              Month
            </TabsTrigger>
            <TabsTrigger value="alltime" className="text-xs gap-1">
              <Trophy className="h-3 w-3" />
              All
            </TabsTrigger>
          </TabsList>

          <TabsContent value={timeframe} className="mt-0">
            {loading ? (
              <div className="text-center py-6 text-muted-foreground text-sm">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                Loading...
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No data yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entry, index) => (
                  <button 
                    key={entry.user_id} 
                    onClick={() => setViewingUser(entry.user_id)}
                    className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors text-left ${
                      index === 0 ? 'bg-yellow-50 dark:bg-yellow-900/20' : 
                      index === 1 ? 'bg-gray-50 dark:bg-gray-800/50' : 
                      index === 2 ? 'bg-amber-50 dark:bg-amber-900/20' : 
                      'bg-muted/30 hover:bg-muted/50'
                    } ${entry.user_id === user?.id ? 'ring-1 ring-primary' : ''}`}
                  >
                    <div className="w-6 flex justify-center shrink-0">
                      {getRankIcon(index)}
                    </div>
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={entry.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">
                        {entry.display_name[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {entry.display_name}
                        {entry.user_id === user?.id && <span className="text-xs text-muted-foreground ml-1">(You)</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">Level {entry.current_level}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {getCategoryValue(entry)}
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      {viewingUser && (
        <UserProfileDialog
          open={!!viewingUser}
          onClose={() => setViewingUser(null)}
          userId={viewingUser}
        />
      )}
    </Card>
  );
};

export default LeaderboardWidget;
