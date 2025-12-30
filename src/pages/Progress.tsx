import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProgressDashboard from "@/components/ProgressDashboard";

const Progress = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <ProgressDashboard />
      </main>
      <Footer />
    </div>
  );
};

export default Progress;
