import { Card, CardContent } from '@/components/ui/card';
import { Check, Crown, Zap, Target, TrendingUp, Dumbbell, Droplets, Calendar, Star, Shield } from 'lucide-react';
import SalesDisclaimer from '@/components/SalesDisclaimer';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { trackBuyNowClick, trackViewContent, trackAddToCart } from '@/lib/tracking';

const VIP_FEATURES = [
  { icon: Target, label: '30-Day Keto Challenge', desc: 'Structured daily plan to reach ketosis' },
  { icon: Zap, label: 'Intermittent Fasting Tracker', desc: 'Multiple fasting protocols & timers' },
  { icon: Dumbbell, label: 'Workout Tracker', desc: 'Log workouts & track calories burned' },
  { icon: Droplets, label: 'Water Intake Tracker', desc: 'Daily hydration goals & reminders' },
  { icon: Calendar, label: 'Weekly Meal Planner', desc: 'Auto-generated keto meal plans' },
  { icon: Calendar, label: 'Period Tracker', desc: 'Cycle tracking with keto adjustments' },
  { icon: Target, label: 'Custom Meal Plans', desc: 'Personalized plans based on your goals' },
  { icon: TrendingUp, label: 'Weight Trend Analysis', desc: 'Smoothed EMA weight trend charts' },
  { icon: TrendingUp, label: 'Energy Balance Charts', desc: 'Expenditure vs intake analysis' },
  { icon: TrendingUp, label: 'Visual Progress Charts', desc: 'Comprehensive macro & calorie charts' },
  { icon: Calendar, label: 'Weekly Report', desc: 'Detailed weekly performance summary' },
  { icon: Star, label: 'All Challenges', desc: 'Access every challenge & leaderboard' },
  { icon: Shield, label: 'Marketplace Access', desc: 'Buy & sell keto food locally' },
];

const CHECKOUT_URL = 'https://www.jvzoo.com/b/0/443435/1';
const NO_THANKS_URL = 'https://www.jvzoo.com/nothanks/443435';

const getYouTubeEmbed = (url: string): string | null => {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
};

const VipUpgrade = () => {
  const [videoUrl, setVideoUrl] = useState<string>('');

  useEffect(() => {
    trackViewContent('vip_upgrade_page', { product: 'vip_yearly', value: 39.99, currency: 'USD' });
    trackAddToCart('vip_yearly', 39.99, 'USD');
    setVideoUrl(localStorage.getItem('vip_upgrade_video_url') || '');
  }, []);

  const embedUrl = getYouTubeEmbed(videoUrl);

  return (
    <div className="min-h-screen bg-background">
      <main>
        {/* Hero */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-background to-orange-500/10" />
          <div className="container relative text-center px-4">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-600 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Crown className="h-5 w-5" />
              VIP Membership
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              Upgrade to Ketopia <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">VIP Access</span> 🚀
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Take your keto journey to the next level with advanced trackers, personalized meal plans,
              workout logging, fasting protocols, and detailed analytics.
            </p>
          </div>
        </section>

        {/* Video */}
        {embedUrl && (
          <section className="py-8">
            <div className="container px-4 max-w-3xl">
              <div className="relative w-full rounded-xl overflow-hidden shadow-2xl border border-amber-500/20" style={{ paddingTop: '56.25%' }}>
                <iframe
                  src={embedUrl}
                  title="Ketopia VIP Overview"
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </section>
        )}

        {/* Features Grid */}
        <section className="py-12 container px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">Everything You Get with VIP</h2>
          <p className="text-center text-muted-foreground mb-8 max-w-xl mx-auto">
            13 premium tools designed to accelerate your results and keep you on track every single day.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {VIP_FEATURES.map((f) => (
              <Card key={f.label} className="border-amber-500/20 hover:border-amber-500/50 transition-colors">
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="p-2 bg-amber-500/10 rounded-lg flex-shrink-0">
                    <f.icon className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{f.label}</h3>
                    <p className="text-xs text-muted-foreground">{f.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-16 bg-gradient-to-b from-amber-500/5 to-background">
          <div className="container px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">VIP Access</h2>
            <p className="text-center text-muted-foreground mb-8">Unlock everything. No restrictions.</p>
            <div className="max-w-md md:max-w-lg mx-auto">
              <Card className="border-2 border-primary shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-bold rounded-bl-lg">BEST VALUE</div>
                <CardContent className="p-4 sm:p-6 md:p-8 text-center space-y-5">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold">12-Month VIP Access</h3>
                  <div>
                    <span className="text-4xl sm:text-5xl md:text-6xl font-bold">$39.99</span>
                    <span className="text-muted-foreground">/year</span>
                  </div>
                  <ul className="text-sm sm:text-base space-y-2.5 text-left">
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />All VIP features for a full year</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />Single yearly payment — huge savings</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />Priority support</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />Future updates included</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />60-day money back guarantee</li>
                  </ul>
                  <a
                    href={CHECKOUT_URL}
                    aria-label="Get 12-Month VIP Access"
                    onClick={() => trackBuyNowClick('vip_yearly', 39.99, 'USD')}
                    className="flex justify-center transition-transform hover:scale-[1.02]"
                  >
                    <img src="https://i.jvzoo.com/0/443435/1" alt="VIP Upgrade ketopia #1 custom keto diet platform" />
                  </a>
                  <a
                    href={NO_THANKS_URL}
                    className="block text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
                  >
                    No Thanks
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* 60-Day Guarantee */}
        <section className="py-12 bg-amber-500/5">
          <div className="container mx-auto px-4 text-center max-w-2xl">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 mb-4">
              <Shield className="h-8 w-8 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold mb-3">100% Risk-Free – 60-Day Guarantee</h2>
            <p className="text-muted-foreground">
              Try Ketopia VIP completely risk-free. If you are not satisfied for any reason,
              you can request a full refund within 60 days. No questions asked.
            </p>
          </div>
        </section>

        <SalesDisclaimer />

        {/* JVZoo tracking pixel */}
        <img src="https://i.jvzoo.com/0/443435/99" alt="" width="1" height="1" style={{ position: 'absolute', left: '-9999px' }} />

        {/* Footer links */}
        <div className="py-6 text-center border-t">
          <div className="container px-4 flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
            <a href="/imprint" className="hover:text-primary transition-colors">Imprint</a>
            <a href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="/refund-policy" className="hover:text-primary transition-colors">Refund Policy</a>
            <a href="/contact" className="hover:text-primary transition-colors">Contact</a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VipUpgrade;
