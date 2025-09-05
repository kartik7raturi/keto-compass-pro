import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { Plus, Utensils, Apple, Beef, Search, Minus, History, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Recipe {
  id: string;
  title: string;
  carbs: number;
  protein: number;
  fat: number;
  calories: number;
  servings: number;
}

interface MealLog {
  id: string;
  name: string;
  time: string;
  carbs: number;
  protein: number;
  fat: number;
  calories: number;
  date: string;
}

const EnhancedMacroTracker = () => {
  const [macros, setMacros] = useState([
    { name: "Carbs", current: 15, target: 20, color: "bg-red-500", icon: Apple },
    { name: "Protein", current: 120, target: 140, color: "bg-blue-500", icon: Beef },
    { name: "Fat", current: 85, target: 120, color: "bg-keto-green", icon: Utensils }
  ]);

  const [newFood, setNewFood] = useState("");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [mealHistory, setMealHistory] = useState<MealLog[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showAddFood, setShowAddFood] = useState(false);

  useEffect(() => {
    fetchRecipes();
    loadMealHistory();
  }, []);

  const fetchRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('id, title, carbs, protein, fat, calories, servings');
      
      if (error) throw error;
      setRecipes(data || []);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
  };

  const loadMealHistory = () => {
    // Load from localStorage for now - in a real app, this would come from the database
    const savedHistory = localStorage.getItem('mealHistory');
    if (savedHistory) {
      setMealHistory(JSON.parse(savedHistory));
    }
  };

  const updateMacro = (index: number, amount: number) => {
    const updatedMacros = [...macros];
    updatedMacros[index].current = Math.max(0, updatedMacros[index].current + amount);
    setMacros(updatedMacros);
  };

  const addFoodToMacros = (food: { carbs: number; protein: number; fat: number; calories: number; name: string }) => {
    const updatedMacros = [...macros];
    updatedMacros[0].current += food.carbs;
    updatedMacros[1].current += food.protein;
    updatedMacros[2].current += food.fat;
    setMacros(updatedMacros);

    // Add to meal history
    const newMeal: MealLog = {
      id: Date.now().toString(),
      name: food.name,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      carbs: food.carbs,
      protein: food.protein,
      fat: food.fat,
      calories: food.calories,
      date: new Date().toLocaleDateString()
    };

    const updatedHistory = [newMeal, ...mealHistory].slice(0, 50); // Keep last 50 meals
    setMealHistory(updatedHistory);
    localStorage.setItem('mealHistory', JSON.stringify(updatedHistory));
    setShowAddFood(false);
  };

  const quickFoods = [
    { name: "🥑 Avocado (1 medium)", carbs: 2, protein: 2, fat: 15, calories: 160 },
    { name: "🧀 Cheddar Cheese (1 oz)", carbs: 1, protein: 7, fat: 9, calories: 113 },
    { name: "🥩 Ground Beef (3 oz)", carbs: 0, protein: 22, fat: 15, calories: 213 },
    { name: "🥜 Almonds (1 oz)", carbs: 3, protein: 6, fat: 14, calories: 164 }
  ];

  const filteredRecipes = recipes.filter(recipe => 
    recipe.title.toLowerCase().includes(newFood.toLowerCase())
  );

  const todaysMeals = mealHistory.filter(meal => meal.date === new Date().toLocaleDateString());

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <span>Today's Macros</span>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex gap-2">
                <Input 
                  placeholder="Search food..." 
                  value={newFood}
                  onChange={(e) => setNewFood(e.target.value)}
                  className="w-full sm:w-48"
                />
                <Button size="sm" variant="outline">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <Dialog open={showAddFood} onOpenChange={setShowAddFood}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-gradient-to-r from-keto-green to-keto-yellow">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Food
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add Food</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-3">Quick Add</h3>
                      <div className="grid gap-2">
                        {quickFoods.map((food, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            className="w-full justify-between h-auto p-3"
                            onClick={() => addFoodToMacros(food)}
                          >
                            <span>{food.name}</span>
                            <span className="text-sm text-muted-foreground">
                              {food.carbs}C | {food.protein}P | {food.fat}F | {food.calories} cal
                            </span>
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    {filteredRecipes.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3">Recipes</h3>
                        <div className="grid gap-2 max-h-60 overflow-y-auto">
                          {filteredRecipes.map((recipe) => (
                            <Button
                              key={recipe.id}
                              variant="outline"
                              className="w-full justify-between h-auto p-3"
                              onClick={() => addFoodToMacros({
                                name: recipe.title,
                                carbs: recipe.carbs || 0,
                                protein: recipe.protein || 0,
                                fat: recipe.fat || 0,
                                calories: recipe.calories || 0
                              })}
                            >
                              <span>{recipe.title}</span>
                              <span className="text-sm text-muted-foreground">
                                {recipe.carbs || 0}C | {recipe.protein || 0}P | {recipe.fat || 0}F | {recipe.calories || 0} cal
                              </span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {macros.map((macro, index) => {
              const percentage = Math.min((macro.current / macro.target) * 100, 100);
              const Icon = macro.icon;
              
              return (
                <div key={macro.name} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${macro.color.replace('bg-', 'bg-').replace('-500', '-100')}`}>
                      <Icon className={`h-5 w-5 ${macro.color.replace('bg-', 'text-')}`} />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{macro.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {macro.current}g / {macro.target}g
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-6 w-6 p-0"
                        onClick={() => updateMacro(index, 5)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-6 w-6 p-0"
                        onClick={() => updateMacro(index, -5)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-3" />
                  <div className="text-xs text-muted-foreground text-center">
                    {Math.max(0, macro.target - macro.current)}g remaining
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-keto-green-light to-keto-yellow-light rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Ketosis Status</h3>
                <p className="text-sm text-muted-foreground">
                  {macros[0].current <= 20 ? "You're on track! Keep carbs under 20g to maintain ketosis." : "Warning: High carb intake detected. Consider reducing carbs."}
                </p>
              </div>
              <div className="text-3xl">{macros[0].current <= 20 ? "🎯" : "⚠️"}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recent Meals</span>
            <Dialog open={showHistory} onOpenChange={setShowHistory}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <History className="h-4 w-4 mr-2" />
                  Show History
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Meal History</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  {mealHistory.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No meal history yet</p>
                  ) : (
                    mealHistory.map((meal) => (
                      <div key={meal.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                        <div>
                          <div className="font-medium">{meal.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            {meal.date} • {meal.time} • {meal.calories} cal
                          </div>
                        </div>
                        <div className="text-sm font-medium text-keto-green">
                          {meal.carbs}C | {meal.protein}P | {meal.fat}F
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {todaysMeals.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No meals logged today</p>
          ) : (
            todaysMeals.slice(0, 4).map((meal) => (
              <div key={meal.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <div>
                  <div className="font-medium">{meal.name}</div>
                  <div className="text-sm text-muted-foreground">{meal.time} • {meal.calories} cal</div>
                </div>
                <div className="text-sm font-medium text-keto-green">
                  {meal.carbs}C | {meal.protein}P | {meal.fat}F
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedMacroTracker;