import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Star, Heart } from "lucide-react";

const RecipeLibrary = () => {
  const recipes = [
    {
      id: 1,
      title: "Creamy Garlic Chicken",
      image: "🍗",
      time: "25 min",
      servings: 4,
      rating: 4.8,
      carbs: "3g",
      difficulty: "Easy",
      tags: ["High Protein", "Dinner"]
    },
    {
      id: 2,
      title: "Keto Chocolate Mousse",
      image: "🍫",
      time: "15 min",
      servings: 6,
      rating: 4.9,
      carbs: "2g",
      difficulty: "Easy",
      tags: ["Dessert", "Low Carb"]
    },
    {
      id: 3,
      title: "Zucchini Lasagna",
      image: "🥒",
      time: "45 min",
      servings: 8,
      rating: 4.7,
      carbs: "5g",
      difficulty: "Medium",
      tags: ["Comfort Food", "Vegetarian"]
    },
    {
      id: 4,
      title: "Bacon Wrapped Asparagus",
      image: "🥓",
      time: "20 min",
      servings: 4,
      rating: 4.6,
      carbs: "1g",
      difficulty: "Easy",
      tags: ["Side Dish", "Quick"]
    },
    {
      id: 5,
      title: "Keto Pizza Bowl",
      image: "🍕",
      time: "30 min",
      servings: 2,
      rating: 4.5,
      carbs: "4g",
      difficulty: "Easy",
      tags: ["Lunch", "Comfort Food"]
    },
    {
      id: 6,
      title: "Avocado Smoothie",
      image: "🥑",
      time: "5 min",
      servings: 1,
      rating: 4.4,
      carbs: "3g",
      difficulty: "Easy",
      tags: ["Breakfast", "Smoothie"]
    }
  ];

  return (
    <section id="recipes" className="py-20">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Delicious Keto Recipes
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover 1000+ mouth-watering keto recipes with detailed macros, 
            step-by-step instructions, and video tutorials.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {["All", "Breakfast", "Lunch", "Dinner", "Dessert", "Snacks", "Drinks"].map((category) => (
            <Button 
              key={category} 
              variant={category === "All" ? "default" : "outline"}
              size="sm"
              className={category === "All" ? "bg-gradient-to-r from-keto-green to-keto-orange" : ""}
              onClick={() => console.log(`Filter by: ${category}`)}
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {recipes.map((recipe) => (
            <Card key={recipe.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
              <CardHeader className="pb-4">
                <div className="text-6xl text-center mb-4">{recipe.image}</div>
                <CardTitle className="text-lg group-hover:text-keto-green transition-colors">
                  {recipe.title}
                </CardTitle>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {recipe.time}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {recipe.servings}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {recipe.rating}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="secondary" className="bg-keto-green-light text-keto-green">
                    {recipe.carbs} carbs
                  </Badge>
                  <Badge variant="outline">
                    {recipe.difficulty}
                  </Badge>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {recipe.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1 bg-gradient-to-r from-keto-green to-keto-orange hover:opacity-90" onClick={() => console.log(`View Recipe: ${recipe.title}`)}>
                    View Recipe
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => console.log(`Favorite: ${recipe.title}`)}>
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button variant="outline" size="lg" onClick={() => console.log('Browse All Recipes clicked')}>
            Browse All Recipes
          </Button>
        </div>
      </div>
    </section>
  );
};

export default RecipeLibrary;