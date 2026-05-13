import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Crown, PartyPopper, ShoppingBag, ArrowRight } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useButtonLinks } from '@/hooks/useButtonLinks';

const ThankYou = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { upgradePlan, refetch } = useSubscription();
  const { getUrl } = useButtonLinks();
  const plan = searchParams.get('plan') || 'basic';

  useEffect(() => {
    if (plan === 'basic') {
      upgradePlan('basic', 'one_time', 19);
    } else if (plan === 'vip-monthly') {
      upgradePlan('vip', 'monthly', 29);
    } else if (plan === 'vip-lifetime' || plan === 'vip-yearly') {
      // $99 yearly plan — stored as vip_lifetime internally; expiry now 365 days
      upgradePlan('vip_lifetime', 'one_time', 99);
    }
    // Re-poll a few times so the IPN processor's update lands.
    const tries = [2000, 5000, 10000];
    const timers = tries.map(t => setTimeout(() => refetch(), t));
    return () => timers.forEach(clearTimeout);
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

  const handleVipUpgrade = () => {
    const url = getUrl('thankyou_basic_vip_upgrade');
    if (url.startsWith('/')) navigate(url);
    else window.open(url, '_blank');
  };

  const handleDashboard = () => {
    const url = getUrl('thankyou_basic_dashboard');
    if (url.startsWith('/')) navigate(url);
    else window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-xl mx-auto text-center mb-6">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
            <p className="text-sm font-medium">
              Thank you for your purchase!
            </p>
          </div>
        </div>

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

          <Card className={`border-2 ${isVip ? 'border-amber-500' : 'border-primary'} mb-6`}>
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

          <p className="text-xs text-muted-foreground mb-6">
            A receipt has been emailed to you.
          </p>

          <div className="space-y-3">
            {!isVip ? (
              <>
                {/* VIP Upsell Card */}
                <Card className="border-2 border-amber-500 shadow-xl overflow-hidden mb-4">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3 text-center font-bold text-sm">
                    🔥 EXCLUSIVE OFFER — UPGRADE TO VIP 🔥
                  </div>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3 justify-center">
                      <Crown className="h-8 w-8 text-amber-500" />
                      <h2 className="text-xl font-bold">Unlock All Premium Features</h2>
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      Get advanced trackers, workout plans, fasting tools, and detailed analytics!
                    </p>
                    <Button
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-6 text-lg font-bold"
                      onClick={handleVipUpgrade}
                    >
                      <Crown className="h-5 w-5 mr-2" /> Yes, Upgrade to VIP
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </CardContent>
                </Card>
                <Button variant="outline" className="w-full" size="lg" onClick={handleDashboard}>
                  No thanks, go to my dashboard
                </Button>
              </>
            ) : (
              <Button className="w-full" size="lg" onClick={handleDashboard}>
                Go to Dashboard
              </Button>
            )}
          </div>
        </div>

        {/* Footer links */}
        <div className="mt-12 text-center">
          <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
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

export default ThankYou;
