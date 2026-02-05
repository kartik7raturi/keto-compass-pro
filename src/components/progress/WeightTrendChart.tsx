import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
interface WeightTrendChartProps {
  data: Array<{
    date: string;
    weight: number;
  }>;
  goalWeight?: number;
}
export const WeightTrendChart = ({
  data,
  goalWeight
}: WeightTrendChartProps) => {
  // Calculate trend line
  const calculateTrend = () => {
    if (data.length < 2) return [];
    const n = data.length;
    const sumX = data.reduce((acc, _, i) => acc + i, 0);
    const sumY = data.reduce((acc, d) => acc + d.weight, 0);
    const sumXY = data.reduce((acc, d, i) => acc + i * d.weight, 0);
    const sumXX = data.reduce((acc, _, i) => acc + i * i, 0);
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    return data.map((d, i) => ({
      ...d,
      trend: intercept + slope * i
    }));
  };
  const trendData = calculateTrend();
  return <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="text-lg">Weight Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{
            top: 10,
            right: 10,
            left: -10,
            bottom: 0
          }} className="">
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" tick={{
              fontSize: 12
            }} className="text-muted-foreground" />
              <YAxis domain={['dataMin - 5', 'dataMax + 5']} tick={{
              fontSize: 12
            }} className="text-muted-foreground" />
              <Tooltip contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px'
            }} formatter={(value: number) => [`${value.toFixed(1)} lbs`, '']} />
              {goalWeight && <ReferenceLine y={goalWeight} stroke="hsl(142, 76%, 36%)" strokeDasharray="5 5" label={{
              value: 'Goal',
              position: 'right',
              fill: 'hsl(142, 76%, 36%)'
            }} />}
              <Line type="monotone" dataKey="weight" name="Weight" stroke="hsl(var(--primary))" strokeWidth={2} dot={{
              fill: 'hsl(var(--primary))',
              strokeWidth: 2
            }} />
              <Line type="monotone" dataKey="trend" name="Trend" stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>;
};