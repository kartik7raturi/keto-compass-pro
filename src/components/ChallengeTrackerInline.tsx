import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Calendar, Trophy, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format, differenceInDays, addDays } from 'date-fns';

interface UserChallenge {
  id: string;
  challenge_id: string;
  start_date: string;
  current_progress: number;
  is_completed: boolean;
  challenges: {
    id: string;
    title: string;
    description: string;
    duration_days: number;
    challenge_type: string;
    reward_points: number;
  };
}

interface DailyLog {
  id: string;
  log_date: string;
  completed: boolean;
  notes: string | null;
}

interface ChallengeTrackerInlineProps {
  userChallenge: UserChallenge;
  onUpdate?: () => void;
}

const ChallengeTrackerInline = ({ userChallenge, onUpdate }: ChallengeTrackerInlineProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(false);

  const challenge = userChallenge.challenges;
  const startDate = new Date(userChallenge.start_date);
  const endDate = addDays(startDate, challenge.duration_days);
  const today = new Date();
  const dayNumber = Math.min(differenceInDays(today, startDate) + 1, challenge.duration_days);
  const daysCompleted = dailyLogs.filter(l => l.completed).length;
  const progressPercent = Math.round((daysCompleted / challenge.duration_days) * 100);

  useEffect(() => {
    if (user) fetchDailyLogs();
  }, [user, userChallenge.id]);

  const fetchDailyLogs = async () => {
    const { data } = await supabase
      .from('challenge_daily_logs')
      .select('*')
      .eq('user_challenge_id', userChallenge.id)
      .order('log_date', { ascending: true });
    setDailyLogs(data || []);
  };

  const toggleDayCompletion = async (date: Date) => {
    if (!user) return;
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const existingLog = dailyLogs.find(l => l.log_date === dateStr);
    
    setLoading(true);
    try {
      if (existingLog) {
        await supabase
          .from('challenge_daily_logs')
          .update({ completed: !existingLog.completed })
          .eq('id', existingLog.id);
      } else {
        await supabase.from('challenge_daily_logs').insert({
          user_id: user.id,
          user_challenge_id: userChallenge.id,
          log_date: dateStr,
          completed: true,
        });
      }
      
      await fetchDailyLogs();
      
      // Update progress percentage on user_challenges
      const newCompleted = existingLog 
        ? (existingLog.completed ? daysCompleted - 1 : daysCompleted + 1)
        : daysCompleted + 1;
      const newProgress = Math.round((newCompleted / challenge.duration_days) * 100);
      
      await supabase
        .from('user_challenges')
        .update({ 
          current_progress: newProgress,
          is_completed: newProgress >= 100
        })
        .eq('id', userChallenge.id);

      if (newProgress >= 100 && !userChallenge.is_completed) {
        // Award points
        await supabase.rpc('award_points', { points_to_add: challenge.reward_points || 50 });
        
        // Create notification
        await supabase.from('notifications').insert({
          user_id: user.id,
          title: 'Challenge Completed! 🎉',
          message: `Congratulations! You completed "${challenge.title}" and earned ${challenge.reward_points || 50} points!`,
          type: 'achievement',
          link: '/challenges'
        });

        toast({
          title: '🎉 Challenge Completed!',
          description: `You earned ${challenge.reward_points || 50} points!`,
        });
      }

      onUpdate?.();
    } catch (error) {
      console.error('Error updating day:', error);
      toast({ title: 'Error updating progress', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const isDayCompleted = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return dailyLogs.find(l => l.log_date === dateStr)?.completed || false;
  };

  // Generate days array
  const days = Array.from({ length: Math.min(challenge.duration_days, 30) }, (_, i) => 
    addDays(startDate, i)
  );

  if (userChallenge.is_completed) {
    return (
      <Card className="border-green-200 bg-green-50/50 dark:bg-green-900/20">
        <CardContent className="pt-4">
          <div className="flex items-center gap-3">
            <Trophy className="h-8 w-8 text-yellow-500" />
            <div>
              <h4 className="font-semibold text-green-700 dark:text-green-400">Challenge Completed!</h4>
              <p className="text-sm text-muted-foreground">
                You earned {challenge.reward_points || 50} points
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <span>Daily Tracker</span>
          </div>
          <Badge variant="secondary">Day {dayNumber}/{challenge.duration_days}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>{daysCompleted} days completed</span>
            <span>{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((date, i) => {
            const isToday = format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
            const isPast = date < today;
            const completed = isDayCompleted(date);
            
            return (
              <button
                key={i}
                disabled={loading || date > today}
                onClick={() => toggleDayCompletion(date)}
                className={`
                  aspect-square rounded-md flex items-center justify-center text-xs font-medium
                  transition-all
                  ${completed ? 'bg-green-500 text-white' : 'bg-muted hover:bg-muted/80'}
                  ${isToday ? 'ring-2 ring-primary ring-offset-1' : ''}
                  ${date > today ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {completed ? <CheckCircle className="h-4 w-4" /> : i + 1}
              </button>
            );
          })}
        </div>

        {challenge.duration_days > 30 && (
          <p className="text-xs text-muted-foreground text-center">
            Showing first 30 days. Total: {challenge.duration_days} days
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ChallengeTrackerInline;
