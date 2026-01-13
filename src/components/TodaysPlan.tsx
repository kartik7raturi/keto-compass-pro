import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Calendar, Coffee, Sun, Moon, Check, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface MealItem {
  id: string;
  meal_id: string;
  meal_type: string;
  meal_title: string;
  calories: number | null;
  carbs: number | null;
  protein: number | null;
  fat: number | null;
  completed: boolean;
}

const TodaysPlan = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [meals, setMeals] = useState<MealItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [planTitle, setPlanTitle] = useState<string>('');

  useEffect(() => {
    if (user) {
      fetchTodaysPlan();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchTodaysPlan = async () => {
    if (!user) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const dayOfWeek = new Date().getDay();
      
      // Find active meal plan
      const { data: activePlan } = await supabase
        .from('meal_plans')
        .select('id, title')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .lte('start_date', today)
        .gte('end_date', today)
        .maybeSingle();

      if (!activePlan) {
        setLoading(false);
        return;
      }

      setPlanTitle(activePlan.title);

      // Fetch today's meals
      const { data: planItems } = await supabase
        .from('meal_plan_items')
        .select(`
          id,
          meal_id,
          meal_type,
          meals (
            title,
            calories,
            carbs,
            protein,
            fat
          )
        `)
        .eq('meal_plan_id', activePlan.id)
        .eq('day_of_week', dayOfWeek);

      // Get completed status from local storage
      const completedMeals = JSON.parse(localStorage.getItem(`completed_meals_${today}`) || '{}');

      const todayMeals: MealItem[] = (planItems || []).map((item: any) => ({
        id: item.id,
        meal_id: item.meal_id,
        meal_type: item.meal_type,
        meal_title: item.meals?.title || 'Unknown Meal',
        calories: item.meals?.calories,
        carbs: item.meals?.carbs,
        protein: item.meals?.protein,
        fat: item.meals?.fat,
        completed: completedMeals[item.id] || false,
      }));

      // Sort by meal type
      const mealOrder = ['breakfast', 'lunch', 'snack', 'dinner'];
      todayMeals.sort((a, b) => mealOrder.indexOf(a.meal_type) - mealOrder.indexOf(b.meal_type));
      
      setMeals(todayMeals);
    } catch (error) {
      console.error('Error fetching today\'s plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMealComplete = (mealId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const completedMeals = JSON.parse(localStorage.getItem(`completed_meals_${today}`) || '{}');
    
    const newCompleted = !completedMeals[mealId];
    completedMeals[mealId] = newCompleted;
    localStorage.setItem(`completed_meals_${today}`, JSON.stringify(completedMeals));
    
    setMeals(prev => prev.map(meal => 
      meal.id === mealId ? { ...meal, completed: newCompleted } : meal
    ));

    if (newCompleted) {
      toast({ title: "Meal completed! 🎉" });
    }
  };

  const getMealIcon = (mealType: string) => {
    switch (mealType.toLowerCase()) {
      case 'breakfast': return <Coffee className="h-4 w-4" />;
      case 'lunch': return <Sun className="h-4 w-4" />;
      case 'dinner': return <Moon className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const completedCount = meals.filter(m => m.completed).length;
  const progress = meals.length > 0 ? (completedCount / meals.length) * 100 : 0;

  const totalMacros = meals.reduce((acc, meal) => ({
    calories: acc.calories + (meal.calories || 0),
    carbs: acc.carbs + (meal.carbs || 0),
    protein: acc.protein + (meal.protein || 0),
    fat: acc.fat + (meal.fat || 0),
  }), { calories: 0, carbs: 0, protein: 0, fat: 0 });

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-8 bg-muted rounded" />
            <div className="h-8 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground mb-4">Sign in to see your daily plan</p>
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
        </CardContent>
      </Card>
    );
  }

  if (meals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-primary" />
            Today's Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <p className="text-muted-foreground mb-4">No meal plan for today</p>
          <Button onClick={() => navigate('/custom-plan')} className="gap-2">
            Create Custom Plan
            <ChevronRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-primary" />
            Today's Plan
          </CardTitle>
          <Badge variant={completedCount === meals.length ? "default" : "secondary"}>
            {completedCount}/{meals.length} Done
          </Badge>
        </div>
        {planTitle && (
          <p className="text-sm text-muted-foreground">{planTitle}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-1">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground text-right">
            {Math.round(progress)}% complete
          </p>
        </div>

        {/* Meal List */}
        <ScrollArea className="max-h-64">
          <div className="space-y-2">
            {meals.map((meal) => (
              <div
                key={meal.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  meal.completed 
                    ? 'bg-primary/5 border-primary/20' 
                    : 'bg-muted/30 hover:bg-muted/50'
                }`}
              >
                <Checkbox
                  checked={meal.completed}
                  onCheckedChange={() => toggleMealComplete(meal.id)}
                  className="h-5 w-5"
                />
                <div className={`p-1.5 rounded-full ${
                  meal.completed ? 'bg-primary/20' : 'bg-muted'
                }`}>
                  {getMealIcon(meal.meal_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm truncate ${
                    meal.completed ? 'line-through text-muted-foreground' : ''
                  }`}>
                    {meal.meal_title}
                  </p>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span className="capitalize">{meal.meal_type}</span>
                    {meal.calories && <span>• {meal.calories} cal</span>}
                  </div>
                </div>
                {meal.completed && (
                  <Check className="h-4 w-4 text-primary shrink-0" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Daily Totals */}
        <div className="pt-3 border-t">
          <p className="text-xs text-muted-foreground mb-2">Daily Totals</p>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2 bg-muted/30 rounded">
              <p className="text-xs text-muted-foreground">Calories</p>
              <p className="font-semibold text-sm">{totalMacros.calories}</p>
            </div>
            <div className="p-2 bg-muted/30 rounded">
              <p className="text-xs text-muted-foreground">Carbs</p>
              <p className="font-semibold text-sm">{totalMacros.carbs}g</p>
            </div>
            <div className="p-2 bg-muted/30 rounded">
              <p className="text-xs text-muted-foreground">Protein</p>
              <p className="font-semibold text-sm">{totalMacros.protein}g</p>
            </div>
            <div className="p-2 bg-muted/30 rounded">
              <p className="text-xs text-muted-foreground">Fat</p>
              <p className="font-semibold text-sm">{totalMacros.fat}g</p>
            </div>
          </div>
        </div>

        <Button 
          variant="outline" 
          className="w-full" 
          onClick={() => navigate('/weekly-plan')}
        >
          View Full Week
        </Button>
      </CardContent>
    </Card>
  );
};

export default TodaysPlan;
