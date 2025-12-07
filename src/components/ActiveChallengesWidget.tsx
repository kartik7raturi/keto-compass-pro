import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, Calendar, Trophy, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';

interface ActiveChallenge {
  id: string;
  challenge_id: string;
  start_date: string;
  end_date: string | null;
  current_progress: number;
  is_completed: boolean;
  challenge: {
    id: string;
    title: string;
    description: string | null;
    duration_days: number;
    challenge_type: string | null;
    target_value: number | null;
    target_unit: string | null;
  } | null;
}

const ActiveChallengesWidget = () => {
  const { user } = useAuth();
  const [activeChallenges, setActiveChallenges] = useState<ActiveChallenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchActiveChallenges();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchActiveChallenges = async () => {
    try {
      const { data, error } = await supabase
        .from('user_challenges')
        .select(`
          id,
          challenge_id,
          start_date,
          end_date,
          current_progress,
          is_completed,
          challenge:challenges(id, title, description, duration_days, challenge_type, target_value, target_unit)
        `)
        .eq('user_id', user?.id)
        .eq('is_completed', false)
        .order('start_date', { ascending: false });

      if (error) throw error;
      
      // Filter and type-cast properly
      const validChallenges = (data || []).filter(c => c.challenge !== null) as ActiveChallenge[];
      setActiveChallenges(validChallenges);
    } catch (error) {
      console.error('Error fetching active challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (challenge: ActiveChallenge): number => {
    if (!challenge.challenge) return 0;
    
    const startDate = new Date(challenge.start_date);
    const today = new Date();
    const daysElapsed = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const progress = Math.min(100, (daysElapsed / challenge.challenge.duration_days) * 100);
    
    return Math.round(progress);
  };

  const getDaysRemaining = (challenge: ActiveChallenge): number => {
    if (!challenge.challenge) return 0;
    
    const startDate = new Date(challenge.start_date);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + challenge.challenge.duration_days);
    
    const today = new Date();
    const remaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    return Math.max(0, remaining);
  };

  if (loading || !user || activeChallenges.length === 0) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border-orange-500/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="h-5 w-5 text-orange-500" />
          Active Challenges
          <Badge variant="secondary" className="bg-orange-500/10 text-orange-600">
            {activeChallenges.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeChallenges.slice(0, 3).map((challenge) => (
          <div key={challenge.id} className="space-y-2 p-3 bg-background/60 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm truncate flex-1">
                {challenge.challenge?.title || 'Challenge'}
              </span>
              <Badge variant="outline" className="text-xs ml-2">
                <Calendar className="h-3 w-3 mr-1" />
                {getDaysRemaining(challenge)}d left
              </Badge>
            </div>
            <Progress value={calculateProgress(challenge)} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{calculateProgress(challenge)}% complete</span>
              <span>{challenge.challenge?.duration_days} day challenge</span>
            </div>
          </div>
        ))}
        
        {activeChallenges.length > 3 && (
          <p className="text-xs text-center text-muted-foreground">
            +{activeChallenges.length - 3} more challenges
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ActiveChallengesWidget;
