import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Crown, PartyPopper, ShoppingBag, ArrowRight } from 'lucide-react';
import DigiStoreBadge from '@/components/DigiStoreBadge';
import DigiStoreUpsell from '@/components/DigiStoreUpsell';

const ThankYouVip = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <DigiStoreBadge type="thankyoupage" />
      <DigiStoreUpsell />
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-xl mx-auto text-center space-y-8">
          {/* Success message */}
          <div>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/10 mb-4">
              <Crown className="h-10 w-10 text-amber-500" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome to VIP! 🎉</h1>
            <p className="text-lg text-muted-foreground">
              Your VIP plan is now active. All premium features are unlocked.
            </p>
          </div>

          {/* Supplement Upsell */}
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
                onClick={() => window.open('https://www.digistore24.com/answer/yes?template=light', '_blank')}
              >
                Yes, Add Supplement to My Order
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                className="w-full text-muted-foreground"
                onClick={() => navigate('/progress')}
              >
                No thanks, go to my dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ThankYouVip;
