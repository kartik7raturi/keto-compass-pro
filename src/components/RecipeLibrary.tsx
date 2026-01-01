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
import { useToast } from "@/hooks/use-toast";
import RecipeRecommendations from "./RecipeRecommendations";

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
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [userRecipes, setUserRecipes] = useState<any[]>([]);
  const [weeklyTopRecipes, setWeeklyTopRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [dietType, setDietType] = useState<'keto' | 'pcos'>('keto');
  const [topContributors, setTopContributors] = useState<any[]>([]);
  useEffect(() => {
    if (user) {
      fetchDietType();
    }
  }, [user]);

  useEffect(() => {
    // Clear recipes before fetching to avoid showing wrong diet type
    setRecipes([]);
    setUserRecipes([]);
    setLoading(true);
    
    fetchRecipes();
    fetchUserRecipes();
    fetchTopContributors();
  }, [selectedCategory, dietType]);

  useEffect(() => {
    // Listen for diet type changes
    const handleDietChange = (event: any) => {
      setDietType(event.detail);
    };
    window.addEventListener('dietTypeChanged', handleDietChange);
    return () => window.removeEventListener('dietTypeChanged', handleDietChange);
  }, []);

  useEffect(() => {
    // Refresh community recipes after a new submission
    const handleSubmitted = () => {
      fetchUserRecipes();
      fetchTopContributors();
    };
    window.addEventListener('userRecipeSubmitted', handleSubmitted);
    return () => window.removeEventListener('userRecipeSubmitted', handleSubmitted);
  }, [dietType, selectedCategory]);

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

      if (selectedCategory !== "all" && selectedCategory !== "people recipes") {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      // Also fetch approved user recipes for this category
      let userRecipeQuery = supabase
        .from('user_recipes')
        .select('*')
        .eq('diet_type', dietType)
        .eq('is_approved', true);
      
      if (selectedCategory !== "all" && selectedCategory !== "people recipes") {
        userRecipeQuery = userRecipeQuery.eq('category', selectedCategory);
      }
      
      const { data: approvedUserRecipes } = await userRecipeQuery;
      
      // Combine recipes and approved user recipes
      const allRecipes = [...(data || []), ...(approvedUserRecipes || [])];
      setRecipes(allRecipes);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRecipes = async () => {
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const applyBaseFilters = (q: any) => {
        q = q.eq('diet_type', dietType);
        if (selectedCategory !== "all" && selectedCategory !== "people recipes") {
          q = q.eq('category', selectedCategory);
        }
        return q;
      };

      // Weekly top (last 7 days, highest upvotes)
      let weeklyQuery = applyBaseFilters(
        supabase
          .from('user_recipes')
          .select('*')
          .gte('created_at', oneWeekAgo.toISOString())
          .order('upvotes', { ascending: false })
      );

      // All submitted (no time filter), newest first
      let allQuery = applyBaseFilters(
        supabase
          .from('user_recipes')
          .select('*')
          .order('created_at', { ascending: false })
      );

      const [weeklyRes, allRes] = await Promise.all([weeklyQuery, allQuery]);

      const weekly = weeklyRes.data || [];
      const all = allRes.data || [];

      // Fetch profiles for both sets in one call
      const userIds = Array.from(new Set([...weekly, ...all].map((r: any) => r.user_id)));
      let profilesMap: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, display_name, avatar_url')
          .in('user_id', userIds);
        profilesMap = (profiles || []).reduce((acc: any, p: any) => {
          acc[p.user_id] = p;
          return acc;
        }, {} as Record<string, any>);
      }

      const weeklyWithProfiles = weekly.map((recipe: any) => ({
        ...recipe,
        profiles: profilesMap[recipe.user_id] || null,
      }));
      const allWithProfiles = all.map((recipe: any) => ({
        ...recipe,
        profiles: profilesMap[recipe.user_id] || null,
      }));

      setWeeklyTopRecipes(weeklyWithProfiles);
      setUserRecipes(allWithProfiles);
    } catch (error) {
      console.error('Error fetching user recipes:', error);
    }
  };

  const fetchTopContributors = async () => {
    try {
      const { data: recipes } = await supabase
        .from('user_recipes')
        .select('user_id')
        .eq('diet_type', dietType);
      
      if (recipes && recipes.length > 0) {
        const userIds = [...new Set(recipes.map(r => r.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, display_name, avatar_url')
          .in('user_id', userIds);
        
        const contributors = recipes.reduce((acc: any, recipe: any) => {
          const userId = recipe.user_id;
          const profile = profiles?.find(p => p.user_id === userId);
          
          if (!acc[userId]) {
            acc[userId] = {
              name: profile?.display_name || 'Anonymous',
              avatar: profile?.avatar_url || null,
              count: 0
            };
          }
          acc[userId].count++;
          return acc;
        }, {});

        const sorted = Object.values(contributors)
          .sort((a: any, b: any) => b.count - a.count)
          .slice(0, 3);
        
        setTopContributors(sorted);
      }
    } catch (error) {
      console.error('Error fetching top contributors:', error);
    }
  };

  const handleVote = async (recipeId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to upvote recipes"
      });
      return;
    }

    try {
      const { data: existingVote } = await supabase
        .from('recipe_votes')
        .select('id')
        .eq('user_id', user.id)
        .eq('recipe_id', recipeId)
        .maybeSingle();

      if (existingVote) {
        // Remove vote
        await supabase
          .from('recipe_votes')
          .delete()
          .eq('id', existingVote.id);
        
        // Decrement upvotes count
        await (supabase.rpc as any)('decrement_recipe_upvotes', { recipe_id: recipeId });
      } else {
        // Add vote
        await supabase
          .from('recipe_votes')
          .insert({ user_id: user.id, recipe_id: recipeId });
        
        // Increment upvotes count
        await (supabase.rpc as any)('increment_recipe_upvotes', { recipe_id: recipeId });
      }

      fetchUserRecipes();
      fetchTopContributors();
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: "Error",
        description: "Failed to update vote"
      });
    }
  };

  const handleViewRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsDetailOpen(true);
  };

  const categories = ["all", "people recipes", "breakfast", "lunch", "dinner", "snacks", "drinks"];
  const displayRecipes = selectedCategory === "people recipes" ? userRecipes : recipes;

  return (
    <section id="recipes" className="py-20">
      <div className="container">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <ChefHat className={`h-8 w-8 ${dietType === 'pcos' ? 'text-[hsl(var(--pcos-pink))]' : 'text-keto-green'}`} />
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

        {/* Recipe Recommendations */}
        <div className="mb-8">
          <RecipeRecommendations onSelectRecipe={(recipeId) => {
            const recipe = recipes.find(r => r.id === recipeId);
            if (recipe) handleViewRecipe(recipe);
          }} />
        </div>

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
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                    {contributor.avatar && (
                      <img 
                        src={contributor.avatar} 
                        alt={contributor.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    )}
                    <Badge variant="secondary" className="text-sm">
                      {contributor.name} • {contributor.count} recipes
                    </Badge>
                  </div>
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
              className={category === selectedCategory ? 
                (dietType === 'pcos' ? "bg-[hsl(var(--pcos-pink))] hover:bg-[hsl(var(--pcos-pink-dark))] capitalize" : "bg-gradient-to-r from-keto-green to-keto-green-dark capitalize") 
                : "capitalize"}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* User Recipe Submission */}
        {user && selectedCategory === "people recipes" && (
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
              {selectedCategory === "people recipes" 
                ? "No community recipes yet. Be the first to contribute!" 
                : "No recipes found in this category."}
            </p>
          </div>
        ) : selectedCategory === "people recipes" ? (
          <>
            {/* Weekly Top 10 Section */}
            {weeklyTopRecipes.slice(0, 10).length > 0 && (
              <div className="mb-12">
                <h3 className={`text-2xl font-bold mb-6 text-center ${
                  dietType === 'pcos' ? 'text-[hsl(var(--pcos-pink))]' : 'text-keto-green'
                }`}>
                  Weekly Top 10 Recipes with Highest Upvotes
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {weeklyTopRecipes.slice(0, 10).map((recipe: any) => (
                    <Card key={recipe.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden">
                      <CardHeader className="pb-4">
                        <CardTitle className={`text-lg transition-colors ${
                          dietType === 'pcos' 
                            ? 'group-hover:text-[hsl(var(--pcos-pink))]' 
                            : 'group-hover:text-keto-green'
                        }`}>
                          {recipe.title}
                        </CardTitle>
                        
                        <div className="flex items-center gap-2 mt-2">
                          {recipe.profiles?.avatar_url && (
                            <img 
                              src={recipe.profiles.avatar_url} 
                              alt={recipe.profiles?.display_name || 'User'}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          )}
                          <span className="text-sm text-muted-foreground">
                            by {recipe.profiles?.display_name || 'Anonymous'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
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
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" />
                            {recipe.upvotes}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {recipe.description}
                        </p>

                        <div className="space-y-3">
                          <Button 
                            className={`w-full hover:opacity-90 ${
                              dietType === 'pcos' 
                                ? 'bg-[hsl(var(--pcos-pink))] hover:bg-[hsl(var(--pcos-pink-dark))]' 
                                : 'bg-gradient-to-r from-keto-green to-keto-green-dark'
                            }`}
                            onClick={() => handleViewRecipe(recipe)}
                          >
                            View Recipe
                          </Button>
                          
                          <Button
                            variant="outline"
                            className={`w-full ${
                              dietType === 'pcos' 
                                ? 'hover:bg-[hsl(var(--pcos-pink-light))] hover:text-[hsl(var(--pcos-pink-dark))] hover:border-[hsl(var(--pcos-pink))]' 
                                : 'hover:bg-green-50'
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVote(recipe.id);
                            }}
                          >
                            <ThumbsUp className="h-4 w-4 mr-2" />
                            Upvote
                          </Button>
                          
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
              </div>
            )}

            {/* All Submitted Recipes Section */}
            <div className="mb-12">
              <h3 className={`text-2xl font-bold mb-6 text-center ${
                dietType === 'pcos' ? 'text-[hsl(var(--pcos-pink))]' : 'text-keto-green'
              }`}>
                All Submitted Recipes
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userRecipes.map((recipe: any) => (
                  <Card key={recipe.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden">
                    <CardHeader className="pb-4">
                      <CardTitle className={`text-lg transition-colors ${
                        dietType === 'pcos' 
                          ? 'group-hover:text-[hsl(var(--pcos-pink))]' 
                          : 'group-hover:text-keto-green'
                      }`}>
                        {recipe.title}
                      </CardTitle>
                      
                      <div className="flex items-center gap-2 mt-2">
                        {recipe.profiles?.avatar_url && (
                          <img 
                            src={recipe.profiles.avatar_url} 
                            alt={recipe.profiles?.display_name || 'User'}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        )}
                        <span className="text-sm text-muted-foreground">
                          by {recipe.profiles?.display_name || 'Anonymous'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
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
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          {recipe.upvotes}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {recipe.description}
                      </p>

                      <div className="space-y-3">
                        <Button 
                          className={`w-full hover:opacity-90 ${
                            dietType === 'pcos' 
                              ? 'bg-[hsl(var(--pcos-pink))] hover:bg-[hsl(var(--pcos-pink-dark))]' 
                              : 'bg-gradient-to-r from-keto-green to-keto-green-dark'
                          }`}
                          onClick={() => handleViewRecipe(recipe)}
                        >
                          View Recipe
                        </Button>
                        
                        <Button
                          variant="outline"
                          className={`w-full ${
                            dietType === 'pcos' 
                              ? 'hover:bg-[hsl(var(--pcos-pink-light))] hover:text-[hsl(var(--pcos-pink-dark))] hover:border-[hsl(var(--pcos-pink))]' 
                              : 'hover:bg-green-50'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVote(recipe.id);
                          }}
                        >
                          <ThumbsUp className="h-4 w-4 mr-2" />
                          Upvote
                        </Button>
                        
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
            </div>
          </>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {displayRecipes.map((recipe: any) => (
              <Card key={recipe.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className={`text-lg transition-colors ${
                    dietType === 'pcos' 
                      ? 'group-hover:text-[hsl(var(--pcos-pink))]' 
                      : 'group-hover:text-keto-green'
                  }`}>
                    {recipe.title}
                  </CardTitle>
                  
                  {/* Show user info for community recipes */}
                  {selectedCategory === "people recipes" && (
                    <div className="flex items-center gap-2 mt-2">
                      {recipe.profiles?.avatar_url && (
                        <img 
                          src={recipe.profiles.avatar_url} 
                          alt={recipe.profiles?.display_name || 'User'}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      )}
                      <span className="text-sm text-muted-foreground">
                        by {recipe.profiles?.display_name || 'Anonymous'}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
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
                    {selectedCategory === "people recipes" && recipe.upvotes !== undefined && (
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
                      className={`w-full hover:opacity-90 ${
                        dietType === 'pcos' 
                          ? 'bg-[hsl(var(--pcos-pink))] hover:bg-[hsl(var(--pcos-pink-dark))]' 
                          : 'bg-gradient-to-r from-keto-green to-keto-green-dark'
                      }`}
                      onClick={() => handleViewRecipe(recipe)}
                    >
                      View Recipe
                    </Button>
                    
                    {selectedCategory === "people recipes" && (
                      <Button
                        variant="outline"
                        className={`w-full ${
                          dietType === 'pcos' 
                            ? 'hover:bg-[hsl(var(--pcos-pink-light))] hover:text-[hsl(var(--pcos-pink-dark))] hover:border-[hsl(var(--pcos-pink))]' 
                            : 'hover:bg-green-50'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVote(recipe.id);
                        }}
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
              className={dietType === 'pcos' 
                ? "bg-[hsl(var(--pcos-pink))] hover:bg-[hsl(var(--pcos-pink-dark))]" 
                : "bg-gradient-to-r from-keto-green to-keto-green-dark"}
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
