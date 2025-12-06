import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Testimonials from "@/components/Testimonials";
import Transformations from "@/components/Transformations";
import FAQSection from "@/components/FAQSection";
import HealthBadges from "@/components/HealthBadges";
import Footer from "@/components/Footer";
import { AdvertisementBanner } from "@/components/AdvertisementBanner";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <div className="container mx-auto px-4 py-4">
        <AdvertisementBanner />
      </div>
      <HealthBadges />
      <Transformations />
      <Testimonials />
      <FAQSection />
      <Footer />
    </div>
  );
};

export default Index;
