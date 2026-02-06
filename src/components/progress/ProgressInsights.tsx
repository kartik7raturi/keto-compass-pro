import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Target, Award, AlertCircle, CheckCircle } from "lucide-react";

interface InsightData {
  carbDaysMetTarget: number;
  totalDays: number;
  avgCalories: number;
  caloriesTrend: 'up' | 'down' | 'stable';
  weightTrend: 'up' | 'down' | 'stable';
  proteinAdherence: number;
}

interface ProgressInsightsProps {
  data: InsightData;
}

export const ProgressInsights = ({ data }: ProgressInsightsProps) => {
  const insights = [
    {
      type: data.carbDaysMetTarget >= 5 ? 'success' : 'info',
      icon: data.carbDaysMetTarget >= 5 ? CheckCircle : Target,
      text: `You met carb targets ${data.carbDaysMetTarget} out of ${data.totalDays} days`,
      color: data.carbDaysMetTarget >= 5 ? 'text-green-600' : 'text-blue-600'
    },
    {
      type: data.caloriesTrend === 'down' ? 'success' : 'info',
      icon: data.caloriesTrend === 'down' ? TrendingDown : TrendingUp,
      text: data.caloriesTrend === 'down' 
        ? `Your average calories are trending downward` 
        : data.caloriesTrend === 'up'
        ? `Your average calories are trending upward`
        : `Your average calories are stable`,
      color: data.caloriesTrend === 'down' ? 'text-green-600' : 'text-amber-600'
    },
    {
      type: data.proteinAdherence >= 80 ? 'success' : 'warning',
      icon: data.proteinAdherence >= 80 ? Award : AlertCircle,
      text: `Protein goal adherence: ${data.proteinAdherence}% this week`,
      color: data.proteinAdherence >= 80 ? 'text-green-600' : 'text-amber-600'
    },
    {
      type: data.weightTrend === 'down' ? 'success' : 'info',
      icon: data.weightTrend === 'down' ? TrendingDown : TrendingUp,
      text: data.weightTrend === 'down' 
        ? `Weight is trending in the right direction 🎉`
        : data.weightTrend === 'up'
        ? `Weight trending upward - consider adjusting macros`
        : `Weight is stable this week`,
      color: data.weightTrend === 'down' ? 'text-green-600' : 'text-muted-foreground'
    }
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Weekly Insights & Feedback
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
              >
                <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${insight.color}`} />
                <p className="text-sm">{insight.text}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
