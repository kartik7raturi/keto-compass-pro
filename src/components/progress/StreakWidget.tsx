import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Calendar, Trophy, Zap } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface StreakData {
  type: string;
  current: number;
  best: number;
  icon: React.ReactNode;
  color: string;
}

const StreakWidget = () => {
  const { user } = useAuth();
  const [streaks, setStreaks] = useState<StreakData[]>([
    { type: 'Keto', current: 0, best: 0, icon: <Zap className="h-4 w-4" />, color: 'text-purple-500' },
    { type: 'Workout', current: 0, best: 0, icon: <Flame className="h-4 w-4" />, color: 'text-orange-500' },
    { type: 'Fasting', current: 0, best: 0, icon: <Calendar className="h-4 w-4" />, color: 'text-blue-500' },
  ]);
  const [longestStreak, setLongestStreak] = useState(0);

  useEffect(() => {
    if (user) {
      fetchStreaks();
    }
  }, [user]);

  const calculateStreak = (dates: string[]): { current: number; best: number } => {
    if (!dates.length) return { current: 0, best: 0 };
    
    const sortedDates = [...new Set(dates)].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;
    
    // Check if streak is active (today or yesterday has an entry)
    const isActive = sortedDates[0] === today || sortedDates[0] === yesterday;
    
    // Calculate current streak from most recent date
    if (isActive) {
      for (let i = 0; i < sortedDates.length; i++) {
        const expectedDate = new Date(new Date(sortedDates[0]).getTime() - i * 86400000).toISOString().split('T')[0];
        if (sortedDates.includes(expectedDate)) {
          currentStreak++;
        } else {
          break;
        }
      }
    }
    
    // Calculate best streak
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
        bestStreak = 1;
        continue;
      }
      
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const diffDays = Math.round((prevDate.getTime() - currDate.getTime()) / 86400000);
      
      if (diffDays === 1) {
        tempStreak++;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }
    
    return { current: currentStreak, best: bestStreak };
  };

  const fetchStreaks = async () => {
    if (!user) return;

    try {
      // Fetch keto streak data
      const { data: ketoData } = await supabase
        .from('keto_streaks')
        .select('date')
        .eq('user_id', user.id)
        .eq('completed', true)
        .order('date', { ascending: false });

      // Fetch workout data
      const { data: workoutData } = await supabase
        .from('workout_logs')
        .select('date')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      // Fetch fasting sessions
      const { data: fastingData } = await supabase
        .from('fasting_sessions')
        .select('start_time')
        .eq('user_id', user.id)
        .eq('completed', true)
        .order('start_time', { ascending: false });

      const ketoStreak = calculateStreak(ketoData?.map(d => d.date) || []);
      const workoutStreak = calculateStreak(workoutData?.map(d => d.date) || []);
      const fastingStreak = calculateStreak(
        fastingData?.map(d => new Date(d.start_time).toISOString().split('T')[0]) || []
      );

      setStreaks([
        { type: 'Keto', ...ketoStreak, icon: <Zap className="h-4 w-4" />, color: 'text-purple-500' },
        { type: 'Workout', ...workoutStreak, icon: <Flame className="h-4 w-4" />, color: 'text-orange-500' },
        { type: 'Fasting', ...fastingStreak, icon: <Calendar className="h-4 w-4" />, color: 'text-blue-500' },
      ]);

      setLongestStreak(Math.max(ketoStreak.best, workoutStreak.best, fastingStreak.best));
    } catch (error) {
      console.error('Error fetching streaks:', error);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Flame className="h-4 w-4 text-orange-500" />
          Streaks
          {longestStreak > 0 && (
            <Badge variant="outline" className="ml-auto flex items-center gap-1">
              <Trophy className="h-3 w-3 text-yellow-500" />
              Best: {longestStreak}d
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {streaks.map((streak) => (
            <div key={streak.type} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={streak.color}>{streak.icon}</span>
                <span className="text-sm font-medium">{streak.type}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <p className="text-lg font-bold">{streak.current}</p>
                  <p className="text-[10px] text-muted-foreground">Current</p>
                </div>
                <div className="text-center text-muted-foreground">
                  <p className="text-sm font-medium">{streak.best}</p>
                  <p className="text-[10px]">Best</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Streak Flame Visualization */}
        <div className="mt-4 pt-3 border-t flex justify-center gap-1">
          {Array.from({ length: 7 }).map((_, i) => {
            const maxCurrent = Math.max(...streaks.map(s => s.current));
            const isActive = i < Math.min(maxCurrent, 7);
            return (
              <div
                key={i}
                className={`w-6 h-8 rounded-full flex items-center justify-center transition-all ${
                  isActive 
                    ? 'bg-gradient-to-t from-orange-500 to-yellow-400 animate-pulse' 
                    : 'bg-muted'
                }`}
              >
                <Flame className={`h-4 w-4 ${isActive ? 'text-white' : 'text-muted-foreground'}`} />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default StreakWidget;
