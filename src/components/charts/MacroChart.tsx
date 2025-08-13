import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { useAuth } from "@/components/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

const MacroChart = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchMacroData();
    }
  }, [user]);

  const fetchMacroData = async () => {
    try {
      const { data: macroLogs } = await supabase
        .from('macro_logs')
        .select('*')
        .eq('user_id', user?.id)
        .order('date', { ascending: true })
        .limit(7);

      if (macroLogs) {
        const chartData = macroLogs.map(log => ({
          date: new Date(log.date).toLocaleDateString('en-US', { weekday: 'short' }),
          calories: log.calories || 0,
          carbs: log.carbs || 0,
          protein: log.protein || 0,
          fat: log.fat || 0
        }));
        setData(chartData);
      }
    } catch (error) {
      console.error('Error fetching macro data:', error);
    }
  };

  const chartConfig = {
    calories: {
      label: "Calories",
      color: "hsl(var(--primary))",
    },
    carbs: {
      label: "Carbs (g)",
      color: "hsl(var(--destructive))",
    },
    protein: {
      label: "Protein (g)",
      color: "hsl(var(--secondary))",
    },
    fat: {
      label: "Fat (g)",
      color: "hsl(var(--accent))",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Macro Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <XAxis dataKey="date" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                type="monotone" 
                dataKey="calories" 
                stroke="var(--color-calories)" 
                strokeWidth={2}
                dot={{ fill: "var(--color-calories)", r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="carbs" 
                stroke="var(--color-carbs)" 
                strokeWidth={2}
                dot={{ fill: "var(--color-carbs)", r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="protein" 
                stroke="var(--color-protein)" 
                strokeWidth={2}
                dot={{ fill: "var(--color-protein)", r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="fat" 
                stroke="var(--color-fat)" 
                strokeWidth={2}
                dot={{ fill: "var(--color-fat)", r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default MacroChart;