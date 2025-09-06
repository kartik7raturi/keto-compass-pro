import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { Plus, Utensils, Apple, Beef, Search, Minus, History, Clock, ScanLine, Target, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import BarcodeScanner from "@/components/BarcodeScanner";

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
    { name: "Carbs", current: 15, target: 20, color: "text-destructive", icon: Apple },
    { name: "Protein", current: 120, target: 140, color: "text-blue-500", icon: Beef },
    { name: "Fat", current: 85, target: 120, color: "text-primary", icon: Utensils }
  ]);

  const [newFood, setNewFood] = useState("");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [mealHistory, setMealHistory] = useState<MealLog[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showAddFood, setShowAddFood] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

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

    const updatedHistory = [newMeal, ...mealHistory].slice(0, 50);
    setMealHistory(updatedHistory);
    localStorage.setItem('mealHistory', JSON.stringify(updatedHistory));
    setShowAddFood(false);
    setShowScanner(false);
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
      <Card className="bg-gradient-to-br from-background to-secondary/20 border-primary/10">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Today's Macro Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Enhanced Macro Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {macros.map((macro, index) => {
              const percentage = Math.min((macro.current / macro.target) * 100, 100);
              const Icon = macro.icon;
              const remaining = Math.max(0, macro.target - macro.current);
              
              return (
                <Card key={macro.name} className="relative overflow-hidden border-l-4 border-l-primary/30 hover:border-l-primary/60 transition-all duration-300 hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className={`h-5 w-5 ${macro.color}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{macro.name}</h3>
                          <p className="text-sm text-muted-foreground">{remaining}g remaining</p>
                        </div>
                      </div>
                      <Badge 
                        variant={macro.current > macro.target ? "destructive" : "secondary"} 
                        className="font-medium"
                      >
                        {Math.round(macro.current)}/{macro.target}g
                      </Badge>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateMacro(index, -5)}
                          disabled={macro.current <= 0}
                          className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">{Math.round(macro.current)}</div>
                          <div className="text-xs text-muted-foreground">grams</div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateMacro(index, 5)}
                          className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <Progress 
                          value={percentage} 
                          className="h-3"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{Math.round(percentage)}% of target</span>
                          <span className={percentage > 100 ? "text-destructive font-medium" : ""}>
                            {percentage > 100 ? "Over limit!" : `${remaining}g left`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Enhanced Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <Dialog open={showAddFood} onOpenChange={setShowAddFood}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-primary to-primary/90 hover:opacity-90 shadow-md">
                  <Utensils className="mr-2 h-4 w-4" />
                  Add Food
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Add Food to Tracker
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Search food or recipes..." 
                      value={newFood}
                      onChange={(e) => setNewFood(e.target.value)}
                      className="flex-1"
                    />
                    <Button size="sm" variant="outline">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      Quick Add
                    </h3>
                    <div className="grid gap-2">
                      {quickFoods.map((food, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="w-full justify-between h-auto p-4 hover:border-primary/40"
                          onClick={() => addFoodToMacros(food)}
                        >
                          <span className="font-medium">{food.name}</span>
                          <span className="text-sm text-muted-foreground bg-secondary px-2 py-1 rounded">
                            {food.carbs}C | {food.protein}P | {food.fat}F | {food.calories} cal
                          </span>
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  {filteredRecipes.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Utensils className="h-4 w-4 text-primary" />
                        Recipes ({filteredRecipes.length})
                      </h3>
                      <div className="grid gap-2 max-h-60 overflow-y-auto">
                        {filteredRecipes.map((recipe) => (
                          <Button
                            key={recipe.id}
                            variant="outline"
                            className="w-full justify-between h-auto p-4 hover:border-primary/40"
                            onClick={() => addFoodToMacros({
                              name: recipe.title,
                              carbs: recipe.carbs || 0,
                              protein: recipe.protein || 0,
                              fat: recipe.fat || 0,
                              calories: recipe.calories || 0
                            })}
                          >
                            <span className="font-medium">{recipe.title}</span>
                            <span className="text-sm text-muted-foreground bg-secondary px-2 py-1 rounded">
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
            
            <Dialog open={showScanner} onOpenChange={setShowScanner}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="border-primary text-primary hover:bg-primary/10 shadow-md"
                >
                  <ScanLine className="mr-2 h-4 w-4" />
                  Scan Barcode
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Barcode Scanner</DialogTitle>
                </DialogHeader>
                <BarcodeScanner
                  onFoodAdd={(food) => {
                    addFoodToMacros(food);
                    setShowScanner(false);
                  }}
                  onClose={() => setShowScanner(false)}
                />
              </DialogContent>
            </Dialog>
            
            <Button 
              variant="outline" 
              className="shadow-md"
              onClick={() => setShowHistory(true)}
            >
              <History className="mr-2 h-4 w-4" />
              View History
            </Button>
          </div>

          {/* Enhanced Ketosis Status */}
          <div className="bg-gradient-to-r from-primary/10 to-secondary/20 p-6 rounded-xl border border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Ketosis Status</h3>
                  <p className="text-sm text-muted-foreground">
                    {macros[0].current <= 20 
                      ? "Excellent! You're maintaining ketosis with low carb intake." 
                      : "Warning: High carb intake detected. Consider reducing carbs to maintain ketosis."}
                  </p>
                </div>
              </div>
              <div className="text-4xl">{macros[0].current <= 20 ? "🎯" : "⚠️"}</div>
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
                        <div className="text-sm font-medium text-primary">
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
                <div className="text-sm font-medium text-primary">
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