import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Star, Zap, TrendingUp, Shield, Award, Crown } from 'lucide-react';
import { useButtonLinks } from '@/hooks/useButtonLinks';
import DigiStoreBadge from '@/components/DigiStoreBadge';

const FEATURES = [
  '1000+ Keto Recipes',
  'Daily Food Tracker',
  'Basic Progress Bar',
  'Community Access',
  'Recipe Favorites',
];

const RESULTS = [
  { icon: TrendingUp, text: 'Average 8-12 lbs lost in first month' },
  { icon: Zap, text: 'Higher energy levels within 1 week' },
  { icon: Shield, text: 'Reduced cravings in 3-5 days' },
  { icon: Award, text: 'Join 10,000+ successful members' },
];

const TESTIMONIALS = [
  { name: 'Sarah M.', text: 'Lost 15 lbs in my first month! The recipes are amazing.', stars: 5 },
  { name: 'James K.', text: 'Best keto tool I have ever used. Worth every penny.', stars: 5 },
  { name: 'Maria L.', text: 'The tracker makes staying on keto so easy!', stars: 5 },
];

const Pricing = () => {
  const { getUrl } = useButtonLinks();

  return (
    <div className="min-h-screen bg-background">
      <DigiStoreBadge type="salespage" />
      {/* NO Header/Footer — pure sales page, no navigation */}
      <main>
        {/* Hero */}
        <section className="py-12 md:py-20 bg-gradient-to-br from-primary/5 via-background to-primary/10">
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">K</span>
              </div>
              <span className="font-bold text-xl text-foreground">Ketopia</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Start Your Keto Transformation Today
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Join thousands who have transformed their health with our proven keto system
            </p>
          </div>
        </section>

        {/* Results */}
        <section className="py-10 bg-secondary/20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {RESULTS.map(r => (
                <div key={r.text} className="text-center p-4">
                  <r.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-xs md:text-sm font-medium">{r.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Card */}
        <section className="py-14">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto">
              <Card className="border-2 border-primary shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-2.5 text-center text-sm font-bold">
                  🔥 START YOUR KETO JOURNEY TODAY 🔥
                </div>
                <CardHeader className="text-center pb-2 pt-14">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="h-5 w-5 text-amber-500 fill-amber-500" />
                    ))}
                  </div>
                  <CardTitle className="text-2xl">Keto Starter Plan</CardTitle>
                  <div className="mt-3">
                    <span className="text-5xl font-bold text-primary">$19</span>
                    <span className="text-2xl font-bold text-primary">.99</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <ul className="space-y-3">
                    {FEATURES.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
                    <p className="text-xs text-center font-medium text-primary">
                      ✅ 30-day money back guarantee
                    </p>
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-primary to-primary/80 text-lg py-7 shadow-lg hover:shadow-xl transition-all"
                    onClick={() => window.open(getUrl('keto_starter'), '_blank')}
                  >
                    Get Started Now — $19.99
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Secure payment • Instant access • No hidden fees
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-10 bg-secondary/10">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-8">What Our Members Say</h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {TESTIMONIALS.map(t => (
                <Card key={t.name}>
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center gap-1 mb-3">
                      {Array.from({ length: t.stars }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-amber-500 fill-amber-500" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">"{t.text}"</p>
                    <p className="font-semibold text-sm">{t.name}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* VIP Teaser */}
        <section className="py-10">
          <div className="container mx-auto px-4 text-center max-w-2xl">
            <Crown className="h-10 w-10 text-amber-500 mx-auto mb-3" />
            <h2 className="text-2xl font-bold mb-3">Want Even More Features?</h2>
            <p className="text-muted-foreground mb-4">
              After purchasing the Starter plan, you can upgrade to VIP for advanced trackers, 
              workout plans, fasting tools, challenges, and more!
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Pricing;
