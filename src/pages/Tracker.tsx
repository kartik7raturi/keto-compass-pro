import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EnhancedMacroTracker from "@/components/EnhancedMacroTracker";

const Tracker = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Macro Tracker</h1>
          <p className="text-muted-foreground">Track your daily macros with precision</p>
        </div>
        <EnhancedMacroTracker />
      </main>
      <Footer />
    </div>
  );
};

export default Tracker;