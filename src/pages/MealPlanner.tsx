import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, ChefHat } from "lucide-react";

const MealPlanner = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Keto Meal Planner</h1>
          <p className="text-xl text-muted-foreground">Plan your weekly keto meals with ease</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CalendarDays className="h-8 w-8 text-keto-green mb-2" />
              <CardTitle>Weekly Planning</CardTitle>
              <CardDescription>Plan all your meals for the week ahead</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" onClick={() => window.location.href = '/weekly-plan'}>Start Planning</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Clock className="h-8 w-8 text-keto-green mb-2" />
              <CardTitle>Quick Meals</CardTitle>
              <CardDescription>30-minute keto meal suggestions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" onClick={() => window.location.href = '/quick-meals'}>Browse Quick Meals</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <ChefHat className="h-8 w-8 text-keto-green mb-2" />
              <CardTitle>Custom Plans</CardTitle>
              <CardDescription>Create personalized meal plans</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" onClick={() => window.location.href = '/custom-plan'}>Create Plan</Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>We're working hard to bring you the best meal planning experience</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Our meal planner will help you organize your keto journey with automated grocery lists, 
              macro calculations, and personalized meal suggestions based on your preferences.
            </p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default MealPlanner;