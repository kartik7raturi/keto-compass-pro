import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { useMemo } from "react";

const WaterChart = () => {
  const data = useMemo(() => {
    const savedGoal = localStorage.getItem("water-goal");
    const goal = savedGoal ? Number(savedGoal) : 8;
    
    // Generate sample data for the last 7 days
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().slice(0, 10);
      
      // Check if it's today to get real data
      const isToday = i === 0;
      let cups = 0;
      
      if (isToday) {
        const savedCups = localStorage.getItem("water-cups");
        cups = savedCups ? Number(savedCups) : 0;
      } else {
        // Generate realistic sample data for previous days
        cups = Math.floor(Math.random() * (goal + 2)) + Math.max(0, goal - 3);
      }
      
      days.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        cups: cups,
        goal: goal,
        percentage: Math.round((cups / goal) * 100)
      });
    }
    return days;
  }, []);

  const chartConfig = {
    cups: {
      label: "Cups",
      color: "hsl(var(--primary))",
    },
    goal: {
      label: "Goal",
      color: "hsl(var(--muted-foreground))",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Water Intake</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data}>
              <XAxis dataKey="date" />
              <YAxis />
              <ChartTooltip 
                content={<ChartTooltipContent />} 
                formatter={(value, name) => [`${value} cups`, name === "cups" ? "Consumed" : "Goal"]}
              />
              <Area 
                type="monotone" 
                dataKey="goal" 
                stroke="var(--color-goal)" 
                fill="var(--color-goal)" 
                fillOpacity={0.1}
                strokeDasharray="3 3"
              />
              <Area 
                type="monotone" 
                dataKey="cups" 
                stroke="var(--color-cups)" 
                fill="var(--color-cups)" 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default WaterChart;