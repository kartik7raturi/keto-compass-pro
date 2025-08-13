import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { useMemo } from "react";

const FastingChart = () => {
  const data = useMemo(() => {
    // Simulate fasting history data since it's stored locally
    const savedDuration = localStorage.getItem("fasting-tracker-duration");
    const duration = savedDuration ? Number(savedDuration) : 16;
    
    // Generate sample data for the last 7 days
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        duration: Math.random() > 0.3 ? duration + Math.floor(Math.random() * 4 - 2) : 0, // Some days might be skipped
        target: duration
      });
    }
    return days;
  }, []);

  const chartConfig = {
    duration: {
      label: "Fasting Hours",
      color: "hsl(var(--primary))",
    },
    target: {
      label: "Target",
      color: "hsl(var(--muted-foreground))",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fasting Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <XAxis dataKey="date" />
              <YAxis domain={[0, 24]} />
              <ChartTooltip 
                content={<ChartTooltipContent />} 
                formatter={(value, name) => [`${value}h`, name === "duration" ? "Completed" : "Target"]}
              />
              <Line 
                type="monotone" 
                dataKey="target" 
                stroke="var(--color-target)" 
                strokeDasharray="3 3"
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="duration" 
                stroke="var(--color-duration)" 
                strokeWidth={2}
                dot={{ fill: "var(--color-duration)", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default FastingChart;