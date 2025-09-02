import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const usePointsSystem = () => {
  const { toast } = useToast();

  const awardPoints = useCallback(async (points: number, action: string) => {
    try {
      const { error } = await supabase.rpc('award_points', {
        points_to_add: points
      });

      if (error) {
        console.error('Error awarding points:', error);
        return;
      }

      toast({
        title: `+${points} points earned!`,
        description: `Great job ${action}`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Error awarding points:', error);
    }
  }, [toast]);

  return { awardPoints };
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