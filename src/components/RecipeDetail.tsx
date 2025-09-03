import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Users, ChefHat, Heart, HeartOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import SocialShareButtons from '@/components/SocialShareButtons';

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

interface RecipeDetailProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
}

const RecipeDetail = ({ recipe, isOpen, onClose }: RecipeDetailProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (recipe && user) {
      checkFavoriteStatus();
    }
  }, [recipe, user]);

  const checkFavoriteStatus = async () => {
    if (!recipe || !user) return;

    const { data } = await supabase
      .from('recipe_favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('recipe_id', recipe.id)
      .single();

    setIsFavorite(!!data);
  };

  const toggleFavorite = async () => {
    if (!recipe || !user) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to save favorites.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (isFavorite) {
        await supabase
          .from('recipe_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('recipe_id', recipe.id);
        
        setIsFavorite(false);
        toast({
          title: "Removed from favorites",
          description: "Recipe removed from your favorites.",
        });
      } else {
        await supabase
          .from('recipe_favorites')
          .insert({
            user_id: user.id,
            recipe_id: recipe.id,
          });
        
        setIsFavorite(true);
        toast({
          title: "Added to favorites",
          description: "Recipe saved to your favorites.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!recipe) return null;

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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">{recipe.title}</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFavorite}
              disabled={loading}
              className="text-red-500 hover:text-red-600"
            >
              {isFavorite ? <Heart className="h-5 w-5 fill-current" /> : <HeartOff className="h-5 w-5" />}
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Recipe Image */}
          <div className="relative rounded-lg overflow-hidden">
            <img 
              src={getRecipeImage(recipe)}
              alt={recipe.title}
              className="w-full h-64 object-cover"
            />
          </div>

          <p className="text-muted-foreground">{recipe.description}</p>

          <div className="flex flex-wrap gap-4 justify-between items-center">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm">{recipe.prep_time + recipe.cook_time} min total</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="text-sm">{recipe.servings} servings</span>
              </div>
              <div className="flex items-center gap-2">
                <ChefHat className="h-4 w-4" />
                <Badge className={getDifficultyColor(recipe.difficulty)}>
                  {recipe.difficulty}
                </Badge>
              </div>
            </div>
            
            {/* Social Share Buttons */}
            <SocialShareButtons 
              title={recipe.title}
              description={recipe.description}
              url={`${window.location.origin}/recipes/${recipe.id}`}
              image={getRecipeImage(recipe)}
            />
          </div>

          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Nutrition per serving</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="font-bold text-lg text-keto-green">{recipe.calories}</div>
                  <div className="text-sm text-muted-foreground">Calories</div>
                </div>
                <div>
                  <div className="font-bold text-lg text-keto-green">{recipe.carbs}g</div>
                  <div className="text-sm text-muted-foreground">Carbs</div>
                </div>
                <div>
                  <div className="font-bold text-lg text-keto-green">{recipe.protein}g</div>
                  <div className="text-sm text-muted-foreground">Protein</div>
                </div>
                <div>
                  <div className="font-bold text-lg text-keto-green">{recipe.fat}g</div>
                  <div className="text-sm text-muted-foreground">Fat</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Ingredients</h3>
                <ul className="space-y-2">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-keto-green mt-1">•</span>
                      <span>{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Instructions</h3>
                <ol className="space-y-3">
                  {recipe.instructions.map((step, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-keto-green text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecipeDetail;