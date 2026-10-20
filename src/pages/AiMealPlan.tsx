import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { SEO } from '@/components/seo/SEO';

const AiMealPlan = () => {
  const { user, loading } = useAuth();
  const [preferences, setPreferences] = useState('');
  const [restrictions, setRestrictions] = useState('');
  const [goals, setGoals] = useState('');
  const [days, setDays] = useState('3');
  const [calories, setCalories] = useState('');
  const [busy, setBusy] = useState(false);
  const [plan, setPlan] = useState('');
  const [error, setError] = useState('');

  if (!loading && !user) return <Navigate to="/auth?redirect=/ai-meal-plan" replace />;

  const generate = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setPlan('');
    const { data, error: fnError } = await supabase.functions.invoke('ai-meal-plan', {
      body: {
        preferences,
        restrictions,
        goals,
        days: parseInt(days, 10),
        ...(calories ? { calories: parseInt(calories, 10) } : {}),
      },
    });
    setBusy(false);
    if (fnError) {
      let msg = 'Couldn\u2019t create your plan. Please try again.';
      try {
        const body = await (fnError as any).context?.json?.();
        if (body?.error && typeof body.error === 'string') msg = body.error;
      } catch { /* keep default */ }
      setError(msg);
      return;
    }
    if (data?.plan) setPlan(data.plan);
    else setError(data?.error || 'No plan was returned.');
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="AI Keto Meal Planner" description="Get a personalized keto meal plan built around your food preferences, restrictions and goals." path="/ai-meal-plan" />
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2"><Sparkles className="h-7 w-7 text-primary" /> AI Keto Meal Planner</h1>
        <p className="text-muted-foreground mb-6">Tell us what you like, what you can't eat and what you're aiming for — Lovable AI builds a keto plan just for you.</p>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Your details</CardTitle>
            <CardDescription>The more detail you give, the better your plan.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={generate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prefs">Foods you love / dietary preferences</Label>
                <Textarea id="prefs" maxLength={500} placeholder="e.g. vegetarian, loves eggs and avocado, Indian flavours" value={preferences} onChange={(e) => setPreferences(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="restr">Food restrictions or allergies</Label>
                <Textarea id="restr" maxLength={500} placeholder="e.g. no dairy, nut allergy" value={restrictions} onChange={(e) => setRestrictions(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goals">Your goals</Label>
                <Textarea id="goals" maxLength={500} placeholder="e.g. lose 5 kg, more energy, quick 20-minute meals" value={goals} onChange={(e) => setGoals(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Number of days</Label>
                  <Select value={days} onValueChange={setDays}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7].map((d) => <SelectItem key={d} value={String(d)}>{d} day{d > 1 ? 's' : ''}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cal">Daily calories (optional)</Label>
                  <Input id="cal" type="number" min={800} max={5000} placeholder="e.g. 1600" value={calories} onChange={(e) => setCalories(e.target.value)} />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating your plan…</> : <><Sparkles className="h-4 w-4 mr-2" /> Create my keto plan</>}
              </Button>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </form>
          </CardContent>
        </Card>

        {plan && (
          <Card>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none pt-6">
              <ReactMarkdown>{plan}</ReactMarkdown>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AiMealPlan;
