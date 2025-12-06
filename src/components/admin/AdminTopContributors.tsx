import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trophy, ChefHat } from "lucide-react";

interface Contributor {
  user_id: string;
  display_name: string;
  email: string;
  avatar_url: string;
  recipe_count: number;
  total_upvotes: number;
}

export const AdminTopContributors = () => {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopContributors();
  }, []);

  const fetchTopContributors = async () => {
    try {
      setLoading(true);
      
      // Get all user recipes with user info
      const { data: recipes, error } = await supabase
        .from('user_recipes')
        .select('user_id, upvotes');

      if (error) throw error;

      // Group by user
      const userStats: Record<string, { recipe_count: number; total_upvotes: number }> = {};
      recipes?.forEach((recipe) => {
        if (!userStats[recipe.user_id]) {
          userStats[recipe.user_id] = { recipe_count: 0, total_upvotes: 0 };
        }
        userStats[recipe.user_id].recipe_count++;
        userStats[recipe.user_id].total_upvotes += recipe.upvotes || 0;
      });

      // Get user profiles
      const userIds = Object.keys(userStats);
      if (userIds.length === 0) {
        setContributors([]);
        return;
      }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, email, avatar_url')
        .in('user_id', userIds);

      // Combine data
      const contributorList: Contributor[] = userIds.map((userId) => {
        const profile = profiles?.find((p) => p.user_id === userId);
        return {
          user_id: userId,
          display_name: profile?.display_name || 'Unknown',
          email: profile?.email || '',
          avatar_url: profile?.avatar_url || '',
          recipe_count: userStats[userId].recipe_count,
          total_upvotes: userStats[userId].total_upvotes
        };
      });

      // Sort by recipe count, then by upvotes
      contributorList.sort((a, b) => {
        if (b.recipe_count !== a.recipe_count) return b.recipe_count - a.recipe_count;
        return b.total_upvotes - a.total_upvotes;
      });

      setContributors(contributorList.slice(0, 20));
    } catch (error) {
      console.error('Error fetching contributors:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <ChefHat className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Top Recipe Contributors</h3>
      </div>

      {contributors.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No contributors found yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {contributors.map((contributor, index) => (
            <Card key={contributor.user_id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-bold">
                    {index < 3 ? (
                      <Trophy className={`h-4 w-4 ${
                        index === 0 ? 'text-yellow-500' : 
                        index === 1 ? 'text-gray-400' : 'text-amber-600'
                      }`} />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={contributor.avatar_url} />
                    <AvatarFallback>
                      {contributor.display_name?.charAt(0)?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{contributor.display_name}</div>
                    <div className="text-sm text-muted-foreground truncate">{contributor.email}</div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary">
                      {contributor.recipe_count} recipes
                    </Badge>
                    <Badge variant="outline">
                      {contributor.total_upvotes} upvotes
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
