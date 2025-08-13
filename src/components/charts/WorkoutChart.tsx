import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { useMemo } from "react";

type WorkoutEntry = {
  id: string;
  date: string;
  type: string;
  duration: number;
  notes?: string;
};

const WorkoutChart = () => {
  const data = useMemo(() => {
    const saved = localStorage.getItem("workout-entries");
    const entries: WorkoutEntry[] = saved ? JSON.parse(saved) : [];
    
    // Group by last 7 days
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().slice(0, 10);
      
      const dayEntries = entries.filter(e => e.date === dateStr);
      const totalDuration = dayEntries.reduce((sum, e) => sum + e.duration, 0);
      
      days.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        duration: totalDuration,
        sessions: dayEntries.length
      });
    }
    return days;
  }, []);

  const chartConfig = {
    duration: {
      label: "Minutes",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workout Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data}>
              <XAxis dataKey="date" />
              <YAxis />
              <ChartTooltip 
                content={<ChartTooltipContent />} 
                formatter={(value, name) => [`${value} min`, "Duration"]}
              />
              <Bar dataKey="duration" fill="var(--color-duration)" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default WorkoutChart;