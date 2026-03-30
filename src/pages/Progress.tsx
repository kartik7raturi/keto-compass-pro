import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProgressDashboard from "@/components/ProgressDashboard";
import FeatureGate from "@/components/FeatureGate";
import { WeightTrendChart } from "@/components/progress/WeightTrendChart";
import { ExpenditureChart } from "@/components/progress/ExpenditureChart";
import { VisualProgressCharts } from "@/components/progress/VisualProgressCharts";
import { WeeklyReport } from "@/components/progress/WeeklyReport";

const Progress = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-4 md:py-8">
        <ProgressDashboard />
      </main>
      <Footer />
    </div>
  );
};

export default Progress;
