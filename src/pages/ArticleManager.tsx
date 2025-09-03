import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  PlusCircle, 
  Edit, 
  Trash2, 
  Eye, 
  BookOpen, 
  Save,
  ArrowLeft,
  ImagePlus
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image_url: string;
  category: string;
  tags: string[];
  is_published: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

const ArticleManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Partial<Article>>({
    title: "",
    content: "",
    excerpt: "",
    category: "general",
    tags: [],
    is_published: false
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchArticles();
    }
  }, [user]);

  const fetchArticles = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error fetching articles",
        description: error.message,
      });
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const handleSaveArticle = async () => {
    if (!user || !editingArticle.title || !editingArticle.content) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in title and content.",
      });
      return;
    }

    setLoading(true);
    try {
      const articleData = {
        title: editingArticle.title!,
        content: editingArticle.content!,
        user_id: user.id,
        slug: generateSlug(editingArticle.title || ""),
        excerpt: editingArticle.excerpt || "",
        featured_image_url: editingArticle.featured_image_url || "",
        category: editingArticle.category || "general",
        tags: editingArticle.tags || [],
        is_published: editingArticle.is_published || false,
        updated_at: new Date().toISOString()
      };

      if (editingArticle.id) {
        // Update existing article
        const { error } = await supabase
          .from('articles')
          .update(articleData)
          .eq('id', editingArticle.id);
        
        if (error) throw error;
        
        toast({
          title: "Article updated!",
          description: "Your article has been updated successfully.",
        });
      } else {
        // Create new article
        const { error } = await supabase
          .from('articles')
          .insert(articleData);
        
        if (error) throw error;
        
        toast({
          title: "Article created!",
          description: "Your article has been created successfully.",
        });
      }

      setIsEditing(false);
      setEditingArticle({
        title: "",
        content: "",
        excerpt: "",
        category: "general",
        tags: [],
        is_published: false
      });
      fetchArticles();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error saving article",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditArticle = (article: Article) => {
    setEditingArticle(article);
    setIsEditing(true);
  };

  const handleDeleteArticle = async (id: string) => {
    if (!confirm("Are you sure you want to delete this article?")) return;

    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Article deleted",
        description: "Article has been successfully deleted.",
      });
      
      fetchArticles();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting article",
        description: error.message,
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please sign in to manage articles</h1>
            <Button onClick={() => window.location.href = '/auth'}>
              Sign In
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="ghost"
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Articles
              </Button>
              <h1 className="text-3xl font-bold">
                {editingArticle.id ? "Edit Article" : "Create New Article"}
              </h1>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Article Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={editingArticle.title || ""}
                    onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })}
                    placeholder="Enter article title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={editingArticle.excerpt || ""}
                    onChange={(e) => setEditingArticle({ ...editingArticle, excerpt: e.target.value })}
                    placeholder="Brief description of the article"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={editingArticle.category}
                      onValueChange={(value) => setEditingArticle({ ...editingArticle, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="keto-basics">Keto Basics</SelectItem>
                        <SelectItem value="recipes">Recipes</SelectItem>
                        <SelectItem value="meal-planning">Meal Planning</SelectItem>
                        <SelectItem value="health-wellness">Health & Wellness</SelectItem>
                        <SelectItem value="success-stories">Success Stories</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image">Featured Image URL</Label>
                    <Input
                      id="image"
                      value={editingArticle.featured_image_url || ""}
                      onChange={(e) => setEditingArticle({ ...editingArticle, featured_image_url: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={editingArticle.content || ""}
                    onChange={(e) => setEditingArticle({ ...editingArticle, content: e.target.value })}
                    placeholder="Write your article content here..."
                    rows={15}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="published"
                      checked={editingArticle.is_published || false}
                      onChange={(e) => setEditingArticle({ ...editingArticle, is_published: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="published">Publish article</Label>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveArticle}
                      disabled={loading}
                      className="flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {loading ? "Saving..." : "Save Article"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Article Manager</h1>
              <p className="text-muted-foreground">Create and manage your keto knowledge articles</p>
            </div>
            <Button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              New Article
            </Button>
          </div>

          {articles.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No articles yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Start sharing your keto knowledge by creating your first article
                </p>
                <Button onClick={() => setIsEditing(true)}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create First Article
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {articles.map((article) => (
                <Card key={article.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-semibold">{article.title}</h3>
                          <Badge variant={article.is_published ? "default" : "secondary"}>
                            {article.is_published ? "Published" : "Draft"}
                          </Badge>
                          <Badge variant="outline">{article.category}</Badge>
                        </div>
                        
                        {article.excerpt && (
                          <p className="text-muted-foreground mb-3 line-clamp-2">
                            {article.excerpt}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{new Date(article.created_at).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{article.view_count} views</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditArticle(article)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteArticle(article.id)}
                          className="text-red-600 hover:text-red-700"
                        >
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
      </main>
      <Footer />
    </div>
  );
};

export default ArticleManager;