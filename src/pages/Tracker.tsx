import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MacroTracker from "@/components/MacroTracker";
import WeightLogger from "@/components/WeightLogger";

const Tracker = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Tracker</h1>
          <p className="text-muted-foreground mb-8">Track your daily macros and weight progress</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <MacroTracker />
          <WeightLogger />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Tracker;