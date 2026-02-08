import React, { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Plus, ShoppingCart, GripVertical, X, Flame, Copy, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { useDietMode } from "@/components/DietModeProvider";
import { RecipePopup } from "@/components/RecipePopup";

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
  const [draggedItem, setDraggedItem] = useState<MealPlanItem | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<{ day: number; type: string } | null>(null);
  const [copying, setCopying] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Meal | null>(null);
  const { toast } = useToast();
  const { dietMode } = useDietMode();
  const isMobile = useIsMobile();

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const fullDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const mealTypes = ['breakfast', 'lunch', 'dinner'];
  const mealTypeIcons = {
    breakfast: '☀️',
    lunch: '🌤️',
    dinner: '🌙'
  };

  useEffect(() => {
    fetchMeals();
    fetchWeeklyPlan();
  }, [dietMode]);

  const fetchMeals = async () => {
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

    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .order('title');

    if (!error) {
      setMeals(data || []);
    }
  };

  const fetchWeeklyPlan = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    
    const { data: planData } = await supabase
      .from('meal_plans')
      .select('id')
      .eq('user_id', user.user.id)
      .or(`plan_type.eq.weekly,plan_type.eq.custom`)
      .gte('end_date', new Date().toISOString().split('T')[0])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (planData) {
      const { data: items } = await supabase
        .from('meal_plan_items')
        .select(`id, day_of_week, meal_type, meals (*)`)
        .eq('meal_plan_id', planData.id);

      setWeeklyPlan(items?.map(item => ({
        id: item.id,
        day_of_week: item.day_of_week ?? 0,
        meal_type: item.meal_type,
        meal: item.meals as Meal
      })) || []);
    }
  };

  const getMealForSlot = (dayIndex: number, mealType: string) => {
    return weeklyPlan.find(item => item.day_of_week === dayIndex && item.meal_type === mealType);
  };

  const handleDragStart = (e: React.DragEvent, item: MealPlanItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.id);
  };

  const handleDragOver = (e: React.DragEvent, day: number, mealType: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSlot({ day, type: mealType });
  };

  const handleDragLeave = () => {
    setDragOverSlot(null);
  };

  const handleDrop = async (e: React.DragEvent, targetDay: number, targetMealType: string) => {
    e.preventDefault();
    setDragOverSlot(null);

    if (!draggedItem) return;

    // Check if target slot already has a meal
    const existingMeal = getMealForSlot(targetDay, targetMealType);
    if (existingMeal && existingMeal.id !== draggedItem.id) {
      toast({
        title: "Slot occupied",
        description: "Remove the existing meal first or swap them",
        variant: "destructive",
      });
      setDraggedItem(null);
      return;
    }

    // Update the meal position in database
    const { error } = await supabase
      .from('meal_plan_items')
      .update({
        day_of_week: targetDay,
        meal_type: targetMealType,
      })
      .eq('id', draggedItem.id);

    if (error) {
      toast({
        title: "Error moving meal",
        description: error.message,
        variant: "destructive",
      });
    } else {
      // Update local state
      setWeeklyPlan(prev => prev.map(item => 
        item.id === draggedItem.id 
          ? { ...item, day_of_week: targetDay, meal_type: targetMealType }
          : item
      ));
      toast({ title: "Meal moved!" });
    }
    setDraggedItem(null);
  };

  const addMealToPlan = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      toast({ title: "Please sign in", variant: "destructive" });
      return;
    }

    if (!selectedMeal || !selectedMealType) {
      toast({ title: "Select a meal and type", variant: "destructive" });
      return;
    }

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
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      
      const { data: newPlan, error: planError } = await supabase
        .from('meal_plans')
        .insert({
          user_id: user.user.id,
          title: `Week of ${startOfWeek.toLocaleDateString()}`,
          plan_type: 'weekly',
          start_date: startOfWeek.toISOString().split('T')[0],
          end_date: endOfWeek.toISOString().split('T')[0],
          is_active: true,
        })
        .select('id')
        .single();

      if (planError) {
        toast({ title: "Error", description: planError.message, variant: "destructive" });
        return;
      }
      planId = newPlan.id;
    }

    // Get full recipe data with ingredients/instructions
    const selectedMealData = meals.find(m => m.id === selectedMeal);
    if (!selectedMealData) {
      toast({ title: "Error", description: "Meal not found", variant: "destructive" });
      return;
    }

    // Fetch complete recipe data if needed
    const { data: fullRecipe } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', selectedMeal)
      .maybeSingle();

    // Always create a new meal entry with complete data
    const { data: newMeal, error: insertError } = await supabase
      .from('meals')
      .insert({
        title: selectedMealData.title,
        description: selectedMealData.description || fullRecipe?.description || '',
        prep_time: selectedMealData.prep_time || 0,
        cook_time: selectedMealData.cook_time || 0,
        servings: selectedMealData.servings || 1,
        calories: selectedMealData.calories || 0,
        carbs: selectedMealData.carbs || 0,
        protein: selectedMealData.protein || 0,
        fat: selectedMealData.fat || 0,
        difficulty: selectedMealData.difficulty || 'easy',
        meal_type: selectedMealData.meal_type || selectedMealType,
        ingredients: fullRecipe?.ingredients || selectedMealData.ingredients || [],
        instructions: fullRecipe?.instructions || selectedMealData.instructions || [],
        user_id: user.user.id,
      })
      .select('id')
      .single();

    if (insertError) {
      toast({ title: "Error", description: insertError.message, variant: "destructive" });
      return;
    }
    
    const mealId = newMeal.id;

    const { error } = await supabase
      .from('meal_plan_items')
      .insert({
        meal_plan_id: planId,
        meal_id: mealId,
        day_of_week: selectedDay,
        meal_type: selectedMealType,
      });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Meal added!" });
      fetchWeeklyPlan();
      setIsAddingMeal(false);
      setSelectedMeal("");
      setSelectedMealType("");
    }
  };

  const removeMealFromPlan = async (itemId: string) => {
    const { error } = await supabase
      .from('meal_plan_items')
      .delete()
      .eq('id', itemId);

    if (!error) {
      setWeeklyPlan(prev => prev.filter(item => item.id !== itemId));
      toast({ title: "Meal removed" });
    }
  };

  const generateShoppingList = () => {
    if (weeklyPlan.length === 0) {
      toast({ title: "No meals planned", variant: "destructive" });
      return;
    }

    const allIngredients: string[] = [];
    weeklyPlan.forEach(item => {
      if (item.meal?.ingredients) {
        allIngredients.push(...item.meal.ingredients);
      }
    });

    const ingredientMap = new Map<string, number>();
    allIngredients.forEach(ingredient => {
      const normalized = ingredient.toLowerCase().trim();
      ingredientMap.set(normalized, (ingredientMap.get(normalized) || 0) + 1);
    });

    const shoppingList = Array.from(ingredientMap.entries())
      .map(([ingredient, count]) => count > 1 ? `${ingredient} (x${count})` : ingredient)
      .sort()
      .join('\n');

    navigator.clipboard.writeText(shoppingList).then(() => {
      toast({ title: "Shopping list copied!", description: `${ingredientMap.size} items` });
    }).catch(() => {
      alert(`Shopping List:\n\n${shoppingList}`);
    });
  };

  // Calculate daily totals
  const getDailyTotals = (dayIndex: number) => {
    const dayMeals = weeklyPlan.filter(item => item.day_of_week === dayIndex);
    return dayMeals.reduce((acc, item) => ({
      calories: acc.calories + (item.meal?.calories || 0),
      carbs: acc.carbs + (item.meal?.carbs || 0),
      protein: acc.protein + (item.meal?.protein || 0),
      fat: acc.fat + (item.meal?.fat || 0),
    }), { calories: 0, carbs: 0, protein: 0, fat: 0 });
  };

  const today = new Date().getDay();

  // Copy week to next week
  const copyWeekToNextWeek = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      toast({ title: "Please sign in", variant: "destructive" });
      return;
    }

    if (weeklyPlan.length === 0) {
      toast({ title: "No meals to copy", description: "Add some meals first", variant: "destructive" });
      return;
    }

    setCopying(true);
    try {
      // Calculate next week's dates
      const startOfNextWeek = new Date();
      startOfNextWeek.setDate(startOfNextWeek.getDate() - startOfNextWeek.getDay() + 7);
      const endOfNextWeek = new Date(startOfNextWeek);
      endOfNextWeek.setDate(endOfNextWeek.getDate() + 6);

      // Create new meal plan for next week
      const { data: newPlan, error: planError } = await supabase
        .from('meal_plans')
        .insert({
          user_id: user.user.id,
          title: `Week of ${startOfNextWeek.toLocaleDateString()}`,
          plan_type: 'weekly',
          start_date: startOfNextWeek.toISOString().split('T')[0],
          end_date: endOfNextWeek.toISOString().split('T')[0],
          is_active: true,
        })
        .select('id')
        .single();

      if (planError) throw planError;

      // Copy each meal to next week
      const newItems = [];
      for (const item of weeklyPlan) {
        if (item.meal) {
          // Create new meal entry
          const { data: newMeal } = await supabase
            .from('meals')
            .insert({
              title: item.meal.title,
              description: item.meal.description,
              prep_time: item.meal.prep_time,
              cook_time: item.meal.cook_time,
              servings: item.meal.servings,
              calories: item.meal.calories,
              carbs: item.meal.carbs,
              protein: item.meal.protein,
              fat: item.meal.fat,
              difficulty: item.meal.difficulty,
              meal_type: item.meal.meal_type,
              ingredients: item.meal.ingredients,
              instructions: item.meal.instructions,
              user_id: user.user.id,
            })
            .select('id')
            .single();

          if (newMeal) {
            newItems.push({
              meal_plan_id: newPlan.id,
              meal_id: newMeal.id,
              day_of_week: item.day_of_week,
              meal_type: item.meal_type,
            });
          }
        }
      }

      if (newItems.length > 0) {
        await supabase.from('meal_plan_items').insert(newItems);
      }

      toast({ 
        title: "Week copied!", 
        description: `${newItems.length} meals copied to next week` 
      });
    } catch (error: any) {
      toast({ title: "Error copying week", description: error.message, variant: "destructive" });
    } finally {
      setCopying(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Calendar className="h-7 w-7 text-primary" />
              Weekly Meal Calendar
            </h1>
            <p className="text-muted-foreground mt-1">
              Drag and drop to rearrange your {dietMode === 'pcos' ? 'PCOS-friendly' : 'keto'} meals
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isAddingMeal} onOpenChange={setIsAddingMeal}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Meal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Meal to Plan</DialogTitle>
                  <DialogDescription>Select a meal to add to your weekly plan</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Day</label>
                    <Select value={selectedDay.toString()} onValueChange={(v) => setSelectedDay(parseInt(v))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        {fullDays.map((day, i) => (
                          <SelectItem key={i} value={i.toString()}>{day}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Meal Type</label>
                    <Select value={selectedMealType} onValueChange={setSelectedMealType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {mealTypes.map((type) => (
                          <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>
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
                        <ScrollArea className="h-60">
                          {meals.map((meal) => (
                            <SelectItem key={meal.id} value={meal.id}>
                              <div className="flex items-center gap-2">
                                <span>{meal.title}</span>
                                <span className="text-xs text-muted-foreground">{meal.calories} cal</span>
                              </div>
                            </SelectItem>
                          ))}
                        </ScrollArea>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={addMealToPlan} className="w-full">Add to Plan</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" className="gap-2" onClick={generateShoppingList}>
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Shopping List</span>
            </Button>
            <Button 
              variant="outline" 
              className="gap-2" 
              onClick={copyWeekToNextWeek}
              disabled={copying || weeklyPlan.length === 0}
            >
              {copying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Copy to Next Week</span>
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header Row */}
            <div className="grid grid-cols-8 gap-2 mb-2">
              <div className="p-2 text-center text-sm font-medium text-muted-foreground">Meal</div>
              {days.map((day, i) => (
                <div 
                  key={day} 
                  className={`p-2 text-center rounded-lg ${
                    i === today 
                      ? 'bg-primary text-primary-foreground font-bold' 
                      : 'bg-muted/50 font-medium'
                  }`}
                >
                  <div className="text-sm">{day}</div>
                  {i === today && <div className="text-xs opacity-80">Today</div>}
                </div>
              ))}
            </div>

            {/* Meal Type Rows */}
            {mealTypes.map((mealType) => (
              <div key={mealType} className="grid grid-cols-8 gap-2 mb-2">
                {/* Meal Type Label */}
                <div className="p-3 flex items-center gap-2 bg-muted/30 rounded-lg">
                  <span className="text-lg">{mealTypeIcons[mealType as keyof typeof mealTypeIcons]}</span>
                  <span className="text-sm font-medium capitalize">{mealType}</span>
                </div>

                {/* Day Slots */}
                {days.map((_, dayIndex) => {
                  const plannedMeal = getMealForSlot(dayIndex, mealType);
                  const isOver = dragOverSlot?.day === dayIndex && dragOverSlot?.type === mealType;

                  return (
                    <div
                      key={`${dayIndex}-${mealType}`}
                      className={`min-h-[100px] rounded-lg border-2 border-dashed transition-all ${
                        isOver 
                          ? 'border-primary bg-primary/10' 
                          : plannedMeal 
                            ? 'border-transparent bg-card shadow-sm' 
                            : 'border-muted-foreground/20 bg-muted/10 hover:bg-muted/20'
                      }`}
                      onDragOver={(e) => handleDragOver(e, dayIndex, mealType)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, dayIndex, mealType)}
                    >
                      {plannedMeal ? (
                        <div
                          draggable
                          onDragStart={(e) => handleDragStart(e, plannedMeal)}
                          className={`h-full p-2 cursor-grab active:cursor-grabbing ${
                            draggedItem?.id === plannedMeal.id ? 'opacity-50' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div 
                              className="flex-1 min-w-0 cursor-pointer hover:opacity-80"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (plannedMeal.meal) {
                                  setSelectedRecipe(plannedMeal.meal);
                                }
                              }}
                            >
                              <div className="flex items-center gap-1">
                                <GripVertical className="h-3 w-3 text-muted-foreground shrink-0" />
                                <p className="text-xs font-medium truncate">{plannedMeal.meal?.title}</p>
                              </div>
                              <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                                <Flame className="h-3 w-3" />
                                <span>{plannedMeal.meal?.calories || 0} cal</span>
                              </div>
                              <div className="mt-1 flex flex-wrap gap-1">
                                <Badge variant="outline" className="text-[9px] px-1 py-0">
                                  C: {plannedMeal.meal?.carbs || 0}g
                                </Badge>
                                <Badge variant="outline" className="text-[9px] px-1 py-0">
                                  P: {plannedMeal.meal?.protein || 0}g
                                </Badge>
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeMealFromPlan(plannedMeal.id);
                              }}
                              className="p-0.5 hover:bg-destructive/20 rounded shrink-0"
                            >
                              <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <button
                            onClick={() => {
                              setSelectedDay(dayIndex);
                              setSelectedMealType(mealType);
                              setIsAddingMeal(true);
                            }}
                            className="p-2 text-muted-foreground/50 hover:text-primary transition-colors"
                          >
                            <Plus className="h-5 w-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Daily Totals Row */}
            <div className="grid grid-cols-8 gap-2 mt-4 pt-4 border-t">
              <div className="p-2 text-sm font-medium text-muted-foreground">Daily Total</div>
              {days.map((_, dayIndex) => {
                const totals = getDailyTotals(dayIndex);
                return (
                  <div 
                    key={`total-${dayIndex}`} 
                    className={`p-2 rounded-lg text-center ${
                      dayIndex === today ? 'bg-primary/10' : 'bg-muted/30'
                    }`}
                  >
                    <div className="text-sm font-bold">{totals.calories}</div>
                    <div className="text-[10px] text-muted-foreground">calories</div>
                    <div className="flex justify-center gap-1 mt-1 text-[9px]">
                      <span className="text-blue-500">C:{totals.carbs}g</span>
                      <span className="text-green-500">P:{totals.protein}g</span>
                      <span className="text-orange-500">F:{totals.fat}g</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Week Summary */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold">Weekly Summary</h3>
                <p className="text-sm text-muted-foreground">
                  {weeklyPlan.length} meals planned across {new Set(weeklyPlan.map(m => m.day_of_week)).size} days
                </p>
              </div>
              <div className="flex gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {weeklyPlan.reduce((acc, item) => acc + (item.meal?.calories || 0), 0)}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Calories</div>
                </div>
                <div className="w-px bg-border" />
                <div>
                  <div className="text-2xl font-bold text-blue-500">
                    {weeklyPlan.reduce((acc, item) => acc + (item.meal?.carbs || 0), 0)}g
                  </div>
                  <div className="text-xs text-muted-foreground">Total Carbs</div>
                </div>
                <div className="w-px bg-border" />
                <div>
                  <div className="text-2xl font-bold text-green-500">
                    {weeklyPlan.reduce((acc, item) => acc + (item.meal?.protein || 0), 0)}g
                  </div>
                  <div className="text-xs text-muted-foreground">Total Protein</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recipe Popup */}
        <RecipePopup 
          meal={selectedRecipe} 
          open={!!selectedRecipe} 
          onOpenChange={(open) => !open && setSelectedRecipe(null)} 
        />
      </main>
      <Footer />
    </div>
  );
};

export default WeeklyPlan;
