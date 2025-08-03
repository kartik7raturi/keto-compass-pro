import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, ChefHat, Star } from "lucide-react";

const QuickMeals = () => {
  const quickMeals = [
    {
      name: "Avocado Egg Bowl",
      time: "5 mins",
      carbs: "4g",
      rating: 4.8,
      description: "Simple and satisfying breakfast with perfect macros"
    },
    {
      name: "Keto Caesar Salad",
      time: "10 mins",
      carbs: "6g",
      rating: 4.7,
      description: "Classic caesar with parmesan and keto-friendly dressing"
    },
    {
      name: "Bacon & Cheese Omelet",
      time: "8 mins",
      carbs: "2g",
      rating: 4.9,
      description: "Fluffy omelet packed with bacon and cheese"
    },
    {
      name: "Zucchini Noodle Carbonara",
      time: "15 mins",
      carbs: "8g",
      rating: 4.6,
      description: "Creamy carbonara with spiralized zucchini noodles"
    },
    {
      name: "Keto Tuna Salad",
      time: "5 mins",
      carbs: "3g",
      rating: 4.5,
      description: "High-protein tuna salad with avocado mayo"
    },
    {
      name: "Chicken & Broccoli Skillet",
      time: "20 mins",
      carbs: "7g",
      rating: 4.8,
      description: "One-pan meal with tender chicken and fresh broccoli"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Quick Keto Meals</h1>
          <p className="text-xl text-muted-foreground">30-minute meals for busy keto lifestyles</p>
        </div>

        <div className="mb-6 flex gap-4 flex-wrap">
          <Button variant="outline">All Meals</Button>
          <Button variant="outline">Breakfast</Button>
          <Button variant="outline">Lunch</Button>
          <Button variant="outline">Dinner</Button>
          <Button variant="outline">Under 10 mins</Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickMeals.map((meal, index) => (
            <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{meal.name}</CardTitle>
                    <CardDescription className="mt-2">{meal.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {meal.rating}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {meal.time}
                  </div>
                  <div className="text-sm font-medium">
                    {meal.carbs} carbs
                  </div>
                </div>
                <Button className="w-full">
                  <ChefHat className="h-4 w-4 mr-2" />
                  View Recipe
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default QuickMeals;