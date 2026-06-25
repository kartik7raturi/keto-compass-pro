import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Lock, Check } from 'lucide-react';

const isYouTube = (url: string) => /youtu\.?be/.test(url);
const isVimeo = (url: string) => /vimeo\.com/.test(url);
const toEmbed = (url: string) => {
  if (isYouTube(url)) {
    const id = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/)?.[1];
    return id ? `https://www.youtube.com/embed/${id}` : url;
  }
  if (isVimeo(url)) {
    const id = url.match(/vimeo\.com\/(\d+)/)?.[1];
    return id ? `https://player.vimeo.com/video/${id}` : url;
  }
  return url;
};

const CourseLesson = () => {
  const { moduleSlug, lessonSlug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lesson, setLesson] = useState<any>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: mod } = await supabase.from('course_modules').select('id').eq('slug', moduleSlug).maybeSingle();
      if (!mod) { setLoading(false); return; }
      const { data: l } = await supabase.from('course_lessons').select('*').eq('module_id', mod.id).eq('slug', lessonSlug).maybeSingle();
      setLesson(l);

      if (user) {
        const { data: a } = await supabase.rpc('user_has_course_access', { p_user_id: user.id });
        setHasAccess(Boolean(a));
        if (l) {
          const { data: p } = await supabase.from('course_progress').select('completed_at').eq('user_id', user.id).eq('lesson_id', l.id).maybeSingle();
          setCompleted(!!p?.completed_at);
        }
      }
      setLoading(false);
    })();
  }, [moduleSlug, lessonSlug, user]);

  const markComplete = async () => {
    if (!user || !lesson) return;
    await supabase.from('course_progress').upsert({
      user_id: user.id, lesson_id: lesson.id, completed_at: new Date().toISOString(),
    }, { onConflict: 'user_id,lesson_id' });
    setCompleted(true);
  };

  if (loading) return <div className="min-h-screen bg-background"><Header /><div className="container py-10">Loading…</div></div>;
  if (!lesson) return <div className="min-h-screen bg-background"><Header /><div className="container py-10">Lesson not found.</div></div>;

  const canWatch = hasAccess || lesson.is_preview;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link to="/course"><ArrowLeft className="h-4 w-4 mr-2" /> Back to course</Link>
        </Button>

        <h1 className="text-2xl md:text-3xl font-bold mb-4">{lesson.title}</h1>

        {!canWatch ? (
          <Card className="border-2 border-primary/30">
            <CardContent className="p-10 text-center space-y-4">
              <Lock className="h-12 w-12 text-primary mx-auto" />
              <h2 className="text-xl font-bold">This lesson is locked</h2>
              <p className="text-muted-foreground">Unlock the full Ketopia video course to watch all lessons.</p>
              <Button size="lg" onClick={() => navigate('/course-sales')}>Get the Course</Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="aspect-video rounded-lg overflow-hidden bg-black mb-6">
              {lesson.video_url ? (
                <iframe src={toEmbed(lesson.video_url)} className="w-full h-full" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">Video coming soon</div>
              )}
            </div>
            {lesson.description && <p className="text-muted-foreground mb-6 whitespace-pre-line">{lesson.description}</p>}
            {user && (
              <Button onClick={markComplete} disabled={completed} variant={completed ? 'outline' : 'default'}>
                {completed ? <><Check className="h-4 w-4 mr-2" /> Completed</> : 'Mark as complete'}
              </Button>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default CourseLesson;
