import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scale, TrendingDown, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface WeightLog {
  id: string;
  weight: number;
  unit: string;
  notes: string;
  logged_at: string;
}

const WeightLogger = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [weight, setWeight] = useState('');
  const [unit, setUnit] = useState('kg');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchWeightLogs();
    }
  }, [user]);

  const fetchWeightLogs = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('weight_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('logged_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching weight logs:', error);
    } else {
      setWeightLogs(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to log your weight.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('weight_logs')
        .insert({
          user_id: user.id,
          weight: parseFloat(weight),
          unit,
          notes,
        });

      if (error) throw error;

      toast({
        title: "Weight logged!",
        description: "Your weight has been successfully recorded.",
      });

      setWeight('');
      setNotes('');
      setIsOpen(false);
      fetchWeightLogs();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log weight. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getWeightTrend = () => {
    if (weightLogs.length < 2) return null;
    const current = weightLogs[0].weight;
    const previous = weightLogs[1].weight;
    return current - previous;
  };

  const trend = getWeightTrend();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-keto-green" />
            Weight Tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {weightLogs.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-keto-green">
                  {weightLogs[0].weight} {weightLogs[0].unit}
                </div>
                <div className="text-sm text-muted-foreground">Current Weight</div>
              </div>
              {trend !== null && (
                <div className="text-center">
                  <div className={`text-2xl font-bold flex items-center justify-center gap-1 ${
                    trend > 0 ? 'text-red-500' : trend < 0 ? 'text-green-500' : 'text-gray-500'
                  }`}>
                    {trend > 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                    {Math.abs(trend).toFixed(1)} {weightLogs[0].unit}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {trend > 0 ? 'Gained' : 'Lost'} since last entry
                  </div>
                </div>
              )}
            </div>
          )}

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="w-full bg-gradient-to-r from-keto-green to-keto-green-dark hover:opacity-90">
                Log Weight
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Log Your Weight</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      placeholder="Enter weight"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Select value={unit} onValueChange={setUnit}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="lbs">lbs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any notes about your weight or progress..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-keto-green to-keto-green-dark hover:opacity-90"
                  disabled={loading}
                >
                  {loading ? 'Logging...' : 'Log Weight'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          {weightLogs.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Recent Logs</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {weightLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex justify-between items-center text-sm">
                    <span>{log.weight} {log.unit}</span>
                    <span className="text-muted-foreground">
                      {new Date(log.logged_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WeightLogger;