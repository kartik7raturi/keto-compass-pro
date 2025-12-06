import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Loader2, Image, ExternalLink } from "lucide-react";

interface Advertisement {
  id: string;
  title: string;
  image_url: string;
  redirect_url: string;
  is_active: boolean;
  display_order: number;
}

export const AdminAdvertisements = () => {
  const { toast } = useToast();
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Partial<Advertisement> | null>(null);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setAds(data || []);
    } catch (error) {
      console.error('Error fetching ads:', error);
      toast({ title: "Error", description: "Failed to fetch advertisements", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingAd({
      title: '',
      image_url: '',
      redirect_url: '',
      is_active: true,
      display_order: ads.length
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (ad: Advertisement) => {
    setEditingAd(ad);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingAd?.title || !editingAd?.image_url || !editingAd?.redirect_url) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }

    try {
      if (editingAd.id) {
        // Update
        const { error } = await supabase
          .from('advertisements')
          .update({
            title: editingAd.title,
            image_url: editingAd.image_url,
            redirect_url: editingAd.redirect_url,
            is_active: editingAd.is_active,
            display_order: editingAd.display_order
          })
          .eq('id', editingAd.id);

        if (error) throw error;
        toast({ title: "Success", description: "Advertisement updated" });
      } else {
        // Create
        const { error } = await supabase
          .from('advertisements')
          .insert({
            title: editingAd.title,
            image_url: editingAd.image_url,
            redirect_url: editingAd.redirect_url,
            is_active: editingAd.is_active ?? true,
            display_order: editingAd.display_order ?? 0
          });

        if (error) throw error;
        toast({ title: "Success", description: "Advertisement created" });
      }

      setIsDialogOpen(false);
      fetchAds();
    } catch (error) {
      console.error('Error saving ad:', error);
      toast({ title: "Error", description: "Failed to save advertisement", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this advertisement?')) return;

    try {
      const { error } = await supabase
        .from('advertisements')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Success", description: "Advertisement deleted" });
      fetchAds();
    } catch (error) {
      console.error('Error deleting ad:', error);
      toast({ title: "Error", description: "Failed to delete advertisement", variant: "destructive" });
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('advertisements')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;
      fetchAds();
    } catch (error) {
      console.error('Error toggling ad:', error);
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
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Manage Advertisements</h3>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Advertisement
          </Button>
        </div>

        {ads.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
              No advertisements found. Create one to get started.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {ads.map((ad) => (
              <Card key={ad.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-20 rounded overflow-hidden bg-muted flex-shrink-0">
                      <img
                        src={ad.image_url}
                        alt={ad.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{ad.title}</h4>
                      <a
                        href={ad.redirect_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 truncate"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {ad.redirect_url}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={ad.is_active}
                        onCheckedChange={() => handleToggleActive(ad.id, ad.is_active)}
                      />
                      <Button variant="outline" size="sm" onClick={() => handleEdit(ad)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(ad.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAd?.id ? 'Edit' : 'Create'} Advertisement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input
                value={editingAd?.title || ''}
                onChange={(e) => setEditingAd({ ...editingAd, title: e.target.value })}
                placeholder="Ad title"
              />
            </div>
            <div>
              <Label>Image URL *</Label>
              <Input
                value={editingAd?.image_url || ''}
                onChange={(e) => setEditingAd({ ...editingAd, image_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <Label>Redirect URL *</Label>
              <Input
                value={editingAd?.redirect_url || ''}
                onChange={(e) => setEditingAd({ ...editingAd, redirect_url: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
            <div>
              <Label>Display Order</Label>
              <Input
                type="number"
                value={editingAd?.display_order || 0}
                onChange={(e) => setEditingAd({ ...editingAd, display_order: parseInt(e.target.value) })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={editingAd?.is_active ?? true}
                onCheckedChange={(checked) => setEditingAd({ ...editingAd, is_active: checked })}
              />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
