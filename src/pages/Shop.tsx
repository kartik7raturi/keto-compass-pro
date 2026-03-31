import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Shield, Truck, Check, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import supplementImage from '@/assets/keto-supplement.png';
import { useButtonLinks } from '@/hooks/useButtonLinks';
import { useState } from 'react';
import DigiStorePromo from '@/components/DigiStorePromo';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const BENEFITS = [
  'Supports Sleep Aid',
  'Boosts Metabolism',
  'Appetite Suppression',
  'Night Time Weight Loss',
  'High Potency Formula',
  'Dietary Supplement — 60 Softgels',
];

const INGREDIENTS = [
  'CLA (Conjugated Linoleic Acid)',
  'L-Carnitine',
  'Green Tea Extract',
  'Melatonin',
  'Ashwagandha Root',
  'White Kidney Bean Extract',
];

const DETAILED_BENEFITS = [
  { title: 'Burn Fat While You Sleep', desc: 'Our unique night-time formula works with your body\'s natural metabolism to promote fat burning during sleep.' },
  { title: 'Better Sleep Quality', desc: 'Melatonin and Ashwagandha help improve sleep quality so you wake up refreshed and energized.' },
  { title: 'Suppress Late Night Cravings', desc: 'White Kidney Bean Extract and CLA help reduce those late-night urges to snack.' },
  { title: 'Support Ketosis', desc: 'Perfectly formulated to complement your keto diet and help maintain ketosis overnight.' },
];

const FAQS = [
  { q: 'How do I take this supplement?', a: 'Take 2 softgels 30 minutes before bedtime with water.' },
  { q: 'Is it safe to use with keto diet?', a: 'Yes! This supplement is specially formulated for keto dieters.' },
  { q: 'How long until I see results?', a: 'Most users notice changes within 2-4 weeks of consistent use.' },
  { q: 'Are there any side effects?', a: 'Our formula uses natural ingredients. Some may experience drowsiness due to melatonin.' },
  { q: 'Can I cancel my order?', a: 'Yes, we offer a 30-day money-back guarantee if you\'re not satisfied.' },
];

const REVIEWS = [
  { name: 'Jessica R.', rating: 5, text: 'Amazing product! Lost 8 lbs in the first month while sleeping better than ever.', date: '2 weeks ago' },
  { name: 'Mike T.', rating: 5, text: 'I was skeptical at first but the results speak for themselves. Highly recommend!', date: '1 month ago' },
  { name: 'Amanda S.', rating: 4, text: 'Good supplement. Noticed reduced cravings and better sleep. Will buy again.', date: '3 weeks ago' },
  { name: 'David L.', rating: 5, text: 'Perfect complement to my keto lifestyle. The ingredients are top quality.', date: '1 month ago' },
];

const Shop = () => {
  const { getUrl } = useButtonLinks();

  return (
    <div className="min-h-screen bg-background">
      <DigiStorePromo />
      <Header />
      <main>
        {/* Breadcrumb */}
        <div className="container px-4 py-4">
          <p className="text-sm text-muted-foreground">Home / Shop / Night Time Fat Burner</p>
        </div>

        {/* Product Hero */}
        <section className="container px-4 pb-12">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
            <div className="bg-secondary/20 rounded-2xl p-4 md:p-8 flex items-center justify-center">
              <img
                src={supplementImage}
                alt="Beworths Night Time Fat Burner — Keto Supplement"
                className="max-h-[300px] md:max-h-[450px] w-auto object-contain"
              />
            </div>

            <div className="space-y-5">
              <div>
                <Badge className="bg-primary/10 text-primary mb-2">Keto Supplement</Badge>
                <h1 className="text-2xl md:text-4xl font-bold leading-tight">Night Time Fat Burner</h1>
                <p className="text-muted-foreground mt-2">High Potency Weight Loss — 60 Softgels</p>
              </div>

              <div className="flex items-center gap-2">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="h-5 w-5 text-amber-500 fill-amber-500" />
                ))}
                <span className="text-sm text-muted-foreground">(4.8 / 5 — 2,340 reviews)</span>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold">$29.99</span>
                <span className="text-xl text-muted-foreground line-through">$49.99</span>
                <Badge variant="destructive">40% OFF</Badge>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Key Benefits</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {BENEFITS.map(b => (
                    <li key={b} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-primary to-primary/80 text-lg py-7"
                  onClick={() => window.open(getUrl('shop_product'), '_blank')}
                >
                  Buy Now — $29.99
                </Button>
                <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> 30-Day Guarantee</span>
                  <span className="flex items-center gap-1"><Truck className="h-3 w-3" /> Free Shipping</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Benefits */}
        <section className="py-12 bg-gradient-to-b from-primary/5 to-background">
          <div className="container px-4 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Why Choose Our Fat Burner?</h2>
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

        {/* How It Works */}
        <section className="py-12 container px-4 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: '1', title: 'Take Before Bed', desc: 'Take 2 softgels 30 minutes before sleep.' },
              { step: '2', title: 'Sleep & Burn', desc: 'Ingredients work overnight to boost metabolism.' },
              { step: '3', title: 'Wake Up Lighter', desc: 'Experience gradual, healthy weight loss.' },
            ].map(s => (
              <div key={s.step} className="text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground text-xl font-bold flex items-center justify-center mx-auto">
                  {s.step}
                </div>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
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
              "I've tried many supplements, but this is the first one that actually works while I sleep.
              Combined with my keto diet, I've lost 15 lbs in just 6 weeks!"
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

        {/* Pricing CTA */}
        <section className="py-12">
          <div className="container px-4 max-w-md mx-auto">
            <Card className="border-2 border-primary shadow-xl">
              <CardContent className="p-6 text-center space-y-4">
                <h2 className="text-2xl font-bold">Ready to Burn Fat While You Sleep?</h2>
                <div className="flex items-baseline justify-center gap-3">
                  <span className="text-4xl font-bold">$29.99</span>
                  <span className="text-lg text-muted-foreground line-through">$49.99</span>
                </div>
                <ul className="text-sm space-y-2 text-left">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />60 Softgels (30-Day Supply)</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />Free Shipping</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />30-Day Money Back Guarantee</li>
                </ul>
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-primary to-primary/80 text-lg py-7"
                  onClick={() => window.open(getUrl('shop_product'), '_blank')}
                >
                  Order Now — $29.99
                </Button>
                <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Secure Payment</span>
                  <span className="flex items-center gap-1"><Truck className="h-3 w-3" /> Fast Delivery</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Shop;
