import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Settings, Target, Users, Clock, Loader2, Bell, CalendarCheck } from "lucide-react";
import { useDietMode } from "@/components/DietModeProvider";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthContext";

const CustomPlan = () => {
  const { dietMode } = useDietMode();
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [duration, setDuration] = useState("1week");
  const [servings, setServings] = useState("2");
  const [budget, setBudget] = useState("medium");
  const [carbs, setCarbs] = useState("20");
  const [protein, setProtein] = useState("100");
  const [fat, setFat] = useState("150");
  const [maxCookTime, setMaxCookTime] = useState("30");
  const [skillLevel, setSkillLevel] = useState("intermediate");
  const [preferences, setPreferences] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [enableReminders, setEnableReminders] = useState(true);
  const [mealTimes, setMealTimes] = useState({
    breakfast: "08:00",
    lunch: "12:30",
    dinner: "19:00"
  });

  const togglePreference = (pref: string) => {
    setPreferences(prev => 
      prev.includes(pref) ? prev.filter(p => p !== pref) : [...prev, pref]
    );
  };

  const generatePlan = async () => {
    if (!user) {
      toast({ title: "Please sign in to generate a meal plan", variant: "destructive" });
      navigate('/auth');
      return;
    }

    setGenerating(true);
    try {
      const durationDays = duration === '1week' ? 7 : duration === '2weeks' ? 14 : 30;
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + durationDays);

      // Deactivate existing plans
      await supabase
        .from('meal_plans')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('is_active', true);

      // Create meal plan
      const { data: plan, error: planError } = await supabase
        .from('meal_plans')
        .insert({
          user_id: user.id,
          title: `Custom ${dietMode === 'pcos' ? 'PCOS' : 'Keto'} Plan`,
          description: JSON.stringify({
            macros: { carbs: parseInt(carbs), protein: parseInt(protein), fat: parseInt(fat) },
            duration: durationDays,
            preferences,
            mealTimes: enableReminders ? mealTimes : null,
            remindersEnabled: enableReminders
          }),
          plan_type: 'custom',
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          is_active: true,
        })
        .select('id')
        .single();

      if (planError) throw planError;

      // Fetch recipes matching criteria with full data
      let query = supabase
        .from('recipes')
        .select('id, title, description, carbs, protein, fat, calories, prep_time, cook_time, servings, difficulty, ingredients, instructions')
        .eq('diet_type', dietMode);

      if (parseInt(maxCookTime) > 0) {
        query = query.lte('cook_time', parseInt(maxCookTime));
      }

      const { data: recipes } = await query;

      if (!recipes || recipes.length === 0) {
        toast({ 
          title: "No matching recipes found", 
          description: "Try adjusting your preferences",
          variant: "destructive" 
        });
        setGenerating(false);
        return;
      }

      // Add meals to plan for each day
      const mealTypes = ['breakfast', 'lunch', 'dinner'];
      const planItems = [];

      for (let day = 0; day < durationDays; day++) {
        for (const mealType of mealTypes) {
          const randomRecipe = recipes[Math.floor(Math.random() * recipes.length)];
          
          // Create meal entry with full recipe data
          const { data: meal, error: mealError } = await supabase
            .from('meals')
            .insert({
              title: randomRecipe.title,
              description: randomRecipe.description || '',
              calories: randomRecipe.calories || ((randomRecipe.carbs || 0) * 4 + (randomRecipe.protein || 0) * 4 + (randomRecipe.fat || 0) * 9),
              carbs: randomRecipe.carbs || 0,
              protein: randomRecipe.protein || 0,
              fat: randomRecipe.fat || 0,
              prep_time: randomRecipe.prep_time || 0,
              cook_time: randomRecipe.cook_time || 0,
              servings: parseInt(servings),
              difficulty: randomRecipe.difficulty || 'easy',
              meal_type: mealType,
              ingredients: randomRecipe.ingredients || [],
              instructions: randomRecipe.instructions || [],
            })
            .select('id')
            .single();

          if (!mealError && meal) {
            planItems.push({
              meal_plan_id: plan.id,
              meal_id: meal.id,
              day_of_week: day % 7,
              meal_type: mealType,
              servings: parseInt(servings),
            });
          }
        }
      }

      if (planItems.length > 0) {
        await supabase.from('meal_plan_items').insert(planItems);
      }

      toast({ 
        title: "Plan Generated!", 
        description: `Your ${durationDays}-day meal plan is ready.` 
      });
      navigate('/weekly-plan');
    } catch (error: any) {
      console.error('Error generating plan:', error);
      toast({ title: "Error generating plan", description: error.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-4xl font-bold mb-4">Create Custom Meal Plan</h1>
          <p className="text-base md:text-xl text-muted-foreground">
            Personalized {dietMode === 'pcos' ? 'PCOS-friendly' : 'keto'} meal plans tailored to your needs
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Settings Panel */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Settings className="h-5 w-5 text-primary" />
                    Plan Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Plan Duration</Label>
                    <Select value={duration} onValueChange={setDuration}>
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
                    <Select value={servings} onValueChange={setServings}>
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
                    <Select value={budget} onValueChange={setBudget}>
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
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="h-5 w-5 text-primary" />
                    Macro Targets
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="carbs">Daily Carbs (g)</Label>
                    <Input id="carbs" value={carbs} onChange={(e) => setCarbs(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="protein">Daily Protein (g)</Label>
                    <Input id="protein" value={protein} onChange={(e) => setProtein(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fat">Daily Fat (g)</Label>
                    <Input id="fat" value={fat} onChange={(e) => setFat(e.target.value)} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Dietary Preferences</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      {['dairy-free', 'nut-free', 'egg-free'].map(pref => (
                        <div key={pref} className="flex items-center space-x-2">
                          <Checkbox 
                            id={pref} 
                            checked={preferences.includes(pref)}
                            onCheckedChange={() => togglePreference(pref)}
                          />
                          <Label htmlFor={pref} className="capitalize">{pref.replace('-', ' ')}</Label>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-3">
                      {['vegetarian', 'pescatarian', 'shellfish-free'].map(pref => (
                        <div key={pref} className="flex items-center space-x-2">
                          <Checkbox 
                            id={pref}
                            checked={preferences.includes(pref)}
                            onCheckedChange={() => togglePreference(pref)}
                          />
                          <Label htmlFor={pref} className="capitalize">{pref.replace('-', ' ')}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="h-5 w-5 text-primary" />
                    Cooking Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Maximum Cooking Time</Label>
                      <Select value={maxCookTime} onValueChange={setMaxCookTime}>
                        <SelectTrigger>
                          <SelectValue />
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
                      <Select value={skillLevel} onValueChange={setSkillLevel}>
                        <SelectTrigger>
                          <SelectValue />
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

              {/* Meal Reminders */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Bell className="h-5 w-5 text-primary" />
                    Meal Reminders
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Daily Reminders</Label>
                      <p className="text-sm text-muted-foreground">Get notified for each meal</p>
                    </div>
                    <Switch checked={enableReminders} onCheckedChange={setEnableReminders} />
                  </div>
                  
                  {enableReminders && (
                    <div className="grid grid-cols-3 gap-4 pt-2">
                      <div className="space-y-2">
                        <Label className="text-xs">Breakfast</Label>
                        <Input 
                          type="time" 
                          value={mealTimes.breakfast}
                          onChange={(e) => setMealTimes(prev => ({ ...prev, breakfast: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Lunch</Label>
                        <Input 
                          type="time" 
                          value={mealTimes.lunch}
                          onChange={(e) => setMealTimes(prev => ({ ...prev, lunch: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Dinner</Label>
                        <Input 
                          type="time" 
                          value={mealTimes.dinner}
                          onChange={(e) => setMealTimes(prev => ({ ...prev, dinner: e.target.value }))}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Button size="lg" className="w-full" onClick={generatePlan} disabled={generating}>
                {generating ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Generating Your Plan...
                  </>
                ) : (
                  <>
                    <CalendarCheck className="h-5 w-5 mr-2" />
                    Generate & Save Plan
                  </>
                )}
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
