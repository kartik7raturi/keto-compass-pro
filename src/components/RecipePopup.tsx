import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, Users, Flame, ChefHat } from 'lucide-react';

interface Meal {
  id: string;
  title: string;
  description?: string;
  prep_time?: number;
  cook_time?: number;
  servings?: number;
  calories?: number;
  carbs?: number;
  protein?: number;
  fat?: number;
  difficulty?: string;
  meal_type?: string;
  ingredients?: string[];
  instructions?: string[];
}

interface RecipePopupProps {
  meal: Meal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RecipePopup = ({ meal, open, onOpenChange }: RecipePopupProps) => {
  if (!meal) return null;

  const totalTime = (meal.prep_time || 0) + (meal.cook_time || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-primary" />
            {meal.title}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Description */}
            {meal.description && (
              <p className="text-muted-foreground">{meal.description}</p>
            )}

            {/* Quick Info */}
            <div className="flex flex-wrap gap-4 p-4 bg-muted/50 rounded-lg">
              {totalTime > 0 && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-sm">{totalTime} min</span>
                </div>
              )}
              {meal.servings && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-sm">{meal.servings} servings</span>
                </div>
              )}
              {meal.difficulty && (
                <Badge variant="outline" className="capitalize">{meal.difficulty}</Badge>
              )}
            </div>

            {/* Macros */}
            {(meal.calories || meal.carbs || meal.protein || meal.fat) && (
              <div className="grid grid-cols-4 gap-3">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <Flame className="h-4 w-4 mx-auto mb-1 text-orange-500" />
                  <div className="font-bold">{meal.calories || 0}</div>
                  <div className="text-xs text-muted-foreground">Calories</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="font-bold text-blue-500">{meal.carbs || 0}g</div>
                  <div className="text-xs text-muted-foreground">Net Carbs</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="font-bold text-green-500">{meal.protein || 0}g</div>
                  <div className="text-xs text-muted-foreground">Protein</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="font-bold text-yellow-500">{meal.fat || 0}g</div>
                  <div className="text-xs text-muted-foreground">Fat</div>
                </div>
              </div>
            )}

            {/* Ingredients */}
            {meal.ingredients && meal.ingredients.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3">Ingredients</h3>
                <ul className="space-y-2">
                  {meal.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                      <span>{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Instructions */}
            {meal.instructions && meal.instructions.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3">Instructions</h3>
                <ol className="space-y-3">
                  {meal.instructions.map((instruction, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-medium">
                        {index + 1}
                      </span>
                      <span className="pt-0.5">{instruction}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default RecipePopup;
