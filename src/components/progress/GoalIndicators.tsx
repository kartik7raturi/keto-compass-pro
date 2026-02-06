import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingDown, Flame, Award } from "lucide-react";

interface GoalIndicatorsProps {
  macroGoalsMet: number; // percentage 0-100
  weightLossGoal: number; // target weight loss in lbs
  currentWeightLoss: number; // actual weight loss in lbs
  currentStreak: number; // days
  bestStreak: number; // days
}

export const GoalIndicators = ({
  macroGoalsMet,
  weightLossGoal,
  currentWeightLoss,
  currentStreak,
  bestStreak
}: GoalIndicatorsProps) => {
  const weightProgress = weightLossGoal > 0 
    ? Math.min(100, (currentWeightLoss / weightLossGoal) * 100) 
    : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Goal Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Macro Goals Met */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-500" />
              Daily Macro Goals Met
            </span>
            <span className="font-bold">{macroGoalsMet}%</span>
          </div>
          <Progress value={macroGoalsMet} className="h-3" />
          <p className="text-xs text-muted-foreground">Weekly average</p>
        </div>

        {/* Weight Loss Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-green-500" />
              Weight Loss Goal
            </span>
            <span className="font-bold">{currentWeightLoss.toFixed(1)} / {weightLossGoal} lbs</span>
          </div>
          <Progress value={weightProgress} className="h-3" />
          <p className="text-xs text-muted-foreground">
            {weightProgress >= 100 
              ? '🎉 Goal reached!' 
              : `${(weightLossGoal - currentWeightLoss).toFixed(1)} lbs to go`
            }
          </p>
        </div>

        {/* Streak Indicators */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-3 rounded-lg bg-gradient-to-br from-orange-100 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/10 text-center">
            <Flame className="h-6 w-6 mx-auto text-orange-500 mb-1" />
            <div className="text-2xl font-bold">{currentStreak}</div>
            <div className="text-xs text-muted-foreground">Current Streak</div>
          </div>
          <div className="p-3 rounded-lg bg-gradient-to-br from-purple-100 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/10 text-center">
            <Award className="h-6 w-6 mx-auto text-purple-500 mb-1" />
            <div className="text-2xl font-bold">{bestStreak}</div>
            <div className="text-xs text-muted-foreground">Best Streak</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
