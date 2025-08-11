import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const SEO = () => {
  useEffect(() => {
    const title = "Workout Tracker | Keto Coach";
    const description = "Log workouts with duration and notes. Stay active on your keto journey.";
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

type WorkoutEntry = {
  id: string;
  date: string;
  type: string;
  duration: number;
  notes?: string;
};

const STORAGE_KEY = "workout-entries";

const Workout = () => {
  const { toast } = useToast();
  const [entries, setEntries] = useState<WorkoutEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [type, setType] = useState("");
  const [duration, setDuration] = useState<number>(30);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const addEntry = () => {
    if (!type || duration <= 0) return;
    const entry: WorkoutEntry = {
      id: crypto.randomUUID(),
      date,
      type,
      duration,
      notes: notes || undefined,
    };
    setEntries([entry, ...entries]);
    setType("");
    setDuration(30);
    setNotes("");
    toast({ title: "Workout added", description: `${entry.type} for ${entry.duration} min` });
  };

  const removeEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO />
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Workout Tracker</h1>
          <p className="text-muted-foreground">Log your sessions and keep the momentum.</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add Workout</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Input id="type" placeholder="e.g. Strength, Cardio" value={type} onChange={(e) => setType(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="duration">Duration (min)</Label>
              <Input id="duration" type="number" min={1} value={duration} onChange={(e) => setDuration(Math.max(1, Number(e.target.value)))} />
            </div>
            <div className="lg:col-span-4">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="Optional notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <div className="lg:col-span-4 flex justify-end">
              <Button onClick={addEntry}>Save Workout</Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {entries.length === 0 ? (
            <p className="text-muted-foreground">No workouts yet. Add your first session above.</p>
          ) : (
            entries.map((e) => (
              <Card key={e.id}>
                <CardContent className="py-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold">{e.type}</div>
                    <div className="text-sm text-muted-foreground">{e.date} • {e.duration} min</div>
                    {e.notes && <div className="text-sm mt-1">{e.notes}</div>}
                  </div>
                  <Button variant="outline" onClick={() => removeEntry(e.id)}>Remove</Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Workout;
