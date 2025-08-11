import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const SEO = () => {
  useEffect(() => {
    const title = "30-Day Keto Tracker | Keto Coach";
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

const daysArray = (count: number) => Array.from({ length: count }, (_, i) => i + 1);

const STORAGE_KEY = "keto30-tracker";

const Keto30 = () => {
  const { toast } = useToast();
  const [startDate, setStartDate] = useState<string>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}-start`);
    return saved || "";
  });
  const [completed, setCompleted] = useState<boolean[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}-days`);
    return saved ? JSON.parse(saved) : Array(30).fill(false);
  });

  const started = !!startDate;
  const progress = useMemo(() => {
    const done = completed.filter(Boolean).length;
    return Math.round((done / 30) * 100);
  }, [completed]);

  useEffect(() => {
    if (startDate) localStorage.setItem(`${STORAGE_KEY}-start`, startDate);
    localStorage.setItem(`${STORAGE_KEY}-days`, JSON.stringify(completed));
  }, [startDate, completed]);

  const handleStart = () => {
    setStartDate(new Date().toISOString().slice(0, 10));
    setCompleted(Array(30).fill(false));
    toast({ title: "Challenge started", description: "Your 30-day keto tracker is live. You got this!" });
  };

  const handleReset = () => {
    setStartDate("");
    setCompleted(Array(30).fill(false));
    localStorage.removeItem(`${STORAGE_KEY}-start`);
    localStorage.removeItem(`${STORAGE_KEY}-days`);
    toast({ title: "Tracker reset", description: "Start again anytime." });
  };

  const toggleDay = (index: number) => {
    const next = [...completed];
    next[index] = !next[index];
    setCompleted(next);
  };

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
              {daysArray(30).map((day, i) => (
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
