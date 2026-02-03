import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MacroRingsProps {
  protein: { current: number; goal: number };
  carbs: { current: number; goal: number };
  fat: { current: number; goal: number };
}

const MacroRing = ({ 
  label, 
  current, 
  goal, 
  color 
}: { 
  label: string; 
  current: number; 
  goal: number; 
  color: string;
}) => {
  const percentage = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-muted"
          />
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke={color}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold">{current}g</span>
          <span className="text-xs text-muted-foreground">/{goal}g</span>
        </div>
      </div>
      <span className="mt-2 text-sm font-medium">{label}</span>
      <span className="text-xs text-muted-foreground">{percentage.toFixed(0)}%</span>
    </div>
  );
};

export const MacroRings = ({ protein, carbs, fat }: MacroRingsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Macro Adherence</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-around">
          <MacroRing 
            label="Protein" 
            current={protein.current} 
            goal={protein.goal} 
            color="hsl(var(--primary))"
          />
          <MacroRing 
            label="Carbs" 
            current={carbs.current} 
            goal={carbs.goal} 
            color="hsl(142, 76%, 36%)"
          />
          <MacroRing 
            label="Fat" 
            current={fat.current} 
            goal={fat.goal} 
            color="hsl(38, 92%, 50%)"
          />
        </div>
      </CardContent>
    </Card>
  );
};
