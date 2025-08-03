import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Guide = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Complete Keto Guide</h1>
          <p className="text-xl text-muted-foreground">Everything you need to know about the ketogenic diet</p>
        </div>

        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle>What is the Ketogenic Diet?</CardTitle>
              <CardDescription>Understanding the basics of keto</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                The ketogenic diet is a low-carb, high-fat diet that puts your body into ketosis - 
                a metabolic state where you burn fat for energy instead of carbohydrates.
              </p>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="secondary">Fat: 70-80%</Badge>
                <Badge variant="secondary">Protein: 15-25%</Badge>
                <Badge variant="secondary">Carbs: 5-10%</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>Your first steps into keto</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Calculate your macronutrient needs</li>
                <li>• Clean out your pantry of high-carb foods</li>
                <li>• Stock up on keto-friendly foods</li>
                <li>• Plan your first week of meals</li>
                <li>• Track your progress and symptoms</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Keto-Friendly Foods</CardTitle>
              <CardDescription>What to eat and what to avoid</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-green-600 mb-2">✓ Eat These:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Meat and poultry</li>
                    <li>• Fish and seafood</li>
                    <li>• Eggs</li>
                    <li>• Low-carb vegetables</li>
                    <li>• Nuts and seeds</li>
                    <li>• Healthy oils and fats</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-red-600 mb-2">✗ Avoid These:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Grains and starches</li>
                    <li>• Sugar and sweets</li>
                    <li>• Most fruits</li>
                    <li>• Legumes</li>
                    <li>• Root vegetables</li>
                    <li>• Low-fat products</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Guide;