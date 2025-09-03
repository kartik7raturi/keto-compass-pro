import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Testimonials from "@/components/Testimonials";
import Transformations from "@/components/Transformations";
import FAQSection from "@/components/FAQSection";
import KetoArticles from "@/components/KetoArticles";
import HealthBadges from "@/components/HealthBadges";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <HealthBadges />
      <Transformations />
      <KetoArticles />
      <Testimonials />
      <FAQSection />
      <Footer />
    </div>
  );
};

export default Index;
