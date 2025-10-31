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
import { Pencil, Trash2, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  is_published: boolean;
  view_count: number;
  created_at: string;
  profiles?: {
    display_name: string;
    email: string;
  };
}

export const AdminArticles = () => {
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const { data: articlesData, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (articlesData && articlesData.length > 0) {
        const userIds = [...new Set(articlesData.map((a: any) => a.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, display_name, email')
          .in('user_id', userIds);

        const articlesWithProfiles = articlesData.map((article: any) => ({
          ...article,
          profiles: profiles?.find((p: any) => p.user_id === article.user_id) || null
        }));

        setArticles(articlesWithProfiles);
      } else {
        setArticles([]);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast({
        title: "Error",
        description: "Failed to fetch articles",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingArticle) return;

    try {
      const { error } = await supabase
        .from('articles')
        .update({
          title: editingArticle.title,
          slug: editingArticle.slug,
          excerpt: editingArticle.excerpt,
          content: editingArticle.content,
          category: editingArticle.category,
          is_published: editingArticle.is_published
        })
        .eq('id', editingArticle.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Article updated successfully"
      });

      setIsDialogOpen(false);
      fetchArticles();
    } catch (error) {
      console.error('Error updating article:', error);
      toast({
        title: "Error",
        description: "Failed to update article",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Article deleted successfully"
      });

      fetchArticles();
    } catch (error) {
      console.error('Error deleting article:', error);
      toast({
        title: "Error",
        description: "Failed to delete article",
        variant: "destructive"
      });
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('articles')
        .update({ is_published: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Article ${!currentStatus ? 'published' : 'unpublished'} successfully`
      });

      fetchArticles();
    } catch (error) {
      console.error('Error toggling publish status:', error);
      toast({
        title: "Error",
        description: "Failed to update article status",
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
        {articles.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No articles found.
            </CardContent>
          </Card>
        ) : (
          articles.map((article) => (
            <Card key={article.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{article.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      by {article.profiles?.display_name || 'Unknown'} ({article.profiles?.email})
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={article.is_published ? "default" : "secondary"}>
                      {article.is_published ? "Published" : "Draft"}
                    </Badge>
                    <Badge variant="outline">{article.category}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{article.excerpt}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <span>Views: {article.view_count}</span>
                  <span>•</span>
                  <span>Slug: {article.slug}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(article)}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTogglePublish(article.id, article.is_published)}
                  >
                    {article.is_published ? (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Unpublish
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Publish
                      </>
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(article.id)}
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
            <DialogTitle>Edit Article</DialogTitle>
          </DialogHeader>
          {editingArticle && (
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={editingArticle.title}
                  onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Slug</Label>
                <Input
                  value={editingArticle.slug}
                  onChange={(e) => setEditingArticle({ ...editingArticle, slug: e.target.value })}
                />
              </div>
              <div>
                <Label>Category</Label>
                <Input
                  value={editingArticle.category}
                  onChange={(e) => setEditingArticle({ ...editingArticle, category: e.target.value })}
                />
              </div>
              <div>
                <Label>Excerpt</Label>
                <Textarea
                  value={editingArticle.excerpt || ''}
                  onChange={(e) => setEditingArticle({ ...editingArticle, excerpt: e.target.value })}
                />
              </div>
              <div>
                <Label>Content</Label>
                <Textarea
                  value={editingArticle.content}
                  onChange={(e) => setEditingArticle({ ...editingArticle, content: e.target.value })}
                  rows={10}
                />
              </div>
              <div>
                <Label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingArticle.is_published}
                    onChange={(e) => setEditingArticle({ ...editingArticle, is_published: e.target.checked })}
                    className="rounded"
                  />
                  Published
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
