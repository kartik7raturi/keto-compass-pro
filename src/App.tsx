import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthContext";
import { DietModeProvider } from "@/components/DietModeProvider";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import ArticleManager from "./pages/ArticleManager";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import Recipes from "./pages/Recipes";
import Tracker from "./pages/Tracker";
import Progress from "./pages/Progress";

import Keto30 from "./pages/Keto30";
import Fasting from "./pages/Fasting";
import Workout from "./pages/Workout";
import Water from "./pages/Water";
import PeriodTracker from "./pages/PeriodTracker";

import WeeklyPlan from "./pages/WeeklyPlan";
import QuickMeals from "./pages/QuickMeals";
import CustomPlan from "./pages/CustomPlan";
import Guide from "./pages/Guide";
import Stories from "./pages/Stories";
import Blog from "./pages/Blog";
import FAQ from "./pages/FAQ";
import Support from "./pages/Support";
import About from "./pages/About";
import Careers from "./pages/Careers";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import Community from "./components/Community";
import Header from "./components/Header";
import Footer from "./components/Footer";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DietModeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/articles" element={<ArticleManager />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/recipes" element={<Recipes />} />
              <Route path="/tracker" element={<Tracker />} />
              <Route path="/tracker/30-day-keto" element={<Keto30 />} />
              <Route path="/tracker/fasting" element={<Fasting />} />
              <Route path="/tracker/workout" element={<Workout />} />
              <Route path="/tracker/water" element={<Water />} />
              <Route path="/tracker/period" element={<PeriodTracker />} />
              <Route path="/tracker/weekly-plan" element={<WeeklyPlan />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/weekly-plan" element={<WeeklyPlan />} />
              <Route path="/quick-meals" element={<QuickMeals />} />
              <Route path="/custom-plan" element={<CustomPlan />} />
              <Route path="/guide" element={<Guide />} />
              <Route path="/stories" element={<Stories />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<Blog />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/support" element={<Support />} />
              <Route path="/about" element={<About />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/community" element={
                <div className="min-h-screen bg-background">
                  <Header />
                  <Community />
                  <Footer />
                </div>
              } />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </DietModeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
