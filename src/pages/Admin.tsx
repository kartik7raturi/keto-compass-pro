import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Loader2, ChefHat, FileText, BookOpen, Image, Target, MessageSquare, Award } from "lucide-react";
import { AdminRecipes } from "@/components/admin/AdminRecipes";
import { AdminArticles } from "@/components/admin/AdminArticles";
import { AdminStories } from "@/components/admin/AdminStories";
import { AdminAdvertisements } from "@/components/admin/AdminAdvertisements";
import { AdminChallenges } from "@/components/admin/AdminChallenges";
import { AdminMessages } from "@/components/admin/AdminMessages";
import { AdminBadges } from "@/components/admin/AdminBadges";
import { AdminModeration } from "@/components/admin/AdminModeration";

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
            <CardTitle className="flex items-center gap-2 text-2xl md:text-3xl">
              <Shield className="h-6 w-6 md:h-8 md:w-8 text-primary" />
              Admin Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm md:text-base">
              Manage recipes, blog articles, success stories, badges, challenges, and more.
            </p>
          </CardContent>
        </Card>

        <Tabs defaultValue="recipes" className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="recipes" className="flex items-center gap-1 text-xs md:text-sm">
              <ChefHat className="h-4 w-4" />
              <span className="hidden sm:inline">Recipes</span>
            </TabsTrigger>
            <TabsTrigger value="articles" className="flex items-center gap-1 text-xs md:text-sm">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Articles</span>
            </TabsTrigger>
            <TabsTrigger value="stories" className="flex items-center gap-1 text-xs md:text-sm">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Stories</span>
            </TabsTrigger>
            <TabsTrigger value="ads" className="flex items-center gap-1 text-xs md:text-sm">
              <Image className="h-4 w-4" />
              <span className="hidden sm:inline">Ads</span>
            </TabsTrigger>
            <TabsTrigger value="badges" className="flex items-center gap-1 text-xs md:text-sm">
              <Award className="h-4 w-4" />
              <span className="hidden sm:inline">Badges</span>
            </TabsTrigger>
            <TabsTrigger value="challenges" className="flex items-center gap-1 text-xs md:text-sm">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Challenges</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-1 text-xs md:text-sm">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Messages</span>
            </TabsTrigger>
            <TabsTrigger value="moderation" className="flex items-center gap-1 text-xs md:text-sm">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Moderation</span>
            </TabsTrigger>
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

          <TabsContent value="ads">
            <AdminAdvertisements />
          </TabsContent>

          <TabsContent value="badges">
            <AdminBadges />
          </TabsContent>

          <TabsContent value="challenges">
            <AdminChallenges />
          </TabsContent>

          <TabsContent value="messages">
            <AdminMessages />
          </TabsContent>

          <TabsContent value="moderation">
            <AdminModeration />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
