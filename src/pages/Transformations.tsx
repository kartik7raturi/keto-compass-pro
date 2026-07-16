import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Trophy, Calendar, Scale } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Story {
  id: string; user_id: string; title: string; story: string;
  before_image_url: string | null; after_image_url: string | null;
  weight_lost: number | null; duration_months: number | null;
  is_featured: boolean; created_at: string;
}

const uploadImage = async (file: File, userId: string): Promise<string | null> => {
  const ext = file.name.split('.').pop();
  const path = `${userId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('community-media').upload(path, file);
  if (error) return null;
  return supabase.storage.from('community-media').getPublicUrl(path).data.publicUrl;
};

const Transformations = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: '', story: '', weight_lost: '', duration_months: '' });
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);

  const load = async () => {
    const { data } = await supabase.from('success_stories')
      .select('*').eq('is_approved', true)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false });
    setStories((data as any) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!user) { navigate('/auth'); return; }
    if (!form.title || !form.story) { toast({ title: 'Title and story required', variant: 'destructive' }); return; }
    setSubmitting(true);
    try {
      const beforeUrl = beforeFile ? await uploadImage(beforeFile, user.id) : null;
      const afterUrl = afterFile ? await uploadImage(afterFile, user.id) : null;
      const { error } = await supabase.from('success_stories').insert({
        user_id: user.id, title: form.title, story: form.story,
        before_image_url: beforeUrl, after_image_url: afterUrl,
        weight_lost: form.weight_lost ? Number(form.weight_lost) : null,
        duration_months: form.duration_months ? Number(form.duration_months) : null,
        is_approved: false,
      });
      if (error) throw error;
      toast({ title: 'Submitted!', description: 'Your story will appear once approved by our team.' });
      setOpen(false); setForm({ title: '', story: '', weight_lost: '', duration_months: '' });
      setBeforeFile(null); setAfterFile(null);
    } catch (e: any) {
      toast({ title: 'Failed', description: e.message, variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Transformations & Success Stories | Ketopia</title>
        <meta name="description" content="Real transformations from the Ketopia community — before/after photos, weight-loss journeys, and keto tips that work." />
        <link rel="canonical" href="https://ketopia.online/transformations" />
        <meta property="og:title" content="Transformations & Success Stories | Ketopia" />
        <meta property="og:description" content="Real keto transformations and journey tips from the Ketopia community." />
        <meta property="og:url" content="https://ketopia.online/transformations" />
      </Helmet>
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold mb-2">
              <Sparkles className="h-3.5 w-3.5" /> Community Transformations
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">Real Journeys, Real Results</h1>
            <p className="text-muted-foreground mt-2">Share your before & after, your tips, and inspire the next person.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Share My Story</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Share your transformation</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Lost 30 lbs in 6 months" /></div>
                <div><Label>Your story & tips</Label><Textarea rows={5} value={form.story} onChange={e => setForm({ ...form, story: e.target.value })} placeholder="What worked for you, what didn't, advice for others…" /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Weight lost (kg)</Label><Input type="number" value={form.weight_lost} onChange={e => setForm({ ...form, weight_lost: e.target.value })} /></div>
                  <div><Label>Duration (months)</Label><Input type="number" value={form.duration_months} onChange={e => setForm({ ...form, duration_months: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Before photo</Label><Input type="file" accept="image/*" onChange={e => setBeforeFile(e.target.files?.[0] || null)} /></div>
                  <div><Label>After photo</Label><Input type="file" accept="image/*" onChange={e => setAfterFile(e.target.files?.[0] || null)} /></div>
                </div>
                <Button onClick={submit} disabled={submitting} className="w-full">{submitting ? 'Uploading…' : 'Submit for review'}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : stories.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">No stories yet — be the first to share!</CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stories.map(s => (
              <Card key={s.id} className="overflow-hidden">
                {(s.before_image_url || s.after_image_url) && (
                  <div className="grid grid-cols-2 bg-secondary/30">
                    {s.before_image_url && <img src={s.before_image_url} alt="Before" className="w-full h-44 object-cover" loading="lazy" />}
                    {s.after_image_url && <img src={s.after_image_url} alt="After" className="w-full h-44 object-cover" loading="lazy" />}
                  </div>
                )}
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    {s.is_featured && <Trophy className="h-4 w-4 text-amber-500" />}
                    {s.title}
                  </CardTitle>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    {s.weight_lost && <span className="flex items-center gap-1"><Scale className="h-3 w-3" /> -{s.weight_lost}kg</span>}
                    {s.duration_months && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {s.duration_months} mo</span>}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-line line-clamp-6">{s.story}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Transformations;
