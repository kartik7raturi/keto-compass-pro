import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import FeatureGate from "@/components/FeatureGate";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { usePointsSystem, POINT_VALUES } from "@/hooks/usePointsSystem";

const SEO = () => {
  useEffect(() => {
    const title = "30-Day Keto Tracker | Ketopia";
    const description = "Stay consistent with a 30-day keto streak tracker. Check off days, see progress, and keep your momentum.";
    document.title = title;
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = description;

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.href;
  }, []);
  return null;
};

const Keto30 = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { awardPoints } = usePointsSystem();
  const [startDate, setStartDate] = useState<string>("");
  const [completed, setCompleted] = useState<boolean[]>(Array(30).fill(false));
  const [loading, setLoading] = useState(true);

  const started = !!startDate;
  const progress = useMemo(() => {
    const done = completed.filter(Boolean).length;
    return Math.round((done / 30) * 100);
  }, [completed]);

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
        .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10))
        .order('date', { ascending: true });

      if (ketoData && ketoData.length > 0) {
        setStartDate(ketoData[0].date);
        const completedDays = Array(30).fill(false);
        ketoData.forEach(entry => {
          const dayIndex = Math.floor((new Date(entry.date).getTime() - new Date(ketoData[0].date).getTime()) / (1000 * 60 * 60 * 24));
          if (dayIndex >= 0 && dayIndex < 30) {
            completedDays[dayIndex] = entry.completed;
          }
        });
        setCompleted(completedDays);
      }
    } catch (error) {
      console.error('Error fetching keto data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    if (!user) return;
    
    const today = new Date().toISOString().slice(0, 10);
    setStartDate(today);
    setCompleted(Array(30).fill(false));
    
    try {
      await supabase
        .from('keto_streaks')
        .insert({
          user_id: user.id,
          date: today,
          completed: false
        });
      
      toast({ title: "Challenge started", description: "Your 30-day keto tracker is live. You got this!" });
    } catch (error) {
      toast({ title: "Error starting challenge", variant: "destructive" });
    }
  };

  const handleReset = async () => {
    if (!user) return;
    
    try {
      await supabase
        .from('keto_streaks')
        .delete()
        .eq('user_id', user.id);
      
      setStartDate("");
      setCompleted(Array(30).fill(false));
      toast({ title: "Tracker reset", description: "Start again anytime." });
    } catch (error) {
      toast({ title: "Error resetting tracker", variant: "destructive" });
    }
  };

  const toggleDay = async (index: number) => {
    if (!user || !startDate) return;
    
    const targetDate = new Date(startDate);
    targetDate.setDate(targetDate.getDate() + index);
    const dateStr = targetDate.toISOString().slice(0, 10);
    
    const newCompleted = [...completed];
    newCompleted[index] = !newCompleted[index];
    setCompleted(newCompleted);
    
    try {
      await supabase
        .from('keto_streaks')
        .upsert({
          user_id: user.id,
          date: dateStr,
          completed: newCompleted[index]
        });
        
      // Award points for completing a keto day
      if (newCompleted[index]) {
        awardPoints(POINT_VALUES.COMPLETE_KETO_DAY, "staying keto!");
      }
    } catch (error) {
      console.error('Error updating day:', error);
      // Revert on error
      setCompleted(completed);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Please sign in to use the tracker.</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO />
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">30-Day Keto Tracker</h1>
          <p className="text-muted-foreground">Build a consistent keto streak.</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Challenge Controls</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-3">
            {!started ? (
              <Button onClick={handleStart} className="w-full sm:w-auto">Start 30-Day Challenge</Button>
            ) : (
              <>
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <div className="rounded-md border p-3">
                    <div className="text-sm text-muted-foreground">Started</div>
                    <div className="font-semibold">{startDate}</div>
                  </div>
                  <div className="rounded-md border p-3">
                    <div className="text-sm text-muted-foreground">Progress</div>
                    <div className="font-semibold">{progress}%</div>
                  </div>
                </div>
                <Button variant="outline" onClick={handleReset} className="w-full sm:w-auto">Reset</Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-2">
              {Array.from({ length: 30 }, (_, i) => i + 1).map((day, i) => (
                <button
                  key={day}
                  onClick={() => toggleDay(i)}
                  className={`rounded-md border p-3 text-sm transition-colors ${
                    completed[i] ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                  }`}
                  aria-pressed={completed[i]}
                  aria-label={`Day ${day} ${completed[i] ? 'completed' : 'not completed'}`}
                >
                  Day {day}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Keto30;
