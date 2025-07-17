import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronRight, Star, Target, TrendingUp } from "lucide-react";
import heroImage from "@/assets/keto-hero.jpg";

const Hero = () => {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-keto-green-light via-background to-keto-yellow-light opacity-50" />
      
      <div className="container relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-keto-green-light text-keto-green px-3 py-1 rounded-full text-sm font-medium">
                <Star className="h-4 w-4" />
                #1 Keto Tracking App
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Master Your{" "}
                <span className="bg-gradient-to-r from-keto-green to-keto-yellow bg-clip-text text-transparent">
                  Keto Journey
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-lg">
                Track macros, discover delicious recipes, and join a supportive community. 
                Everything you need to succeed on keto, all in one beautiful app.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-gradient-to-r from-keto-green to-keto-yellow hover:opacity-90 transition-opacity" onClick={() => console.log('Start Free Today clicked')}>
                Start Free Today
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => console.log('Watch Demo clicked')}>
                Watch Demo
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-8 pt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-keto-green">50K+</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-keto-yellow">1000+</div>
                <div className="text-sm text-muted-foreground">Keto Recipes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-keto-green">4.9★</div>
                <div className="text-sm text-muted-foreground">App Rating</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={heroImage} 
                alt="Fresh keto ingredients" 
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            
            {/* Floating cards */}
            <Card className="absolute -left-4 top-1/4 p-4 bg-background/95 backdrop-blur shadow-lg animate-pulse">
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

            <Card className="absolute -right-4 bottom-1/4 p-4 bg-background/95 backdrop-blur shadow-lg animate-pulse">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-keto-yellow-light rounded-lg">
                  <TrendingUp className="h-4 w-4 text-keto-yellow" />
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