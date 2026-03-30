import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Loader2, ChefHat, FileText, BookOpen, Image, Target, MessageSquare, Award, Headphones, Layout, Crown, Users } from "lucide-react";
import { AdminRecipes } from "@/components/admin/AdminRecipes";
import { AdminArticles } from "@/components/admin/AdminArticles";
import { AdminStories } from "@/components/admin/AdminStories";
import { AdminAdvertisements } from "@/components/admin/AdminAdvertisements";
import { AdminChallenges } from "@/components/admin/AdminChallenges";
import { AdminMessages } from "@/components/admin/AdminMessages";
import { AdminBadges } from "@/components/admin/AdminBadges";
import { AdminModeration } from "@/components/admin/AdminModeration";
import { AdminSupportChats } from "@/components/admin/AdminSupportChats";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const AdminPages = () => {
  const navigate = useNavigate();
  const pages = [
    { name: 'Homepage', path: '/', status: 'active' },
    { name: 'VIP Upgrade', path: '/vip-upgrade', status: 'active' },
    { name: 'Shop', path: '/shop', status: 'active' },
    { name: 'Thank You', path: '/thank-you', status: 'active' },
    { name: 'Onboarding Survey', path: '/onboarding', status: 'active' },
    { name: 'Recipes', path: '/recipes', status: 'active' },
    { name: 'Tracker', path: '/tracker', status: 'active' },
    { name: 'Progress', path: '/progress', status: 'active' },
    { name: 'Challenges', path: '/challenges', status: 'active' },
    { name: 'Marketplace', path: '/marketplace', status: 'active' },
    { name: 'Community', path: '/community', status: 'active' },
    { name: 'Blog', path: '/blog', status: 'active' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Page Management</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Page</TableHead>
            <TableHead>Path</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pages.map(p => (
            <TableRow key={p.path}>
              <TableCell className="font-medium">{p.name}</TableCell>
              <TableCell className="text-muted-foreground text-sm">{p.path}</TableCell>
              <TableCell><Badge variant="secondary" className="bg-primary/10 text-primary">Active</Badge></TableCell>
              <TableCell>
                <Button size="sm" variant="outline" onClick={() => navigate(p.path)}>View</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const AdminSubscriptions = () => {
  const [subs, setSubs] = useState<any[]>([]);

  useEffect(() => {
    const fetchSubs = async () => {
      const { data } = await supabase.from('user_subscriptions').select('*');
      setSubs(data || []);
    };
    fetchSubs();
  }, []);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">User Subscriptions ({subs.length})</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User ID</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Active</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subs.map(s => (
            <TableRow key={s.id}>
              <TableCell className="text-xs font-mono">{s.user_id?.slice(0, 8)}...</TableCell>
              <TableCell>
                <Badge className={s.plan_type === 'vip' ? 'bg-amber-500' : s.plan_type === 'basic' ? 'bg-primary' : 'bg-secondary'}>
                  {s.plan_type}
                </Badge>
              </TableCell>
              <TableCell className="text-sm">{s.payment_type || 'N/A'}</TableCell>
              <TableCell className="text-sm">${s.amount_paid}</TableCell>
              <TableCell>{s.is_active ? '✅' : '❌'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) { navigate('/auth'); return; }
      try {
        const { data, error } = await supabase
          .from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin').maybeSingle();
        if (error) throw error;
        if (!data) { navigate('/'); return; }
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

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-4 md:py-8">
        <Card className="mb-6">
          <CardHeader className="py-4">
            <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
              <Shield className="h-6 w-6 text-primary" />
              Admin Dashboard
            </CardTitle>
          </CardHeader>
        </Card>

        <Tabs defaultValue="recipes" className="space-y-4">
          <TabsList className="flex flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="recipes" className="flex items-center gap-1 text-xs">
              <ChefHat className="h-3.5 w-3.5" /><span className="hidden sm:inline">Recipes</span>
            </TabsTrigger>
            <TabsTrigger value="articles" className="flex items-center gap-1 text-xs">
              <FileText className="h-3.5 w-3.5" /><span className="hidden sm:inline">Articles</span>
            </TabsTrigger>
            <TabsTrigger value="stories" className="flex items-center gap-1 text-xs">
              <BookOpen className="h-3.5 w-3.5" /><span className="hidden sm:inline">Stories</span>
            </TabsTrigger>
            <TabsTrigger value="ads" className="flex items-center gap-1 text-xs">
              <Image className="h-3.5 w-3.5" /><span className="hidden sm:inline">Ads</span>
            </TabsTrigger>
            <TabsTrigger value="badges" className="flex items-center gap-1 text-xs">
              <Award className="h-3.5 w-3.5" /><span className="hidden sm:inline">Badges</span>
            </TabsTrigger>
            <TabsTrigger value="challenges" className="flex items-center gap-1 text-xs">
              <Target className="h-3.5 w-3.5" /><span className="hidden sm:inline">Challenges</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-1 text-xs">
              <MessageSquare className="h-3.5 w-3.5" /><span className="hidden sm:inline">Messages</span>
            </TabsTrigger>
            <TabsTrigger value="moderation" className="flex items-center gap-1 text-xs">
              <Shield className="h-3.5 w-3.5" /><span className="hidden sm:inline">Moderation</span>
            </TabsTrigger>
            <TabsTrigger value="support" className="flex items-center gap-1 text-xs">
              <Headphones className="h-3.5 w-3.5" /><span className="hidden sm:inline">Support</span>
            </TabsTrigger>
            <TabsTrigger value="pages" className="flex items-center gap-1 text-xs">
              <Layout className="h-3.5 w-3.5" /><span className="hidden sm:inline">Pages</span>
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="flex items-center gap-1 text-xs">
              <Crown className="h-3.5 w-3.5" /><span className="hidden sm:inline">Subs</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recipes"><AdminRecipes /></TabsContent>
          <TabsContent value="articles"><AdminArticles /></TabsContent>
          <TabsContent value="stories"><AdminStories /></TabsContent>
          <TabsContent value="ads"><AdminAdvertisements /></TabsContent>
          <TabsContent value="badges"><AdminBadges /></TabsContent>
          <TabsContent value="challenges"><AdminChallenges /></TabsContent>
          <TabsContent value="messages"><AdminMessages /></TabsContent>
          <TabsContent value="moderation"><AdminModeration /></TabsContent>
          <TabsContent value="support"><AdminSupportChats /></TabsContent>
          <TabsContent value="pages"><AdminPages /></TabsContent>
          <TabsContent value="subscriptions"><AdminSubscriptions /></TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
