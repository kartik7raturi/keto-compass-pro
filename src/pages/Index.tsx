import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Testimonials from "@/components/Testimonials";
import Transformations from "@/components/Transformations";
import FAQSection from "@/components/FAQSection";
import HealthBadges from "@/components/HealthBadges";
import Footer from "@/components/Footer";
import { AdvertisementBanner } from "@/components/AdvertisementBanner";
import ContactForm from "@/components/ContactForm";
import WelcomeProgressModal from "@/components/WelcomeProgressModal";
import { useWelcomeModal } from "@/hooks/useWelcomeModal";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Utensils, BarChart3, Target, Dumbbell, Droplets, Calendar, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const MoneyBackGuarantee = () => (
  <section className="py-12 bg-primary/5">
    <div className="container mx-auto px-4 text-center max-w-2xl">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
        <Shield className="h-8 w-8 text-primary" />
      </div>
      <h2 className="text-2xl font-bold mb-3">60-Day Money Back Guarantee</h2>
      <p className="text-muted-foreground">
        We're confident you'll love Ketopia. If you're not 100% satisfied within 60 days, 
        we'll refund your purchase — no questions asked.
      </p>
    </div>
  </section>
);

const WhatYouGet = () => {
  const navigate = useNavigate();
  const features = [
    { icon: Utensils, title: '1000+ Keto Recipes', desc: 'Delicious meals for every taste' },
    { icon: BarChart3, title: 'Smart Food Tracker', desc: 'Log meals & track daily macros' },
    { icon: Target, title: 'Custom Meal Plans', desc: 'Plans tailored to your goals' },
    { icon: Dumbbell, title: 'Workout Tracker', desc: 'Log exercises & burn calories' },
    { icon: Droplets, title: 'Water & Fasting', desc: 'Hydration & fasting timers' },
    { icon: Calendar, title: 'Weekly Planner', desc: 'Organized weekly meal prep' },
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-secondary/20 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Your Complete Keto Toolkit
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Everything you need to start, track, and succeed on your keto diet — recipes, trackers, meal plans, and community support.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-8">
          {features.map(f => (
            <Card key={f.title} className="border-primary/10 hover:border-primary/30 transition-colors">
              <CardContent className="p-4 text-center space-y-2">
                <div className="mx-auto w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-sm">{f.title}</h3>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-primary to-primary/80 hover:opacity-90"
            onClick={() => navigate('/onboarding')}
          >
            Get Your Free Custom Keto Plan →
          </Button>
        </div>
      </div>
    </section>
  );
};

const Index = () => {
  const { showWelcome, closeWelcome } = useWelcomeModal();

  return (
    <div className="min-h-screen bg-background">
      <DigiStoreBadge type="salespage" />
      <DigiStorePromo />
      <Header />
      <Hero />
      <div className="container mx-auto px-4 py-4">
        <AdvertisementBanner />
      </div>
      <HealthBadges />
      <WhatYouGet />
      <MoneyBackGuarantee />
      <Transformations />
      <Testimonials />
      <FAQSection />
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Send us a suggestion</h2>
            <p className="text-muted-foreground">Send us your recipe suggestions, feedback, or report any issues</p>
          </div>
          <ContactForm />
        </div>
      </section>
      <Footer />
      <WelcomeProgressModal open={showWelcome} onClose={closeWelcome} />
    </div>
  );
};

export default Index;
