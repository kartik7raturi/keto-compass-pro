import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface Recipe {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  diet_type: string;
  is_approved: boolean;
  upvotes: number;
  ingredients: string[];
  instructions: string[];
  prep_time: number;
  cook_time: number;
  servings: number;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  created_at: string;
  profiles?: {
    display_name: string;
    email: string;
  };
}

export const AdminRecipes = () => {
  const { toast } = useToast();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const { data: recipesData, error } = await supabase
        .from('user_recipes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (recipesData && recipesData.length > 0) {
        const userIds = [...new Set(recipesData.map((r: any) => r.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, display_name, email')
          .in('user_id', userIds);

        const recipesWithProfiles = recipesData.map((recipe: any) => ({
          ...recipe,
          profiles: profiles?.find((p: any) => p.user_id === recipe.user_id) || null
        }));

        setRecipes(recipesWithProfiles);
      } else {
        setRecipes([]);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch recipes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingRecipe) return;

    try {
      const { error } = await supabase
        .from('user_recipes')
        .update({
          title: editingRecipe.title,
          description: editingRecipe.description,
          category: editingRecipe.category,
          difficulty: editingRecipe.difficulty,
          ingredients: editingRecipe.ingredients,
          instructions: editingRecipe.instructions,
          prep_time: editingRecipe.prep_time,
          cook_time: editingRecipe.cook_time,
          servings: editingRecipe.servings,
          calories: editingRecipe.calories,
          carbs: editingRecipe.carbs,
          protein: editingRecipe.protein,
          fat: editingRecipe.fat,
          is_approved: editingRecipe.is_approved
        })
        .eq('id', editingRecipe.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Recipe updated successfully"
      });

      setIsDialogOpen(false);
      fetchRecipes();
    } catch (error) {
      console.error('Error updating recipe:', error);
      toast({
        title: "Error",
        description: "Failed to update recipe",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recipe?')) return;

    try {
      const { error } = await supabase
        .from('user_recipes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Recipe deleted successfully"
      });

      fetchRecipes();
    } catch (error) {
      console.error('Error deleting recipe:', error);
      toast({
        title: "Error",
        description: "Failed to delete recipe",
        variant: "destructive"
      });
    }
  };

  const handleToggleApproval = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('user_recipes')
        .update({ is_approved: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Recipe ${!currentStatus ? 'approved' : 'unapproved'} successfully`
      });

      fetchRecipes();
    } catch (error) {
      console.error('Error toggling approval:', error);
      toast({
        title: "Error",
        description: "Failed to update recipe status",
        variant: "destructive"
      });
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
    <>
      <div className="grid gap-6">
        {recipes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No submitted recipes found.
            </CardContent>
          </Card>
        ) : (
          recipes.map((recipe) => (
            <Card key={recipe.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{recipe.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      by {recipe.profiles?.display_name || 'Unknown'} ({recipe.profiles?.email})
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={recipe.is_approved ? "default" : "secondary"}>
                      {recipe.is_approved ? "Approved" : "Pending"}
                    </Badge>
                    <Badge variant="outline">{recipe.diet_type}</Badge>
                    <Badge variant="outline">{recipe.category}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{recipe.description}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <span>Upvotes: {recipe.upvotes}</span>
                  <span>•</span>
                  <span>Difficulty: {recipe.difficulty}</span>
                  <span>•</span>
                  <span>Time: {recipe.prep_time + recipe.cook_time} min</span>
                  <span>•</span>
                  <span>Servings: {recipe.servings}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(recipe)}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleApproval(recipe.id, recipe.is_approved)}
                  >
                    {recipe.is_approved ? (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Unapprove
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </>
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(recipe.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Recipe</DialogTitle>
          </DialogHeader>
          {editingRecipe && (
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={editingRecipe.title}
                  onChange={(e) => setEditingRecipe({ ...editingRecipe, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={editingRecipe.description}
                  onChange={(e) => setEditingRecipe({ ...editingRecipe, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select
                    value={editingRecipe.category}
                    onValueChange={(value) => setEditingRecipe({ ...editingRecipe, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breakfast">Breakfast</SelectItem>
                      <SelectItem value="lunch">Lunch</SelectItem>
                      <SelectItem value="dinner">Dinner</SelectItem>
                      <SelectItem value="snacks">Snacks</SelectItem>
                      <SelectItem value="drinks">Drinks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Difficulty</Label>
                  <Select
                    value={editingRecipe.difficulty}
                    onValueChange={(value) => setEditingRecipe({ ...editingRecipe, difficulty: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label>Prep Time (min)</Label>
                  <Input
                    type="number"
                    value={editingRecipe.prep_time}
                    onChange={(e) => setEditingRecipe({ ...editingRecipe, prep_time: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Cook Time (min)</Label>
                  <Input
                    type="number"
                    value={editingRecipe.cook_time}
                    onChange={(e) => setEditingRecipe({ ...editingRecipe, cook_time: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Servings</Label>
                  <Input
                    type="number"
                    value={editingRecipe.servings}
                    onChange={(e) => setEditingRecipe({ ...editingRecipe, servings: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Calories</Label>
                  <Input
                    type="number"
                    value={editingRecipe.calories}
                    onChange={(e) => setEditingRecipe({ ...editingRecipe, calories: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Carbs (g)</Label>
                  <Input
                    type="number"
                    value={editingRecipe.carbs}
                    onChange={(e) => setEditingRecipe({ ...editingRecipe, carbs: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Protein (g)</Label>
                  <Input
                    type="number"
                    value={editingRecipe.protein}
                    onChange={(e) => setEditingRecipe({ ...editingRecipe, protein: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Fat (g)</Label>
                  <Input
                    type="number"
                    value={editingRecipe.fat}
                    onChange={(e) => setEditingRecipe({ ...editingRecipe, fat: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <Label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingRecipe.is_approved}
                    onChange={(e) => setEditingRecipe({ ...editingRecipe, is_approved: e.target.checked })}
                    className="rounded"
                  />
                  Approved
                </Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
