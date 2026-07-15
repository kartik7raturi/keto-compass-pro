import { Button } from '@/components/ui/button';
import { Zap, TrendingUp, Shield, Award, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { trackLead } from '@/lib/tracking';

const RESULTS = [
  { icon: TrendingUp, text: 'Average 8-12 lbs lost in first month' },
  { icon: Zap, text: 'Higher energy levels within 1 week' },
  { icon: Shield, text: 'Reduced cravings in 3-5 days' },
  { icon: Award, text: 'Join 10,000+ successful members' },
];

const PricingSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 bg-gradient-to-b from-secondary/20 to-background">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-3">Ready to Start?</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
          Take a quick quiz, get your personalized keto plan, and start your transformation today.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-10">
          {RESULTS.map(r => (
            <div key={r.text} className="text-center p-3">
              <r.icon className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-xs md:text-sm font-medium">{r.text}</p>
            </div>
          ))}
        </div>

        <Button 
          size="lg"
          className="bg-gradient-to-r from-primary to-primary/80 text-lg px-8 py-7 shadow-lg hover:shadow-xl"
          onClick={() => navigate('/onboarding')}
        >
          Get Your Free Custom Keto Plan <ChevronRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </section>
  );
};

export default PricingSection;
