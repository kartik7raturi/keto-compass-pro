import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar, TrendingDown, Target, Flame } from "lucide-react";

interface WeeklyReportProps {
  avgCarbs: number;
  avgProtein: number;
  avgFat: number;
  avgCalories: number;
  carbSuccessRate: number;
  weightChange: number;
  daysTracked: number;
}

export const WeeklyReport = ({ 
  avgCarbs, 
  avgProtein, 
  avgFat, 
  avgCalories,
  carbSuccessRate, 
  weightChange,
  daysTracked 
}: WeeklyReportProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Weekly Report
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {/* Average Macros */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Average Daily Macros</h4>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2 rounded-lg bg-muted/50">
                <div className="text-lg font-bold">{avgCarbs}g</div>
                <div className="text-xs text-muted-foreground">Carbs</div>
              </div>
              <div className="p-2 rounded-lg bg-muted/50">
                <div className="text-lg font-bold">{avgProtein}g</div>
                <div className="text-xs text-muted-foreground">Protein</div>
              </div>
              <div className="p-2 rounded-lg bg-muted/50">
                <div className="text-lg font-bold">{avgFat}g</div>
                <div className="text-xs text-muted-foreground">Fat</div>
              </div>
              <div className="p-2 rounded-lg bg-muted/50">
                <div className="text-lg font-bold">{avgCalories}</div>
                <div className="text-xs text-muted-foreground">Calories</div>
              </div>
            </div>
          </div>

          {/* Carb Success Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Net Carbs Success Rate
              </span>
              <span className="font-medium">{carbSuccessRate}%</span>
            </div>
            <Progress 
              value={carbSuccessRate} 
              className="h-2"
            />
            <p className="text-xs text-muted-foreground">
              Days under 25g net carbs this week
            </p>
          </div>

          {/* Weight Trend */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <TrendingDown className={`h-5 w-5 ${weightChange < 0 ? 'text-green-500' : weightChange > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
              <span className="text-sm font-medium">Weight Trend</span>
            </div>
            <div className={`font-bold ${weightChange < 0 ? 'text-green-500' : weightChange > 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
              {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} lbs
            </div>
          </div>

          {/* Days Tracked */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Days Tracked</span>
            </div>
            <div className="font-bold">{daysTracked}/7 days</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
