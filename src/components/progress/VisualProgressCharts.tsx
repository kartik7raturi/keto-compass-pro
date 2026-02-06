import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend } from 'recharts';
import { TrendingUp } from "lucide-react";

interface ChartDataPoint {
  date: string;
  weight?: number;
  netCarbs?: number;
  targetCarbs?: number;
  calories?: number;
  targetCalories?: number;
  carbs?: number;
  protein?: number;
  fat?: number;
}

interface VisualProgressChartsProps {
  weightData: ChartDataPoint[];
  macroData: ChartDataPoint[];
  calorieData: ChartDataPoint[];
}

export const VisualProgressCharts = ({ 
  weightData, 
  macroData,
  calorieData 
}: VisualProgressChartsProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Visual Progress Charts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="weight" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="weight" className="text-xs">Weight</TabsTrigger>
            <TabsTrigger value="carbs" className="text-xs">Net Carbs</TabsTrigger>
            <TabsTrigger value="macros" className="text-xs">Macros</TabsTrigger>
            <TabsTrigger value="calories" className="text-xs">Calories</TabsTrigger>
          </TabsList>

          {/* Weight Chart */}
          <TabsContent value="weight" className="mt-0">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weightData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis domain={['dataMin - 5', 'dataMax + 5']} tick={{ fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="hsl(var(--primary))" 
                    fill="url(#weightGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">Weight over time (lbs)</p>
          </TabsContent>

          {/* Net Carbs Chart */}
          <TabsContent value="carbs" className="mt-0">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={macroData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="netCarbs" 
                    stroke="hsl(142, 76%, 36%)" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="Actual"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="targetCarbs" 
                    stroke="hsl(var(--muted-foreground))" 
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Target"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">Net carbs vs target (g)</p>
          </TabsContent>

          {/* Macro History Chart */}
          <TabsContent value="macros" className="mt-0">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={macroData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="carbs" 
                    stackId="1"
                    stroke="hsl(0, 84%, 60%)" 
                    fill="hsl(0, 84%, 60%)"
                    fillOpacity={0.6}
                    name="Carbs"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="protein" 
                    stackId="1"
                    stroke="hsl(217, 91%, 60%)" 
                    fill="hsl(217, 91%, 60%)"
                    fillOpacity={0.6}
                    name="Protein"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="fat" 
                    stackId="1"
                    stroke="hsl(142, 76%, 36%)" 
                    fill="hsl(142, 76%, 36%)"
                    fillOpacity={0.6}
                    name="Fat"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">Macro balance history (g)</p>
          </TabsContent>

          {/* Calories Chart */}
          <TabsContent value="calories" className="mt-0">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={calorieData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="calories" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="Consumed"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="targetCalories" 
                    stroke="hsl(var(--muted-foreground))" 
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Target"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">Calories consumed vs target</p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
