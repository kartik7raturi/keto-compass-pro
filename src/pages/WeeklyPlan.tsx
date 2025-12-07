import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Plus, ShoppingCart, Utensils, Clock, ChefHat } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useDietMode } from "@/components/DietModeProvider";

interface Meal {
  id: string;
  title: string;
  description: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  difficulty: string;
  meal_type: string;
  ingredients: string[];
  instructions: string[];
}

interface MealPlanItem {
  id: string;
  day_of_week: number;
  meal_type: string;
  meal: Meal;
}

const WeeklyPlan = () => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [weeklyPlan, setWeeklyPlan] = useState<MealPlanItem[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [selectedMealType, setSelectedMealType] = useState<string>("");
  const [isAddingMeal, setIsAddingMeal] = useState(false);
  const { toast } = useToast();
  const { dietMode } = useDietMode();

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const mealTypes = ['breakfast', 'lunch', 'dinner'];

  useEffect(() => {
    fetchMeals();
    fetchWeeklyPlan();
  }, [dietMode]);

  const fetchMeals = async () => {
    // First try recipes table with diet_type filter
    const { data: recipesData, error: recipesError } = await supabase
      .from('recipes')
      .select('*')
      .eq('diet_type', dietMode)
      .order('title');

    if (!recipesError && recipesData && recipesData.length > 0) {
      const transformedMeals = recipesData.map(recipe => ({
        id: recipe.id,
        title: recipe.title,
        description: recipe.description || '',
        prep_time: recipe.prep_time || 0,
        cook_time: recipe.cook_time || 0,
        servings: recipe.servings || 1,
        calories: recipe.calories || 0,
        carbs: recipe.carbs || 0,
        protein: recipe.protein || 0,
        fat: recipe.fat || 0,
        difficulty: recipe.difficulty || 'easy',
        meal_type: recipe.category || 'meal',
        ingredients: recipe.ingredients || [],
        instructions: recipe.instructions || []
      }));
      setMeals(transformedMeals);
      return;
    }

    // Fallback to meals table
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .order('title');

    if (error) {
      toast({
        title: "Error fetching meals",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setMeals(data || []);
    }
  };

  const fetchWeeklyPlan = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;

    // Get current week's plan
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    
    const { data: planData, error: planError } = await supabase
      .from('meal_plans')
      .select('id')
      .eq('user_id', user.user.id)
      .eq('plan_type', 'weekly')
      .eq('start_date', startOfWeek.toISOString().split('T')[0])
      .maybeSingle();

    if (planError) {
      console.error('Error fetching plan:', planError);
      return;
    }

    if (planData) {
      const { data: items, error: itemsError } = await supabase
        .from('meal_plan_items')
        .select(`
          id,
          day_of_week,
          meal_type,
          meals (*)
        `)
        .eq('meal_plan_id', planData.id);

      if (itemsError) {
        toast({
          title: "Error fetching plan items",
          description: itemsError.message,
          variant: "destructive",
        });
      } else {
        setWeeklyPlan(items?.map(item => ({
          id: item.id,
          day_of_week: item.day_of_week,
          meal_type: item.meal_type,
          meal: item.meals as Meal
        })) || []);
      }
    }
  };

  const addMealToPlan = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create meal plans",
        variant: "destructive",
      });
      return;
    }

    if (!selectedMeal || selectedDay === null || !selectedMealType) {
      toast({
        title: "Missing information",
        description: "Please select a meal, day, and meal type",
        variant: "destructive",
      });
      return;
    }

    // Create or get current week's plan
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    
    let planId;
    const { data: existingPlan } = await supabase
      .from('meal_plans')
      .select('id')
      .eq('user_id', user.user.id)
      .eq('plan_type', 'weekly')
      .eq('start_date', startOfWeek.toISOString().split('T')[0])
      .maybeSingle();

    if (existingPlan) {
      planId = existingPlan.id;
    } else {
      const { data: newPlan, error: planError } = await supabase
        .from('meal_plans')
        .insert({
          user_id: user.user.id,
          title: `Week of ${startOfWeek.toLocaleDateString()}`,
          plan_type: 'weekly',
          start_date: startOfWeek.toISOString().split('T')[0],
        })
        .select('id')
        .single();

      if (planError) {
        toast({
          title: "Error creating plan",
          description: planError.message,
          variant: "destructive",
        });
        return;
      }
      planId = newPlan.id;
    }

    // Add meal to plan
    const { error } = await supabase
      .from('meal_plan_items')
      .insert({
        meal_plan_id: planId,
        meal_id: selectedMeal,
        day_of_week: selectedDay,
        meal_type: selectedMealType,
      });

    if (error) {
      toast({
        title: "Error adding meal",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Meal added!",
        description: "Meal has been added to your weekly plan",
      });
      fetchWeeklyPlan();
      setIsAddingMeal(false);
      setSelectedMeal("");
      setSelectedDay(0);
      setSelectedMealType("");
    }
  };

  const getMealForSlot = (dayIndex: number, mealType: string) => {
    return weeklyPlan.find(item => item.day_of_week === dayIndex && item.meal_type === mealType);
  };

  const removeMealFromPlan = async (itemId: string) => {
    const { error } = await supabase
      .from('meal_plan_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      toast({
        title: "Error removing meal",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Meal removed",
        description: "Meal has been removed from your plan",
      });
      fetchWeeklyPlan();
    }
  };

  const generateShoppingList = () => {
    if (weeklyPlan.length === 0) {
      toast({
        title: "No meals planned",
        description: "Add meals to your weekly plan first",
        variant: "destructive",
      });
      return;
    }

    const allIngredients: string[] = [];
    weeklyPlan.forEach(item => {
      if (item.meal.ingredients) {
        allIngredients.push(...item.meal.ingredients);
      }
    });

    // Group and count similar ingredients
    const ingredientMap = new Map<string, number>();
    allIngredients.forEach(ingredient => {
      const normalizedIngredient = ingredient.toLowerCase().trim();
      ingredientMap.set(normalizedIngredient, (ingredientMap.get(normalizedIngredient) || 0) + 1);
    });

    // Create shopping list text
    const shoppingList = Array.from(ingredientMap.entries())
      .map(([ingredient, count]) => count > 1 ? `${ingredient} (x${count})` : ingredient)
      .sort()
      .join('\n');

    // Copy to clipboard
    navigator.clipboard.writeText(shoppingList).then(() => {
      toast({
        title: "Shopping list generated!",
        description: `${ingredientMap.size} unique ingredients copied to clipboard`,
      });
    }).catch(() => {
      // Fallback: show in alert
      alert(`Shopping List:\n\n${shoppingList}`);
      toast({
        title: "Shopping list generated!",
        description: "Shopping list shown in popup",
      });
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Weekly Meal Plan</h1>
          <p className="text-xl text-muted-foreground">
            Plan your {dietMode === 'pcos' ? 'PCOS-friendly' : 'keto'} meals for the entire week
          </p>
        </div>

        <div className="mb-6 flex gap-4">
          <Dialog open={isAddingMeal} onOpenChange={setIsAddingMeal}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Meal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Meal to Plan</DialogTitle>
                <DialogDescription>
                  Select a meal, day, and meal type to add to your weekly plan
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Day</label>
                  <Select value={selectedDay.toString()} onValueChange={(value) => setSelectedDay(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {days.map((day, index) => (
                        <SelectItem key={index} value={index.toString()}>{day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Meal Type</label>
                  <Select value={selectedMealType} onValueChange={setSelectedMealType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select meal type" />
                    </SelectTrigger>
                    <SelectContent>
                      {mealTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Meal</label>
                  <Select value={selectedMeal} onValueChange={setSelectedMeal}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select meal" />
                    </SelectTrigger>
                    <SelectContent>
                      {meals.map((meal) => (
                        <SelectItem key={meal.id} value={meal.id}>{meal.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={addMealToPlan} className="w-full">Add to Plan</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" className="flex items-center gap-2" onClick={generateShoppingList}>
            <ShoppingCart className="h-4 w-4" />
            Generate Shopping List
          </Button>
        </div>

        <div className="grid gap-6">
          {days.map((day, dayIndex) => (
            <Card key={day}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  {day}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {mealTypes.map((mealType) => {
                    const plannedMeal = getMealForSlot(dayIndex, mealType);
                    return (
                      <div key={mealType} className="space-y-2">
                        <h4 className="font-semibold capitalize">{mealType}</h4>
                        {plannedMeal ? (
                          <Card className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h5 className="font-medium">{plannedMeal.meal.title}</h5>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {plannedMeal.meal.description}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {plannedMeal.meal.prep_time + plannedMeal.meal.cook_time}min
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Utensils className="h-3 w-3" />
                                    {plannedMeal.meal.servings} servings
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <ChefHat className="h-3 w-3" />
                                    {plannedMeal.meal.difficulty}
                                  </span>
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {plannedMeal.meal.calories} cal • {plannedMeal.meal.carbs}g carbs • {plannedMeal.meal.protein}g protein • {plannedMeal.meal.fat}g fat
                                </div>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => removeMealFromPlan(plannedMeal.id)}
                              >
                                Remove
                              </Button>
                            </div>
                          </Card>
                        ) : (
                          <div 
                            className="p-4 border-2 border-dashed border-muted rounded-lg text-center text-muted-foreground cursor-pointer hover:border-primary/50"
                            onClick={() => {
                              setSelectedDay(dayIndex);
                              setSelectedMealType(mealType);
                              setIsAddingMeal(true);
                            }}
                          >
                            Click to add {mealType}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WeeklyPlan;