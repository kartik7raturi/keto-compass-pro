import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Clock, Flame, ChefHat, RefreshCw, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

interface Recipe {
  id: string;
  title: string;
  description: string | null;
  prep_time: number | null;
  cook_time: number | null;
  calories: number | null;
  difficulty: string | null;
  category: string | null;
  diet_type: string | null;
}

interface RecipeRecommendationsProps {
  onSelectRecipe?: (recipeId: string) => void;
}

const RecipeRecommendations = ({ onSelectRecipe }: RecipeRecommendationsProps) => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, [user]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      let dietType = 'keto';
      let favoriteCategories: string[] = [];
      let favoriteDifficulties: string[] = [];

      // Get user preferences
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('diet_type')
          .eq('user_id', user.id)
          .single();

        if (profile?.diet_type) {
          dietType = profile.diet_type;
        }

        // Get user's favorite recipes to understand preferences
        const { data: favorites } = await supabase
          .from('recipe_favorites')
          .select('recipe_id')
          .eq('user_id', user.id)
          .limit(20);

        if (favorites && favorites.length > 0) {
          const favoriteIds = favorites.map(f => f.recipe_id);
          
          const { data: favoriteRecipes } = await supabase
            .from('recipes')
            .select('category, difficulty')
            .in('id', favoriteIds);

          if (favoriteRecipes) {
            favoriteCategories = [...new Set(
              favoriteRecipes
                .map(r => r.category)
                .filter((c): c is string => c !== null)
            )];
            favoriteDifficulties = [...new Set(
              favoriteRecipes
                .map(r => r.difficulty)
                .filter((d): d is string => d !== null)
            )];
          }
        }
      }

      // Build recommendation query
      let query = supabase
        .from('recipes')
        .select('*')
        .eq('diet_type', dietType);

      // Prioritize favorite categories if available
      if (favoriteCategories.length > 0) {
        query = query.in('category', favoriteCategories);
      }

      const { data: recipes } = await query.limit(50);

      if (recipes && recipes.length > 0) {
        // Shuffle and pick 4 recommendations
        const shuffled = recipes.sort(() => Math.random() - 0.5);
        
        // Prioritize by favorite difficulties if available
        if (favoriteDifficulties.length > 0) {
          shuffled.sort((a, b) => {
            const aMatch = favoriteDifficulties.includes(a.difficulty || '');
            const bMatch = favoriteDifficulties.includes(b.difficulty || '');
            return bMatch ? 1 : aMatch ? -1 : 0;
          });
        }

        setRecommendations(shuffled.slice(0, 4));
      } else {
        // Fallback to any recipes
        const { data: fallback } = await supabase
          .from('recipes')
          .select('*')
          .limit(4);
        setRecommendations(fallback || []);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRecommendations();
    setRefreshing(false);
  };

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'hard': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Recommended for You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            Recommended for You
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {user ? 'Based on your preferences and favorites' : 'Popular keto recipes'}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {recommendations.map((recipe) => (
            <div
              key={recipe.id}
              onClick={() => onSelectRecipe?.(recipe.id)}
              className="group p-3 sm:p-4 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-all hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="font-medium text-sm sm:text-base line-clamp-2 group-hover:text-primary transition-colors">
                  {recipe.title}
                </h4>
                <Heart className="h-4 w-4 text-muted-foreground shrink-0" />
              </div>
              
              {recipe.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                  {recipe.description}
                </p>
              )}
              
              <div className="flex flex-wrap items-center gap-2">
                {recipe.prep_time && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{recipe.prep_time + (recipe.cook_time || 0)}m</span>
                  </div>
                )}
                
                {recipe.calories && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Flame className="h-3 w-3" />
                    <span>{recipe.calories} cal</span>
                  </div>
                )}
                
                {recipe.difficulty && (
                  <Badge variant="secondary" className={`text-xs ${getDifficultyColor(recipe.difficulty)}`}>
                    {recipe.difficulty}
                  </Badge>
                )}
                
                {recipe.category && (
                  <Badge variant="outline" className="text-xs">
                    {recipe.category}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecipeRecommendations;
