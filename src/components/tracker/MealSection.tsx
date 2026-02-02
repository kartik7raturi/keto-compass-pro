import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MealItem {
  id: string;
  name: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  time?: string;
}

interface MealSectionProps {
  title: string;
  icon: string;
  items: MealItem[];
  onAddFood: () => void;
  totalCalories: number;
  className?: string;
}

export const MealSection = ({ 
  title, 
  icon, 
  items, 
  onAddFood, 
  totalCalories,
  className 
}: MealSectionProps) => {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <h3 className="font-semibold">{title}</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">
            {totalCalories} cal
          </span>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
            onClick={onAddFood}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <CardContent className="p-0">
        {items.length === 0 ? (
          <button
            onClick={onAddFood}
            className="w-full py-4 text-center text-muted-foreground hover:bg-muted/30 transition-colors"
          >
            <span className="text-sm">Tap to add food</span>
          </button>
        ) : (
          <div className="divide-y">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-muted/20 transition-colors cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.carbs}C • {item.protein}P • {item.fat}F
                    {item.time && ` • ${item.time}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{item.calories}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            ))}
            <button
              onClick={onAddFood}
              className="w-full py-3 text-center text-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span className="text-sm font-medium">Add Food</span>
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
