import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, TrendingDown, Award, Target, Plus, Edit } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import UserProgressWidget from "@/components/UserProgressWidget";
import { usePointsSystem, POINT_VALUES } from "@/hooks/usePointsSystem";
import { MacroRings } from "@/components/progress/MacroRings";
import { ExpenditureChart } from "@/components/progress/ExpenditureChart";
import { WeightTrendChart } from "@/components/progress/WeightTrendChart";
import { BodyComposition } from "@/components/progress/BodyComposition";
import NutritionAnalytics from "@/components/progress/NutritionAnalytics";
import StreakWidget from "@/components/progress/StreakWidget";
import LeaderboardWidget from "@/components/LeaderboardWidget";
import KetoStreakChart from "@/components/charts/KetoStreakChart";
import WorkoutChart from "@/components/charts/WorkoutChart";
import { useIsMobile } from "@/hooks/use-mobile";
import { VisualProgressCharts } from "@/components/progress/VisualProgressCharts";
import { HealthDashboard } from "@/components/progress/HealthDashboard";
import { GoalIndicators } from "@/components/progress/GoalIndicators";
import { WeeklyReport } from "@/components/progress/WeeklyReport";
import { ProgressInsights } from "@/components/progress/ProgressInsights";

interface WeeklySummary {
  ketoDays: number;
  currentStreak: number;
  weeklyWeightChange: number;
}

const ProgressDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { awardPoints } = usePointsSystem();
  const isMobile = useIsMobile();
  const [profile, setProfile] = useState<any>(null);
  const [weightLogs, setWeightLogs] = useState<any[]>([]);
  const [editingWeight, setEditingWeight] = useState(false);
  const [editingGoal, setEditingGoal] = useState(false);
  const [newCurrentWeight, setNewCurrentWeight] = useState("");
  const [newGoalWeight, setNewGoalWeight] = useState("");
  const [loading, setLoading] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary>({
    ketoDays: 0,
    currentStreak: 0,
    weeklyWeightChange: 0
  });

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      // Fetch weight logs
      const { data: weightData } = await supabase
        .from('weight_logs')
        .select('*')
        .eq('user_id', user?.id)
        .order('logged_at', { ascending: false })
        .limit(10);

      // Fetch weekly keto data
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = weekAgo.toISOString().split('T')[0];

      const { data: ketoData } = await supabase
        .from('keto_streaks')
        .select('*')
        .eq('user_id', user?.id)
        .eq('completed', true)
        .gte('date', weekAgoStr);

      // Calculate current streak
      const { data: allKetoData } = await supabase
        .from('keto_streaks')
        .select('date, completed')
        .eq('user_id', user?.id)
        .order('date', { ascending: false })
        .limit(30);

      let streak = 0;
      if (allKetoData) {
        for (const entry of allKetoData) {
          if (entry.completed) {
            streak++;
          } else {
            break;
          }
        }
      }

      // Calculate weekly weight change
      let weeklyWeightChange = 0;
      if (weightData && weightData.length >= 1) {
        const recentWeight = weightData[0].weight;
        const weekOldWeight = weightData.find(w => 
          new Date(w.logged_at) <= weekAgo
        )?.weight || (weightData.length > 1 ? weightData[weightData.length - 1].weight : recentWeight);
        weeklyWeightChange = weekOldWeight - recentWeight;
      }

      setWeeklySummary({
        ketoDays: ketoData?.length || 0,
        currentStreak: streak,
        weeklyWeightChange: weeklyWeightChange
      });

      setProfile(profileData);
      setWeightLogs(weightData || []);
      
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

      // First ensure profile exists
      if (!profile) {
        await supabase
          .from('profiles')
          .insert({
            user_id: user?.id,
            email: user?.email,
            current_weight: weight
          });
      } else {
        // Update existing profile
        await supabase
          .from('profiles')
          .update({ current_weight: weight })
          .eq('user_id', user?.id);
      }

      // Add weight log
      await supabase
        .from('weight_logs')
        .insert({
          user_id: user?.id,
          weight: weight,
          unit: 'lbs'
        });

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

      await supabase
        .from('profiles')
        .update({ goal_weight: weight })
        .eq('user_id', user?.id);

      setProfile({ ...profile, goal_weight: weight });
      setEditingGoal(false);
      toast({ title: "Goal weight updated successfully!" });
    } catch (error) {
      toast({ title: "Error updating goal weight", variant: "destructive" });
    }
  };

  if (loading) {
    return <div className="py-20 text-center">Loading your progress...</div>;
  }

  if (!user) {
    return <div className="py-20 text-center">Please sign in to view your progress.</div>;
  }

  const currentWeight = profile?.current_weight || 0;
  const goalWeight = profile?.goal_weight || 0;
  const startingWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1]?.weight || currentWeight : currentWeight;
  const weightLost = startingWeight - currentWeight;
  const progressPercentage = goalWeight && startingWeight !== goalWeight 
    ? Math.round(((startingWeight - currentWeight) / (startingWeight - goalWeight)) * 100)
    : 0;

  const stats = [
    { label: "Current Weight", value: `${currentWeight} lbs`, change: `${weightLost > 0 ? '-' : '+'}${Math.abs(weightLost).toFixed(1)} lbs`, trend: weightLost > 0 ? "down" : "up" },
    { label: "Goal Weight", value: `${goalWeight} lbs`, change: `${Math.abs(currentWeight - goalWeight).toFixed(1)} lbs to go`, trend: "target" },
    { label: "Progress", value: `${progressPercentage}%`, change: "Complete", trend: "up" },
    { label: "Weight Logs", value: `${weightLogs.length}`, change: "Total entries", trend: "up" }
  ];

  const milestones = [
    { title: "First Weight Log", date: weightLogs.length > 0 ? new Date(weightLogs[weightLogs.length - 1]?.logged_at).toLocaleDateString() : "", achieved: weightLogs.length > 0 },
    { title: "Lost 5 lbs", date: "", achieved: weightLost >= 5 },
    { title: "Lost 10 lbs", date: "", achieved: weightLost >= 10 },
    { title: "Lost 15 lbs", date: "", achieved: weightLost >= 15 },
    { title: "Goal Weight", date: "", achieved: currentWeight <= goalWeight && goalWeight > 0 }
  ];

  // Mobile view - MacroFactor-style precision dashboard
  if (isMobile) {
    return (
      <section id="progress" className="py-4">
        <div className="container px-4">
          <h2 className="text-2xl font-bold mb-4">Your Progress</h2>
          
          {/* Mobile Nutrition Analytics Dashboard */}
          <NutritionAnalytics />
          
          {/* Goal Indicators */}
          <div className="mt-4">
            <GoalIndicators
              macroGoalsMet={weeklySummary.ketoDays > 0 ? Math.round((weeklySummary.ketoDays / 7) * 100) : 0}
              weightLossGoal={10}
              currentWeightLoss={weightLost}
              currentStreak={weeklySummary.currentStreak}
              bestStreak={weeklySummary.currentStreak}
            />
          </div>
          
          {/* Health Dashboard */}
          <div className="mt-4">
            <HealthDashboard
              currentWeight={currentWeight}
              height={profile?.height || 68}
            />
          </div>
          
          {/* Weekly Report */}
          <div className="mt-4">
            <WeeklyReport
              avgCarbs={15}
              avgProtein={100}
              avgFat={120}
              avgCalories={1800}
              carbSuccessRate={weeklySummary.ketoDays > 0 ? Math.round((weeklySummary.ketoDays / 7) * 100) : 0}
              weightChange={weeklySummary.weeklyWeightChange}
              daysTracked={weeklySummary.ketoDays}
            />
          </div>
          
          {/* Insights */}
          <div className="mt-4">
            <ProgressInsights
              data={{
                carbDaysMetTarget: weeklySummary.ketoDays,
                totalDays: 7,
                avgCalories: 1800,
                caloriesTrend: weeklySummary.weeklyWeightChange > 0 ? 'down' : 'stable',
                weightTrend: weeklySummary.weeklyWeightChange > 0 ? 'down' : 'stable',
                proteinAdherence: 85
              }}
            />
          </div>
          
          {/* Streaks and Leaderboard */}
          <div className="mt-4 space-y-4">
            <StreakWidget />
            <LeaderboardWidget />
          </div>
          
          {/* Keto and Workout Charts */}
          <div className="mt-4 space-y-4">
            <KetoStreakChart />
            <WorkoutChart />
          </div>
        </div>
      </section>
    );
  }

  // Desktop view - now mirrors mobile with full analytics
  return (
    <section id="progress" className="py-8 bg-secondary/30">
      <div className="container">
        <div className="text-center mb-8">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Track Your Success
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Visualize your keto journey with detailed progress tracking, 
            milestone celebrations, and motivational insights.
          </p>
        </div>

        <div className="max-w-6xl mx-auto space-y-6">
          {/* Nutrition Analytics Dashboard - Same as mobile */}
          <NutritionAnalytics />

          {/* Goal Indicators & Health Dashboard */}
          <div className="grid lg:grid-cols-2 gap-6">
            <GoalIndicators
              macroGoalsMet={weeklySummary.ketoDays > 0 ? Math.round((weeklySummary.ketoDays / 7) * 100) : 0}
              weightLossGoal={10}
              currentWeightLoss={weightLost}
              currentStreak={weeklySummary.currentStreak}
              bestStreak={weeklySummary.currentStreak}
            />
            <HealthDashboard
              currentWeight={currentWeight}
              height={profile?.height || 68}
            />
          </div>

          {/* Weekly Report & Insights */}
          <div className="grid lg:grid-cols-2 gap-6">
            <WeeklyReport
              avgCarbs={15}
              avgProtein={100}
              avgFat={120}
              avgCalories={1800}
              carbSuccessRate={weeklySummary.ketoDays > 0 ? Math.round((weeklySummary.ketoDays / 7) * 100) : 0}
              weightChange={weeklySummary.weeklyWeightChange}
              daysTracked={weeklySummary.ketoDays}
            />
            <ProgressInsights
              data={{
                carbDaysMetTarget: weeklySummary.ketoDays,
                totalDays: 7,
                avgCalories: 1800,
                caloriesTrend: weeklySummary.weeklyWeightChange > 0 ? 'down' : 'stable',
                weightTrend: weeklySummary.weeklyWeightChange > 0 ? 'down' : 'stable',
                proteinAdherence: 85
              }}
            />
          </div>

          {/* Visual Progress Charts */}
          <VisualProgressCharts 
            weightData={weightLogs.map(w => ({ date: w.logged_at, weight: w.weight }))}
            macroData={[]}
            calorieData={[]}
          />

          {/* User Progress Widget */}
          <UserProgressWidget />

          {/* Leaderboard and Streaks Row */}
          <div className="grid lg:grid-cols-2 gap-6">
            <LeaderboardWidget />
            <StreakWidget />
          </div>

          {/* Keto and Workout Charts */}
          <div className="grid md:grid-cols-2 gap-6">
            <KetoStreakChart />
            <WorkoutChart />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">{stat.label}</span>
                    {stat.trend === "down" && <TrendingDown className="h-4 w-4 text-keto-green" />}
                    {stat.trend === "target" && <Target className="h-4 w-4 text-keto-yellow" />}
                    {stat.trend === "up" && <Award className="h-4 w-4 text-keto-green" />}
                  </div>
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.change}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Weight Progress</span>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Log Weight
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Log New Weight</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Weight (lbs)</label>
                          <Input
                            type="number"
                            value={newCurrentWeight}
                            onChange={(e) => setNewCurrentWeight(e.target.value)}
                            placeholder="Enter your current weight"
                          />
                        </div>
                        <Button onClick={updateCurrentWeight} className="w-full">
                          Log Weight
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress to Goal</span>
                    <span>{progressPercentage}% Complete</span>
                  </div>
                  <Progress value={Math.min(progressPercentage, 100)} className="h-3" />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Starting Weight</span>
                    <span className="font-medium">{startingWeight} lbs</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Current Weight</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{currentWeight} lbs</span>
                      <Dialog open={editingWeight} onOpenChange={setEditingWeight}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Update Current Weight</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">Weight (lbs)</label>
                              <Input
                                type="number"
                                value={newCurrentWeight}
                                onChange={(e) => setNewCurrentWeight(e.target.value)}
                                placeholder="Enter your current weight"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button onClick={updateCurrentWeight} className="flex-1">
                                Update
                              </Button>
                              <Button variant="outline" onClick={() => setEditingWeight(false)} className="flex-1">
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Goal Weight</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{goalWeight} lbs</span>
                      <Dialog open={editingGoal} onOpenChange={setEditingGoal}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Update Goal Weight</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">Goal Weight (lbs)</label>
                              <Input
                                type="number"
                                value={newGoalWeight}
                                onChange={(e) => setNewGoalWeight(e.target.value)}
                                placeholder="Enter your goal weight"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button onClick={updateGoalWeight} className="flex-1">
                                Update
                              </Button>
                              <Button variant="outline" onClick={() => setEditingGoal(false)} className="flex-1">
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm font-medium">Total Lost</span>
                    <span className="font-bold text-keto-green">{weightLost.toFixed(1)} lbs</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Milestones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {milestones.map((milestone, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        milestone.achieved ? 'bg-keto-green' : 'bg-muted'
                      }`} />
                      <div className="flex-1">
                        <div className={`font-medium ${
                          milestone.achieved ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {milestone.title}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {milestone.date}
                        </div>
                      </div>
                      {milestone.achieved && (
                        <Award className="h-4 w-4 text-keto-yellow" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* MacroFactor Style Charts */}
          <div className="mt-8 grid lg:grid-cols-2 gap-6">
            <MacroRings 
              protein={{ current: 85, goal: 120 }}
              carbs={{ current: 18, goal: 25 }}
              fat={{ current: 95, goal: 130 }}
            />
            <ExpenditureChart 
              data={[
                { day: 'Mon', consumed: 1850, burned: 2100 },
                { day: 'Tue', consumed: 1920, burned: 2200 },
                { day: 'Wed', consumed: 1780, burned: 1950 },
                { day: 'Thu', consumed: 1900, burned: 2150 },
                { day: 'Fri', consumed: 2050, burned: 2300 },
                { day: 'Sat', consumed: 1950, burned: 2000 },
                { day: 'Sun', consumed: 1800, burned: 1900 },
              ]}
            />
          </div>

          <div className="mt-6">
            <WeightTrendChart 
              data={weightLogs.slice().reverse().map((log: any) => ({
                date: new Date(log.logged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                weight: log.weight
              }))}
              goalWeight={goalWeight}
            />
          </div>

          <div className="mt-6">
            <BodyComposition />
          </div>

          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-keto-green-light to-transparent rounded-lg">
                    <div className="text-3xl mb-2">🎯</div>
                    <div className="text-2xl font-bold text-keto-green">{weeklySummary.ketoDays}/7</div>
                    <div className="text-sm text-muted-foreground">Days in Ketosis</div>
                    <Progress value={(weeklySummary.ketoDays / 7) * 100} className="h-2 mt-2" />
                  </div>
                  
                  <div className="text-center p-6 bg-gradient-to-br from-keto-yellow-light to-transparent rounded-lg">
                    <div className="text-3xl mb-2">🔥</div>
                    <div className="text-2xl font-bold text-keto-yellow">{weeklySummary.currentStreak}</div>
                    <div className="text-sm text-muted-foreground">Day Streak</div>
                    <Progress value={Math.min(100, (weeklySummary.currentStreak / 30) * 100)} className="h-2 mt-2" />
                  </div>
                  
                  <div className="text-center p-6 bg-gradient-to-br from-secondary to-transparent rounded-lg">
                    <div className="text-3xl mb-2">⚡</div>
                    <div className={`text-2xl font-bold ${weeklySummary.weeklyWeightChange > 0 ? 'text-keto-green' : 'text-orange-500'}`}>
                      {weeklySummary.weeklyWeightChange > 0 ? '-' : '+'}{Math.abs(weeklySummary.weeklyWeightChange).toFixed(1)} lbs
                    </div>
                    <div className="text-sm text-muted-foreground">This Week</div>
                    <Progress 
                      value={Math.min(100, Math.abs(weeklySummary.weeklyWeightChange) * 20)} 
                      className="h-2 mt-2" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ProgressDashboard;