import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Settings, Target, Users, Clock } from "lucide-react";

const CustomPlan = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Create Custom Meal Plan</h1>
          <p className="text-xl text-muted-foreground">Personalized keto meal plans tailored to your needs</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Settings Panel */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-keto-green" />
                    Plan Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Plan Duration</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1week">1 Week</SelectItem>
                        <SelectItem value="2weeks">2 Weeks</SelectItem>
                        <SelectItem value="1month">1 Month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="servings">Number of Servings</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select servings" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Person</SelectItem>
                        <SelectItem value="2">2 People</SelectItem>
                        <SelectItem value="4">4 People</SelectItem>
                        <SelectItem value="6">6 People</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget Range</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select budget" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low ($50-75/week)</SelectItem>
                        <SelectItem value="medium">Medium ($75-100/week)</SelectItem>
                        <SelectItem value="high">High ($100+/week)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Configuration */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-keto-green" />
                    Macro Targets
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="carbs">Daily Carbs (g)</Label>
                    <Input id="carbs" placeholder="20" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="protein">Daily Protein (g)</Label>
                    <Input id="protein" placeholder="100" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fat">Daily Fat (g)</Label>
                    <Input id="fat" placeholder="150" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Dietary Preferences</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="dairy-free" />
                        <Label htmlFor="dairy-free">Dairy-Free</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="nut-free" />
                        <Label htmlFor="nut-free">Nut-Free</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="egg-free" />
                        <Label htmlFor="egg-free">Egg-Free</Label>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="vegetarian" />
                        <Label htmlFor="vegetarian">Vegetarian</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="pescatarian" />
                        <Label htmlFor="pescatarian">Pescatarian</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="shellfish-free" />
                        <Label htmlFor="shellfish-free">Shellfish-Free</Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-keto-green" />
                    Cooking Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Maximum Cooking Time</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select max time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Cooking Skill Level</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select skill level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button size="lg" className="w-full">
                <Users className="h-5 w-5 mr-2" />
                Generate Custom Plan
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CustomPlan;