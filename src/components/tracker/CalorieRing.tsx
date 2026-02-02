import { cn } from "@/lib/utils";

interface CalorieRingProps {
  consumed: number;
  goal: number;
  className?: string;
}

export const CalorieRing = ({ consumed, goal, className }: CalorieRingProps) => {
  const remaining = Math.max(0, goal - consumed);
  const percentage = Math.min((consumed / goal) * 100, 100);
  const isOver = consumed > goal;
  
  // SVG ring calculations
  const size = 180;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isOver ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className={cn(
          "text-3xl font-bold",
          isOver ? "text-destructive" : "text-foreground"
        )}>
          {remaining}
        </span>
        <span className="text-sm text-muted-foreground">
          {isOver ? "Over" : "Remaining"}
        </span>
      </div>
    </div>
  );
};
