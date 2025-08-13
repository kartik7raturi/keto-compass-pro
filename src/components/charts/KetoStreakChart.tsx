import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { useMemo } from "react";

const KetoStreakChart = () => {
  const data = useMemo(() => {
    const saved = localStorage.getItem("keto30-tracker-days");
    const completed = saved ? JSON.parse(saved) : Array(30).fill(false);
    
    // Group by weeks for better visualization
    const weeks = [];
    for (let i = 0; i < 30; i += 7) {
      const weekDays = completed.slice(i, i + 7);
      const completedDays = weekDays.filter(Boolean).length;
      weeks.push({
        week: `Week ${Math.floor(i / 7) + 1}`,
        completed: completedDays,
        total: Math.min(7, 30 - i)
      });
    }
    return weeks;
  }, []);

  const chartConfig = {
    completed: {
      label: "Days Completed",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>30-Day Keto Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data}>
              <XAxis dataKey="week" />
              <YAxis domain={[0, 7]} />
              <ChartTooltip 
                content={<ChartTooltipContent />} 
                formatter={(value, name) => [`${value}/7 days`, "Completed"]}
              />
              <Bar dataKey="completed" fill="var(--color-completed)" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default KetoStreakChart;