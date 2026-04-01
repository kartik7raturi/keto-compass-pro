import { Navigate } from "react-router-dom";
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
import { useAuth } from "@/components/auth/AuthContext";
import PricingSection from "@/components/PricingSection";
import DigiStoreBadge from "@/components/DigiStoreBadge";
import DigiStorePromo from "@/components/DigiStorePromo";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { user } = useAuth();
  const { showWelcome, closeWelcome } = useWelcomeModal();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (user) {
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();
        setIsAdmin(!!data);
      }
      setChecking(false);
    };
    checkAdmin();
  }, [user]);

  // If logged in and NOT admin, go to progress
  if (user && !checking && !isAdmin) {
    return <Navigate to="/progress" replace />;
  }

  // Still checking admin status for logged-in user
  if (user && checking) {
    return null;
  }

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
      <PricingSection />
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
