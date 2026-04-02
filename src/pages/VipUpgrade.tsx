import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Crown, Zap, Target, TrendingUp, Dumbbell, Droplets, Calendar, Star, Shield, Lock } from 'lucide-react';
import DigiStoreBadge from '@/components/DigiStoreBadge';
import DigiStoreUpsell from '@/components/DigiStoreUpsell';
import { Badge } from '@/components/ui/badge';

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

const TESTIMONIALS = [
  { name: 'Sarah M.', text: 'Lost 20 lbs in 2 months with VIP features!', stars: 5 },
  { name: 'James K.', text: 'The fasting tracker changed my routine completely.', stars: 5 },
  { name: 'Maria L.', text: 'Best investment for my keto journey.', stars: 5 },
];

const VipUpgrade = () => {
  return (
    <div className="min-h-screen bg-background">
      <DigiStoreBadge type="salespage" />
      <DigiStoreUpsell />
      <Header />
      <main>
        {/* Hero */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-background to-orange-500/10" />
          <div className="container relative text-center px-4">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-600 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Crown className="h-5 w-5" />
              VIP Membership
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
              Unlock <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">Every Feature</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Get full access to all trackers, challenges, advanced analytics, marketplace, and more.
            </p>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-12 container px-4">
          <h2 className="text-2xl font-bold text-center mb-8">Everything You Get</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
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

        {/* Testimonials */}
        <section className="py-12 bg-secondary/20">
          <div className="container px-4">
            <h2 className="text-2xl font-bold text-center mb-8">What VIP Members Say</h2>
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

        {/* Pricing with Digistore Upsell Buttons */}
        <section className="py-16 bg-gradient-to-b from-amber-500/5 to-background">
          <div className="container px-4">
            <h2 className="text-2xl font-bold text-center mb-2">Choose Your VIP Plan</h2>
            <p className="text-center text-muted-foreground mb-8">Unlock everything. No restrictions.</p>
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <Card className="border-2 border-amber-500/30 shadow-lg">
                <CardContent className="p-6 text-center space-y-4">
                  <h3 className="text-xl font-bold">Monthly</h3>
                  <div>
                    <span className="text-5xl font-bold">$49</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <ul className="text-sm space-y-2 text-left">
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-amber-500" />All VIP features</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-amber-500" />Cancel anytime</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-amber-500" />Priority support</li>
                  </ul>
                  <Button
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-6 text-lg"
                    onClick={() => window.open('https://www.digistore24.com/product/680740)}
                  >
                    Yes, Upgrade Now — $49/mo
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full text-muted-foreground"
                    onClick={() => window.open('https://www.digistore24.com/product/680740')}
                  >
                    No thanks, maybe later
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-bold rounded-bl-lg">BEST VALUE</div>
                <CardContent className="p-6 text-center space-y-4">
                  <h3 className="text-xl font-bold">Lifetime</h3>
                  <div>
                    <span className="text-5xl font-bold">$299</span>
                    <span className="text-muted-foreground"> one-time</span>
                  </div>
                  <ul className="text-sm space-y-2 text-left">
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />All VIP features forever</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />No recurring fees</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />Priority support</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />Future updates included</li>
                  </ul>
                  <Button
                    className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-6 text-lg"
                    onClick={() => window.open('https://www.ketopia.online/progress')}
                  >
                    Yes, Get Lifetime — $299
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full text-muted-foreground"
                    onClick={() => window.open('https://www.digistore24.com/product/680740')}
                  >
                    No thanks, maybe later
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default VipUpgrade;
