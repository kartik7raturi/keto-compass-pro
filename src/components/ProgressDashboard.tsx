import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Calendar, TrendingDown, Award, Target, Plus } from "lucide-react";

const ProgressDashboard = () => {
  const stats = [
    { label: "Current Weight", value: "168 lbs", change: "-12 lbs", trend: "down" },
    { label: "Goal Weight", value: "155 lbs", change: "13 lbs to go", trend: "target" },
    { label: "Body Fat", value: "22%", change: "-3%", trend: "down" },
    { label: "Ketosis Days", value: "28", change: "This month", trend: "up" }
  ];

  const milestones = [
    { title: "First Week Complete", date: "2024-01-15", achieved: true },
    { title: "Lost 5 lbs", date: "2024-01-22", achieved: true },
    { title: "30 Days Consistent", date: "2024-02-05", achieved: true },
    { title: "Lost 10 lbs", date: "2024-02-12", achieved: true },
    { title: "Goal Weight", date: "2024-03-15", achieved: false }
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
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">{stat.label}</span>
                    {stat.trend === "down" && <TrendingDown className="h-4 w-4 text-keto-green" />}
                    {stat.trend === "target" && <Target className="h-4 w-4 text-keto-orange" />}
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
                  <Button variant="outline" size="sm" onClick={() => console.log('Log Weight clicked')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Log Weight
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress to Goal</span>
                    <span>48% Complete</span>
                  </div>
                  <Progress value={48} className="h-3" />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Starting Weight</span>
                    <span className="font-medium">180 lbs</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Current Weight</span>
                    <span className="font-medium">168 lbs</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Goal Weight</span>
                    <span className="font-medium">155 lbs</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm font-medium">Total Lost</span>
                    <span className="font-bold text-keto-green">12 lbs</span>
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
                        <Award className="h-4 w-4 text-keto-orange" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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
                  
                  <div className="text-center p-6 bg-gradient-to-br from-keto-orange-light to-transparent rounded-lg">
                    <div className="text-3xl mb-2">🔥</div>
                    <div className="text-2xl font-bold text-keto-orange">28</div>
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