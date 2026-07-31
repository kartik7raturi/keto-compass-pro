import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Crown, ShoppingBag, ArrowRight } from 'lucide-react';
import { useButtonLinks } from '@/hooks/useButtonLinks';
import { useSubscription } from '@/hooks/useSubscription';
import { trackPurchase } from '@/lib/tracking';

const ThankYouVip = () => {
  const navigate = useNavigate();
  const { getUrl } = useButtonLinks();
  const { refetch } = useSubscription();

  // Re-poll subscription a few times so the IPN-updated plan shows up immediately.
  useEffect(() => {
    trackPurchase('vip_12_month', 47, 'USD', { source: 'thank-you-vip' });
    const tries = [1000, 3000, 6000, 12000];
    const timers = tries.map(t => setTimeout(() => refetch(), t));
    return () => timers.forEach(clearTimeout);
  }, [refetch]);

  const handleBuySupplement = () => {
    const url = getUrl('thankyou_vip_supplement');
    if (url.startsWith('/')) navigate(url);
    else window.open(url, '_blank');
  };

  const handleDashboard = () => {
    const url = getUrl('thankyou_vip_dashboard');
    if (url.startsWith('/')) navigate(url);
    else window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-xl mx-auto text-center mb-6">
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4 mb-6">
            <p className="text-sm font-medium">
              Thank you for upgrading to Ketopia VIP!
            </p>
          </div>
        </div>

        <div className="max-w-xl mx-auto text-center space-y-8">
          <div>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/10 mb-4">
              <Crown className="h-10 w-10 text-amber-500" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Thank you for upgrading to Ketopia VIP!</h1>
            <div className="space-y-4 text-sm md:text-base text-muted-foreground max-w-md mx-auto">
              <p>
                Access URL:{' '}
                <a href="https://www.ketopia.online/auth" className="font-semibold text-primary underline-offset-4 hover:underline">
                  https://www.ketopia.online/auth
                </a>
              </p>
              <p>
                Your VIP account is upgraded automatically after purchase. Login with the same email used at checkout.
                All VIP features unlock instantly.
              </p>
              <p>
                Support: Email us at:{' '}
                <a href="mailto:sankhobusiness@gmail.com" className="font-semibold text-primary underline-offset-4 hover:underline">
                  sankhobusiness@gmail.com
                </a>
              </p>
            </div>
          </div>

          <Card className="border-2 border-primary shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-3 text-center font-bold">
              🔥 EXCLUSIVE VIP OFFER — ONE TIME ONLY 🔥
            </div>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3 justify-center">
                <ShoppingBag className="h-8 w-8 text-primary" />
                <h2 className="text-xl font-bold">Accelerate Your Results</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Supercharge your keto journey with our premium BHB supplement. 
                VIP members get exclusive pricing!
              </p>
              <ul className="text-sm space-y-2 text-left max-w-xs mx-auto">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Faster ketosis entry</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Boosted energy & focus</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Reduced cravings</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Premium BHB formula</li>
              </ul>
              <Button
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-6 text-lg font-bold"
                onClick={handleBuySupplement}
              >
                Yes, Add Supplement to My Order
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                className="w-full text-muted-foreground"
                asChild
              >
                <a href="https://www.jvzoo.com/nothanks/443435">No Thanks</a>
              </Button>
            </CardContent>
          </Card>
        </div>

        <img
          src="https://i.jvzoo.com/0/443435/99"
          alt="VIP Upgrade ketopia #1 custom keto diet platform"
          
          width="1"
          height="1"
        />

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

export default ThankYouVip;
