import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProgressDashboard from "@/components/ProgressDashboard";
import DailyChallengeTracker from "@/components/DailyChallengeTracker";

const Progress = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <ProgressDashboard />
        <div className="max-w-6xl mx-auto mt-8">
          <DailyChallengeTracker />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Progress;