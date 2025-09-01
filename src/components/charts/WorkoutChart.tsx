import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const WorkoutChart = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchWorkoutData();
    }
  }, [user]);

  const fetchWorkoutData = async () => {
    try {
      const { data: workoutData } = await supabase
        .from('workout_logs')
        .select('*')
        .eq('user_id', user?.id)
        .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10))
        .order('date', { ascending: true });

      if (workoutData) {
        // Group by last 7 days
        const days = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().slice(0, 10);
          
          const dayEntries = workoutData.filter(e => e.date === dateStr);
          const totalDuration = dayEntries.reduce((sum, e) => sum + e.duration_minutes, 0);
          
          days.push({
            date: date.toLocaleDateString('en-US', { weekday: 'short' }),
            duration: totalDuration,
            sessions: dayEntries.length
          });
        }
        setData(days);
      }
    } catch (error) {
      console.error('Error fetching workout data:', error);
    }
  };

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