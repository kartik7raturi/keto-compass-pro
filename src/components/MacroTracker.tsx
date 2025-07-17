import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Plus, Utensils, Apple, Beef } from "lucide-react";

const MacroTracker = () => {
  const macros = [
    { name: "Carbs", current: 15, target: 20, color: "bg-red-500", icon: Apple },
    { name: "Protein", current: 120, target: 140, color: "bg-blue-500", icon: Beef },
    { name: "Fat", current: 85, target: 120, color: "bg-keto-green", icon: Utensils }
  ];

  return (
    <section id="tracker" className="py-20 bg-secondary/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Smart Macro Tracking
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Effortlessly track your daily macros with our intelligent food database 
            and barcode scanner. Stay in ketosis with precision.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Today's Macros</span>
                <Button size="sm" className="bg-gradient-to-r from-keto-green to-keto-orange" onClick={() => console.log('Add Food clicked')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Food
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                {macros.map((macro) => {
                  const percentage = (macro.current / macro.target) * 100;
                  const Icon = macro.icon;
                  
                  return (
                    <div key={macro.name} className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${macro.color.replace('bg-', 'bg-').replace('-500', '-100')}`}>
                          <Icon className={`h-5 w-5 ${macro.color.replace('bg-', 'text-')}`} />
                        </div>
                        <div>
                          <div className="font-semibold">{macro.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {macro.current}g / {macro.target}g
                          </div>
                        </div>
                      </div>
                      <Progress value={percentage} className="h-3" />
                      <div className="text-xs text-muted-foreground text-center">
                        {macro.target - macro.current}g remaining
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 p-6 bg-gradient-to-r from-keto-green-light to-keto-orange-light rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">Ketosis Status</h3>
                    <p className="text-sm text-muted-foreground">
                      You're on track! Keep carbs under 20g to maintain ketosis.
                    </p>
                  </div>
                  <div className="text-3xl">🎯</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Meals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: "Avocado Omelet", time: "8:30 AM", carbs: "4g" },
                  { name: "Grilled Salmon Salad", time: "1:15 PM", carbs: "6g" },
                  { name: "Keto Coffee", time: "3:00 PM", carbs: "2g" }
                ].map((meal, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div>
                      <div className="font-medium">{meal.name}</div>
                      <div className="text-sm text-muted-foreground">{meal.time}</div>
                    </div>
                    <div className="text-sm font-medium text-keto-green">{meal.carbs}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Add</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  "🥑 Avocado (1 medium)",
                  "🧀 Cheddar Cheese (1 oz)",
                  "🥩 Ground Beef (3 oz)",
                  "🥜 Almonds (1 oz)"
                ].map((food, index) => (
                  <Button 
                    key={index} 
                    variant="outline" 
                    className="w-full justify-start h-auto p-3"
                    onClick={() => console.log(`Quick add: ${food}`)}
                  >
                    {food}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MacroTracker;