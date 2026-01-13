import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EnhancedMacroTracker from "@/components/EnhancedMacroTracker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, Utensils, Target, Droplet, Dumbbell, Timer, CheckSquare, Heart } from "lucide-react";

const Tracker = () => {
  const navigate = useNavigate();

  const trackerOptions = [
    {
      title: "Macro Tracker",
      description: "Track your daily macronutrients and calories",
      icon: Target,
      path: "/tracker",
      current: true
    },
    {
      title: "30-Day Keto",
      description: "Stay on a 30-day keto streak",
      icon: CheckSquare,
      path: "/tracker/30-day-keto"
    },
    {
      title: "Intermittent Fasting",
      description: "Start and monitor your fasting windows",
      icon: Timer,
      path: "/tracker/fasting"
    },
    {
      title: "Workout Tracker",
      description: "Log your workouts and duration",
      icon: Dumbbell,
      path: "/tracker/workout"
    },
    {
      title: "Water Tracker",
      description: "Track daily hydration and goals",
      icon: Droplet,
      path: "/tracker/water"
    },
    {
      title: "Weekly Plan",
      description: "Create weekly meal schedules",
      icon: Calendar,
      path: "/tracker/weekly-plan"
    },
    {
      title: "Quick Meals",
      description: "Fast and easy keto meal options",
      icon: Clock,
      path: "/quick-meals"
    },
    {
      title: "Custom Plan",
      description: "Create personalized meal plans",
      icon: Utensils,
      path: "/custom-plan"
    },
    {
      title: "Period Tracker",
      description: "Track your menstrual cycle",
      icon: Heart,
      path: "/tracker/period"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Tracker Dashboard</h1>
          <p className="text-muted-foreground">Track your keto journey with precision</p>
        </div>

        {/* Tracker Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {trackerOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Card 
                key={option.path} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  option.current ? 'ring-2 ring-primary bg-primary/5' : ''
                }`}
                onClick={() => !option.current && navigate(option.path)}
              >
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{option.title}</CardTitle>
                  <CardDescription>{option.description}</CardDescription>
                </CardHeader>
                {!option.current && (
                  <CardContent className="pt-0">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(option.path);
                      }}
                    >
                      Open
                    </Button>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {/* Macro Tracker */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Macro Tracker</h2>
          <EnhancedMacroTracker />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Tracker;