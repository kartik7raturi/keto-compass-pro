import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UserProgress {
  user_id: string;
  total_points: number;
  current_level: number;
  created_at: string;
  updated_at: string;
}

export const usePointsSystem = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);

  // Fetch user progress on mount
  useEffect(() => {
    if (user?.id) {
      fetchUserProgress();
    }
  }, [user?.id]);

  const fetchUserProgress = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user progress:', error);
        return;
      }
      
      setUserProgress(data);
    } catch (error) {
      console.error('Error fetching user progress:', error);
    }
  };

  const awardPoints = useCallback(async (points: number, action: string) => {
    try {
      const { error } = await supabase.rpc('award_points', {
        points_to_add: points
      });

      if (error) {
        console.error('Error awarding points:', error);
        return;
      }

      // Refresh user progress after awarding points
      await fetchUserProgress();

      toast({
        title: `+${points} points earned!`,
        description: `Great job ${action}`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Error awarding points:', error);
    }
  }, [toast]);

  return { awardPoints, userProgress };
};

// Point values for different actions
export const POINT_VALUES = {
  LOG_WEIGHT: 10,
  COMPLETE_KETO_DAY: 15,
  COMPLETE_FAST: 20,
  LOG_WORKOUT: 10,
  COMPLETE_WATER_GOAL: 10,
  CREATE_POST: 5,
  LIKE_POST: 2,
  WEEKLY_STREAK: 50,
  MILESTONE_ACHIEVED: 100
};