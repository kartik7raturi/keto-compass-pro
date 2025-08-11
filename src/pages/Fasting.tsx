import { useEffect, useMemo, useRef, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const SEO = () => {
  useEffect(() => {
    const title = "Intermittent Fasting Tracker | Keto Coach";
    const description = "Start and monitor your fasting window with countdown, presets, and reminders.";
    document.title = title;
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) { meta = document.createElement("meta"); meta.name = "description"; document.head.appendChild(meta); }
    meta.content = description;
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = window.location.href;
  }, []);
  return null;
};

const STORAGE_KEY = "fasting-tracker";

function formatHMS(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600).toString().padStart(2, '0');
  const m = Math.floor((total % 3600) / 60).toString().padStart(2, '0');
  const s = Math.floor(total % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

const Fasting = () => {
  const { toast } = useToast();
  const [durationHours, setDurationHours] = useState<number>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}-duration`);
    return saved ? Number(saved) : 16;
  });
  const [startAt, setStartAt] = useState<number | null>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}-start`);
    return saved ? Number(saved) : null;
  });
  const [now, setNow] = useState<number>(Date.now());
  const timerRef = useRef<number | null>(null);

  const endAt = useMemo(() => (startAt ? startAt + durationHours * 3600 * 1000 : null), [startAt, durationHours]);
  const remaining = useMemo(() => (endAt ? endAt - now : 0), [endAt, now]);
  const active = !!startAt && remaining > 0;

  useEffect(() => {
    if (active) {
      timerRef.current = window.setInterval(() => setNow(Date.now()), 1000);
    }
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
  }, [active]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}-duration`, String(durationHours));
    if (startAt) localStorage.setItem(`${STORAGE_KEY}-start`, String(startAt));
    else localStorage.removeItem(`${STORAGE_KEY}-start`);
  }, [durationHours, startAt]);

  useEffect(() => {
    if (!active && startAt && endAt && remaining <= 0) {
      toast({ title: "Fasting complete", description: `You completed a ${durationHours}h fast. Great job!` });
      setStartAt(null);
    }
  }, [active, remaining, startAt, endAt, durationHours, toast]);

  const start = () => {
    setStartAt(Date.now());
    toast({ title: "Fast started", description: `Countdown for ${durationHours} hours.` });
  };
  const stop = () => {
    setStartAt(null);
    toast({ title: "Fast stopped", description: "You can start again anytime." });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO />
      <Header />
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
              {startAt && endAt && (
                <div className="text-sm text-muted-foreground mt-2">
                  Ends at {new Date(endAt).toLocaleString()}
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
