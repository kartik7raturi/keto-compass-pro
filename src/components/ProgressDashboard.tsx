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
import KetoStreakChart from "@/components/charts/KetoStreakChart";
import FastingChart from "@/components/charts/FastingChart";
import WorkoutChart from "@/components/charts/WorkoutChart";
import WaterChart from "@/components/charts/WaterChart";
import UserProgressWidget from "@/components/UserProgressWidget";
import { usePointsSystem, POINT_VALUES } from "@/hooks/usePointsSystem";

const ProgressDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { awardPoints } = usePointsSystem();
  const [profile, setProfile] = useState<any>(null);
  const [weightLogs, setWeightLogs] = useState<any[]>([]);
  const [editingWeight, setEditingWeight] = useState(false);
  const [editingGoal, setEditingGoal] = useState(false);
  const [newCurrentWeight, setNewCurrentWeight] = useState("");
  const [newGoalWeight, setNewGoalWeight] = useState("");
  const [loading, setLoading] = useState(true);

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

  return (
    <section id="progress" className="py-20 bg-secondary/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Track Your Success
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Visualize your keto journey with detailed progress tracking, 
            milestone celebrations, and motivational insights.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* User Progress Widget */}
          <div className="mb-8">
            <UserProgressWidget />
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

          {/* Tracker Charts */}
          <div className="mt-8">
            <h3 className="text-2xl font-bold mb-6">Tracker Analytics</h3>
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <KetoStreakChart />
              <FastingChart />
              <WorkoutChart />
              <WaterChart />
            </div>
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
                    <div className="text-2xl font-bold text-keto-green">7/7</div>
                    <div className="text-sm text-muted-foreground">Days in Ketosis</div>
                  </div>
                  
                  <div className="text-center p-6 bg-gradient-to-br from-keto-yellow-light to-transparent rounded-lg">
                    <div className="text-3xl mb-2">🔥</div>
                    <div className="text-2xl font-bold text-keto-yellow">28</div>
                    <div className="text-sm text-muted-foreground">Day Streak</div>
                  </div>
                  
                  <div className="text-center p-6 bg-gradient-to-br from-secondary to-transparent rounded-lg">
                    <div className="text-3xl mb-2">⚡</div>
                    <div className="text-2xl font-bold">2.1 lbs</div>
                    <div className="text-sm text-muted-foreground">This Week</div>
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