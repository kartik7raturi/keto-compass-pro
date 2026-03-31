import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Star } from 'lucide-react';

const BASIC_FEATURES = [
  '1000+ Keto Recipes',
  'Daily Food Tracker',
  'Basic Progress Bar',
  'Community Access',
  'Recipe Favorites',
];

const PricingSection = () => {
  return (
    <section className="py-16 bg-secondary/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Start Your Keto Journey</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Get access to recipes, daily tracker, and progress tracking
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <Card className="border-2 border-primary shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 text-xs font-bold rounded-bl-lg">
              POPULAR
            </div>
            <CardHeader className="text-center pb-2">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
              </div>
              <CardTitle className="text-2xl">Keto Starter Plan</CardTitle>
              <div className="mt-2">
                <span className="text-5xl font-bold">$19</span>
                <span className="text-2xl">.99</span>
                <span className="text-muted-foreground ml-1">/month</span>
              </div>
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
              <Button
                className="w-full bg-gradient-to-r from-primary to-primary/80 text-lg py-6"
                onClick={() => window.open('https://www.digistore24.com/product/678112', '_blank')}
              >
                Get Started — $19.99/mo
              </Button>
              <p className="text-xs text-center text-muted-foreground">Cancel anytime. No hidden fees.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
