import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FeatureGate from "@/components/FeatureGate";
import { PeriodTracker as PeriodTrackerComponent } from "@/components/PeriodTracker";

const PeriodTracker = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Period Tracker</h1>
          <p className="text-muted-foreground">Track your menstrual cycle for better PCOS management</p>
        </div>
        <PeriodTrackerComponent />
      </main>
      <Footer />
    </div>
  );
};

export default PeriodTracker;
