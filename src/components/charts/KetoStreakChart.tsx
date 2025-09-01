import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const KetoStreakChart = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchKetoData();
    }
  }, [user]);

  const fetchKetoData = async () => {
    try {
      const { data: ketoData } = await supabase
        .from('keto_streaks')
        .select('*')
        .eq('user_id', user?.id)
        .order('date', { ascending: true });

      if (ketoData) {
        // Group by weeks for better visualization
        const weeks = [];
        for (let i = 0; i < 4; i++) {
          const weekStart = new Date();
          weekStart.setDate(weekStart.getDate() - (21 - i * 7));
          
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 6);
          
          const weekData = ketoData.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= weekStart && entryDate <= weekEnd;
          });
          
          const completedDays = weekData.filter(entry => entry.completed).length;
          
          weeks.push({
            week: `Week ${i + 1}`,
            completed: completedDays,
            total: 7
          });
        }
        setData(weeks);
      }
    } catch (error) {
      console.error('Error fetching keto data:', error);
    }
  };

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