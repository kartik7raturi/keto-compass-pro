import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Star, Heart, ChefHat } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import RecipeDetail from "@/components/RecipeDetail";
import { useAuth } from "@/components/auth/AuthContext";

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
              <Card key={recipe.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
                <CardHeader className="pb-4">
                  <div className="text-6xl text-center mb-4">🍽️</div>
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
                    <Badge variant="secondary" className="bg-keto-green-light text-keto-green">
                      {recipe.carbs}g carbs
                    </Badge>
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
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {recipe.description}
                  </p>

                  <div className="flex gap-2">
                    <Button 
                      className="flex-1 bg-gradient-to-r from-keto-green to-keto-green-dark hover:opacity-90" 
                      onClick={() => handleViewRecipe(recipe)}
                    >
                      View Recipe
                    </Button>
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