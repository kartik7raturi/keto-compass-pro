import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, ArrowRight, BookOpen } from "lucide-react";

const KetoArticles = () => {
  const articles = [
    {
      title: "Complete Beginner's Guide to Ketogenic Diet",
      excerpt: "Everything you need to know to start your keto journey successfully, from basic principles to meal planning.",
      readTime: "8 min read",
      category: "Beginner",
      image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    },
    {
      title: "Top 15 Keto-Friendly Foods for Weight Loss",
      excerpt: "Discover the most effective keto foods that will accelerate your weight loss and keep you in ketosis.",
      readTime: "6 min read",
      category: "Nutrition",
      image: "https://images.unsplash.com/photo-1543362906-acfc16c67564?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    },
    {
      title: "How to Avoid Common Keto Mistakes",
      excerpt: "Learn from others' experiences and avoid the pitfalls that can derail your ketogenic success.",
      readTime: "5 min read",
      category: "Tips",
      image: "https://images.unsplash.com/photo-1506368249639-73a05d6f6488?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    },
    {
      title: "Keto and Exercise: Maximizing Your Results",
      excerpt: "The complete guide to working out on keto, including the best exercises and timing strategies.",
      readTime: "7 min read",
      category: "Fitness",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    },
    {
      title: "Intermittent Fasting and Keto: The Perfect Combo",
      excerpt: "How combining IF with keto can supercharge your weight loss and health benefits.",
      readTime: "6 min read",
      category: "Advanced",
      image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    },
    {
      title: "Keto Meal Prep: 7-Day Plan for Busy People",
      excerpt: "Time-saving meal prep strategies to stay on track with your keto lifestyle even with a busy schedule.",
      readTime: "10 min read",
      category: "Meal Planning",
      image: "https://images.unsplash.com/photo-1547592180-85f173990554?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    }
  ];

  const getCategoryColor = (category: string) => {
    const colors = {
      "Beginner": "bg-blue-100 text-blue-700",
      "Nutrition": "bg-green-100 text-green-700", 
      "Tips": "bg-yellow-100 text-yellow-700",
      "Fitness": "bg-purple-100 text-purple-700",
      "Advanced": "bg-red-100 text-red-700",
      "Meal Planning": "bg-orange-100 text-orange-700"
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-700";
  };

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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {articles.map((article, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
              <div className="relative overflow-hidden">
                <img 
                  src={article.image}
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
                    {article.readTime}
                  </div>
                  <Button variant="ghost" size="sm" className="group/btn">
                    Read More 
                    <ArrowRight className="h-3 w-3 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button size="lg" className="gap-2">
            <BookOpen className="h-4 w-4" />
            View All Articles
          </Button>
        </div>
      </div>
    </section>
  );
};

export default KetoArticles;