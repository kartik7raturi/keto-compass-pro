import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, ArrowRight, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  featured_image_url: string;
  slug: string;
  created_at: string;
}

const KetoArticles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('id, title, excerpt, category, featured_image_url, slug, created_at')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      "beginner": "bg-blue-100 text-blue-700",
      "nutrition": "bg-green-100 text-green-700", 
      "tips": "bg-yellow-100 text-yellow-700",
      "fitness": "bg-purple-100 text-purple-700",
      "advanced": "bg-red-100 text-red-700",
      "meal-planning": "bg-orange-100 text-orange-700",
      "general": "bg-gray-100 text-gray-700"
    };
    return colors[category.toLowerCase() as keyof typeof colors] || "bg-gray-100 text-gray-700";
  };

  const handleReadMore = (article: Article) => {
    navigate(`/blog/${article.slug}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 mb-4">
              <BookOpen className="h-8 w-8 text-primary" />
              <h2 className="text-3xl lg:text-4xl font-bold">
                Keto Knowledge Hub
              </h2>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Expert-backed articles to guide your ketogenic journey and help you achieve lasting results
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-300 h-48 rounded-t-lg mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 rounded mb-4"></div>
                <div className="h-8 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20">
      <div className="container">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
            <h2 className="text-3xl lg:text-4xl font-bold">
              Keto Knowledge Hub
            </h2>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Expert-backed articles to guide your ketogenic journey and help you achieve lasting results
          </p>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">No articles available yet.</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {articles.map((article) => (
                <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
                  <div className="relative overflow-hidden">
                    <img 
                      src={article.featured_image_url || "https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"}
                      alt={article.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className={getCategoryColor(article.category)}>
                        {article.category}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardHeader className="pb-3">
                    <h3 className="font-semibold text-lg leading-tight line-clamp-2">
                      {article.title}
                    </h3>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                      {article.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDate(article.created_at)}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="group/btn"
                        onClick={() => handleReadMore(article)}
                      >
                        Read More 
                        <ArrowRight className="h-3 w-3 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button 
                size="lg" 
                className="gap-2"
                onClick={() => navigate('/blog')}
              >
                <BookOpen className="h-4 w-4" />
                View All Articles
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default KetoArticles;