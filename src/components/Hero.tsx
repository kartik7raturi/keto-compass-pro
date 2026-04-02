import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronRight, Star, Target, TrendingUp, Utensils, BarChart3, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthContext";
import heroImage from "@/assets/keto-hero.jpg";

const Hero = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    navigate('/onboarding');
  };

  return (
    <section className="relative py-16 lg:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-keto-green-light via-background to-keto-green-light opacity-50" />
      
      <div className="container relative px-4">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-keto-green-light text-keto-green px-3 py-1 rounded-full text-sm font-medium">
                <Star className="h-4 w-4" />
                Personalized Keto Diet Plan
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                Get Your{" "}
                <span className="bg-gradient-to-r from-keto-green to-keto-green-dark bg-clip-text text-transparent">
                  Free Custom Keto Plan
                </span>
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-lg">
                Take a quick quiz and receive a personalized keto diet plan, 
                custom macro targets, and a 1-week meal plan tailored to your body and goals.
              </p>
            </div>

            {/* What you get */}
            <div className="space-y-3 bg-secondary/30 rounded-xl p-4">
              <p className="text-sm font-semibold text-foreground">What you'll get:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { icon: BarChart3, text: 'Your BMI & calorie targets' },
                  { icon: Utensils, text: 'Custom 1-week keto meal plan' },
                  { icon: Target, text: 'Personalized macro goals' },
                  { icon: Users, text: 'Access to keto community' },
                ].map(item => (
                  <div key={item.text} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <item.icon className="h-4 w-4 text-keto-green flex-shrink-0" />
                    {item.text}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-keto-green to-keto-green-dark hover:opacity-90 transition-opacity text-base"
                onClick={handleGetStarted}
              >
                Get Your Free Keto Plan
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/auth')}>
                Already a member? Sign In
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-4">
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-keto-green">50K+</div>
                <div className="text-xs text-muted-foreground">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-keto-green">1000+</div>
                <div className="text-xs text-muted-foreground">Keto Recipes</div>
              </div>
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-keto-green">4.9★</div>
                <div className="text-xs text-muted-foreground">User Rating</div>
              </div>
            </div>
          </div>

          <div className="relative hidden md:block">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={heroImage} 
                alt="Fresh keto ingredients" 
                className="w-full h-[450px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            
            <Card className="absolute -left-4 top-1/4 p-3 bg-background/95 backdrop-blur shadow-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-keto-green-light rounded-lg">
                  <Target className="h-4 w-4 text-keto-green" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Daily Goal</div>
                  <div className="text-xs text-muted-foreground">20g carbs left</div>
                </div>
              </div>
            </Card>

            <Card className="absolute -right-4 bottom-1/4 p-3 bg-background/95 backdrop-blur shadow-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-keto-green-light rounded-lg">
                  <TrendingUp className="h-4 w-4 text-keto-green" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Progress</div>
                  <div className="text-xs text-muted-foreground">-12 lbs this month</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
