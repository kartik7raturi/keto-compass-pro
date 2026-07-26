import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, ChefHat, ArrowLeft } from "lucide-react";
import SocialShareButtons from "@/components/SocialShareButtons";
import { SEO } from "@/components/seo/SEO";
import { recipeSchema, breadcrumbSchema } from "@/lib/seo/schema";

interface RecipeRow {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  ingredients: string[];
  instructions: string[];
  prep_time: number | null;
  cook_time: number | null;
  servings: number | null;
  difficulty: string | null;
  category: string | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  image_url: string | null;
  created_at: string;
  updated_at?: string;
}

const RecipePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<RecipeRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) fetchRecipe(slug);
  }, [slug]);

  const fetchRecipe = async (recipeSlug: string) => {
    setLoading(true);

    const { data: curated } = await supabase
      .from("recipes")
      .select("*")
      .eq("slug", recipeSlug)
      .maybeSingle();

    if (curated) {
      setRecipe(curated as RecipeRow);
      setLoading(false);
      return;
    }

    const { data: community } = await supabase
      .from("user_recipes")
      .select("*")
      .eq("slug", recipeSlug)
      .eq("is_approved", true)
      .maybeSingle();

    if (community) {
      setRecipe(community as RecipeRow);
    } else {
      navigate("/recipes", { replace: true });
    }
    setLoading(false);
  };

  if (loading || !recipe) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 animate-pulse">
          <div className="h-8 bg-muted rounded mb-4 w-1/2" />
          <div className="h-64 bg-muted rounded mb-6" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-4 bg-muted rounded" />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={recipe.title}
        description={recipe.description || undefined}
        path={`/recipes/${recipe.slug}`}
        image={recipe.image_url || undefined}
        type="article"
        jsonLd={[
          recipeSchema(recipe),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Recipes", path: "/recipes" },
            { name: recipe.title, path: `/recipes/${recipe.slug}` },
          ]),
        ]}
      />
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Link to="/recipes" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to recipes
        </Link>

        <article className="max-w-3xl mx-auto">
          {recipe.category && (
            <Badge variant="secondary" className="capitalize mb-3">{recipe.category}</Badge>
          )}
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{recipe.title}</h1>
          {recipe.description && (
            <p className="text-lg text-muted-foreground mb-6">{recipe.description}</p>
          )}

          {recipe.image_url && (
            <img src={recipe.image_url} alt={recipe.title} className="w-full h-64 md:h-96 object-cover rounded-lg mb-8" />
          )}

          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-8 border-y py-4">
            {totalTime > 0 && (
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {totalTime} min</span>
            )}
            {recipe.servings && (
              <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {recipe.servings} servings</span>
            )}
            {recipe.difficulty && (
              <span className="flex items-center gap-1"><ChefHat className="h-4 w-4" /> {recipe.difficulty}</span>
            )}
            {recipe.calories && <span>{recipe.calories} cal</span>}
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <h2 className="text-xl font-semibold mb-3">Ingredients</h2>
              <ul className="space-y-2 text-sm">
                {recipe.ingredients?.map((ing, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>{ing}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold mb-3">Instructions</h2>
              <ol className="space-y-4 text-sm">
                {recipe.instructions?.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                      {i + 1}
                    </span>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t">
            <SocialShareButtons
              title={recipe.title}
              description={recipe.description || ""}
              url={`${window.location.origin}/recipes/${recipe.slug}`}
              image={recipe.image_url || ""}
            />
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default RecipePage;
