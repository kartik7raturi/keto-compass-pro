import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Medal, Crown, Flame, Star, Target, TrendingUp, Calendar, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { UserProfileDialog } from '@/components/UserProfileDialog';

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  total_points: number;
  current_level: number;
  challenges_completed: number;
  current_streak: number;
  weight_lost: number;
}

const Leaderboard = () => {
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'alltime'>('weekly');
  const [category, setCategory] = useState<'points' | 'challenges' | 'streaks' | 'weight_loss'>('points');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingUser, setViewingUser] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

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

      // Get user progress data
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('user_id, total_points, current_level')
        .order('total_points', { ascending: false })
        .limit(50);

      if (progressError) throw progressError;

      // Get challenge completion counts
      let challengeQuery = supabase
        .from('user_challenges')
        .select('user_id')
        .eq('is_completed', true);
      
      if (startDate) {
        challengeQuery = challengeQuery.gte('created_at', startDate.toISOString());
      }

      const { data: challengeData } = await challengeQuery;

      // Aggregate challenge completions
      const challengeCounts: Record<string, number> = {};
      challengeData?.forEach(c => {
        challengeCounts[c.user_id] = (challengeCounts[c.user_id] || 0) + 1;
      });

      // Get keto streaks for streak calculation
      let streakQuery = supabase
        .from('keto_streaks')
        .select('user_id, date, completed')
        .eq('completed', true)
        .order('date', { ascending: false });

      if (startDate) {
        streakQuery = streakQuery.gte('date', startDate.toISOString().split('T')[0]);
      }

      const { data: streakData } = await streakQuery;

      // Calculate streaks per user
      const streakCounts: Record<string, number> = {};
      const userStreakDates: Record<string, string[]> = {};
      
      streakData?.forEach(s => {
        if (!userStreakDates[s.user_id]) {
          userStreakDates[s.user_id] = [];
        }
        userStreakDates[s.user_id].push(s.date);
      });

      // Calculate current streak for each user
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

      // Get all unique user IDs
      const allUserIds = new Set<string>();
      progressData?.forEach(p => allUserIds.add(p.user_id));
      Object.keys(challengeCounts).forEach(id => allUserIds.add(id));
      Object.keys(streakCounts).forEach(id => allUserIds.add(id));

      if (allUserIds.size === 0) {
        setLeaderboard([]);
        setLoading(false);
        return;
      }

      // Get user profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url, current_weight, share_progress_publicly')
        .in('user_id', Array.from(allUserIds));

      // Weight loss: compare each user's earliest logged weight to their current weight.
      // Shows only the amount lost (not raw body weight) to keep this less sensitive,
      // and only for users who've explicitly opted in to sharing their progress.
      let weightLossByUser: Record<string, number> = {};
      const optedInIds = new Set((profiles || []).filter(p => p.share_progress_publicly).map(p => p.user_id));
      const { data: weightLogsData } = optedInIds.size > 0
        ? await supabase
            .from('weight_logs')
            .select('user_id, weight, logged_at')
            .in('user_id', Array.from(optedInIds))
            .order('logged_at', { ascending: true })
        : { data: [] as { user_id: string; weight: number; logged_at: string }[] };

      if (weightLogsData) {
        const firstByUser: Record<string, number> = {};
        weightLogsData.forEach((log) => {
          if (firstByUser[log.user_id] === undefined) firstByUser[log.user_id] = log.weight;
        });
        Array.from(optedInIds).forEach((uid) => {
          const profile = profiles?.find(p => p.user_id === uid);
          const first = firstByUser[uid];
          const current = profile?.current_weight;
          if (first !== undefined && current !== undefined && current !== null && first > current) {
            weightLossByUser[uid] = Math.round((first - current) * 10) / 10;
          }
        });
      }

      // Build leaderboard
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
          weight_lost: weightLossByUser[userId] || 0,
        };
      });

      // Sort based on category
      if (category === 'points') {
        leaderboardData.sort((a, b) => b.total_points - a.total_points);
      } else if (category === 'challenges') {
        leaderboardData.sort((a, b) => b.challenges_completed - a.challenges_completed);
      } else if (category === 'weight_loss') {
        leaderboardData.sort((a, b) => b.weight_lost - a.weight_lost);
      } else {
        leaderboardData.sort((a, b) => b.current_streak - a.current_streak);
      }

      const finalList = category === 'weight_loss'
        ? leaderboardData.filter(e => e.weight_lost > 0)
        : leaderboardData;

      setLeaderboard(finalList.slice(0, 20));
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="h-6 w-6 text-yellow-500" />;
    if (index === 1) return <Medal className="h-6 w-6 text-gray-400" />;
    if (index === 2) return <Medal className="h-6 w-6 text-amber-600" />;
    return <span className="w-6 text-center font-bold text-muted-foreground">{index + 1}</span>;
  };

  const getCategoryIcon = () => {
    switch (category) {
      case 'points': return <Star className="h-5 w-5 text-yellow-500" />;
      case 'challenges': return <Target className="h-5 w-5 text-green-500" />;
      case 'streaks': return <Flame className="h-5 w-5 text-orange-500" />;
      case 'weight_loss': return <TrendingUp className="h-5 w-5 text-primary" />;
    }
  };

  const getCategoryValue = (entry: LeaderboardEntry) => {
    switch (category) {
      case 'points': return `${entry.total_points} pts`;
      case 'challenges': return `${entry.challenges_completed} completed`;
      case 'streaks': return `${entry.current_streak} days`;
      case 'weight_loss': return `${entry.weight_lost} lbs lost`;
    }
  };

  const startDirectMessage = (userId: string) => {
    navigate(`/community?user=${userId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Trophy className="h-8 w-8 text-yellow-500" />
              <h1 className="text-3xl font-bold">Leaderboard</h1>
            </div>
            <p className="text-muted-foreground">
              See how you stack up against other community members
            </p>
          </div>

          {/* Category Selection */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <Button
              variant={category === 'points' ? 'default' : 'outline'}
              onClick={() => setCategory('points')}
              className="gap-2"
            >
              <Star className="h-4 w-4" />
              Points
            </Button>
            <Button
              variant={category === 'challenges' ? 'default' : 'outline'}
              onClick={() => setCategory('challenges')}
              className="gap-2"
            >
              <Target className="h-4 w-4" />
              Challenges
            </Button>
            <Button
              variant={category === 'streaks' ? 'default' : 'outline'}
              onClick={() => setCategory('streaks')}
              className="gap-2"
            >
              <Flame className="h-4 w-4" />
              Streaks
            </Button>
            <Button
              variant={category === 'weight_loss' ? 'default' : 'outline'}
              onClick={() => setCategory('weight_loss')}
              className="gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Weight Loss
            </Button>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {getCategoryIcon()}
                  <span className="capitalize">{category} Rankings</span>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as 'weekly' | 'monthly' | 'alltime')}>
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="weekly" className="gap-1">
                    <Calendar className="h-4 w-4" />
                    This Week
                  </TabsTrigger>
                  <TabsTrigger value="monthly" className="gap-1">
                    <TrendingUp className="h-4 w-4" />
                    This Month
                  </TabsTrigger>
                  <TabsTrigger value="alltime" className="gap-1">
                    <Trophy className="h-4 w-4" />
                    All Time
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={timeframe} className="mt-0">
                  {loading ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                      Loading leaderboard...
                    </div>
                  ) : leaderboard.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>
                        {category === 'weight_loss'
                          ? "No one's shared their progress yet. Turn on \"Share progress publicly\" on your Progress page to be the first!"
                          : 'No data yet. Start tracking to appear on the leaderboard!'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {leaderboard.map((entry, index) => (
                        <div 
                          key={entry.user_id} 
                          className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                            index === 0 ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800' : 
                            index === 1 ? 'bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700' : 
                            index === 2 ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800' : 
                            'bg-muted/30 border border-transparent hover:border-muted'
                          } ${entry.user_id === user?.id ? 'ring-2 ring-primary' : ''}`}
                        >
                          <div className="w-8 flex justify-center shrink-0">
                            {getRankIcon(index)}
                          </div>
                          <button
                            onClick={() => setViewingUser(entry.user_id)}
                            className="shrink-0"
                          >
                            <Avatar className="h-12 w-12 hover:ring-2 hover:ring-primary transition-all">
                              <AvatarImage src={entry.avatar_url || undefined} />
                              <AvatarFallback className="text-lg font-semibold">
                                {entry.display_name[0]?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </button>
                          <div className="flex-1 min-w-0">
                            <button
                              onClick={() => setViewingUser(entry.user_id)}
                              className="font-semibold hover:text-primary transition-colors text-left truncate block"
                            >
                              {entry.display_name}
                              {entry.user_id === user?.id && (
                                <span className="ml-2 text-xs text-muted-foreground">(You)</span>
                              )}
                            </button>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Badge variant="outline" className="text-xs">
                                Level {entry.current_level}
                              </Badge>
                              <span>•</span>
                              <span>{entry.total_points} total pts</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge className="text-sm px-3 py-1">
                              {getCategoryValue(entry)}
                            </Badge>
                            {user && entry.user_id !== user.id && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => startDirectMessage(entry.user_id)}
                                className="h-8 w-8 p-0"
                              >
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />

      {/* User Profile Dialog */}
      {viewingUser && (
        <UserProfileDialog
          open={!!viewingUser}
          onClose={() => setViewingUser(null)}
          userId={viewingUser}
        />
      )}
    </div>
  );
};

export default Leaderboard;
