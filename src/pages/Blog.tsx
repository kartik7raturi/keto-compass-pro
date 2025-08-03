import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, User } from "lucide-react";

const Blog = () => {
  const posts = [
    {
      title: "10 Keto Breakfast Ideas to Start Your Day Right",
      excerpt: "Discover delicious and easy keto breakfast recipes that will keep you satisfied all morning.",
      category: "Recipes",
      readTime: "5 min read",
      date: "Dec 15, 2024"
    },
    {
      title: "Understanding the Keto Flu and How to Beat It",
      excerpt: "Learn about common keto side effects and proven strategies to overcome them quickly.",
      category: "Health",
      readTime: "8 min read",
      date: "Dec 10, 2024"
    },
    {
      title: "Keto Meal Prep: A Week's Worth of Meals",
      excerpt: "Master the art of keto meal prepping with our comprehensive guide and shopping list.",
      category: "Meal Prep",
      readTime: "12 min read",
      date: "Dec 5, 2024"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Keto Blog</h1>
          <p className="text-xl text-muted-foreground">Latest tips, recipes, and insights for your keto journey</p>
        </div>

        <div className="grid gap-6">
          {posts.map((post, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                  <div className="flex items-center gap-1">
                    <CalendarDays className="h-4 w-4" />
                    {post.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {post.readTime}
                  </div>
                  <Badge variant="secondary">{post.category}</Badge>
                </div>
                <CardTitle className="text-xl hover:text-keto-green transition-colors">{post.title}</CardTitle>
                <CardDescription>{post.excerpt}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>Keto Compass Team</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Stay Updated</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Subscribe to our newsletter to get the latest keto tips, recipes, and success stories 
                delivered straight to your inbox.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;