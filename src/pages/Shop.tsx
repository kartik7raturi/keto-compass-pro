import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Shield, Truck, Check, MessageSquare, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useButtonLinks } from '@/hooks/useButtonLinks';
import supplementImg from '@/assets/supplement-product.png';

const BENEFITS = [
  'Supports Healthy Ketosis',
  'Boosts Energy & Mental Clarity',
  'Appetite & Craving Control',
  'Enhanced Fat Burning',
  'Electrolyte Balance Support',
  'Premium BHB Ketone Formula',
];

const INGREDIENTS = [
  'Beta-Hydroxybutyrate (BHB)',
  'MCT Oil Powder',
  'Magnesium BHB',
  'Calcium BHB',
  'Sodium BHB',
  'Green Tea Extract',
];

const DETAILED_BENEFITS = [
  { title: 'Accelerate Ketosis', desc: 'Exogenous BHB ketones help your body enter ketosis faster, even if you slip up on carbs.' },
  { title: 'Sustained Energy', desc: 'Clean, long-lasting energy without the crash of sugar or caffeine.' },
  { title: 'Crush Cravings', desc: 'BHB and MCT help suppress appetite naturally so you stay on track.' },
  { title: 'Mental Clarity', desc: 'Ketones are premium brain fuel — experience sharper focus and concentration.' },
];

const FAQS = [
  { q: 'How do I take this supplement?', a: 'Take 2 capsules daily with water, preferably in the morning or before a workout.' },
  { q: 'Is it safe to use with keto diet?', a: 'Absolutely! This supplement is specially formulated to complement your keto lifestyle.' },
  { q: 'How long until I see results?', a: 'Most users notice increased energy within days. Fat loss results typically appear within 2-4 weeks.' },
  { q: 'Are there any side effects?', a: 'Our formula uses clean, natural ingredients. Some may experience mild digestive adjustment in the first few days.' },
  { q: 'Can I get a refund?', a: 'Yes, we offer a 60-day money-back guarantee if you are not satisfied.' },
];

const REVIEWS = [
  { name: 'Jessica R.', rating: 5, text: 'Amazing product! I feel so much more energized on keto now.', date: '2 weeks ago' },
  { name: 'Mike T.', rating: 5, text: 'Finally a BHB supplement that actually works. Highly recommend!', date: '1 month ago' },
  { name: 'Amanda S.', rating: 4, text: 'Good supplement. Noticed reduced cravings and better focus.', date: '3 weeks ago' },
  { name: 'David L.', rating: 5, text: 'Perfect complement to my keto lifestyle. Top quality ingredients.', date: '1 month ago' },
];

const PRICING_OPTIONS = [
  { label: 'Sample Option', bottles: 1, pricePerBottle: 39.95, total: 39.95, savings: null, freeShipping: false, popular: false, best: false, linkKey: 'shop_1_bottle' },
  { label: 'Biggest Savings', bottles: 6, pricePerBottle: 33.25, total: 199.50, savings: 40.20, freeShipping: true, popular: false, best: true, linkKey: 'shop_6_bottles' },
  { label: 'Most Popular', bottles: 3, pricePerBottle: 35.95, total: 107.85, savings: 12.00, freeShipping: true, popular: true, best: false, linkKey: 'shop_3_bottles' },
];

