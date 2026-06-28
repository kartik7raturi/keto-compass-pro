import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, PlayCircle, BookOpen, Crown } from 'lucide-react';

interface Module { id: string; slug: string; title: string; description: string | null; cover_url: string | null; sort_order: number; }
interface Lesson { id: string; module_id: string; slug: string; title: string; duration_sec: number; is_preview: boolean; sort_order: number; }

const Course = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: mods }, { data: lsns }] = await Promise.all([
        supabase.from('course_modules').select('*').eq('is_published', true).order('sort_order'),
        supabase.from('course_lessons').select('id,module_id,slug,title,duration_sec,is_preview,sort_order').eq('is_published', true).order('sort_order'),
      ]);
      setModules((mods as any) || []);
      setLessons((lsns as any) || []);

      if (user) {
        const { data } = await supabase.rpc('user_has_course_access', { p_user_id: user.id });
        setHasAccess(Boolean(data));
      }
      setLoading(false);
    })();
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Keto Video Course — Master Keto Step by Step | Ketopia</title>
        <meta name="description" content="Video lessons covering keto basics, meal planning, fat-loss strategies and more. Watch at your own pace." />
        <link rel="canonical" href="https://keto-compass-pro.lovable.app/course" />
        <meta property="og:title" content="Keto Video Course — Master Keto Step by Step" />
        <meta property="og:description" content="Video lessons covering keto basics, meal planning, fat-loss strategies and more." />
        <meta property="og:url" content="https://keto-compass-pro.lovable.app/course" />
        <meta property="og:type" content="website" />
      </Helmet>
      <Header />
      <main className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold mb-3">
              <BookOpen className="h-3.5 w-3.5" /> Ketopia Video Course
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">Master Keto, Step by Step</h1>
            <p className="text-muted-foreground mt-2">Video lessons covering everything from keto basics to advanced fat-loss strategies.</p>
          </div>
          {!hasAccess && (
            <Button onClick={() => navigate('/course-sales')} className="bg-gradient-to-r from-primary to-amber-500">
              <Crown className="h-4 w-4 mr-2" /> Unlock Course
            </Button>
          )}
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : modules.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">No course modules published yet. Check back soon!</CardContent></Card>
        ) : (
          <div className="space-y-6">
            {modules.map((m, i) => {
              const ml = lessons.filter(l => l.module_id === m.id);
              return (
                <Card key={m.id} className="overflow-hidden">
                  <CardHeader className="bg-secondary/30">
                    <CardTitle className="flex items-center gap-3">
                      <span className="text-primary font-mono">{String(i + 1).padStart(2, '0')}</span>
                      {m.title}
                    </CardTitle>
                    {m.description && <p className="text-sm text-muted-foreground">{m.description}</p>}
                  </CardHeader>
                  <CardContent className="p-0 divide-y">
                    {ml.length === 0 && <p className="p-4 text-sm text-muted-foreground">No lessons yet.</p>}
                    {ml.map((l) => {
                      const locked = !hasAccess && !l.is_preview;
                      const inner = (
                        <div className="flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            {locked ? <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" /> : <PlayCircle className="h-4 w-4 text-primary flex-shrink-0" />}
                            <div className="min-w-0">
                              <p className="font-medium truncate">{l.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {Math.max(1, Math.round(l.duration_sec / 60))} min {l.is_preview && '• Preview'}
                              </p>
                            </div>
                          </div>
                          {locked && <span className="text-xs text-muted-foreground">Locked</span>}
                        </div>
                      );
                      return locked
                        ? <div key={l.id}>{inner}</div>
                        : <Link key={l.id} to={`/course/${m.slug}/${l.slug}`} className="block">{inner}</Link>;
                    })}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Course;
