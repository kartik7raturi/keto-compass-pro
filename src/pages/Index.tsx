import Header from "@/components/Header";
import Hero from "@/components/Hero";
import MacroTracker from "@/components/MacroTracker";
import RecipeLibrary from "@/components/RecipeLibrary";
import ProgressDashboard from "@/components/ProgressDashboard";
import Community from "@/components/Community";
import Footer from "@/components/Footer";
import WeightLogger from "@/components/WeightLogger";
import ChallengeJoiner from "@/components/ChallengeJoiner";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <MacroTracker />
      <RecipeLibrary />
      <div className="container py-10">
        <div className="grid md:grid-cols-2 gap-8">
          <WeightLogger />
          <ChallengeJoiner />
        </div>
      </div>
      <ProgressDashboard />
      <Community />
      <Footer />
    </div>
  );
};

export default Index;
