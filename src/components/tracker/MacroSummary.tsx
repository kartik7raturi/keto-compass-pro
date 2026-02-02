import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface MacroSummaryProps {
  carbs: { current: number; target: number };
  protein: { current: number; target: number };
  fat: { current: number; target: number };
  className?: string;
}

export const MacroSummary = ({ carbs, protein, fat, className }: MacroSummaryProps) => {
  const macros = [
    { name: "Carbs", ...carbs, color: "bg-destructive", unit: "g" },
    { name: "Protein", ...protein, color: "bg-blue-500", unit: "g" },
    { name: "Fat", ...fat, color: "bg-primary", unit: "g" },
  ];

  return (
    <div className={cn("grid grid-cols-3 gap-4", className)}>
      {macros.map((macro) => {
        const percentage = Math.min((macro.current / macro.target) * 100, 100);
        const remaining = Math.max(0, macro.target - macro.current);
        
        return (
          <div key={macro.name} className="text-center">
            <div className="text-xs text-muted-foreground mb-1">{macro.name}</div>
            <div className="text-lg font-bold">
              {Math.round(macro.current)}/{macro.target}
            </div>
            <Progress 
              value={percentage} 
              className="h-2 mt-1"
            />
            <div className="text-xs text-muted-foreground mt-1">
              {remaining}g left
            </div>
          </div>
        );
      })}
    </div>
  );
};
