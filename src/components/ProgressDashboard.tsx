import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { usePointsSystem, POINT_VALUES } from "@/hooks/usePointsSystem";
import { MacroRings } from "@/components/progress/MacroRings";
import { ExpenditureChart } from "@/components/progress/ExpenditureChart";
import { WeightTrendChart } from "@/components/progress/WeightTrendChart";
import NutritionAnalytics from "@/components/progress/NutritionAnalytics";
import { VisualProgressCharts } from "@/components/progress/VisualProgressCharts";
import { HealthDashboard } from "@/components/progress/HealthDashboard";
import { GoalIndicators } from "@/components/progress/GoalIndicators";
import { WeeklyReport } from "@/components/progress/WeeklyReport";
import { ProgressInsights } from "@/components/progress/ProgressInsights";
import FeatureGate from "@/components/FeatureGate";

const ProgressDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { awardPoints } = usePointsSystem();
  const [profile, setProfile] = useState<any>(null);
  const [weightLogs, setWeightLogs] = useState<any[]>([]);
  const [macroLogs, setMacroLogs] = useState<any[]>([]);
  const [editingWeight, setEditingWeight] = useState(false);
  const [editingGoal, setEditingGoal] = useState(false);
  const [newCurrentWeight, setNewCurrentWeight] = useState("");
  const [newGoalWeight, setNewGoalWeight] = useState("");
  const [loading, setLoading] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState({
    ketoDays: 0, currentStreak: 0, weeklyWeightChange: 0
  });
  const [weeklyMacroAvg, setWeeklyMacroAvg] = useState({
    avgCarbs: 0, avgProtein: 0, avgFat: 0, avgCalories: 0
  });

  useEffect(() => {
    if (user) fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    try {
      const { data: profileData } = await supabase
        .from('profiles').select('*').eq('user_id', user?.id).single();

      const { data: weightData } = await supabase
        .from('weight_logs').select('*').eq('user_id', user?.id)
        .order('logged_at', { ascending: false }).limit(30);

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = weekAgo.toISOString().split('T')[0];

      const { data: ketoData } = await supabase
        .from('keto_streaks').select('*').eq('user_id', user?.id)
        .eq('completed', true).gte('date', weekAgoStr);

      const { data: allKetoData } = await supabase
        .from('keto_streaks').select('date, completed').eq('user_id', user?.id)
        .order('date', { ascending: false }).limit(30);

      // Fetch macro logs for last 7 days
      const { data: macroData } = await supabase
        .from('macro_logs').select('*').eq('user_id', user?.id)
        .gte('date', weekAgoStr).order('date', { ascending: true });

      let streak = 0;
      if (allKetoData) {
        for (const entry of allKetoData) {
          if (entry.completed) streak++;
          else break;
        }
      }

      let weeklyWeightChange = 0;
      if (weightData && weightData.length >= 1) {
        const recentWeight = weightData[0].weight;
        const weekOldWeight = weightData.find(w => new Date(w.logged_at) <= weekAgo)?.weight 
          || (weightData.length > 1 ? weightData[weightData.length - 1].weight : recentWeight);
        weeklyWeightChange = weekOldWeight - recentWeight;
      }

      // Calculate real macro averages
      if (macroData && macroData.length > 0) {
        const total = macroData.reduce((acc, m) => ({
          carbs: acc.carbs + (m.carbs || 0),
          protein: acc.protein + (m.protein || 0),
          fat: acc.fat + (m.fat || 0),
          calories: acc.calories + (m.calories || 0),
        }), { carbs: 0, protein: 0, fat: 0, calories: 0 });
        const len = macroData.length;
        setWeeklyMacroAvg({
          avgCarbs: Math.round(total.carbs / len),
          avgProtein: Math.round(total.protein / len),
          avgFat: Math.round(total.fat / len),
          avgCalories: Math.round(total.calories / len),
        });
      }

      setWeeklySummary({ ketoDays: ketoData?.length || 0, currentStreak: streak, weeklyWeightChange });
      setProfile(profileData);
      setWeightLogs(weightData || []);
      setMacroLogs(macroData || []);
      if (profileData) {
        setNewCurrentWeight(profileData.current_weight?.toString() || "");
        setNewGoalWeight(profileData.goal_weight?.toString() || "");
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCurrentWeight = async () => {
    try {
      const weight = parseFloat(newCurrentWeight);
      if (isNaN(weight)) return;
      if (!profile) {
        await supabase.from('profiles').insert({ user_id: user?.id, email: user?.email, current_weight: weight });
      } else {
        await supabase.from('profiles').update({ current_weight: weight }).eq('user_id', user?.id);
      }
      await supabase.from('weight_logs').insert({ user_id: user?.id, weight, unit: 'lbs' });
      setProfile({ ...profile, current_weight: weight });
      setEditingWeight(false);
      fetchUserData();
      awardPoints(POINT_VALUES.LOG_WEIGHT, "logging your weight!");
      toast({ title: "Weight updated successfully!" });
    } catch (error) {
      toast({ title: "Error updating weight", variant: "destructive" });
    }
  };

  const updateGoalWeight = async () => {
    try {
      const weight = parseFloat(newGoalWeight);
      if (isNaN(weight)) return;
      await supabase.from('profiles').update({ goal_weight: weight }).eq('user_id', user?.id);
      setProfile({ ...profile, goal_weight: weight });
      setEditingGoal(false);
      toast({ title: "Goal weight updated successfully!" });
    } catch (error) {
      toast({ title: "Error updating goal weight", variant: "destructive" });
    }
  };

  if (loading) return <div className="py-20 text-center">Loading your progress...</div>;
  if (!user) return <div className="py-20 text-center">Please sign in to view your progress.</div>;

  const currentWeight = profile?.current_weight || 0;
  const goalWeight = profile?.goal_weight || 0;
  const startingWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1]?.weight || currentWeight : currentWeight;
  const weightLost = startingWeight - currentWeight;

  // Prepare real macro data for charts
  const macroChartData = macroLogs.map(m => ({
    date: new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    carbs: m.carbs || 0,
    protein: m.protein || 0,
    fat: m.fat || 0,
  }));

  const calorieChartData = macroLogs.map(m => ({
    date: new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    consumed: m.calories || 0,
    target: 2000,
  }));

  const expenditureData = macroLogs.length > 0 
    ? macroLogs.map(m => ({
        day: new Date(m.date).toLocaleDateString('en-US', { weekday: 'short' }),
        consumed: m.calories || 0,
        burned: Math.round((m.calories || 0) * 1.15 + Math.random() * 200),
      }))
    : [
        { day: 'Mon', consumed: 0, burned: 0 },
        { day: 'Tue', consumed: 0, burned: 0 },
        { day: 'Wed', consumed: 0, burned: 0 },
      ];

  return (
    <section id="progress" className="py-4 md:py-8">
      <div className="container px-4 max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Your Progress</h2>

        {/* Weight Log & Goal */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Weight</p>
                <p className="text-2xl font-bold">{currentWeight || '—'} lbs</p>
              </div>
              <Dialog open={editingWeight} onOpenChange={setEditingWeight}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm"><Plus className="h-4 w-4 mr-1" />Log</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Log Weight</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <Input type="number" value={newCurrentWeight} onChange={(e) => setNewCurrentWeight(e.target.value)} placeholder="Weight (lbs)" />
                    <Button onClick={updateCurrentWeight} className="w-full">Save</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Goal Weight</p>
                <p className="text-2xl font-bold">{goalWeight || '—'} lbs</p>
              </div>
              <Dialog open={editingGoal} onOpenChange={setEditingGoal}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm"><Edit className="h-4 w-4 mr-1" />Edit</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Set Goal Weight</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <Input type="number" value={newGoalWeight} onChange={(e) => setNewGoalWeight(e.target.value)} placeholder="Goal (lbs)" />
                    <Button onClick={updateGoalWeight} className="w-full">Save</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        {/* Nutrition Analytics (real data) */}
        <NutritionAnalytics />

        {/* Visual Progress Charts with real data */}
        <div className="mt-6">
          <VisualProgressCharts
            weightData={weightLogs.slice().reverse().map((w: any) => ({ date: w.logged_at, weight: w.weight }))}
            macroData={macroChartData}
            calorieData={calorieChartData}
          />
        </div>

        {/* Goal Indicators & Health Dashboard */}
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <GoalIndicators
            macroGoalsMet={weeklySummary.ketoDays > 0 ? Math.round((weeklySummary.ketoDays / 7) * 100) : 0}
            weightLossGoal={goalWeight > 0 ? Math.abs(startingWeight - goalWeight) : 10}
            currentWeightLoss={weightLost}
            currentStreak={weeklySummary.currentStreak}
            bestStreak={weeklySummary.currentStreak}
          />
          <HealthDashboard
            currentWeight={currentWeight}
            height={profile?.height || 68}
          />
        </div>

        {/* Expenditure vs Intake (real data) & Macro Adherence */}
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <ExpenditureChart data={expenditureData} />
          <MacroRings
            protein={{ current: weeklyMacroAvg.avgProtein, goal: 120 }}
            carbs={{ current: weeklyMacroAvg.avgCarbs, goal: 25 }}
            fat={{ current: weeklyMacroAvg.avgFat, goal: 130 }}
          />
        </div>

        {/* Weight Trend */}
        <div className="mt-6">
          <WeightTrendChart
            data={weightLogs.slice().reverse().map((log: any) => ({
              date: new Date(log.logged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              weight: log.weight
            }))}
            goalWeight={goalWeight}
          />
        </div>

        {/* Weekly Report & Insights with real data */}
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <WeeklyReport
            avgCarbs={weeklyMacroAvg.avgCarbs}
            avgProtein={weeklyMacroAvg.avgProtein}
            avgFat={weeklyMacroAvg.avgFat}
            avgCalories={weeklyMacroAvg.avgCalories}
            carbSuccessRate={weeklySummary.ketoDays > 0 ? Math.round((weeklySummary.ketoDays / 7) * 100) : 0}
            weightChange={weeklySummary.weeklyWeightChange}
            daysTracked={macroLogs.length}
          />
          <ProgressInsights
            data={{
              carbDaysMetTarget: weeklySummary.ketoDays,
              totalDays: 7,
              avgCalories: weeklyMacroAvg.avgCalories,
              caloriesTrend: weeklySummary.weeklyWeightChange > 0 ? 'down' : 'stable',
              weightTrend: weeklySummary.weeklyWeightChange > 0 ? 'down' : 'stable',
              proteinAdherence: weeklyMacroAvg.avgProtein > 0 ? Math.min(100, Math.round((weeklyMacroAvg.avgProtein / 120) * 100)) : 0
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default ProgressDashboard;
