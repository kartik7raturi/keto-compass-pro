import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';

interface UserProgress {
  total_points: number;
  current_level: number;
}

const UserProgressWidget = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserProgress();
    }
  }, [user]);

  const fetchUserProgress = async () => {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('total_points, current_level')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user progress:', error);
        return;
      }

      if (!data) {
        // Initialize progress if it doesn't exist
        await supabase
          .from('user_progress')
          .insert({
            user_id: user?.id,
            total_points: 0,
            current_level: 1
          });
        setProgress({ total_points: 0, current_level: 1 });
      } else {
        setProgress(data);
      }
    } catch (error) {
      console.error('Error fetching user progress:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !user) {
    return null;
  }

  if (!progress) {
    return null;
  }

  const pointsToNextLevel = (progress.current_level * 100) - progress.total_points;
  const progressToNextLevel = progress.total_points % 100;

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Level {progress.current_level}
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            <Star className="h-3 w-3 mr-1" />
            {progress.total_points} pts
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress to Level {progress.current_level + 1}</span>
            <span className="font-medium">{progressToNextLevel}/100</span>
          </div>
          <Progress value={progressToNextLevel} className="h-2" />
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Zap className="h-3 w-3" />
            {pointsToNextLevel} points to next level
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="p-2 bg-background/60 rounded">
            <div className="text-sm font-medium">{progress.current_level}</div>
            <div className="text-xs text-muted-foreground">Level</div>
          </div>
          <div className="p-2 bg-background/60 rounded">
            <div className="text-sm font-medium">{progress.total_points}</div>
            <div className="text-xs text-muted-foreground">Total Points</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProgressWidget;