import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, ShoppingCart } from "lucide-react";

const WeeklyPlan = () => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Weekly Meal Plan</h1>
          <p className="text-xl text-muted-foreground">Plan your keto meals for the entire week</p>
        </div>

        <div className="mb-6 flex gap-4">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Meal
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Generate Shopping List
          </Button>
        </div>

        <div className="grid gap-6">
          {days.map((day) => (
            <Card key={day}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-keto-green" />
                  {day}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Breakfast</h4>
                    <div className="p-4 border-2 border-dashed border-muted rounded-lg text-center text-muted-foreground">
                      Click to add breakfast
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Lunch</h4>
                    <div className="p-4 border-2 border-dashed border-muted rounded-lg text-center text-muted-foreground">
                      Click to add lunch
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Dinner</h4>
                    <div className="p-4 border-2 border-dashed border-muted rounded-lg text-center text-muted-foreground">
                      Click to add dinner
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WeeklyPlan;