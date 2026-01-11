import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Target, Calendar, Flame, Droplets, Dumbbell, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';

interface Challenge {
  id: string;
  title: string;
  duration_days: number;
  challenge_type: string | null;
}

interface UserChallenge {
  id: string;
  start_date: string;
  current_progress: number;
  is_completed: boolean;
  challenge: Challenge | null;
}

interface WeeklySummary {
  ketoStreak: number;
  fastingDays: number;
  workoutMinutes: number;
  waterCups: number;
  weightChange: number;
}

interface WelcomeProgressModalProps {
  open: boolean;
  onClose: () => void;
}

const WelcomeProgressModal = ({ open, onClose }: WelcomeProgressModalProps) => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<UserChallenge[]>([]);
  const [summary, setSummary] = useState<WeeklySummary>({
    ketoStreak: 0,
    fastingDays: 0,
    workoutMinutes: 0,
    waterCups: 0,
    weightChange: 0
  });
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    if (open && user) {
      fetchData();
    }
  }, [open, user]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', user?.id)
        .maybeSingle();

      setDisplayName(profile?.display_name || 'there');

      // Fetch active challenges
      const { data: userChallenges } = await supabase
        .from('user_challenges')
        .select(`
          id,
          start_date,
          current_progress,
          is_completed,
          challenge:challenges(id, title, duration_days, challenge_type)
        `)
        .eq('user_id', user?.id)
        .eq('is_completed', false)
        .order('start_date', { ascending: false });

      const validChallenges = (userChallenges || []).filter(c => c.challenge !== null) as UserChallenge[];
      setChallenges(validChallenges);

      // Fetch weekly summary data
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = weekAgo.toISOString().split('T')[0];

      // Keto streak
      const { data: ketoData } = await supabase
        .from('keto_streaks')
        .select('*')
        .eq('user_id', user?.id)
        .eq('completed', true)
        .gte('date', weekAgoStr);

      // Fasting sessions
      const { data: fastingData } = await supabase
        .from('fasting_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .eq('completed', true)
        .gte('created_at', weekAgo.toISOString());

      // Workout logs
      const { data: workoutData } = await supabase
        .from('workout_logs')
        .select('duration_minutes')
        .eq('user_id', user?.id)
        .gte('date', weekAgoStr);

      // Water logs
      const { data: waterData } = await supabase
        .from('water_logs')
        .select('cups_consumed')
        .eq('user_id', user?.id)
        .gte('date', weekAgoStr);

      // Weight change
      const { data: weightLogs } = await supabase
        .from('weight_logs')
        .select('weight, logged_at')
        .eq('user_id', user?.id)
        .order('logged_at', { ascending: false })
        .limit(10);

      let weightChange = 0;
      if (weightLogs && weightLogs.length >= 2) {
        const recentWeight = weightLogs[0].weight;
        const weekAgoWeight = weightLogs.find(w => 
          new Date(w.logged_at) <= weekAgo
        )?.weight || weightLogs[weightLogs.length - 1].weight;
        weightChange = weekAgoWeight - recentWeight;
      }

      setSummary({
        ketoStreak: ketoData?.length || 0,
        fastingDays: fastingData?.length || 0,
        workoutMinutes: workoutData?.reduce((acc, w) => acc + (w.duration_minutes || 0), 0) || 0,
        waterCups: waterData?.reduce((acc, w) => acc + (w.cups_consumed || 0), 0) || 0,
        weightChange: weightChange
      });

    } catch (error) {
      console.error('Error fetching welcome data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChallengeProgress = (challenge: UserChallenge): number => {
    if (!challenge.challenge) return 0;
    const startDate = new Date(challenge.start_date);
    const today = new Date();
    const daysElapsed = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.min(100, Math.round((daysElapsed / challenge.challenge.duration_days) * 100));
  };

  const getChallengeIcon = (type: string | null) => {
    switch (type) {
      case 'keto': return <Flame className="h-4 w-4 text-orange-500" />;
      case 'fasting': return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'workout': return <Dumbbell className="h-4 w-4 text-purple-500" />;
      case 'water': return <Droplets className="h-4 w-4 text-cyan-500" />;
      default: return <Target className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Trophy className="h-5 w-5 text-primary" />
            Welcome back, {displayName}!
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">
            Loading your progress...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Weekly Summary */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                This Week's Summary
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <Card className="bg-gradient-to-br from-orange-500/10 to-transparent">
                  <CardContent className="p-3 text-center">
                    <Flame className="h-5 w-5 mx-auto mb-1 text-orange-500" />
                    <div className="text-lg font-bold">{summary.ketoStreak}/7</div>
                    <div className="text-xs text-muted-foreground">Keto Days</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-500/10 to-transparent">
                  <CardContent className="p-3 text-center">
                    <Calendar className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                    <div className="text-lg font-bold">{summary.fastingDays}</div>
                    <div className="text-xs text-muted-foreground">Fasting Days</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-500/10 to-transparent">
                  <CardContent className="p-3 text-center">
                    <Dumbbell className="h-5 w-5 mx-auto mb-1 text-purple-500" />
                    <div className="text-lg font-bold">{summary.workoutMinutes}</div>
                    <div className="text-xs text-muted-foreground">Workout Mins</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-cyan-500/10 to-transparent">
                  <CardContent className="p-3 text-center">
                    <Droplets className="h-5 w-5 mx-auto mb-1 text-cyan-500" />
                    <div className="text-lg font-bold">{summary.waterCups}</div>
                    <div className="text-xs text-muted-foreground">Water Cups</div>
                  </CardContent>
                </Card>
              </div>
              {summary.weightChange !== 0 && (
                <div className="mt-3 p-3 bg-muted/50 rounded-lg text-center">
                  <span className="text-sm text-muted-foreground">Weight change: </span>
                  <span className={`font-bold ${summary.weightChange > 0 ? 'text-green-500' : 'text-orange-500'}`}>
                    {summary.weightChange > 0 ? '-' : '+'}{Math.abs(summary.weightChange).toFixed(1)} lbs
                  </span>
                </div>
              )}
            </div>

            {/* Active Challenges */}
            {challenges.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Your Active Challenges
                  <Badge variant="secondary">{challenges.length}</Badge>
                </h3>
                <div className="space-y-3">
                  {challenges.map((challenge) => {
                    const progress = getChallengeProgress(challenge);
                    const daysLeft = challenge.challenge 
                      ? Math.max(0, challenge.challenge.duration_days - 
                          Math.floor((new Date().getTime() - new Date(challenge.start_date).getTime()) / (1000 * 60 * 60 * 24)))
                      : 0;

                    return (
                      <div key={challenge.id} className="p-3 bg-muted/50 rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getChallengeIcon(challenge.challenge?.challenge_type || null)}
                            <span className="font-medium text-sm">
                              {challenge.challenge?.title || 'Challenge'}
                            </span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {daysLeft}d left
                          </Badge>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{progress}% complete</span>
                          <span>{challenge.challenge?.duration_days} day challenge</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <Button onClick={onClose} className="w-full">
              Let's Continue! 💪
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeProgressModal;
