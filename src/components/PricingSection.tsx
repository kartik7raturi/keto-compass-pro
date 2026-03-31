import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Star, Zap, TrendingUp, Shield, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useButtonLinks } from '@/hooks/useButtonLinks';

const BASIC_FEATURES = [
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

const PricingSection = () => {
  const { getUrl } = useButtonLinks();

  return (
    <section className="py-16 bg-gradient-to-b from-secondary/20 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <Badge className="bg-primary/10 text-primary mb-3">Limited Time Offer</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Start Your Keto Transformation</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Join thousands who have transformed their health with our proven keto system
          </p>
        </div>

        {/* Results */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-10">
          {RESULTS.map(r => (
            <div key={r.text} className="text-center p-3">
              <r.icon className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-xs md:text-sm font-medium">{r.text}</p>
            </div>
          ))}
        </div>

        <div className="max-w-md mx-auto">
          <Card className="border-2 border-primary shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-2 text-center text-sm font-bold">
              🔥 MOST POPULAR — START TODAY 🔥
            </div>
            <CardHeader className="text-center pb-2 pt-12">
              <div className="flex items-center justify-center gap-1 mb-2">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="h-5 w-5 text-amber-500 fill-amber-500" />
                ))}
              </div>
              <CardTitle className="text-2xl">Keto Starter Plan</CardTitle>
              <div className="mt-2">
                <span className="text-lg text-muted-foreground line-through mr-2">$39.99</span>
                <span className="text-5xl font-bold text-primary">$19</span>
                <span className="text-2xl font-bold text-primary">.99</span>
                <span className="text-muted-foreground ml-1">/month</span>
              </div>
              <Badge variant="destructive" className="mt-2">50% OFF — Limited Time</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {BASIC_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
                <p className="text-xs text-center font-medium text-primary">
                  ✅ 30-day money back guarantee • Cancel anytime
                </p>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-primary to-primary/80 text-lg py-7 shadow-lg hover:shadow-xl transition-all"
                onClick={() => window.open(getUrl('keto_starter'), '_blank')}
              >
                Get Started Now — $19.99/mo
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Secure payment • Instant access • No hidden fees
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
