import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, CheckCircle, XCircle, Star, Loader2 } from "lucide-react";

interface Story {
  id: string;
  title: string;
  story: string;
  weight_lost: number;
  duration_months: number;
  is_featured: boolean;
  is_approved: boolean;
  before_image_url?: string;
  after_image_url?: string;
  created_at: string;
  profiles?: {
    display_name: string;
    email: string;
  };
}

export const AdminStories = () => {
  const { toast } = useToast();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const { data: storiesData, error } = await supabase
        .from('success_stories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (storiesData && storiesData.length > 0) {
        const userIds = [...new Set(storiesData.map((s: any) => s.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, display_name, email')
          .in('user_id', userIds);

        const storiesWithProfiles = storiesData.map((story: any) => ({
          ...story,
          profiles: profiles?.find((p: any) => p.user_id === story.user_id) || null
        }));

        setStories(storiesWithProfiles);
      } else {
        setStories([]);
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
      toast({
        title: "Error",
        description: "Failed to fetch success stories",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (story: Story) => {
    setEditingStory(story);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingStory) return;

    try {
      const { error } = await supabase
        .from('success_stories')
        .update({
          title: editingStory.title,
          story: editingStory.story,
          weight_lost: editingStory.weight_lost,
          duration_months: editingStory.duration_months,
          is_approved: editingStory.is_approved,
          is_featured: editingStory.is_featured
        })
        .eq('id', editingStory.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Success story updated successfully"
      });

      setIsDialogOpen(false);
      fetchStories();
    } catch (error) {
      console.error('Error updating story:', error);
      toast({
        title: "Error",
        description: "Failed to update success story",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this success story?')) return;

    try {
      const { error } = await supabase
        .from('success_stories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Success story deleted successfully"
      });

      fetchStories();
    } catch (error) {
      console.error('Error deleting story:', error);
      toast({
        title: "Error",
        description: "Failed to delete success story",
        variant: "destructive"
      });
    }
  };

  const handleToggleApproval = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('success_stories')
        .update({ is_approved: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Success story ${!currentStatus ? 'approved' : 'unapproved'} successfully`
      });

      fetchStories();
    } catch (error) {
      console.error('Error toggling approval:', error);
      toast({
        title: "Error",
        description: "Failed to update story status",
        variant: "destructive"
      });
    }
  };

  const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('success_stories')
        .update({ is_featured: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Success story ${!currentStatus ? 'featured' : 'unfeatured'} successfully`
      });

      fetchStories();
    } catch (error) {
      console.error('Error toggling featured status:', error);
      toast({
        title: "Error",
        description: "Failed to update featured status",
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
        {stories.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No success stories found.
            </CardContent>
          </Card>
        ) : (
          stories.map((story) => (
            <Card key={story.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{story.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      by {story.profiles?.display_name || 'Unknown'} ({story.profiles?.email})
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={story.is_approved ? "default" : "secondary"}>
                      {story.is_approved ? "Approved" : "Pending"}
                    </Badge>
                    {story.is_featured && (
                      <Badge variant="outline" className="gap-1">
                        <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                        Featured
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{story.story}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <span>Weight Lost: {story.weight_lost} kg</span>
                  <span>•</span>
                  <span>Duration: {story.duration_months} months</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(story)}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleApproval(story.id, story.is_approved)}
                  >
                    {story.is_approved ? (
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
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleFeatured(story.id, story.is_featured)}
                  >
                    {story.is_featured ? (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Unfeature
                      </>
                    ) : (
                      <>
                        <Star className="h-4 w-4 mr-2" />
                        Feature
                      </>
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(story.id)}
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
            <DialogTitle>Edit Success Story</DialogTitle>
          </DialogHeader>
          {editingStory && (
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={editingStory.title}
                  onChange={(e) => setEditingStory({ ...editingStory, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Story</Label>
                <Textarea
                  value={editingStory.story}
                  onChange={(e) => setEditingStory({ ...editingStory, story: e.target.value })}
                  rows={6}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Weight Lost (kg)</Label>
                  <Input
                    type="number"
                    value={editingStory.weight_lost}
                    onChange={(e) => setEditingStory({ ...editingStory, weight_lost: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Duration (months)</Label>
                  <Input
                    type="number"
                    value={editingStory.duration_months}
                    onChange={(e) => setEditingStory({ ...editingStory, duration_months: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingStory.is_approved}
                    onChange={(e) => setEditingStory({ ...editingStory, is_approved: e.target.checked })}
                    className="rounded"
                  />
                  Approved
                </Label>
                <Label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingStory.is_featured}
                    onChange={(e) => setEditingStory({ ...editingStory, is_featured: e.target.checked })}
                    className="rounded"
                  />
                  Featured
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
