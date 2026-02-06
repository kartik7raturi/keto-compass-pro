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
const Index = () => {
  const {
    showWelcome,
    closeWelcome
  } = useWelcomeModal();
  return <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <div className="container mx-auto px-4 py-4">
        <AdvertisementBanner />
      </div>
      <HealthBadges />
      <Transformations />
      <Testimonials />
      <FAQSection />
      
      {/* Contact Form Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4 border-primary border-0">
          <div className="text-center mb-8 border border-primary-foreground">
            <h2 className="text-3xl font-bold mb-4 bg-primary-foreground text-black">Send us a suggestion</h2>
            <p className="text-muted-foreground">
              Send us your recipe suggestions, feedback, or report any issues
            </p>
          </div>
          <ContactForm />
        </div>
      </section>
      
      <Footer />

      {/* Welcome Progress Modal */}
      <WelcomeProgressModal open={showWelcome} onClose={closeWelcome} />
    </div>;
};
export default Index;