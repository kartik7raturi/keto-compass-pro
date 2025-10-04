import { useState } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export const UserRecipeSubmission = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("breakfast");
  const [dietType, setDietType] = useState("keto");
  const [difficulty, setDifficulty] = useState("easy");
  const [prepTime, setPrepTime] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [servings, setServings] = useState("");
  const [calories, setCalories] = useState("");
  const [carbs, setCarbs] = useState("");
  const [protein, setProtein] = useState("");
  const [fat, setFat] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([""]);
  const [instructions, setInstructions] = useState<string[]>([""]);

  const addIngredient = () => setIngredients([...ingredients, ""]);
  const removeIngredient = (index: number) => 
    setIngredients(ingredients.filter((_, i) => i !== index));
  const updateIngredient = (index: number, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const addInstruction = () => setInstructions([...instructions, ""]);
  const removeInstruction = (index: number) =>
    setInstructions(instructions.filter((_, i) => i !== index));
  const updateInstruction = (index: number, value: string) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("breakfast");
    setDietType("keto");
    setDifficulty("easy");
    setPrepTime("");
    setCookTime("");
    setServings("");
    setCalories("");
    setCarbs("");
    setProtein("");
    setFat("");
    setIngredients([""]);
    setInstructions([""]);
  };

  const handleSubmit = async () => {
    if (!title || ingredients.filter(i => i).length === 0 || instructions.filter(i => i).length === 0) {
      toast({ variant: "destructive", title: "Please fill all required fields" });
      return;
    }

    try {
      await supabase.from('user_recipes').insert({
        user_id: user?.id,
        title,
        description,
        category,
        diet_type: dietType,
        difficulty,
        prep_time: prepTime ? parseInt(prepTime) : null,
        cook_time: cookTime ? parseInt(cookTime) : null,
        servings: servings ? parseInt(servings) : 1,
        calories: calories ? parseInt(calories) : null,
        carbs: carbs ? parseFloat(carbs) : null,
        protein: protein ? parseFloat(protein) : null,
        fat: fat ? parseFloat(fat) : null,
        ingredients: ingredients.filter(i => i),
        instructions: instructions.filter(i => i)
      });

      toast({ 
        title: "Recipe submitted!",
        description: "Your recipe will be visible after getting 10+ upvotes"
      });
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({ variant: "destructive", title: "Error submitting recipe" });
    }
  };

  if (!user) return null;

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Submit Your Recipe
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit Your Recipe</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Recipe Title *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <Label>Diet Type</Label>
              <Select value={dietType} onValueChange={setDietType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="keto">Keto</SelectItem>
                  <SelectItem value="pcos">PCOS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
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
              <Select value={difficulty} onValueChange={setDifficulty}>
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
            <div>
              <Label>Servings</Label>
              <Input type="number" value={servings} onChange={(e) => setServings(e.target.value)} />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Prep Time (minutes)</Label>
              <Input type="number" value={prepTime} onChange={(e) => setPrepTime(e.target.value)} />
            </div>
            <div>
              <Label>Cook Time (minutes)</Label>
              <Input type="number" value={cookTime} onChange={(e) => setCookTime(e.target.value)} />
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <Label>Calories</Label>
              <Input type="number" value={calories} onChange={(e) => setCalories(e.target.value)} />
            </div>
            <div>
              <Label>Carbs (g)</Label>
              <Input type="number" value={carbs} onChange={(e) => setCarbs(e.target.value)} />
            </div>
            <div>
              <Label>Protein (g)</Label>
              <Input type="number" value={protein} onChange={(e) => setProtein(e.target.value)} />
            </div>
            <div>
              <Label>Fat (g)</Label>
              <Input type="number" value={fat} onChange={(e) => setFat(e.target.value)} />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Ingredients *</Label>
              <Button type="button" size="sm" variant="outline" onClick={addIngredient}>
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            {ingredients.map((ingredient, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <Input
                  value={ingredient}
                  onChange={(e) => updateIngredient(index, e.target.value)}
                  placeholder="e.g., 2 cups almond flour"
                />
                {ingredients.length > 1 && (
                  <Button type="button" size="icon" variant="ghost" onClick={() => removeIngredient(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Instructions *</Label>
              <Button type="button" size="sm" variant="outline" onClick={addInstruction}>
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            {instructions.map((instruction, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <Textarea
                  value={instruction}
                  onChange={(e) => updateInstruction(index, e.target.value)}
                  placeholder={`Step ${index + 1}`}
                  rows={2}
                />
                {instructions.length > 1 && (
                  <Button type="button" size="icon" variant="ghost" onClick={() => removeInstruction(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button onClick={handleSubmit} className="w-full">
            Submit Recipe
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
