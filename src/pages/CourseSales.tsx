import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, PlayCircle, Shield, Clock, Star, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// JVZoo course product checkout link — update product/affiliate IDs in JVZoo dashboard.
const JVZOO_COURSE_URL = 'https://www.jvzoo.com/b/117081/423665/5';

const CourseSales = () => {
  const [modules, setModules] = useState<any[]>([]);
  const [lessonCount, setLessonCount] = useState(0);

  useEffect(() => {
    (async () => {
      const [{ data: m }, { count }] = await Promise.all([
        supabase.from('course_modules').select('id,title,description').eq('is_published', true).order('sort_order'),
        supabase.from('course_lessons').select('id', { count: 'exact', head: true }).eq('is_published', true),
      ]);
      setModules(m || []);
      setLessonCount(count || 0);
    })();
  }, []);

  const trackClick = async () => {
    try {
      await supabase.from('funnel_events').insert({ event_type: 'course_cta_click', page: '/course-sales' } as any);
    } catch {}
  };

  const benefits = [
    'Step-by-step keto starter videos',
    'Meal planning & shopping walkthroughs',
    'Fat-burning workout demos',
    'Plateau-breaking strategies',
    'Lifetime access — watch anytime',
    'Mobile-friendly streaming',
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-background to-amber-500/10" />
        <div className="container relative text-center px-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <BookOpen className="h-4 w-4" /> The Ketopia Video Course
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-5">
            Learn Keto the <span className="bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">Right Way</span> — On Video
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            {modules.length}+ modules, {lessonCount}+ video lessons. Follow along at your own pace and finally make keto stick.
          </p>
          <a href={JVZOO_COURSE_URL} onClick={trackClick}>
            <Button size="lg" className="bg-gradient-to-r from-primary to-amber-500 text-primary-foreground px-10 py-6 text-lg font-bold">
              Get Instant Access — $47
            </Button>
          </a>
          <p className="text-xs text-muted-foreground mt-3">Secure checkout via JVZoo · 60-day money-back guarantee</p>
        </div>
      </section>

      {/* Trust strip */}
      <section className="py-8 border-y bg-secondary/20">
        <div className="container grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-center">
          <div><Shield className="h-6 w-6 text-primary mx-auto mb-1.5" /><p className="text-sm font-semibold">60-Day Guarantee</p></div>
          <div><Clock className="h-6 w-6 text-primary mx-auto mb-1.5" /><p className="text-sm font-semibold">Instant Access</p></div>
          <div><PlayCircle className="h-6 w-6 text-primary mx-auto mb-1.5" /><p className="text-sm font-semibold">Lifetime Streaming</p></div>
          <div><Star className="h-6 w-6 text-primary mx-auto mb-1.5" /><p className="text-sm font-semibold">Beginner Friendly</p></div>
        </div>
      </section>

      {/* What you get */}
      <section className="py-14">
        <div className="container max-w-3xl px-4">
          <h2 className="text-3xl font-bold text-center mb-8">What You'll Get</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {benefits.map((b) => (
              <Card key={b} className="border-primary/10">
                <CardContent className="p-4 flex items-center gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>{b}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum preview */}
      {modules.length > 0 && (
        <section className="py-14 bg-secondary/20">
          <div className="container max-w-3xl px-4">
            <h2 className="text-3xl font-bold text-center mb-8">Course Curriculum</h2>
            <div className="space-y-3">
              {modules.map((m, i) => (
                <Card key={m.id}>
                  <CardContent className="p-5">
                    <p className="text-xs text-primary font-mono mb-1">MODULE {String(i + 1).padStart(2, '0')}</p>
                    <h3 className="font-bold mb-1">{m.title}</h3>
                    {m.description && <p className="text-sm text-muted-foreground">{m.description}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16">
        <div className="container max-w-2xl text-center px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to Master Keto?</h2>
          <p className="text-muted-foreground mb-6">One-time payment. Lifetime access. 60-day no-questions-asked refund.</p>
          <a href={JVZOO_COURSE_URL} onClick={trackClick}>
            <Button size="lg" className="bg-gradient-to-r from-primary to-amber-500 px-10 py-6 text-lg font-bold">
              Get the Course — $47
            </Button>
          </a>
        </div>
      </section>

      <div className="py-6 text-center border-t">
        <div className="container px-4 flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
          <a href="/imprint" className="hover:text-primary">Imprint</a>
          <a href="/privacy" className="hover:text-primary">Privacy</a>
          <a href="/terms" className="hover:text-primary">Terms</a>
          <a href="/refund-policy" className="hover:text-primary">Refund</a>
          <a href="/contact" className="hover:text-primary">Contact</a>
        </div>
      </div>
    </div>
  );
};

export default CourseSales;
