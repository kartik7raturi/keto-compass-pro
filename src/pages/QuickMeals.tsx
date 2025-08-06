import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Utensils, ChefHat, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

const QuickMeals = () => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [filteredMeals, setFilteredMeals] = useState<Meal[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [filterTime, setFilterTime] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchQuickMeals();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [meals, filterTime, filterType]);

  const fetchQuickMeals = async () => {
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('is_quick_meal', true)
      .order('prep_time');

    if (error) {
      toast({
        title: "Error fetching quick meals",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setMeals(data || []);
    }
  };

  const applyFilters = () => {
    let filtered = [...meals];

    if (filterTime !== "all") {
      const maxTime = parseInt(filterTime);
      filtered = filtered.filter(meal => (meal.prep_time + meal.cook_time) <= maxTime);
    }

    if (filterType !== "all") {
      filtered = filtered.filter(meal => meal.meal_type === filterType);
    }

    setFilteredMeals(filtered);
  };

  const getTotalTime = (meal: Meal) => meal.prep_time + meal.cook_time;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Quick Keto Meals</h1>
          <p className="text-xl text-muted-foreground">Fast and delicious keto recipes ready in 30 minutes or less</p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Meals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Cooking Time</label>
                <Select value={filterTime} onValueChange={setFilterTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any time</SelectItem>
                    <SelectItem value="15">15 minutes or less</SelectItem>
                    <SelectItem value="30">30 minutes or less</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Meal Type</label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any type</SelectItem>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Meals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMeals.map((meal) => (
            <Card key={meal.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{meal.title}</CardTitle>
                <CardDescription>{meal.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {getTotalTime(meal)} min
                  </span>
                  <span className="flex items-center gap-1">
                    <Utensils className="h-4 w-4" />
                    {meal.servings} servings
                  </span>
                  <Badge variant="outline">{meal.difficulty}</Badge>
                </div>
                
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div className="text-center">
                    <div className="font-medium">{meal.calories}</div>
                    <div className="text-muted-foreground">cal</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{meal.carbs}g</div>
                    <div className="text-muted-foreground">carbs</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{meal.protein}g</div>
                    <div className="text-muted-foreground">protein</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{meal.fat}g</div>
                    <div className="text-muted-foreground">fat</div>
                  </div>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full" onClick={() => setSelectedMeal(meal)}>
                      View Recipe
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-2xl">{selectedMeal?.title}</DialogTitle>
                      <DialogDescription>{selectedMeal?.description}</DialogDescription>
                    </DialogHeader>
                    {selectedMeal && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="text-center p-3 bg-muted rounded-lg">
                            <Clock className="h-5 w-5 mx-auto mb-1" />
                            <div className="font-medium">Total: {getTotalTime(selectedMeal)}m</div>
                          </div>
                          <div className="text-center p-3 bg-muted rounded-lg">
                            <Utensils className="h-5 w-5 mx-auto mb-1" />
                            <div className="font-medium">{selectedMeal.servings} servings</div>
                          </div>
                          <div className="text-center p-3 bg-muted rounded-lg">
                            <ChefHat className="h-5 w-5 mx-auto mb-1" />
                            <div className="font-medium">{selectedMeal.difficulty}</div>
                          </div>
                          <div className="text-center p-3 bg-muted rounded-lg">
                            <div className="font-medium">{selectedMeal.calories} cal</div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold mb-3">Ingredients</h3>
                          <ul className="space-y-2">
                            {selectedMeal.ingredients.map((ingredient, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-primary rounded-full"></span>
                                {ingredient}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold mb-3">Instructions</h3>
                          <ol className="space-y-3">
                            {selectedMeal.instructions.map((instruction, index) => (
                              <li key={index} className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                                  {index + 1}
                                </span>
                                <span>{instruction}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMeals.length === 0 && (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No meals found</h3>
            <p className="text-muted-foreground">Try adjusting your filters to see more meals</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default QuickMeals;