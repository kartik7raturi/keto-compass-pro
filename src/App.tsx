import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";
import ScrollToTop from "@/components/ScrollToTop";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import { AuthProvider } from "@/components/auth/AuthContext";
import { DietModeProvider } from "@/components/DietModeProvider";
import { SupportChatButton } from "@/components/SupportChat";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Community from "./components/Community";
import RequirePlan from "./components/auth/RequirePlan";

// Lazy-loaded routes (code-splitting)
const Profile = lazy(() => import("./pages/Profile"));
const ArticleManager = lazy(() => import("./pages/ArticleManager"));
const Admin = lazy(() => import("./pages/Admin"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Recipes = lazy(() => import("./pages/Recipes"));
const Tracker = lazy(() => import("./pages/Tracker"));
const Progress = lazy(() => import("./pages/Progress"));
const Challenges = lazy(() => import("./pages/Challenges"));
const Marketplace = lazy(() => import("./pages/Marketplace"));
const Keto30 = lazy(() => import("./pages/Keto30"));
const Fasting = lazy(() => import("./pages/Fasting"));
const Workout = lazy(() => import("./pages/Workout"));
const Water = lazy(() => import("./pages/Water"));
const PeriodTracker = lazy(() => import("./pages/PeriodTracker"));
const WeeklyPlan = lazy(() => import("./pages/WeeklyPlan"));
const QuickMeals = lazy(() => import("./pages/QuickMeals"));
const CustomPlan = lazy(() => import("./pages/CustomPlan"));
const Guide = lazy(() => import("./pages/Guide"));
const Stories = lazy(() => import("./pages/Stories"));
const Blog = lazy(() => import("./pages/Blog"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Support = lazy(() => import("./pages/Support"));
const About = lazy(() => import("./pages/About"));
const Careers = lazy(() => import("./pages/Careers"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Contact = lazy(() => import("./pages/Contact"));
const VipUpgrade = lazy(() => import("./pages/VipUpgrade"));
const ThankYou = lazy(() => import("./pages/ThankYou"));
const ThankYouVip = lazy(() => import("./pages/ThankYouVip"));
const OnboardingSurvey = lazy(() => import("./pages/OnboardingSurvey"));
const Shop = lazy(() => import("./pages/Shop"));
const Pricing = lazy(() => import("./pages/Pricing"));
const KetopiaPLR = lazy(() => import("./pages/KetopiaPLR"));
const KetopiaPLRDownloads = lazy(() => import("./pages/KetopiaPLRDownloads"));
const Messages = lazy(() => import("./pages/Messages"));
const Imprint = lazy(() => import("./pages/Imprint"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const Course = lazy(() => import("./pages/Course"));
const CourseLesson = lazy(() => import("./pages/CourseLesson"));
const CourseSales = lazy(() => import("./pages/CourseSales"));
const Transformations = lazy(() => import("./pages/Transformations"));

const queryClient = new QueryClient();

const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const App = () => (
  <HelmetProvider>
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DietModeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <AnalyticsTracker />
            <Suspense fallback={<PageFallback />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/pricing" element={<Navigate to="/vip-upgrade" replace />} />
                <Route path="/ketopia-plr" element={<KetopiaPLR />} />
                <Route path="/ketopia-plr-downloads" element={<KetopiaPLRDownloads />} />
                <Route path="/onboarding" element={<OnboardingSurvey />} />
                <Route path="/vip-upgrade" element={<VipUpgrade />} />
                <Route path="/thank-you" element={<ThankYou />} />
                <Route path="/thank-you-vip" element={<ThankYouVip />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/course" element={<Course />} />
                <Route path="/course/:moduleSlug/:lessonSlug" element={<CourseLesson />} />
                <Route path="/course-sales" element={<CourseSales />} />
                <Route path="/transformations" element={<Transformations />} />
                <Route path="/imprint" element={<Imprint />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/articles" element={<ArticleManager />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/recipes" element={<Recipes />} />
                <Route path="/tracker" element={<Tracker />} />
                <Route path="/tracker/30-day-keto" element={<RequirePlan required="vip"><Keto30 /></RequirePlan>} />
                <Route path="/tracker/fasting" element={<RequirePlan required="vip"><Fasting /></RequirePlan>} />
                <Route path="/tracker/workout" element={<RequirePlan required="vip"><Workout /></RequirePlan>} />
                <Route path="/tracker/water" element={<RequirePlan required="vip"><Water /></RequirePlan>} />
                <Route path="/tracker/period" element={<RequirePlan required="vip"><PeriodTracker /></RequirePlan>} />
                <Route path="/tracker/weekly-plan" element={<RequirePlan required="vip"><WeeklyPlan /></RequirePlan>} />
                <Route path="/progress" element={<Progress />} />
                <Route path="/challenges" element={<Challenges />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/weekly-plan" element={<RequirePlan required="vip"><WeeklyPlan /></RequirePlan>} />
                <Route path="/quick-meals" element={<QuickMeals />} />
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
            </Suspense>
            <SupportChatButton />
          </BrowserRouter>
        </TooltipProvider>
      </DietModeProvider>
    </AuthProvider>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;
