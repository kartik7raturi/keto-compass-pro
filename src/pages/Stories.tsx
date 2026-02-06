import { useState, useEffect } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Upload, ImageIcon, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface SuccessStory {
  id: string;
  user_id: string;
  title: string;
  story: string;
  weight_lost: number | null;
  duration_months: number | null;
  before_image_url: string | null;
  after_image_url: string | null;
  is_approved: boolean;
  is_featured: boolean;
  created_at: string;
}

const Stories = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [weightLost, setWeightLost] = useState('');
  const [durationMonths, setDurationMonths] = useState('');
  const [beforeImage, setBeforeImage] = useState<File | null>(null);
  const [afterImage, setAfterImage] = useState<File | null>(null);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const { data } = await supabase
        .from('success_stories')
        .select('*')
        .eq('is_approved', true)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });
      
      setStories(data || []);
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file: File, folder: string): Promise<string | null> => {
    if (!user) return null;
    const ext = file.name.split('.').pop();
    const path = `${folder}/${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('community-media').upload(path, file);
    if (error) {
      console.error('Upload error:', error);
      return null;
    }
    const { data } = supabase.storage.from('community-media').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({ title: 'Please sign in to share your story', variant: 'destructive' });
      return;
    }
    if (!title.trim() || !story.trim()) {
      toast({ title: 'Please fill in the title and story', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      let beforeUrl = null;
      let afterUrl = null;

      if (beforeImage) {
        beforeUrl = await uploadImage(beforeImage, 'before');
      }
      if (afterImage) {
        afterUrl = await uploadImage(afterImage, 'after');
      }

      const { error } = await supabase
        .from('success_stories')
        .insert({
          user_id: user.id,
          title: title.trim(),
          story: story.trim(),
          weight_lost: weightLost ? parseFloat(weightLost) : null,
          duration_months: durationMonths ? parseInt(durationMonths) : null,
          before_image_url: beforeUrl,
          after_image_url: afterUrl,
          is_approved: false,
          is_featured: false
        });

      if (error) throw error;

      toast({ 
        title: 'Story submitted!', 
        description: 'Your story will be reviewed and published soon.' 
      });
      
      // Reset form
      setTitle('');
      setStory('');
      setWeightLost('');
      setDurationMonths('');
      setBeforeImage(null);
      setAfterImage(null);
      setDialogOpen(false);
    } catch (error) {
      console.error('Error submitting story:', error);
      toast({ title: 'Error submitting story', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (title: string) => {
    return title.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Success Stories</h1>
          <p className="text-xl text-muted-foreground">Real transformations from our keto community</p>
        </div>

        {/* Share Your Story Button */}
        <div className="flex justify-center mb-8">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Share Your Story
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Share Your Success Story</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="My Keto Journey"
                  />
                </div>
                <div>
                  <Label htmlFor="story">Your Story</Label>
                  <Textarea
                    id="story"
                    value={story}
                    onChange={(e) => setStory(e.target.value)}
                    placeholder="Share your transformation journey..."
                    rows={5}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="weightLost">Weight Lost (lbs)</Label>
                    <Input
                      id="weightLost"
                      type="number"
                      value={weightLost}
                      onChange={(e) => setWeightLost(e.target.value)}
                      placeholder="45"
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration (months)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={durationMonths}
                      onChange={(e) => setDurationMonths(e.target.value)}
                      placeholder="6"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Before Photo</Label>
                    <div className="mt-1">
                      <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                        {beforeImage ? (
                          <span className="text-sm text-primary truncate px-2">{beforeImage.name}</span>
                        ) : (
                          <>
                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Upload</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => setBeforeImage(e.target.files?.[0] || null)}
                        />
                      </label>
                    </div>
                  </div>
                  <div>
                    <Label>After Photo</Label>
                    <div className="mt-1">
                      <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                        {afterImage ? (
                          <span className="text-sm text-primary truncate px-2">{afterImage.name}</span>
                        ) : (
                          <>
                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Upload</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => setAfterImage(e.target.files?.[0] || null)}
                        />
                      </label>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your story will be reviewed before being published.
                </p>
                <Button 
                  onClick={handleSubmit} 
                  className="w-full" 
                  disabled={submitting || !user}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {submitting ? 'Submitting...' : 'Submit Story'}
                </Button>
                {!user && (
                  <p className="text-sm text-center text-muted-foreground">
                    Please sign in to share your story
                  </p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading stories...</div>
        ) : stories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No stories yet. Be the first to share!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((storyItem) => (
              <Card key={storyItem.id} className="h-full">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    {storyItem.before_image_url || storyItem.after_image_url ? (
                      <div className="flex -space-x-2">
                        {storyItem.before_image_url && (
                          <Avatar className="ring-2 ring-background">
                            <AvatarImage src={storyItem.before_image_url} />
                            <AvatarFallback>B</AvatarFallback>
                          </Avatar>
                        )}
                        {storyItem.after_image_url && (
                          <Avatar className="ring-2 ring-background">
                            <AvatarImage src={storyItem.after_image_url} />
                            <AvatarFallback>A</AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ) : (
                      <Avatar>
                        <AvatarFallback>{getInitials(storyItem.title)}</AvatarFallback>
                      </Avatar>
                    )}
                    <div>
                      <CardTitle className="text-lg">{storyItem.title}</CardTitle>
                      <div className="flex gap-2 mt-2">
                        {storyItem.weight_lost && (
                          <Badge variant="secondary">{storyItem.weight_lost} lbs lost</Badge>
                        )}
                        {storyItem.duration_months && (
                          <Badge variant="outline">{storyItem.duration_months} months</Badge>
                        )}
                        {storyItem.is_featured && (
                          <Badge>Featured</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground italic">"{storyItem.story}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Stories;