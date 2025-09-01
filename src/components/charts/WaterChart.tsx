import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const WaterChart = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchWaterData();
    }
  }, [user]);

  const fetchWaterData = async () => {
    try {
      const { data: waterData } = await supabase
        .from('water_logs')
        .select('*')
        .eq('user_id', user?.id)
        .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10))
        .order('date', { ascending: true });

      if (waterData) {
        // Group by last 7 days
        const days = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().slice(0, 10);
          
          const dayLog = waterData.find(log => log.date === dateStr);
          const cups = dayLog?.cups_consumed || 0;
          const goal = dayLog?.daily_goal || 8;
          
          days.push({
            date: date.toLocaleDateString('en-US', { weekday: 'short' }),
            cups: cups,
            goal: goal,
            percentage: Math.round((cups / goal) * 100)
          });
        }
        setData(days);
      }
    } catch (error) {
      console.error('Error fetching water data:', error);
    }
  };

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