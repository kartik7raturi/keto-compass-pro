import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Star, Heart, ChefHat } from "lucide-react";
import { useState } from "react";

const RecipeLibrary = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [favorites, setFavorites] = useState<number[]>([]);

  const toggleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(fav => fav !== id)
        : [...prev, id]
    );
  };

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
      tags: ["High Protein", "Dinner"],
      category: "Dinner"
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
      tags: ["Dessert", "Low Carb"],
      category: "Dessert"
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
      tags: ["Comfort Food", "Vegetarian"],
      category: "Dinner"
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
      tags: ["Side Dish", "Quick"],
      category: "Snacks"
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
      tags: ["Lunch", "Comfort Food"],
      category: "Lunch"
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
      tags: ["Breakfast", "Smoothie"],
      category: "Drinks"
    },
    {
      id: 7,
      title: "Keto Pancakes",
      image: "🥞",
      time: "15 min",
      servings: 2,
      rating: 4.7,
      carbs: "2g",
      difficulty: "Easy",
      tags: ["Breakfast", "Quick"],
      category: "Breakfast"
    },
    {
      id: 8,
      title: "Cauliflower Mac & Cheese",
      image: "🧀",
      time: "35 min",
      servings: 6,
      rating: 4.6,
      carbs: "4g",
      difficulty: "Medium",
      tags: ["Comfort Food", "Side Dish"],
      category: "Dinner"
    },
    {
      id: 9,
      title: "Keto Bread",
      image: "🍞",
      time: "60 min",
      servings: 8,
      rating: 4.3,
      carbs: "1g",
      difficulty: "Hard",
      tags: ["Bread", "Baking"],
      category: "Snacks"
    },
    {
      id: 10,
      title: "Bulletproof Coffee",
      image: "☕",
      time: "5 min",
      servings: 1,
      rating: 4.8,
      carbs: "0g",
      difficulty: "Easy",
      tags: ["Breakfast", "Energy"],
      category: "Drinks"
    },
    {
      id: 11,
      title: "Keto Cheesecake",
      image: "🍰",
      time: "90 min",
      servings: 12,
      rating: 4.9,
      carbs: "3g",
      difficulty: "Hard",
      tags: ["Dessert", "Special"],
      category: "Dessert"
    },
    {
      id: 12,
      title: "Egg Salad Lettuce Wraps",
      image: "🥬",
      time: "10 min",
      servings: 2,
      rating: 4.4,
      carbs: "2g",
      difficulty: "Easy",
      tags: ["Lunch", "Quick"],
      category: "Lunch"
    }
  ];

  const categories = ["All", "Breakfast", "Lunch", "Dinner", "Dessert", "Snacks", "Drinks"];

  const filteredRecipes = selectedCategory === "All" 
    ? recipes 
    : recipes.filter(recipe => recipe.category === selectedCategory);

  return (
    <section id="recipes" className="py-20">
      <div className="container">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <ChefHat className="h-8 w-8 text-keto-green" />
            <h2 className="text-3xl lg:text-4xl font-bold">
              Delicious Keto Recipes
            </h2>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover 1000+ mouth-watering keto recipes with detailed macros, 
            step-by-step instructions, and video tutorials.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {categories.map((category) => (
            <Button 
              key={category} 
              variant={category === selectedCategory ? "default" : "outline"}
              size="sm"
              className={category === selectedCategory ? "bg-gradient-to-r from-keto-green to-keto-yellow" : ""}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredRecipes.map((recipe) => (
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
                  <Badge 
                    variant="outline"
                    className={
                      recipe.difficulty === "Easy" ? "border-green-500 text-green-500" :
                      recipe.difficulty === "Medium" ? "border-yellow-500 text-yellow-500" :
                      "border-red-500 text-red-500"
                    }
                  >
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
                  <Button 
                    className="flex-1 bg-gradient-to-r from-keto-green to-keto-yellow hover:opacity-90" 
                    onClick={() => console.log(`View Recipe: ${recipe.title}`)}
                  >
                    View Recipe
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => toggleFavorite(recipe.id)}
                    className={favorites.includes(recipe.id) ? "text-red-500 border-red-500" : ""}
                  >
                    <Heart className={`h-4 w-4 ${favorites.includes(recipe.id) ? "fill-current" : ""}`} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center space-y-4">
          <div className="bg-gradient-to-r from-keto-green-light to-keto-yellow-light p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Want More Recipes?</h3>
            <p className="text-muted-foreground mb-4">
              Access our complete library of 1000+ keto recipes with meal planning tools
            </p>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-keto-green to-keto-yellow"
              onClick={() => console.log('Browse All Recipes clicked')}
            >
              Browse All 1000+ Recipes
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecipeLibrary;