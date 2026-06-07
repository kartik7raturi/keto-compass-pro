import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Star, Shield, Crown, Sparkles, Clock, Lock, Flame, BookOpen, Utensils, LineChart } from 'lucide-react';
import SalesDisclaimer from '@/components/SalesDisclaimer';

const FEATURES = [
  { icon: BookOpen, text: '1000+ Keto Recipes' },
  { icon: Utensils, text: 'Daily Food & Macro Tracker' },
  { icon: LineChart, text: 'Progress Dashboard' },
  { icon: Sparkles, text: 'Community Access' },
  { icon: Star, text: 'Recipe Favorites & Meal Plans' },
];

const Pricing = () => {

  return (
    <div className="min-h-screen bg-background">
      {/* WarriorPlus view tracking pixel */}
      <img src="https://warriorplus.com/o2/v/xtpnsb/gf37tm" alt="" width="1" height="1" style={{ position: 'absolute', left: -9999, top: -9999 }} />

      <main>
        {/* Hero */}
        <section className="relative py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-amber-500/10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.15),transparent_50%)]" />
          <div className="container relative text-center px-4">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-primary/20">
              <Flame className="h-4 w-4" />
              Limited-Time Launch Offer
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-5 leading-tight">
              Start Your <span className="bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">Keto Transformation</span> Today
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
              The complete keto system — recipes, trackers, meal plans, and a supportive community in one place.
            </p>
            <a
              href="https://www.producthunt.com/products/ketopia?embed=true&amp;utm_source=badge-featured&amp;utm_medium=badge&amp;utm_campaign=badge-ketopia"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex transition-transform hover:scale-[1.02]"
            >
              <img
                alt="Ketopia  - ALL IN ONE KETO PLATFORM | Product Hunt"
                width="250"
                height="54"
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1158629&amp;theme=light&amp;t=1780051410186"
              />
            </a>
          </div>
        </section>

        {/* Value props strip */}
        <section className="py-10 border-y bg-secondary/20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <Shield className="h-7 w-7 text-primary mx-auto mb-2" />
                <p className="text-sm font-semibold">60-Day Guarantee</p>
              </div>
              <div className="text-center">
                <Clock className="h-7 w-7 text-primary mx-auto mb-2" />
                <p className="text-sm font-semibold">Instant Access</p>
              </div>
              <div className="text-center">
                <Lock className="h-7 w-7 text-primary mx-auto mb-2" />
                <p className="text-sm font-semibold">Secure Checkout</p>
              </div>
              <div className="text-center">
                <Sparkles className="h-7 w-7 text-primary mx-auto mb-2" />
                <p className="text-sm font-semibold">Cancel Anytime</p>
              </div>
            </div>
          </div>
        </section>

        {/* What is Ketopia */}
        <section className="py-14">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl font-bold text-center mb-4">Everything You Need to Succeed on Keto</h2>
            <p className="text-muted-foreground text-center mb-8 text-lg">
              Ketopia is a digital weight-loss program built to reduce cravings, improve metabolism, and keep you on track with a structured plan.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {FEATURES.map((f) => (
                <Card key={f.text} className="border-primary/10 hover:border-primary/40 transition-all hover:shadow-md">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <f.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-medium">{f.text}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-xs text-muted-foreground italic text-center mt-6">
              This is a digital product. No physical items or supplements will be shipped.
            </p>
          </div>
        </section>

        {/* Pricing Card */}
        <section className="py-14 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4">
            <div className="max-w-md md:max-w-lg mx-auto">
              <Card className="border-2 border-primary shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary to-amber-500 text-primary-foreground py-2.5 text-center text-sm font-bold tracking-wide">
                  🔥 START YOUR KETO JOURNEY TODAY 🔥
                </div>
                <CardHeader className="text-center pb-2 pt-12 sm:pt-14">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="h-5 w-5 text-amber-500 fill-amber-500" />
                    ))}
                  </div>
                  <CardTitle className="text-xl sm:text-2xl">Keto Starter Plan</CardTitle>
                  <div className="mt-4">
                    <span className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">$19</span>
                    <span className="text-muted-foreground text-lg">/month</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Cancel anytime • No hidden fees</p>
                </CardHeader>
                <CardContent className="space-y-5 pt-4">
                  <ul className="space-y-3">
                    {FEATURES.map((f) => (
                      <li key={f.text} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        {f.text}
                      </li>
                    ))}
                  </ul>

                  <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
                    <p className="text-xs text-center font-medium text-primary">
                      ✅ 60-Day Money Back Guarantee
                    </p>
                  </div>

                  <a href="https://warriorplus.com/o2/buy/xtpnsb/gf37tm/h8p8sl" target="_blank" rel="noopener noreferrer" aria-label="Buy Keto Starter Plan for $19/month" data-offer="keto-starter-19" className="block transition-transform hover:scale-[1.02]">
                    <img src="https://warriorplus.com/o2/btn/fn100011001/xtpnsb/gf37tm/458023" alt="Buy now" className="w-full" />
                  </a>

                  {/* WarriorPlus Disclaimer */}
                  <div className="wplus_spdisclaimer text-sm text-foreground" />

                  <p className="text-xs text-center text-muted-foreground">
                    Secure payment • Instant access
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* 60-Day Guarantee */}
        <section className="py-14 bg-primary/5">
          <div className="container mx-auto px-4 text-center max-w-2xl">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">100% Risk-Free — 60-Day Guarantee</h2>
            <p className="text-muted-foreground text-lg">
              Try Ketopia completely risk-free. If you are not satisfied for any reason, request a full refund within 60 days. No questions asked.
            </p>
          </div>
        </section>

        {/* VIP Teaser */}
        <section className="py-14">
          <div className="container mx-auto px-4 text-center max-w-2xl">
            <Crown className="h-12 w-12 text-amber-500 mx-auto mb-3" />
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Want Even More Features?</h2>
            <p className="text-muted-foreground mb-4 text-lg">
              After purchasing the Starter plan, you can upgrade to VIP for advanced trackers,
              workout plans, fasting tools, challenges, and more.
            </p>
            <a href="/vip-upgrade" className="inline-flex items-center gap-2 text-amber-600 font-semibold hover:underline">
              Explore VIP <Crown className="h-4 w-4" />
            </a>
          </div>
        </section>

        {/* Footer links */}
        <div className="py-8 text-center border-t">
          <div className="container px-4 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <a href="/imprint" className="hover:text-primary transition-colors">Imprint</a>
            <a href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="/refund-policy" className="hover:text-primary transition-colors">Refund Policy</a>
            <a href="/contact" className="hover:text-primary transition-colors">Contact</a>
          </div>
          <p className="text-xs text-muted-foreground mt-4 max-w-2xl mx-auto px-4">
            These earnings are not representative for the average participants. The average participant will earn significantly less or no money at all through this product or service.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Pricing;
