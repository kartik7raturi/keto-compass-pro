import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Shield, Truck, Check } from 'lucide-react';
import supplementImage from '@/assets/keto-supplement.png';

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

const Shop = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Breadcrumb */}
        <div className="container px-4 py-4">
          <p className="text-sm text-muted-foreground">
            Home / Shop / Night Time Fat Burner
          </p>
        </div>

        {/* Product Section */}
        <section className="container px-4 pb-12">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
            {/* Image */}
            <div className="bg-secondary/20 rounded-2xl p-8 flex items-center justify-center">
              <img
                src={supplementImage}
                alt="Beworths Night Time Fat Burner — Keto Supplement"
                className="max-h-[450px] w-auto object-contain"
              />
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <Badge className="bg-primary/10 text-primary mb-2">Keto Supplement</Badge>
                <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                  Night Time Fat Burner
                </h1>
                <p className="text-muted-foreground mt-2">High Potency Weight Loss — 60 Softgels</p>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="h-5 w-5 text-amber-500 fill-amber-500" />
                ))}
                <span className="text-sm text-muted-foreground">(4.8 / 5 — 2,340 reviews)</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold">$29.99</span>
                <span className="text-xl text-muted-foreground line-through">$49.99</span>
                <Badge variant="destructive">40% OFF</Badge>
              </div>

              {/* Benefits */}
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

              {/* CTA */}
              <div className="space-y-3">
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-primary to-primary/80 text-lg py-7"
                  onClick={() => window.open('https://buy.stripe.com/YOUR_SUPPLEMENT_LINK', '_blank')}
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

        {/* Final CTA */}
        <section className="py-12 bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="container px-4 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Start Burning Fat While You Sleep?</h2>
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-primary/80 text-lg px-12 py-6"
              onClick={() => window.open('https://buy.stripe.com/YOUR_SUPPLEMENT_LINK', '_blank')}
            >
              Order Now — $29.99
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Shop;
