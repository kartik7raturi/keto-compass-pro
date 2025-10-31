import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Loader2 } from "lucide-react";
import { AdminRecipes } from "@/components/admin/AdminRecipes";
import { AdminArticles } from "@/components/admin/AdminArticles";
import { AdminStories } from "@/components/admin/AdminStories";

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        navigate('/auth');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (error) throw error;
        
        if (!data) {
          navigate('/');
          return;
        }

        setIsAdmin(true);
      } catch (error) {
        console.error('Error checking admin status:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-3xl">
              <Shield className="h-8 w-8 text-primary" />
              Admin Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Manage submitted recipes, blog articles, and success stories.
            </p>
          </CardContent>
        </Card>

        <Tabs defaultValue="recipes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recipes">Submitted Recipes</TabsTrigger>
            <TabsTrigger value="articles">Blog Articles</TabsTrigger>
            <TabsTrigger value="stories">Success Stories</TabsTrigger>
          </TabsList>

          <TabsContent value="recipes">
            <AdminRecipes />
          </TabsContent>

          <TabsContent value="articles">
            <AdminArticles />
          </TabsContent>

          <TabsContent value="stories">
            <AdminStories />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
