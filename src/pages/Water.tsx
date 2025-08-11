import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

const SEO = () => {
  useEffect(() => {
    const title = "Water Tracker | Keto Coach";
    const description = "Stay hydrated. Track daily water intake with a simple, beautiful tracker.";
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

const todayKey = () => new Date().toISOString().slice(0, 10);

const Water = () => {
  const { toast } = useToast();
  const [goal, setGoal] = useState<number>(() => {
    const saved = localStorage.getItem("water-goal");
    return saved ? Number(saved) : 8;
  });
  const [dateKey, setDateKey] = useState<string>(todayKey());
  const [cups, setCups] = useState<number>(() => {
    const saved = localStorage.getItem(`water-${todayKey()}`);
    return saved ? Number(saved) : 0;
  });

  useEffect(() => {
    const key = todayKey();
    if (key !== dateKey) {
      setDateKey(key);
      const saved = localStorage.getItem(`water-${key}`);
      setCups(saved ? Number(saved) : 0);
    }
  }, [dateKey]);

  useEffect(() => {
    localStorage.setItem("water-goal", String(goal));
  }, [goal]);

  useEffect(() => {
    localStorage.setItem(`water-${dateKey}`, String(cups));
  }, [cups, dateKey]);

  const pct = useMemo(() => Math.min(100, Math.round((cups / Math.max(1, goal)) * 100)), [cups, goal]);

  const inc = () => {
    const next = cups + 1;
    setCups(next);
    if (next === goal) toast({ title: "Goal reached", description: "Nice! You've hit your hydration goal today." });
  };
  const dec = () => setCups(Math.max(0, cups - 1));

  return (
    <div className="min-h-screen bg-background">
      <SEO />
      <Header />
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
              <Input id="goal" type="number" min={1} max={30} value={goal} onChange={(e) => setGoal(Math.max(1, Number(e.target.value)))} />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setGoal(6)}>6</Button>
              <Button variant="outline" onClick={() => setGoal(8)}>8</Button>
              <Button variant="outline" onClick={() => setGoal(10)}>10</Button>
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
      <Footer />
    </div>
  );
};

export default Water;
