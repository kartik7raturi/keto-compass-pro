import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Image, Video, Loader2 } from "lucide-react";
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Sync diet type with profile and page switch
  useEffect(() => {
    const loadDiet = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('diet_type')
        .eq('user_id', user.id)
        .single();
      if (data?.diet_type) setDietType(data.diet_type);
    };
    loadDiet();
  }, [user]);

  useEffect(() => {
    const handleDietChange = (event: any) => {
      if (event.detail === 'keto' || event.detail === 'pcos') {
        setDietType(event.detail);
      }
    };
    window.addEventListener('dietTypeChanged', handleDietChange);
    return () => window.removeEventListener('dietTypeChanged', handleDietChange);
  }, []);

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({ variant: "destructive", title: "Image must be under 10MB" });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast({ variant: "destructive", title: "Video must be under 50MB" });
        return;
      }
      const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
      if (!validTypes.includes(file.type)) {
        toast({ variant: "destructive", title: "Please upload MP4, WebM, MOV, or AVI video" });
        return;
      }
      setVideoFile(file);
    }
  };

  const uploadFile = async (file: File, type: 'image' | 'video'): Promise<string | null> => {
    if (!user) return null;
    const ext = file.name.split('.').pop();
    const path = `${user.id}/${Date.now()}-${type}.${ext}`;
    const { error } = await supabase.storage.from('recipe-media').upload(path, file);
    if (error) {
      console.error('Upload error:', error);
      return null;
    }
    const { data } = supabase.storage.from('recipe-media').getPublicUrl(path);
    return data.publicUrl;
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
    setImageFile(null);
    setVideoFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    if (!title || ingredients.filter(i => i).length === 0 || instructions.filter(i => i).length === 0) {
      toast({ variant: "destructive", title: "Please fill all required fields" });
      return;
    }

    setUploading(true);
    try {
      let imageUrl: string | null = null;
      let videoUrl: string | null = null;

      if (imageFile) {
        imageUrl = await uploadFile(imageFile, 'image');
        if (!imageUrl) {
          toast({ variant: "destructive", title: "Failed to upload image" });
          setUploading(false);
          return;
        }
      }

      if (videoFile) {
        videoUrl = await uploadFile(videoFile, 'video');
        if (!videoUrl) {
          toast({ variant: "destructive", title: "Failed to upload video" });
          setUploading(false);
          return;
        }
      }

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
        instructions: instructions.filter(i => i),
        image_url: imageUrl,
        video_url: videoUrl
      });

      toast({ 
        title: "Recipe submitted!",
        description: "Your recipe has been added to People."
      });
      // Notify page to refresh community list
      window.dispatchEvent(new CustomEvent('userRecipeSubmitted'));
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({ variant: "destructive", title: "Error submitting recipe" });
    } finally {
      setUploading(false);
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

          {/* Image Upload */}
          <div>
            <Label className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Recipe Image
            </Label>
            <div className="mt-2">
              {imagePreview ? (
                <div className="relative w-full h-40 rounded-lg overflow-hidden border">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 h-7 w-7"
                    onClick={() => { setImageFile(null); setImagePreview(null); }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <Image className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">Click to upload image (max 10MB)</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              )}
            </div>
          </div>

          {/* Video Upload */}
          <div>
            <Label className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Recipe Video (Optional)
            </Label>
            <div className="mt-2">
              {videoFile ? (
                <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Video className="h-5 w-5 text-primary" />
                    <span className="text-sm truncate max-w-[200px]">{videoFile.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({(videoFile.size / (1024 * 1024)).toFixed(1)}MB)
                    </span>
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => setVideoFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <Video className="h-6 w-6 text-muted-foreground mb-1" />
                  <span className="text-sm text-muted-foreground">Click to upload video (max 50MB)</span>
                  <span className="text-xs text-muted-foreground">MP4, WebM, MOV, AVI</span>
                  <input type="file" accept="video/mp4,video/webm,video/quicktime,video/x-msvideo" className="hidden" onChange={handleVideoChange} />
                </label>
              )}
            </div>
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

          <Button onClick={handleSubmit} className="w-full" disabled={uploading}>
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              "Submit Recipe"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
