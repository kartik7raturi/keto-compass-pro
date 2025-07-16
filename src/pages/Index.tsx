import Header from "@/components/Header";
import Hero from "@/components/Hero";
import MacroTracker from "@/components/MacroTracker";
import RecipeLibrary from "@/components/RecipeLibrary";
import ProgressDashboard from "@/components/ProgressDashboard";
import Community from "@/components/Community";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <MacroTracker />
      <RecipeLibrary />
      <ProgressDashboard />
      <Community />
      <Footer />
    </div>
  );
};

export default Index;
