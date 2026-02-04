import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, TrendingDown, Target, Flame, Droplets, 
  Activity, Scale, BarChart3, Calendar, CheckCircle2 
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  Tooltip
} from 'recharts';

interface MacroData {
  name: string;
  current: number;
  goal: number;
  color: string;
  unit: string;
}

interface WeightEntry {
  date: string;
  weight: number;
  trend: number;
}

interface EnergyData {
  day: string;
  intake: number;
  expenditure: number;
  balance: number;
}

const NutritionAnalytics = () => {
  const { user } = useAuth();
  const [macros, setMacros] = useState<MacroData[]>([
    { name: 'Protein', current: 0, goal: 120, color: 'hsl(var(--chart-1))', unit: 'g' },
    { name: 'Carbs', current: 0, goal: 25, color: 'hsl(var(--chart-2))', unit: 'g' },
    { name: 'Fat', current: 0, goal: 130, color: 'hsl(var(--chart-3))', unit: 'g' },
  ]);
  const [calories, setCalories] = useState({ current: 0, goal: 2000 });
  const [weightData, setWeightData] = useState<WeightEntry[]>([]);
  const [energyData, setEnergyData] = useState<EnergyData[]>([]);
  const [adherenceScore, setAdherenceScore] = useState(0);
  const [weeklyChange, setWeeklyChange] = useState(0);
  const [goalDirection, setGoalDirection] = useState<'losing' | 'gaining' | 'maintaining'>('losing');

  useEffect(() => {
    if (user) {
      fetchNutritionData();
    }
  }, [user]);

  const fetchNutritionData = async () => {
    if (!user) return;

    try {
      // Fetch today's macros
      const today = new Date().toISOString().split('T')[0];
      const { data: macroLog } = await supabase
        .from('macro_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (macroLog) {
        setMacros([
          { name: 'Protein', current: macroLog.protein || 0, goal: 120, color: 'hsl(var(--chart-1))', unit: 'g' },
          { name: 'Carbs', current: macroLog.carbs || 0, goal: 25, color: 'hsl(var(--chart-2))', unit: 'g' },
          { name: 'Fat', current: macroLog.fat || 0, goal: 130, color: 'hsl(var(--chart-3))', unit: 'g' },
        ]);
        setCalories({ current: macroLog.calories || 0, goal: 2000 });
      }

      // Fetch weight data for trend
      const { data: weights } = await supabase
        .from('weight_logs')
        .select('weight, logged_at')
        .eq('user_id', user.id)
        .order('logged_at', { ascending: true })
        .limit(14);

      if (weights && weights.length > 0) {
        // Calculate smoothed trendline using exponential moving average
        const smoothedData: WeightEntry[] = [];
        let ema = weights[0].weight;
        const alpha = 0.3; // Smoothing factor
        
        weights.forEach((w, i) => {
          ema = alpha * w.weight + (1 - alpha) * ema;
          smoothedData.push({
            date: new Date(w.logged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            weight: w.weight,
            trend: parseFloat(ema.toFixed(1))
          });
        });
        
        setWeightData(smoothedData);
        
        // Calculate weekly change
        if (weights.length >= 2) {
          const firstWeight = weights[0].weight;
          const lastWeight = weights[weights.length - 1].weight;
          setWeeklyChange(parseFloat((firstWeight - lastWeight).toFixed(1)));
        }
      }

      // Generate energy balance data (simulated based on patterns)
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const mockEnergy = days.map((day, i) => {
        const intake = 1800 + Math.random() * 400;
        const expenditure = 2000 + Math.random() * 300;
        return {
          day,
          intake: Math.round(intake),
          expenditure: Math.round(expenditure),
          balance: Math.round(intake - expenditure)
        };
      });
      setEnergyData(mockEnergy);

      // Calculate adherence score
      const adherence = Math.min(100, Math.round((macroLog?.calories || 0) / 2000 * 100));
      setAdherenceScore(adherence);

    } catch (error) {
      console.error('Error fetching nutrition data:', error);
    }
  };

  const getProgressColor = (current: number, goal: number) => {
    const ratio = current / goal;
    if (ratio < 0.8) return 'bg-muted';
    if (ratio <= 1.05) return 'bg-keto-green';
    return 'bg-orange-500';
  };

  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min(100, (current / goal) * 100);
  };

  return (
    <div className="space-y-4">
      {/* Central Dashboard Summary */}
      <Card className="border-primary/20">
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                <CheckCircle2 className="h-4 w-4" />
                <span>Adherence</span>
              </div>
              <div className="text-2xl font-bold">{adherenceScore}%</div>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                {weeklyChange > 0 ? (
                  <TrendingDown className="h-4 w-4 text-keto-green" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                )}
                <span>Weekly</span>
              </div>
              <div className={`text-2xl font-bold ${weeklyChange > 0 ? 'text-keto-green' : 'text-orange-500'}`}>
                {weeklyChange > 0 ? '-' : '+'}{Math.abs(weeklyChange)} lbs
              </div>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                <Target className="h-4 w-4" />
                <span>Goal</span>
              </div>
              <Badge variant="outline" className="text-sm capitalize">{goalDirection}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Horizontal Stacked Macro Progress Bars */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Daily Macros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Calories Bar */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-1">
                <Flame className="h-4 w-4 text-orange-500" />
                Calories
              </span>
              <span className="font-mono">
                <span className="font-semibold">{calories.current}</span>
                <span className="text-muted-foreground">/{calories.goal} kcal</span>
                <Badge 
                  variant={calories.current <= calories.goal ? "default" : "destructive"} 
                  className="ml-2 text-xs"
                >
                  {Math.round(getProgressPercentage(calories.current, calories.goal))}%
                </Badge>
              </span>
            </div>
            <div className="relative h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ease-out rounded-full ${getProgressColor(calories.current, calories.goal)}`}
                style={{ width: `${getProgressPercentage(calories.current, calories.goal)}%` }}
              />
            </div>
          </div>

          {/* Macro Bars */}
          {macros.map((macro) => (
            <div key={macro.name} className="space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium">{macro.name}</span>
                <span className="font-mono">
                  <span className="font-semibold">{macro.current}</span>
                  <span className="text-muted-foreground">/{macro.goal}{macro.unit}</span>
                  <Badge 
                    variant={macro.current <= macro.goal * 1.05 ? "secondary" : "destructive"} 
                    className="ml-2 text-xs"
                  >
                    {Math.round(getProgressPercentage(macro.current, macro.goal))}%
                  </Badge>
                </span>
              </div>
              <div className="relative h-2.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-500 ease-out rounded-full"
                  style={{ 
                    width: `${getProgressPercentage(macro.current, macro.goal)}%`,
                    backgroundColor: macro.current <= macro.goal * 1.05 ? macro.color : 'hsl(var(--destructive))'
                  }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Smoothed Weight Trend Graph */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Scale className="h-4 w-4" />
            Weight Trend
            <Badge variant="outline" className="text-xs ml-auto">14 days</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {weightData.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={weightData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis 
                  domain={['dataMin - 2', 'dataMax + 2']} 
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) => `${v}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                {/* Actual weight as dots */}
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeWidth={0}
                  dot={{ r: 3, fill: 'hsl(var(--muted-foreground))' }}
                />
                {/* Smoothed trendline */}
                <Area 
                  type="monotone" 
                  dataKey="trend" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  fill="url(#trendGradient)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
              Log your weight to see trends
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Energy Balance */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Energy Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={energyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="intake" fill="hsl(var(--chart-2))" radius={[2, 2, 0, 0]} name="Intake" />
              <Bar dataKey="expenditure" fill="hsl(var(--chart-1))" radius={[2, 2, 0, 0]} name="Burned" />
            </BarChart>
          </ResponsiveContainer>
          
          {/* Weekly Summary */}
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Avg Intake</p>
              <p className="font-semibold text-sm">
                {Math.round(energyData.reduce((a, b) => a + b.intake, 0) / Math.max(energyData.length, 1))} kcal
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Avg Burned</p>
              <p className="font-semibold text-sm">
                {Math.round(energyData.reduce((a, b) => a + b.expenditure, 0) / Math.max(energyData.length, 1))} kcal
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Net Balance</p>
              <p className={`font-semibold text-sm ${
                energyData.reduce((a, b) => a + b.balance, 0) < 0 ? 'text-keto-green' : 'text-orange-500'
              }`}>
                {energyData.reduce((a, b) => a + b.balance, 0) < 0 ? '' : '+'}
                {Math.round(energyData.reduce((a, b) => a + b.balance, 0) / Math.max(energyData.length, 1))} kcal
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NutritionAnalytics;
