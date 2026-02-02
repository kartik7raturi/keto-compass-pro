import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Zap, ScanLine } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Food {
  id: string;
  name: string;
  carbs: number;
  protein: number;
  fat: number;
  calories: number;
}

interface AddFoodSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mealType: string;
  onAddFood: (food: Food, mealType: string) => void;
}

const quickFoods: Food[] = [
  { id: "qf1", name: "🥑 Avocado (1 medium)", carbs: 2, protein: 2, fat: 15, calories: 160 },
  { id: "qf2", name: "🧀 Cheddar Cheese (1 oz)", carbs: 1, protein: 7, fat: 9, calories: 113 },
  { id: "qf3", name: "🥩 Ground Beef (3 oz)", carbs: 0, protein: 22, fat: 15, calories: 213 },
  { id: "qf4", name: "🥜 Almonds (1 oz)", carbs: 3, protein: 6, fat: 14, calories: 164 },
  { id: "qf5", name: "🥚 Eggs (2 large)", carbs: 1, protein: 12, fat: 10, calories: 140 },
  { id: "qf6", name: "🥓 Bacon (3 strips)", carbs: 0, protein: 9, fat: 14, calories: 161 },
];

export const AddFoodSheet = ({ open, onOpenChange, mealType, onAddFood }: AddFoodSheetProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [recipes, setRecipes] = useState<Food[]>([]);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    const { data } = await supabase
      .from('recipes')
      .select('id, title, carbs, protein, fat, calories')
      .limit(20);
    
    if (data) {
      setRecipes(data.map(r => ({
        id: r.id,
        name: r.title,
        carbs: r.carbs || 0,
        protein: r.protein || 0,
        fat: r.fat || 0,
        calories: r.calories || 0
      })));
    }
  };

  const filteredRecipes = recipes.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddFood = (food: Food) => {
    onAddFood(food, mealType);
    onOpenChange(false);
    setSearchQuery("");
  };

  const mealLabels: Record<string, string> = {
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    snacks: "Snacks"
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-xl">
        <SheetHeader className="pb-4">
          <SheetTitle>Add to {mealLabels[mealType] || mealType}</SheetTitle>
        </SheetHeader>
        
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search food or recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon">
            <ScanLine className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="h-[calc(100%-120px)]">
          <div className="space-y-6">
            {/* Quick Add */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                <Zap className="h-4 w-4 text-primary" />
                Quick Add
              </h3>
              <div className="space-y-2">
                {quickFoods.map((food) => (
                  <Button
                    key={food.id}
                    variant="outline"
                    className="w-full justify-between h-auto py-3"
                    onClick={() => handleAddFood(food)}
                  >
                    <span className="font-medium text-left">{food.name}</span>
                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                      {food.calories} cal
                    </span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Recipes */}
            {filteredRecipes.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 text-sm">Recipes</h3>
                <div className="space-y-2">
                  {filteredRecipes.map((recipe) => (
                    <Button
                      key={recipe.id}
                      variant="outline"
                      className="w-full justify-between h-auto py-3"
                      onClick={() => handleAddFood(recipe)}
                    >
                      <span className="font-medium text-left truncate flex-1">{recipe.name}</span>
                      <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded ml-2">
                        {recipe.calories} cal
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
