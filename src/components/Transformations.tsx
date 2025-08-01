import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, Calendar, Target } from "lucide-react";

const Transformations = () => {
  const transformations = [
    {
      name: "Lisa Chen",
      beforeImage: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      afterImage: "https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      weightLoss: "42 lbs",
      timeframe: "8 months",
      startWeight: "185 lbs",
      currentWeight: "143 lbs",
      story: "Lost 42 pounds and gained confidence. Keto changed my relationship with food completely.",
      achievements: ["Improved energy", "Better sleep", "Reduced inflammation"]
    },
    {
      name: "David Park",
      beforeImage: "https://images.unsplash.com/photo-1517022812141-2362092800607?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      afterImage: "https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      weightLoss: "38 lbs", 
      timeframe: "6 months",
      startWeight: "220 lbs",
      currentWeight: "182 lbs",
      story: "From struggling with weight to feeling the strongest I've ever been. This app made it possible.",
      achievements: ["Lower cholesterol", "Increased muscle", "Mental clarity"]
    },
    {
      name: "Jennifer Walsh",
      beforeImage: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      afterImage: "https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      weightLoss: "29 lbs",
      timeframe: "5 months", 
      startWeight: "165 lbs",
      currentWeight: "136 lbs",
      story: "The tracking features kept me accountable every day. I finally found a sustainable lifestyle.",
      achievements: ["Stable blood sugar", "Mood improvement", "Consistent energy"]
    }
  ];

  return (
    <section className="py-20">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Amazing Transformations
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See the incredible journeys of our community members
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {transformations.map((transformation, index) => (
            <Card key={index} className="overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="relative">
                <div className="grid grid-cols-2 gap-0">
                  <div className="relative">
                    <img 
                      src={transformation.beforeImage}
                      alt={`${transformation.name} before`}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="bg-muted text-muted-foreground">
                        Before
                      </Badge>
                    </div>
                  </div>
                  <div className="relative">
                    <img 
                      src={transformation.afterImage}
                      alt={`${transformation.name} after`}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-keto-green text-white">
                        After
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <CardContent className="p-6">
                <h4 className="font-semibold text-lg mb-2">{transformation.name}</h4>
                
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-keto-green mb-1">
                      <TrendingDown className="h-4 w-4" />
                      <span className="font-bold">{transformation.weightLoss}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Lost</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-primary mb-1">
                      <Calendar className="h-4 w-4" />
                      <span className="font-bold">{transformation.timeframe}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Duration</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-primary mb-1">
                      <Target className="h-4 w-4" />
                      <span className="font-bold">{transformation.currentWeight}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Current</p>
                  </div>
                </div>

                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                  "{transformation.story}"
                </p>

                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Key Achievements:</h5>
                  <div className="flex flex-wrap gap-1">
                    {transformation.achievements.map((achievement, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {achievement}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-keto-green-light to-keto-green-light p-8 rounded-lg max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold mb-3">Ready to Start Your Transformation?</h3>
            <p className="text-muted-foreground mb-4">
              Join thousands who have already transformed their lives with our comprehensive keto tracking platform.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="text-center">
                <div className="font-bold text-keto-green text-lg">50,000+</div>
                <div className="text-muted-foreground">Success Stories</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-keto-green text-lg">2.5M+</div>
                <div className="text-muted-foreground">Pounds Lost</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-keto-green text-lg">95%</div>
                <div className="text-muted-foreground">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Transformations;