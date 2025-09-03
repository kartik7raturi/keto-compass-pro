import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Star, Heart, ChefHat } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import RecipeDetail from "@/components/RecipeDetail";
import { useAuth } from "@/components/auth/AuthContext";
import SocialShareButtons from "@/components/SocialShareButtons";

// Import recipe images
import ketoBreakfastBowl from "@/assets/recipes/keto-breakfast-bowl.jpg";
import ketoSalmonDinner from "@/assets/recipes/keto-salmon-dinner.jpg";
import ketoChocolateMousse from "@/assets/recipes/keto-chocolate-mousse.jpg";
import ketoChickenWrap from "@/assets/recipes/keto-chicken-wrap.jpg";
import ketoCauliflowerPizza from "@/assets/recipes/keto-cauliflower-pizza.jpg";
import ketoFatBombs from "@/assets/recipes/keto-fat-bombs.jpg";

interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prep_time: number;
  cook_time: number;
  servings: number;
  difficulty: string;
  category: string;
  carbs: number;
  protein: number;
  fat: number;
  calories: number;
  image_url?: string;
}

const RecipeLibrary = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecipes(data || []);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsDetailOpen(true);
  };

  const getRecipeImage = (recipe: Recipe) => {
    if (recipe.image_url) return recipe.image_url;
    
    // Default images based on category or title
    const title = recipe.title.toLowerCase();
    if (title.includes('breakfast') || title.includes('bowl')) return ketoBreakfastBowl;
    if (title.includes('salmon') || title.includes('fish')) return ketoSalmonDinner;
    if (title.includes('chocolate') || title.includes('mousse')) return ketoChocolateMousse;
    if (title.includes('chicken') || title.includes('wrap')) return ketoChickenWrap;
    if (title.includes('pizza') || title.includes('cauliflower')) return ketoCauliflowerPizza;
    if (title.includes('bomb') || title.includes('snack')) return ketoFatBombs;
    
    // Default by category
    switch (recipe.category?.toLowerCase()) {
      case 'breakfast': return ketoBreakfastBowl;
      case 'lunch': return ketoChickenWrap;
      case 'dinner': return ketoSalmonDinner;
      case 'dessert': return ketoChocolateMousse;
      case 'snacks': return ketoFatBombs;
      default: return ketoCauliflowerPizza;
    }
  };


  const categories = ["All", "Breakfast", "Lunch", "Dinner", "Dessert", "Snacks", "Drinks"];

  const filteredRecipes = selectedCategory === "All" 
    ? recipes 
    : recipes.filter(recipe => recipe.category?.toLowerCase() === selectedCategory.toLowerCase());

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
              className={category === selectedCategory ? "bg-gradient-to-r from-keto-green to-keto-green-dark" : ""}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground">Loading recipes...</div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredRecipes.map((recipe) => (
              <Card key={recipe.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden">
                <div className="relative">
                  <img 
                    src={getRecipeImage(recipe)}
                    alt={recipe.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="bg-keto-green-light text-keto-green">
                      {recipe.carbs}g carbs
                    </Badge>
                  </div>
                </div>
                
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg group-hover:text-keto-green transition-colors">
                    {recipe.title}
                  </CardTitle>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {recipe.prep_time + recipe.cook_time} min
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {recipe.servings}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      4.5
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <Badge 
                      variant="outline"
                      className={
                        recipe.difficulty === "easy" ? "border-green-500 text-green-500" :
                        recipe.difficulty === "medium" ? "border-yellow-500 text-yellow-500" :
                        "border-red-500 text-red-500"
                      }
                    >
                      {recipe.difficulty}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      {recipe.calories} cal
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {recipe.description}
                  </p>

                  <div className="space-y-3">
                    <Button 
                      className="w-full bg-gradient-to-r from-keto-green to-keto-green-dark hover:opacity-90" 
                      onClick={() => handleViewRecipe(recipe)}
                    >
                      View Recipe
                    </Button>
                    
                    <SocialShareButtons 
                      title={recipe.title}
                      description={recipe.description}
                      url={`${window.location.origin}/recipes/${recipe.id}`}
                      image={getRecipeImage(recipe)}
                      className="justify-center"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center space-y-4">
          <div className="bg-gradient-to-r from-keto-green-light to-keto-green-light p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Want More Recipes?</h3>
            <p className="text-muted-foreground mb-4">
              Access our complete library with meal planning tools and personalized recommendations
            </p>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-keto-green to-keto-green-dark"
              onClick={() => user ? fetchRecipes() : console.log('Sign up to access more recipes')}
            >
              {user ? 'Refresh Recipes' : 'Sign Up for More Recipes'}
            </Button>
          </div>
        </div>

        <RecipeDetail 
          recipe={selectedRecipe}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
        />
      </div>
    </section>
  );
};

export default RecipeLibrary;