import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, Utensils, Target, Droplet, Dumbbell, Timer, CheckSquare, Heart, Zap } from "lucide-react";
import { CalorieRing } from "@/components/tracker/CalorieRing";
import { MealSection } from "@/components/tracker/MealSection";
import { MacroSummary } from "@/components/tracker/MacroSummary";
import { DateNavigator } from "@/components/tracker/DateNavigator";
import { AddFoodSheet } from "@/components/tracker/AddFoodSheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { format } from "date-fns";
import { useAuth } from "@/components/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";

// SEO Component
const SEO = () => {
  useEffect(() => {
    const title = "Free Macro & Calorie Tracker | Ketopia - Keto Diet Tracker";
    const description = "Track your macros, calories, and keto diet for free. Smart macro tracking with food database, barcode scanner, and ketosis monitoring.";
    const keywords = "free macro tracker, free calorie tracker, keto tracker, carb counter, macro counting app, ketogenic diet tracker";
    
    document.title = title;
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) { meta = document.createElement("meta"); meta.name = "description"; document.head.appendChild(meta); }
    meta.content = description;
    
    let keywordsMeta = document.querySelector('meta[name="keywords"]') as HTMLMetaElement | null;
    if (!keywordsMeta) { keywordsMeta = document.createElement("meta"); keywordsMeta.name = "keywords"; document.head.appendChild(keywordsMeta); }
    keywordsMeta.content = keywords;
    
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = window.location.href;
  }, []);
  return null;
};

interface MealItem {
  id: string;
  name: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  time?: string;
  mealType: string;
}

const Tracker = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [addFoodOpen, setAddFoodOpen] = useState(false);
  const [activeMealType, setActiveMealType] = useState("breakfast");
  const [meals, setMeals] = useState<MealItem[]>([]);

  // Personalized goals — pulled from the user's onboarding survey when signed in,
  // falling back to sensible defaults for guests who haven't set targets yet.
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [macroGoals, setMacroGoals] = useState({ carbs: 25, protein: 120, fat: 150 });

  useEffect(() => {
    if (!user) return;
    supabase
      .from('user_survey_responses')
      .select('daily_calorie_target, daily_carb_target, daily_protein_target, daily_fat_target')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          if (data.daily_calorie_target) setCalorieGoal(data.daily_calorie_target);
          setMacroGoals({
            carbs: data.daily_carb_target ?? 25,
            protein: data.daily_protein_target ?? 120,
            fat: data.daily_fat_target ?? 150,
          });
        }
      });
  }, [user]);

  // Load meals for the selected date — from Supabase for signed-in users (synced
  // across devices), or localStorage as a fallback for guests.
  useEffect(() => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');

    if (user) {
      supabase
        .from('daily_food_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('log_date', dateKey)
        .order('logged_at', { ascending: true })
        .then(({ data, error }) => {
          if (error) {
            console.error('Error loading food logs:', error);
            return;
          }
          setMeals(
            (data || []).map((row) => ({
              id: row.id,
              name: row.name,
              calories: row.calories,
              carbs: row.carbs,
              protein: row.protein,
              fat: row.fat,
              time: format(new Date(row.logged_at), 'h:mm a'),
              mealType: row.meal_type,
            }))
          );
        });
    } else {
      const saved = localStorage.getItem(`meals_${dateKey}`);
      setMeals(saved ? JSON.parse(saved) : []);
    }
  }, [selectedDate, user]);

  // Calculate totals
  const totals = meals.reduce((acc, meal) => ({
    calories: acc.calories + meal.calories,
    carbs: acc.carbs + meal.carbs,
    protein: acc.protein + meal.protein,
    fat: acc.fat + meal.fat,
  }), { calories: 0, carbs: 0, protein: 0, fat: 0 });

  const getMealsByType = (type: string) => 
    meals.filter(m => m.mealType === type);

  const getMealTotalCalories = (type: string) =>
    getMealsByType(type).reduce((sum, m) => sum + m.calories, 0);

  const handleAddFood = async (food: { id: string; name: string; carbs: number; protein: number; fat: number; calories: number }, mealType: string) => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const now = new Date();

    if (user) {
      const { data, error } = await supabase
        .from('daily_food_logs')
        .insert({
          user_id: user.id,
          log_date: dateKey,
          meal_type: mealType,
          name: food.name,
          calories: food.calories,
          carbs: food.carbs,
          protein: food.protein,
          fat: food.fat,
          logged_at: now.toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving food log:', error);
        return;
      }

      setMeals((prev) => [
        ...prev,
        {
          id: data.id,
          name: data.name,
          calories: data.calories,
          carbs: data.carbs,
          protein: data.protein,
          fat: data.fat,
          time: format(now, 'h:mm a'),
          mealType: data.meal_type,
        },
      ]);
    } else {
      const newMeal: MealItem = {
        id: `${Date.now()}-${food.id}`,
        name: food.name,
        calories: food.calories,
        carbs: food.carbs,
        protein: food.protein,
        fat: food.fat,
        time: format(now, 'h:mm a'),
        mealType,
      };
      const newMeals = [...meals, newMeal];
      localStorage.setItem(`meals_${dateKey}`, JSON.stringify(newMeals));
      setMeals(newMeals);
    }
  };

  const openAddFood = (mealType: string) => {
    setActiveMealType(mealType);
    setAddFoodOpen(true);
  };

  const trackerOptions = [
    { title: "30-Day Keto", icon: CheckSquare, path: "/tracker/30-day-keto" },
    { title: "Fasting", icon: Timer, path: "/tracker/fasting" },
    { title: "Workout", icon: Dumbbell, path: "/tracker/workout" },
    { title: "Water", icon: Droplet, path: "/tracker/water" },
    { title: "Weekly Plan", icon: Calendar, path: "/tracker/weekly-plan" },
    { title: "Period", icon: Heart, path: "/tracker/period" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO />
      <Header />
      <main className="container mx-auto px-4 py-6">
        {/* Date Navigator */}
        <div className="mb-6">
          <DateNavigator date={selectedDate} onDateChange={setSelectedDate} />
        </div>

        {!user && (
          <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
            You're tracking as a guest — this data is only saved on this device.{' '}
            <button className="text-primary font-medium hover:underline" onClick={() => navigate('/auth')}>
              Sign in
            </button>{' '}
            to save your progress and access it from anywhere.
          </div>
        )}

        {/* Calorie Summary Card */}
        <Card className="mb-6 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Calorie Ring */}
              <div className="flex flex-col items-center">
                <CalorieRing consumed={totals.calories} goal={calorieGoal} />
                <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{calorieGoal} Goal</span>
                  <span>-</span>
                  <span>{totals.calories} Food</span>
                  <span>=</span>
                  <span className="text-foreground font-medium">
                    {Math.max(0, calorieGoal - totals.calories)} Remaining
                  </span>
                </div>
              </div>
              
              {/* Macro Summary */}
              <div className="flex-1 w-full md:w-auto">
                <MacroSummary
                  carbs={{ current: totals.carbs, target: macroGoals.carbs }}
                  protein={{ current: totals.protein, target: macroGoals.protein }}
                  fat={{ current: totals.fat, target: macroGoals.fat }}
                />
              </div>
            </div>

            {/* Ketosis Status */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <Zap className={`h-5 w-5 ${totals.carbs <= macroGoals.carbs ? 'text-primary' : 'text-destructive'}`} />
                <span className="font-medium">
                  {totals.carbs <= macroGoals.carbs 
                    ? "In Ketosis Range 🎯" 
                    : "Above Carb Limit ⚠️"
                  }
                </span>
                <span className="text-sm text-muted-foreground ml-auto">
                  {totals.carbs <= macroGoals.carbs 
                    ? `${macroGoals.carbs - totals.carbs}g carbs left` 
                    : `${totals.carbs - macroGoals.carbs}g over limit`
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Meal Sections */}
        <div className="space-y-4 mb-8">
          <MealSection
            title="Breakfast"
            icon="☀️"
            items={getMealsByType("breakfast")}
            onAddFood={() => openAddFood("breakfast")}
            totalCalories={getMealTotalCalories("breakfast")}
          />
          <MealSection
            title="Lunch"
            icon="🌤️"
            items={getMealsByType("lunch")}
            onAddFood={() => openAddFood("lunch")}
            totalCalories={getMealTotalCalories("lunch")}
          />
          <MealSection
            title="Dinner"
            icon="🌙"
            items={getMealsByType("dinner")}
            onAddFood={() => openAddFood("dinner")}
            totalCalories={getMealTotalCalories("dinner")}
          />
          <MealSection
            title="Snacks"
            icon="🍎"
            items={getMealsByType("snacks")}
            onAddFood={() => openAddFood("snacks")}
            totalCalories={getMealTotalCalories("snacks")}
          />
        </div>

        {/* Other Trackers */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">More Trackers</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {trackerOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Button
                  key={option.path}
                  variant="outline"
                  className="h-auto py-4 flex flex-col gap-2"
                  onClick={() => navigate(option.path)}
                >
                  <Icon className="h-5 w-5 text-primary" />
                  <span className="text-xs">{option.title}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="h-auto py-4"
            onClick={() => navigate("/quick-meals")}
          >
            <Clock className="h-5 w-5 mr-2" />
            Quick Meals
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4"
            onClick={() => navigate("/custom-plan")}
          >
            <Utensils className="h-5 w-5 mr-2" />
            Custom Plan
          </Button>
        </div>

        {/* Add Food Sheet */}
        <AddFoodSheet
          open={addFoodOpen}
          onOpenChange={setAddFoodOpen}
          mealType={activeMealType}
          onAddFood={handleAddFood}
        />
      </main>
      <Footer />
    </div>
  );
};

export default Tracker;
