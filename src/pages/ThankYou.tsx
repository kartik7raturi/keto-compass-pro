import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Crown, PartyPopper } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import DigiStoreBadge from '@/components/DigiStoreBadge';
import DigiStorePromo from '@/components/DigiStorePromo';

const ThankYou = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { upgradePlan } = useSubscription();
  const plan = searchParams.get('plan') || 'basic';

  useEffect(() => {
    if (plan === 'basic') {
      upgradePlan('basic', 'monthly', 19.99);
    } else if (plan === 'vip-monthly') {
      upgradePlan('vip', 'monthly', 49);
    } else if (plan === 'vip-lifetime') {
      upgradePlan('vip', 'one_time', 299);
    }
  }, [plan]);

  const isVip = plan.startsWith('vip');

  const basicFeatures = ['1000+ Keto Recipes', 'Daily Food Tracker', 'Basic Progress Bar', 'Community Access'];
  const vipFeatures = [
    ...basicFeatures,
    '30-Day Keto Challenge', 'Fasting Tracker', 'Workout Tracker', 'Water Tracker',
    'Weekly Meal Planner', 'Period Tracker', 'Custom Plans', 'Advanced Analytics',
    'Weight Trends', 'Energy Balance', 'Weekly Reports', 'All Challenges', 'Marketplace',
  ];

  const features = isVip ? vipFeatures : basicFeatures;

  return (
    <div className="min-h-screen bg-background">
      <DigiStoreBadge type="thankyoupage" />
      <DigiStorePromo />
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-lg mx-auto text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
              <PartyPopper className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Thank You! 🎉</h1>
            <p className="text-lg text-muted-foreground">
              Your {isVip ? 'VIP' : 'Starter'} plan is now active
            </p>
          </div>

          <Card className={`border-2 ${isVip ? 'border-amber-500' : 'border-primary'} mb-8`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                {isVip ? <Crown className="h-6 w-6 text-amber-500" /> : null}
                <h2 className="text-xl font-bold">{isVip ? 'VIP' : 'Starter'} Plan — Unlocked Features</h2>
              </div>
              <ul className="space-y-2 text-left">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className={`h-4 w-4 flex-shrink-0 ${isVip ? 'text-amber-500' : 'text-primary'}`} />
                    {f}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Button className="w-full" size="lg" onClick={(https://www.digistore24.com/answer/yes?template=light) => navigate('/progress')}>
              Go to Dashboard
            </Button>
            {!isVip && (
              <Button variant="outline" className="w-full border-amber-500 text-amber-600" size="lg" onClick={(https://www.digistore24.com/answer/no) => navigate('/vip-upgrade')}>
                <Crown className="h-4 w-4 mr-2" /> Upgrade to VIP
              </Button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ThankYou;
