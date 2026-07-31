import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/seo/SEO";
import { Home, BookOpen, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Page Not Found"
        description="The page you're looking for doesn't exist or may have moved."
        path={location.pathname}
        noindex
      />
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-md">
          <div className="text-7xl font-bold bg-gradient-to-r from-keto-green to-keto-yellow bg-clip-text text-transparent mb-4">
            404
          </div>
          <h1 className="text-2xl font-bold mb-2">Page not found</h1>
          <p className="text-muted-foreground mb-8">
            The page you're looking for doesn't exist, may have been moved, or the link might be broken.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/blog">
                <BookOpen className="h-4 w-4 mr-2" />
                Browse Articles
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/support">
                <Search className="h-4 w-4 mr-2" />
                Get Help
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
