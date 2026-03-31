import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import FeatureGate from "@/components/FeatureGate";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { usePointsSystem, POINT_VALUES } from "@/hooks/usePointsSystem";

const SEO = () => {
  useEffect(() => {
    const title = "Free Water Tracker | Ketopia - Hydration Tracking Tool";
    const description = "Stay hydrated with our free water tracker. Track daily water intake, set hydration goals, and maintain optimal hydration on your keto journey.";
    const keywords = "free water tracker, hydration tracker, daily water intake, keto hydration, water tracking app";
    
    document.title = title;
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) { meta = document.createElement("meta"); meta.name = "description"; document.head.appendChild(meta); }
    meta.content = description;
    
    let keywordsMeta = document.querySelector('meta[name="keywords"]') as HTMLMetaElement | null;
    if (!keywordsMeta) { keywordsMeta = document.createElement("meta"); keywordsMeta.name = "keywords"; document.head.appendChild(keywordsMeta); }
    keywordsMeta.content = keywords;
    
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = window.location.href;
  }, []);
  return null;
};

const Water = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { awardPoints } = usePointsSystem();
  const [goal, setGoal] = useState<number>(8);
  const [cups, setCups] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const pct = useMemo(() => Math.min(100, Math.round((cups / goal) * 100)), [cups, goal]);

  useEffect(() => {
    if (user) {
      fetchTodayWaterLog();
    }
  }, [user]);

  const fetchTodayWaterLog = async () => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const { data } = await supabase
        .from('water_logs')
        .select('*')
        .eq('user_id', user?.id)
        .eq('date', today)
        .maybeSingle();

      if (data) {
        setGoal(data.daily_goal);
        setCups(data.cups_consumed);
      } else {
        // Create today's entry with defaults
        await supabase
          .from('water_logs')
          .insert({
            user_id: user?.id,
            date: today,
            cups_consumed: 0,
            daily_goal: 8
          });
      }
    } catch (error) {
      console.error('Error fetching water log:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateWaterLog = async (newCups: number, newGoal?: number) => {
    if (!user) return;
    
    try {
      const today = new Date().toISOString().slice(0, 10);
      await supabase
        .from('water_logs')
        .upsert({
          user_id: user.id,
          date: today,
          cups_consumed: newCups,
          daily_goal: newGoal || goal
        });
    } catch (error) {
      console.error('Error updating water log:', error);
    }
  };

  const inc = async () => {
    const newCups = cups + 1;
    setCups(newCups);
    await updateWaterLog(newCups);
    if (newCups === goal) {
      awardPoints(POINT_VALUES.COMPLETE_WATER_GOAL, "completing your daily water goal!");
      toast({ title: "Goal reached", description: "Nice! You've hit your hydration goal today." });
    }
  };

  const dec = async () => {
    const newCups = Math.max(0, cups - 1);
    setCups(newCups);
    await updateWaterLog(newCups);
  };

  const updateGoal = async (newGoal: number) => {
    setGoal(newGoal);
    await updateWaterLog(cups, newGoal);
    toast({ title: "Goal updated", description: `Daily goal set to ${newGoal} cups` });
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
      <FeatureGate feature="water" fallbackMessage="Water Tracker requires VIP">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Water Tracker</h1>
          <p className="text-muted-foreground">Hydration fuels results. Track your cups each day.</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Daily Goal</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3 items-end">
            <div className="sm:col-span-2">
              <Label htmlFor="goal">Cups per day</Label>
              <Input
                id="goal"
                type="number"
                min={1}
                max={20}
                value={goal}
                onChange={(e) => updateGoal(Math.max(1, Number(e.target.value)))}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => updateGoal(6)}>6</Button>
              <Button variant="outline" onClick={() => updateGoal(8)}>8</Button>
              <Button variant="outline" onClick={() => updateGoal(10)}>10</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today's Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">{cups} / {goal} cups</div>
              <div className="text-sm text-muted-foreground">{pct}%</div>
            </div>
            <Progress value={pct} />
            <div className="mt-4 flex gap-2">
              <Button onClick={dec} variant="outline">-1</Button>
              <Button onClick={inc}>+1</Button>
            </div>
          </CardContent>
        </Card>
      </main>
      </FeatureGate>
      <Footer />
    </div>
  );
};

export default Water;