import { useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import FeatureGate from "@/components/FeatureGate";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { usePointsSystem, POINT_VALUES } from "@/hooks/usePointsSystem";

const SEO = () => {
  useEffect(() => {
    const title = "Free Intermittent Fasting Tracker | Ketopia - Fasting Timer";
    const description = "Track your intermittent fasting with our free fasting tracker. Start and monitor fasting windows with countdown timer, presets, and reminders.";
    const keywords = "free fasting tracker, intermittent fasting, fasting timer, IF tracker, 16:8 fasting, keto fasting";
    
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

function formatHMS(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600).toString().padStart(2, '0');
  const m = Math.floor((total % 3600) / 60).toString().padStart(2, '0');
  const s = Math.floor(total % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

const Fasting = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { awardPoints } = usePointsSystem();
  const [durationHours, setDurationHours] = useState<number>(16);
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [now, setNow] = useState<number>(Date.now());
  const timerRef = useRef<number | null>(null);

  const active = !!currentSession && !currentSession.completed;
  const remaining = currentSession && active 
    ? Math.max(0, new Date(currentSession.start_time).getTime() + currentSession.target_duration_hours * 3600 * 1000 - now)
    : 0;

  useEffect(() => {
    if (user) {
      fetchCurrentSession();
    }
  }, [user]);

  useEffect(() => {
    if (active) {
      timerRef.current = window.setInterval(() => setNow(Date.now()), 1000);
    }
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
  }, [active]);

  useEffect(() => {
    if (active && remaining <= 0) {
      completeSession();
    }
  }, [active, remaining]);

  const fetchCurrentSession = async () => {
    try {
      const { data } = await supabase
        .from('fasting_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .eq('completed', false)
        .order('start_time', { ascending: false })
        .limit(1);
      
      if (data && data.length > 0) {
        setCurrentSession(data[0]);
        setDurationHours(data[0].target_duration_hours);
      }
    } catch (error) {
      console.error('Error fetching session:', error);
    }
  };

  const start = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('fasting_sessions')
        .insert({
          user_id: user.id,
          start_time: new Date().toISOString(),
          target_duration_hours: durationHours,
          completed: false
        })
        .select()
        .single();
      
      setCurrentSession(data);
      toast({ title: "Fast started", description: `Countdown for ${durationHours} hours.` });
    } catch (error) {
      toast({ title: "Error starting fast", variant: "destructive" });
    }
  };

  const stop = async () => {
    if (!user || !currentSession) return;
    
    try {
      await supabase
        .from('fasting_sessions')
        .update({ 
          completed: true,
          end_time: new Date().toISOString()
        })
        .eq('id', currentSession.id);
      
      setCurrentSession(null);
      toast({ title: "Fast stopped", description: "You can start again anytime." });
    } catch (error) {
      toast({ title: "Error stopping fast", variant: "destructive" });
    }
  };

  const completeSession = async () => {
    if (!currentSession) return;
    
    try {
      await supabase
        .from('fasting_sessions')
        .update({ 
          completed: true,
          end_time: new Date().toISOString()
        })
        .eq('id', currentSession.id);
      
      setCurrentSession(null);
      awardPoints(POINT_VALUES.COMPLETE_FAST, `completing a ${durationHours}h fast!`);
      toast({ title: "Fasting complete", description: `You completed a ${durationHours}h fast. Great job!` });
    } catch (error) {
      console.error('Error completing session:', error);
    }
  };

  if (!user) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Please sign in to use the tracker.</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO />
      <Header />
      <FeatureGate feature="fasting" fallbackMessage="Fasting Tracker requires VIP">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Intermittent Fasting</h1>
          <p className="text-muted-foreground">Track fasting windows and stay consistent.</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Setup</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="duration">Fasting Duration (hours)</Label>
              <Input id="duration" type="number" min={1} max={72} value={durationHours}
                onChange={(e) => setDurationHours(Math.max(1, Number(e.target.value)))} />
              <div className="flex gap-2 mt-2">
                {[12, 14, 16, 18, 20].map(p => (
                  <Button key={p} variant="outline" size="sm" onClick={() => setDurationHours(p)}>
                    {p}:8
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex items-end gap-2">
              {!active ? (
                <Button className="w-full" onClick={start}>Start Fast</Button>
              ) : (
                <Button variant="destructive" className="w-full" onClick={stop}>Stop</Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Countdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center p-6 rounded-md border">
              <div className="text-sm text-muted-foreground mb-1">Remaining</div>
              <div className="text-4xl font-bold tracking-tight">{active ? formatHMS(remaining) : "--:--:--"}</div>
              {currentSession && active && (
                <div className="text-sm text-muted-foreground mt-2">
                  Ends at {new Date(new Date(currentSession.start_time).getTime() + currentSession.target_duration_hours * 3600 * 1000).toLocaleString()}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Fasting;