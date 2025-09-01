import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const FastingChart = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchFastingData();
    }
  }, [user]);

  const fetchFastingData = async () => {
    try {
      const { data: fastingData } = await supabase
        .from('fasting_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .gte('start_time', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('start_time', { ascending: true });

      if (fastingData) {
        // Group by days for the last 7 days
        const days = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().slice(0, 10);
          
          const daySession = fastingData.find(session => 
            session.start_time.slice(0, 10) === dateStr
          );
          
          const actualDuration = daySession?.completed && daySession?.end_time 
            ? Math.round((new Date(daySession.end_time).getTime() - new Date(daySession.start_time).getTime()) / (1000 * 60 * 60))
            : 0;
          
          days.push({
            date: date.toLocaleDateString('en-US', { weekday: 'short' }),
            duration: actualDuration,
            target: daySession?.target_duration_hours || 16
          });
        }
        setData(days);
      }
    } catch (error) {
      console.error('Error fetching fasting data:', error);
    }
  };

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