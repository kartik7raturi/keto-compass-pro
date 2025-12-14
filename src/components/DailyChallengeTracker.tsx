import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, Calendar, Target, Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format, subDays, eachDayOfInterval, startOfDay } from 'date-fns';

interface UserChallenge {
  id: string;
  challenge_id: string;
  start_date: string;
  current_progress: number;
  is_completed: boolean;
  challenges: {
    id: string;
    title: string;
    duration_days: number;
    challenge_type: string;
    reward_points: number;
  };
}

interface DailyLog {
  id: string;
  user_challenge_id: string;
  log_date: string;
  completed: boolean;
}

const DailyChallengeTracker = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
  const [dailyLogs, setDailyLogs] = useState<Record<string, DailyLog[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserChallenges();
    }
  }, [user]);

  const fetchUserChallenges = async () => {
    if (!user) return;
    
    try {
      const { data: challenges } = await supabase
        .from('user_challenges')
        .select(`
          *,
          challenges(id, title, duration_days, challenge_type, reward_points)
        `)
        .eq('user_id', user.id)
        .eq('is_completed', false);

      setUserChallenges(challenges as unknown as UserChallenge[] || []);

      // Fetch daily logs for each challenge
      if (challenges && challenges.length > 0) {
        const challengeIds = challenges.map(c => c.id);
        const { data: logs } = await supabase
          .from('challenge_daily_logs')
          .select('*')
          .in('user_challenge_id', challengeIds)
          .eq('user_id', user.id);

        // Group logs by challenge
        const logsByChallenge: Record<string, DailyLog[]> = {};
        logs?.forEach(log => {
          if (!logsByChallenge[log.user_challenge_id]) {
            logsByChallenge[log.user_challenge_id] = [];
          }
          logsByChallenge[log.user_challenge_id].push(log as DailyLog);
        });
        setDailyLogs(logsByChallenge);
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDayComplete = async (userChallengeId: string, date: Date) => {
    if (!user) return;

    const dateStr = format(date, 'yyyy-MM-dd');
    const existingLog = dailyLogs[userChallengeId]?.find(
      log => log.log_date === dateStr
    );

    try {
      if (existingLog) {
        // Toggle existing log
        const { error } = await supabase
          .from('challenge_daily_logs')
          .update({ completed: !existingLog.completed })
          .eq('id', existingLog.id);

        if (error) throw error;
      } else {
        // Create new log
        const { error } = await supabase
          .from('challenge_daily_logs')
          .insert({
            user_challenge_id: userChallengeId,
            user_id: user.id,
            log_date: dateStr,
            completed: true,
          });

        if (error) throw error;
      }

      // Update progress
      await updateChallengeProgress(userChallengeId);
      fetchUserChallenges();
      toast({ title: existingLog?.completed ? 'Day unchecked' : 'Day completed!' });
    } catch (error) {
      console.error('Error toggling day:', error);
      toast({ title: 'Error updating progress', variant: 'destructive' });
    }
  };

  const updateChallengeProgress = async (userChallengeId: string) => {
    if (!user) return;

    const challenge = userChallenges.find(c => c.id === userChallengeId);
    if (!challenge) return;

    const { data: logs } = await supabase
      .from('challenge_daily_logs')
      .select('*')
      .eq('user_challenge_id', userChallengeId)
      .eq('completed', true);

    const completedDays = logs?.length || 0;
    const totalDays = challenge.challenges.duration_days;
    const progress = Math.round((completedDays / totalDays) * 100);
    const isCompleted = completedDays >= totalDays;

    await supabase
      .from('user_challenges')
      .update({ 
        current_progress: progress,
        is_completed: isCompleted,
        end_date: isCompleted ? format(new Date(), 'yyyy-MM-dd') : null
      })
      .eq('id', userChallengeId);

    // Award points and create notification on completion
    if (isCompleted && challenge.challenges.reward_points) {
      await supabase.rpc('award_points', { 
        points_to_add: challenge.challenges.reward_points 
      });
      
      await supabase.from('notifications').insert({
        user_id: user.id,
        title: 'Challenge Completed!',
        message: `Congratulations! You completed "${challenge.challenges.title}" and earned ${challenge.challenges.reward_points} points!`,
        type: 'achievement',
        link: '/progress',
      });
    }
  };

  const getDaysForChallenge = (challenge: UserChallenge) => {
    const startDate = new Date(challenge.start_date);
    const endDate = subDays(new Date(), 0);
    const daysToShow = Math.min(challenge.challenges.duration_days, 14);
    
    return eachDayOfInterval({
      start: subDays(endDate, daysToShow - 1),
      end: endDate,
    });
  };

  const isDayCompleted = (userChallengeId: string, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return dailyLogs[userChallengeId]?.some(
      log => log.log_date === dateStr && log.completed
    ) || false;
  };

  if (loading) {
    return <div className="text-center py-8">Loading your challenges...</div>;
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Please sign in to track your challenges
        </CardContent>
      </Card>
    );
  }

  if (userChallenges.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">No active challenges</p>
          <Button variant="outline" onClick={() => window.location.href = '/challenges'}>
            Browse Challenges
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold flex items-center gap-2">
        <Calendar className="h-6 w-6 text-primary" />
        Daily Challenge Tracker
      </h3>

      {userChallenges.map((challenge) => {
        const days = getDaysForChallenge(challenge);
        const completedDays = dailyLogs[challenge.id]?.filter(l => l.completed).length || 0;
        
        return (
          <Card key={challenge.id}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{challenge.challenges.title}</span>
                  <Badge variant="secondary" className="text-xs">
                    {challenge.challenges.challenge_type}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-normal">
                    {challenge.challenges.reward_points} pts
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>{completedDays} / {challenge.challenges.duration_days} days</span>
                  <span>{challenge.current_progress || 0}%</span>
                </div>
                <Progress value={challenge.current_progress || 0} className="h-2" />
              </div>

              <div className="flex flex-wrap gap-2">
                {days.map((day) => {
                  const isCompleted = isDayCompleted(challenge.id, day);
                  const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                  
                  return (
                    <Button
                      key={day.toISOString()}
                      variant={isCompleted ? 'default' : 'outline'}
                      size="sm"
                      className={`flex flex-col items-center p-2 h-auto ${
                        isToday ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => toggleDayComplete(challenge.id, day)}
                    >
                      <span className="text-xs opacity-70">{format(day, 'EEE')}</span>
                      <span className="text-xs">{format(day, 'd')}</span>
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4 mt-1 text-green-500" />
                      ) : (
                        <Circle className="h-4 w-4 mt-1" />
                      )}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default DailyChallengeTracker;