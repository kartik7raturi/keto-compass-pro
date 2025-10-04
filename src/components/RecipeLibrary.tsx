import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, ChefHat, ThumbsUp, Trophy } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import RecipeDetail from "@/components/RecipeDetail";
import { useAuth } from "@/components/auth/AuthContext";
import SocialShareButtons from "@/components/SocialShareButtons";
import { DietTypeSwitch } from "./DietTypeSwitch";
import { UserRecipeSubmission } from "./UserRecipeSubmission";

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
  upvotes?: number;
}

const RecipeLibrary = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [userRecipes, setUserRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [dietType, setDietType] = useState<'keto' | 'pcos'>('keto');
  const [topContributors, setTopContributors] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchDietType();
    }
    fetchRecipes();
    fetchUserRecipes();
    fetchTopContributors();
  }, [selectedCategory, dietType, user]);

  const fetchDietType = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('diet_type')
        .eq('user_id', user?.id)
        .single();

      if (data?.diet_type && (data.diet_type === 'keto' || data.diet_type === 'pcos')) {
        setDietType(data.diet_type);
      }
    } catch (error) {
      console.error('Error fetching diet type:', error);
    }
  };

  const fetchRecipes = async () => {
    try {
      let query = supabase
        .from('recipes')
        .select('*')
        .eq('diet_type', dietType)
        .order('created_at', { ascending: false });

      if (selectedCategory !== "all" && selectedCategory !== "people") {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setRecipes(data || []);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRecipes = async () => {
    try {
      let query = supabase
        .from('user_recipes')
        .select('*, profiles!user_recipes_user_id_fkey(display_name)')
        .eq('is_approved', true)
        .eq('diet_type', dietType)
        .order('upvotes', { ascending: false });

      if (selectedCategory !== "all" && selectedCategory !== "people") {
        query = query.eq('category', selectedCategory);
      }

      const { data } = await query;
      setUserRecipes(data || []);
    } catch (error) {
      console.error('Error fetching user recipes:', error);
    }
  };

  const fetchTopContributors = async () => {
    try {
      const { data } = await supabase
        .from('user_recipes')
        .select('user_id, profiles!user_recipes_user_id_fkey(display_name)')
        .eq('is_approved', true);

      if (data) {
        const contributors = data.reduce((acc: any, recipe: any) => {
          const userId = recipe.user_id;
          if (!acc[userId]) {
            acc[userId] = {
              name: recipe.profiles?.display_name || 'Anonymous',
              count: 0
            };
          }
          acc[userId].count++;
          return acc;
        }, {});

        const sorted = Object.values(contributors)
          .sort((a: any, b: any) => b.count - a.count)
          .slice(0, 5);
        
        setTopContributors(sorted);
      }
    } catch (error) {
      console.error('Error fetching top contributors:', error);
    }
  };

  const handleVote = async (recipeId: string) => {
    if (!user) {
      return;
    }

    try {
      const { data: existingVote } = await supabase
        .from('recipe_votes')
        .select('id')
        .eq('user_id', user.id)
        .eq('recipe_id', recipeId)
        .single();

      if (existingVote) {
        await supabase
          .from('recipe_votes')
          .delete()
          .eq('id', existingVote.id);
      } else {
        await supabase
          .from('recipe_votes')
          .insert({ user_id: user.id, recipe_id: recipeId });
      }

      fetchUserRecipes();
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleViewRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsDetailOpen(true);
  };

  const categories = ["all", "people", "breakfast", "lunch", "dinner", "snacks", "drinks"];
  const displayRecipes = selectedCategory === "people" ? userRecipes : recipes;

  return (
    <section id="recipes" className="py-20">
      <div className="container">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <ChefHat className="h-8 w-8 text-keto-green" />
            <h2 className="text-3xl lg:text-4xl font-bold">
              Delicious {dietType.toUpperCase()} Recipes
            </h2>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover mouth-watering recipes that keep you healthy while satisfying your cravings.
          </p>
        </div>

        {/* Diet Type Switch */}
        {user && (
          <div className="flex justify-center mb-6">
            <DietTypeSwitch />
          </div>
        )}

        {/* Top Contributors */}
        {topContributors.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Top Contributors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {topContributors.map((contributor: any, index: number) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {contributor.name} • {contributor.count} recipes
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {categories.map((category) => (
            <Button 
              key={category} 
              variant={category === selectedCategory ? "default" : "outline"}
              size="sm"
              className={category === selectedCategory ? "bg-gradient-to-r from-keto-green to-keto-green-dark capitalize" : "capitalize"}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* User Recipe Submission */}
        {user && selectedCategory === "people" && (
          <div className="max-w-md mx-auto mb-8">
            <UserRecipeSubmission />
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground">Loading recipes...</div>
          </div>
        ) : displayRecipes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {selectedCategory === "people" 
                ? "No community recipes yet. Be the first to contribute!" 
                : "No recipes found in this category."}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {displayRecipes.map((recipe: any) => (
              <Card key={recipe.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden">
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
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge 
                      variant="outline"
                      className={
                        recipe.difficulty === "easy" ? "border-green-500 text-green-500" :
                        recipe.difficulty === "medium" ? "border-yellow-500 text-yellow-500" :
                        "border-red-500 text-red-500"
                      }
                    >
                      <ChefHat className="h-3 w-3 mr-1" />
                      {recipe.difficulty}
                    </Badge>
                    <Badge variant="secondary">
                      {recipe.calories} cal
                    </Badge>
                    {selectedCategory === "people" && recipe.upvotes !== undefined && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" />
                        {recipe.upvotes}
                      </Badge>
                    )}
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
                    
                    {selectedCategory === "people" && user && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleVote(recipe.id)}
                      >
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        Upvote
                      </Button>
                    )}
                    
                    <SocialShareButtons 
                      title={recipe.title}
                      description={recipe.description}
                      url={`${window.location.origin}/recipes/${recipe.id}`}
                      image={recipe.image_url || ''}
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