const Shop = () => {
  const navigate = useNavigate();
  const { getUrl } = useButtonLinks();

  const scrollToPricing = () => {
    document.getElementById('supplement-pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <DigiStoreUpsell />
      <Header />
      <main>
        {/* Product Overview Hero */}
        <section className="py-12 md:py-16 bg-gradient-to-br from-primary/5 via-background to-primary/10">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto text-center space-y-4">
              <Badge className="bg-primary/10 text-primary">Keto Supplement</Badge>
              <h1 className="text-3xl md:text-5xl font-bold leading-tight">
                Advanced Keto BHB Formula
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Premium Exogenous Ketones — Accelerate Your Keto Results. Enter ketosis faster, boost energy, and crush cravings.
              </p>
              <div className="flex items-center justify-center gap-2">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="h-5 w-5 text-amber-500 fill-amber-500" />
                ))}
                <span className="text-sm text-muted-foreground">(4.8 / 5 — 2,340 reviews)</span>
              </div>

              <div className="flex items-center justify-center">
                <img src={supplementImg} alt="Keto BHB Supplement" className="h-48 md:h-64 object-contain rounded-xl" />
              </div>

              <ul className="flex flex-wrap justify-center gap-3 text-sm">
                {BENEFITS.slice(0, 4).map(b => (
                  <li key={b} className="flex items-center gap-1">
                    <Check className="h-3.5 w-3.5 text-primary" />{b}
                  </li>
                ))}
              </ul>

              <Button
                size="lg"
                className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-lg px-10 py-7 font-bold"
                onClick={scrollToPricing}
              >
                Order Now
              </Button>
            </div>
          </div>
        </section>

        {/* Key Benefits */}
        <section className="py-12 bg-secondary/20">
          <div className="container px-4 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-6">Key Benefits</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
              {BENEFITS.map(b => (
                <li key={b} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Detailed Benefits */}
        <section className="py-12 bg-gradient-to-b from-primary/5 to-background">
          <div className="container px-4 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Why Choose Our BHB Formula?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {DETAILED_BENEFITS.map((b, i) => (
                <Card key={i} className="border-primary/10">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{b.title}</h3>
                        <p className="text-sm text-muted-foreground">{b.desc}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Ingredients */}
        <section className="bg-secondary/20 py-12">
          <div className="container px-4 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-6">Premium Ingredients</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {INGREDIENTS.map(ing => (
                <Card key={ing}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{ing}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Multi-Bottle Pricing */}
        <section id="supplement-pricing" className="py-14 scroll-mt-20">
          <div className="container px-4">
            <h2 className="text-2xl font-bold text-center mb-2">Choose Your Package</h2>
            <p className="text-center text-muted-foreground mb-8">Select the best option for your keto goals</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {PRICING_OPTIONS.map((opt) => (
                <Card
                  key={opt.label}
                  className={`relative overflow-hidden ${opt.best ? 'border-2 border-[hsl(var(--primary))] shadow-xl' : 'border shadow-md'}`}
                >
                  <div className={`py-3 text-center text-white font-bold text-sm ${opt.best ? 'bg-[hsl(var(--primary))]' : opt.popular ? 'bg-[hsl(var(--primary))]' : 'bg-muted-foreground'}`}>
                    {opt.label}
                  </div>
                  <CardContent className="p-6 text-center space-y-4">
                    <p className="text-lg font-semibold">{opt.bottles} {opt.bottles === 1 ? 'Bottle' : 'Bottles'}</p>
                    
                    <div className="flex items-center justify-center">
                      <img src={supplementImg} alt="Keto BHB Supplement" className="h-24 md:h-28 object-contain" />
                    </div>

                    <div>
                      <span className="text-4xl font-bold">${opt.pricePerBottle.toFixed(2)}</span>
                      <span className="text-muted-foreground"> /Bottle</span>
                    </div>

                    {opt.savings && (
                      <div className="space-y-1">
                        <p className="text-sm text-primary font-semibold">💰 Save ${opt.savings.toFixed(2)}</p>
                        {opt.freeShipping && (
                          <p className="text-sm font-bold">🚚 FREE SHIPPING</p>
                        )}
                      </div>
                    )}

                    <p className="text-lg font-semibold">Total: ${opt.total.toFixed(2)}</p>

                    <Button
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-5 text-base font-bold"
                      onClick={() => window.open(getUrl(opt.linkKey), '_blank')}
                    >
                      Add To Cart
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full text-muted-foreground text-sm"
                      onClick={() => navigate('/progress')}
                    >
                      Go to Dashboard
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Reviews */}
        <section className="py-12 bg-secondary/10">
          <div className="container px-4 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Customer Reviews</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {REVIEWS.map((r, i) => (
                <Card key={i}>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-1 mb-2">
                      {Array.from({ length: r.rating }).map((_, j) => (
                        <Star key={j} className="h-4 w-4 text-amber-500 fill-amber-500" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">"{r.text}"</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold">{r.name}</span>
                      <span className="text-xs text-muted-foreground">{r.date}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="py-12">
          <div className="container px-4 max-w-3xl mx-auto text-center">
            <MessageSquare className="h-10 w-10 text-primary mx-auto mb-4" />
            <blockquote className="text-lg md:text-xl italic text-muted-foreground mb-4">
              "Since starting this BHB supplement alongside keto, my energy levels are through the roof
              and I've lost 15 lbs in just 6 weeks!"
            </blockquote>
            <p className="font-semibold">— Rachel P., Verified Buyer</p>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-12 bg-secondary/20">
          <div className="container px-4 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible>
              {FAQS.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-sm font-medium">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-12">
          <div className="container px-4 max-w-md mx-auto text-center space-y-4">
            <h2 className="text-2xl font-bold">Ready to Accelerate Your Keto Results?</h2>
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white text-lg py-7 font-bold"
              onClick={() => window.open(getUrl('shop_3_bottles'), '_blank')}
            >
              Order Now — Best Seller
            </Button>
            <Button
              variant="outline"
              className="w-full text-muted-foreground"
              onClick={() => navigate('/progress')}
            >
              No thanks, go to dashboard
            </Button>
            <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> 60-Day Guarantee</span>
              <span className="flex items-center gap-1"><Truck className="h-3 w-3" /> Free Shipping on 3+</span>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Shop;
