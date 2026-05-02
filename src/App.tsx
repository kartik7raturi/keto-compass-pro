import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import { AuthProvider } from "@/components/auth/AuthContext";
import { DietModeProvider } from "@/components/DietModeProvider";
import { SupportChatButton } from "@/components/SupportChat";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import ArticleManager from "./pages/ArticleManager";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import Recipes from "./pages/Recipes";
import Tracker from "./pages/Tracker";
import Progress from "./pages/Progress";
import Challenges from "./pages/Challenges";
import Marketplace from "./pages/Marketplace";
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
import VipUpgrade from "./pages/VipUpgrade";
import ThankYou from "./pages/ThankYou";
import ThankYouVip from "./pages/ThankYouVip";
import OnboardingSurvey from "./pages/OnboardingSurvey";
import Shop from "./pages/Shop";
import Pricing from "./pages/Pricing";
import Messages from "./pages/Messages";
import Imprint from "./pages/Imprint";
import RefundPolicy from "./pages/RefundPolicy";
import RequirePlan from "./components/auth/RequirePlan";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DietModeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/onboarding" element={<OnboardingSurvey />} />
              <Route path="/vip-upgrade" element={<VipUpgrade />} />
              <Route path="/thank-you" element={<ThankYou />} />
              <Route path="/thank-you-vip" element={<ThankYouVip />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/imprint" element={<Imprint />} />
              <Route path="/refund-policy" element={<RefundPolicy />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/articles" element={<ArticleManager />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/recipes" element={<RequirePlan><Recipes /></RequirePlan>} />
              <Route path="/tracker" element={<RequirePlan><Tracker /></RequirePlan>} />
              <Route path="/tracker/30-day-keto" element={<RequirePlan required="vip"><Keto30 /></RequirePlan>} />
              <Route path="/tracker/fasting" element={<RequirePlan required="vip"><Fasting /></RequirePlan>} />
              <Route path="/tracker/workout" element={<RequirePlan required="vip"><Workout /></RequirePlan>} />
              <Route path="/tracker/water" element={<RequirePlan required="vip"><Water /></RequirePlan>} />
              <Route path="/tracker/period" element={<RequirePlan required="vip"><PeriodTracker /></RequirePlan>} />
              <Route path="/tracker/weekly-plan" element={<RequirePlan required="vip"><WeeklyPlan /></RequirePlan>} />
              <Route path="/progress" element={<RequirePlan><Progress /></RequirePlan>} />
              <Route path="/challenges" element={<RequirePlan><Challenges /></RequirePlan>} />
              <Route path="/marketplace" element={<RequirePlan><Marketplace /></RequirePlan>} />
              <Route path="/weekly-plan" element={<RequirePlan required="vip"><WeeklyPlan /></RequirePlan>} />
              <Route path="/quick-meals" element={<RequirePlan><QuickMeals /></RequirePlan>} />
              <Route path="/custom-plan" element={<RequirePlan required="vip"><CustomPlan /></RequirePlan>} />
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
              <Route path="/messages" element={
                <div className="min-h-screen bg-background">
                  <Header />
                  <Community />
                  <Footer />
                </div>
              } />
              <Route path="/leaderboard" element={<Progress />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <SupportChatButton />
          </BrowserRouter>
        </TooltipProvider>
      </DietModeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
