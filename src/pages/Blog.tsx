import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, ArrowRight, BookOpen, ArrowLeft, Eye, Search } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/seo/SEO";
import { SITE_CONFIG } from "@/lib/seo/config";
import SocialShareButtons from "@/components/SocialShareButtons";

interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  featured_image_url: string;
  slug: string;
  created_at: string;
  view_count: number;
}

const Blog = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchArticleBySlug(slug);
    } else {
      window.scrollTo(0, 0);
      fetchAllArticles();
    }
  }, [slug]);

  const fetchAllArticles = async () => {
    setLoading(true);
    setCurrentArticle(null);
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchArticleBySlug = async (articleSlug: string) => {
    setLoading(true);
    window.scrollTo(0, 0);
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', articleSlug)
        .eq('is_published', true)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        navigate('/blog');
        return;
      }

      setCurrentArticle(data);
      
      // Increment view count
      await supabase
        .from('articles')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', data.id);
        
    } catch (error) {
      console.error('Error fetching article:', error);
      navigate('/blog');
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const categories = useMemo(() => {
    const set = new Set(articles.map((a) => a.category).filter(Boolean));
    return Array.from(set).sort();
  }, [articles]);

  const filteredArticles = useMemo(() => {
    return articles.filter((a) => {
      const matchesCategory = !activeCategory || a.category === activeCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        a.title.toLowerCase().includes(q) ||
        (a.excerpt || "").toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [articles, activeCategory, searchQuery]);

  const relatedArticles = useMemo(() => {
    if (!currentArticle) return [];
    const sameCategory = articles.filter(
      (a) => a.id !== currentArticle.id && a.category === currentArticle.category
    );
    const others = articles.filter(
      (a) => a.id !== currentArticle.id && a.category !== currentArticle.category
    );
    return [...sameCategory, ...others].slice(0, 3);
  }, [articles, currentArticle]);

  // Keep the article list loaded in the background so related articles / filters
  // work even when landing directly on a single article page.
  useEffect(() => {
    if (articles.length === 0) {
      supabase
        .from('articles')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .then(({ data }) => {
          if (data) setArticles(data);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentArticle]);


  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            {slug ? (
              <div className="max-w-4xl mx-auto">
                <div className="h-8 bg-gray-300 rounded mb-4"></div>
                <div className="h-64 bg-gray-300 rounded mb-6"></div>
                <div className="space-y-4">
                  {[1,2,3,4,5].map((i) => (
                    <div key={i} className="h-4 bg-gray-300 rounded"></div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1,2,3,4,5,6].map((i) => (
                  <div key={i}>
                    <div className="bg-gray-300 h-48 rounded-t-lg mb-4"></div>
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded mb-4"></div>
                    <div className="h-8 bg-gray-300 rounded"></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (currentArticle) {
    const articlePath = `/blog/${currentArticle.slug}`;
    const articleImage = currentArticle.featured_image_url || SITE_CONFIG.defaultImage;
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: currentArticle.title,
      description: currentArticle.excerpt,
      image: articleImage,
      datePublished: currentArticle.created_at,
      dateModified: currentArticle.created_at,
      author: { "@type": "Organization", name: SITE_CONFIG.organization.name },
      publisher: {
        "@type": "Organization",
        name: SITE_CONFIG.organization.name,
        logo: { "@type": "ImageObject", url: SITE_CONFIG.organization.logo },
      },
      mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_CONFIG.url}${articlePath}` },
    };
    return (
      <div className="min-h-screen bg-background">
        <SEO
          title={currentArticle.title}
          description={currentArticle.excerpt}
          path={articlePath}
          image={articleImage}
          type="article"
          jsonLd={jsonLd}
        />
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/blog')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Articles
          </Button>
          
          <article className="max-w-4xl mx-auto">
            <div className="mb-8">
              <Badge className={getCategoryColor(currentArticle.category)}>
                {currentArticle.category}
              </Badge>
              <h1 className="text-4xl font-bold mt-4 mb-4">{currentArticle.title}</h1>
              <div className="flex items-center gap-4 text-muted-foreground text-sm mb-6">
                <span>{formatDate(currentArticle.created_at)}</span>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{currentArticle.view_count || 0} views</span>
                </div>
              </div>
            </div>
            
            {currentArticle.featured_image_url && (
              <img 
                src={currentArticle.featured_image_url}
                alt={currentArticle.title}
                className="w-full h-64 md:h-96 object-cover rounded-lg mb-8"
              />
            )}
            
            <div className="prose prose-lg max-w-none prose-headings:font-bold prose-img:rounded-lg">
              <div dangerouslySetInnerHTML={{ __html: currentArticle.content }} />
            </div>

            <div className="mt-10 pt-6 border-t flex flex-wrap items-center justify-between gap-4">
              <span className="text-sm font-medium text-muted-foreground">Share this article</span>
              <SocialShareButtons
                title={currentArticle.title}
                description={currentArticle.excerpt}
                url={`${SITE_CONFIG.url}${articlePath}`}
                image={articleImage}
              />
            </div>

            {relatedArticles.length > 0 && (
              <div className="mt-12 pt-8 border-t">
                <h2 className="text-2xl font-bold mb-6">Keep Reading</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {relatedArticles.map((related) => (
                    <Card
                      key={related.id}
                      className="overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer group"
                      onClick={() => navigate(`/blog/${related.slug}`)}
                    >
                      <div className="relative overflow-hidden">
                        <img
                          src={related.featured_image_url || "https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"}
                          alt={related.title}
                          className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <CardContent className="p-4">
                        <Badge className={`${getCategoryColor(related.category)} mb-2`}>
                          {related.category}
                        </Badge>
                        <h3 className="font-semibold text-sm leading-snug line-clamp-2">
                          {related.title}
                        </h3>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </article>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Keto Knowledge Hub"
        description="Expert-backed articles to guide your ketogenic journey and help you achieve lasting results."
        path="/blog"
      />
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-3xl lg:text-4xl font-bold">
              Keto Knowledge Hub
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Expert-backed articles to guide your ketogenic journey and help you achieve lasting results
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-10 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles..."
              className="pl-9"
            />
          </div>
          {categories.length > 1 && (
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                variant={activeCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(null)}
              >
                All
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={activeCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
          )}
        </div>

        {filteredArticles.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">
              {articles.length === 0 ? "No articles available yet." : "No articles match your search."}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <Card
                key={article.id}
                className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group cursor-pointer"
                onClick={() => navigate(`/blog/${article.slug}`)}
              >
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
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(article.created_at)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {article.view_count || 0}
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="group/btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/blog/${article.slug}`);
                      }}
                    >
                      Read More 
                      <ArrowRight className="h-3 w-3 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </div>
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

export default Blog;