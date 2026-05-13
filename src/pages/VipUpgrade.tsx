import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Crown, Zap, Target, TrendingUp, Dumbbell, Droplets, Calendar, Star, Shield, FileText, Mail, Download } from 'lucide-react';

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

const WHY_VIP = [
  'Faster results with structured system',
  'No guesswork — everything planned',
  'Proven strategies for fat loss',
  'Designed for beginners & busy people',
  'Works from home without gym',
];

const PERFECT_FOR = [
  'You struggle with cravings and fat loss',
  'You want a clear diet plan',
  'You need structured guidance',
  'You want faster and visible results',
  'You prefer a simple system to follow',
];

const TESTIMONIALS = [
  { name: 'Sarah M.', text: 'Lost 20 lbs in 2 months with VIP features!', stars: 5 },
  { name: 'James K.', text: 'The fasting tracker changed my routine completely.', stars: 5 },
  { name: 'Maria L.', text: 'Best investment for my keto journey.', stars: 5 },
];

const VIP_LINK = '/pricing';

const VipUpgrade = () => {
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

        {/* What is Ketopia VIP */}
        <section className="py-10 bg-secondary/10">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-2xl font-bold text-center mb-4">What is Ketopia VIP?</h2>
            <p className="text-muted-foreground text-center mb-6">
              Ketopia VIP is a premium digital upgrade that gives you full access to advanced weight-loss strategies, structured plans, and exclusive content.
            </p>
            <div className="space-y-3 max-w-md mx-auto">
              <h3 className="font-semibold">When you upgrade, you will receive:</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-amber-500 flex-shrink-0" /> Advanced fat-loss diet plans (PDF)</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-amber-500 flex-shrink-0" /> Exclusive meal plans & recipes</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-amber-500 flex-shrink-0" /> Step-by-step transformation system</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-amber-500 flex-shrink-0" /> Premium training content (videos/guides)</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-amber-500 flex-shrink-0" /> Bonus resources for faster results</li>
              </ul>
              <p className="text-xs text-muted-foreground italic">
                This is a digital product. No physical items or supplements will be shipped.
              </p>
            </div>
          </div>
        </section>

        {/* Why Choose VIP */}
        <section className="py-10">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-2xl font-bold text-center mb-6">Why Choose VIP Access?</h2>
            <div className="max-w-md mx-auto space-y-2">
              {WHY_VIP.map(item => (
                <div key={item} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-amber-500 flex-shrink-0" /> {item}
                </div>
              ))}
            </div>
          </div>
        </section>

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

        {/* Instant Access */}
        <section className="py-10 bg-secondary/10">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <h2 className="text-2xl font-bold mb-4">Instant Access After Purchase</h2>
            <p className="text-muted-foreground mb-6">Once your payment is complete, you will receive:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
              <div className="text-center p-4">
                <Mail className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                <p className="text-sm font-medium">Instant access via email</p>
              </div>
              <div className="text-center p-4">
                <Download className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                <p className="text-sm font-medium">Download links or login credentials</p>
              </div>
              <div className="text-center p-4">
                <Shield className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                <p className="text-sm font-medium">Full access to all VIP materials</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">You can start immediately.</p>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-16 bg-gradient-to-b from-amber-500/5 to-background">
          <div className="container px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">Choose Your VIP Plan</h2>
            <p className="text-center text-muted-foreground mb-8">Unlock everything. No restrictions.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <Card className="border-2 border-amber-500/30 shadow-lg">
                <CardContent className="p-6 text-center space-y-4">
                  <h3 className="text-xl font-bold">Monthly</h3>
                  <div>
                    <span className="text-5xl font-bold">$29</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <ul className="text-sm space-y-2 text-left">
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-amber-500" />All VIP features</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-amber-500" />Cancel anytime</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-amber-500" />Priority support</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-amber-500" />60-day money back guarantee</li>
                  </ul>
                  <Button
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-6 text-lg"
                    onClick={() => window.open(VIP_LINK, '_blank')}
                  >
                    Upgrade Now — $29/mo
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-bold rounded-bl-lg">BEST VALUE</div>
                <CardContent className="p-6 text-center space-y-4">
                  <h3 className="text-xl font-bold">12-Month Access</h3>
                  <div>
                    <span className="text-5xl font-bold">$99</span>
                    <span className="text-muted-foreground">/year</span>
                  </div>
                  <ul className="text-sm space-y-2 text-left">
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />All VIP features for a full year</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />Single yearly payment — save vs monthly</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />Priority support</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />Future updates included</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />60-day money back guarantee</li>
                  </ul>
                  <Button
                    className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-6 text-lg"
                    onClick={() => window.open(VIP_LINK, '_blank')}
                  >
                    Get 12-Month Access — $99
                  </Button>
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

        {/* Perfect For You */}
        <section className="py-10">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-2xl font-bold text-center mb-6">This is Perfect For You If:</h2>
            <div className="max-w-md mx-auto space-y-2">
              {PERFECT_FOR.map(item => (
                <div key={item} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-amber-500 flex-shrink-0" /> {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-12 bg-secondary/20">
          <div className="container px-4">
            <h2 className="text-2xl font-bold text-center mb-8">What VIP Members Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
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

        {/* CTA */}
        <section className="py-12 bg-gradient-to-r from-amber-500/10 to-orange-500/10">
          <div className="container mx-auto px-4 text-center max-w-2xl">
            <h2 className="text-2xl font-bold mb-3">Upgrade Now & Start Your Transformation</h2>
            <p className="text-muted-foreground mb-6">
              Click the button below to unlock full VIP access and take control of your fitness journey today.
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-lg py-7 px-10"
              onClick={() => window.open(VIP_LINK, '_blank')}
            >
              👉 Upgrade to Ketopia VIP Now
            </Button>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="py-6 bg-secondary/10">
          <div className="container mx-auto px-4 text-center max-w-2xl">
            <h3 className="font-semibold text-sm mb-2">Disclaimer</h3>
            <p className="text-xs text-muted-foreground">
              This product is for educational purposes only. Results may vary from person to person.
              This is not medical advice. Please consult a professional before making dietary changes.
            </p>
          </div>
        </section>

        {/* Footer links */}
        <div className="py-6 text-center border-t">
          <div className="container px-4 flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
            <a href="/imprint" className="hover:text-primary transition-colors">Imprint</a>
            <a href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="/refund-policy" className="hover:text-primary transition-colors">Refund Policy</a>
          </div>
          <p className="text-xs text-muted-foreground mt-4 max-w-2xl mx-auto px-4">
            These earnings are not representative for the average participants. The average participant will earn significantly less or no money at all through this product or service.
          </p>
        </div>
      </main>
    </div>
  );
};

export default VipUpgrade;
