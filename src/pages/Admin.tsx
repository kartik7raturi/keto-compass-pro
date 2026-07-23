import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Loader2, ChefHat, FileText, BookOpen, Image, Target, MessageSquare, Award, Headphones, Layout, Crown, Package, Pencil, Webhook, GraduationCap } from "lucide-react";
import { AdminWebhookLogs } from "@/components/admin/AdminWebhookLogs";
import { AdminRecipes } from "@/components/admin/AdminRecipes";
import { AdminArticles } from "@/components/admin/AdminArticles";
import { AdminStories } from "@/components/admin/AdminStories";
import { AdminAdvertisements } from "@/components/admin/AdminAdvertisements";
import { AdminChallenges } from "@/components/admin/AdminChallenges";
import { AdminMessages } from "@/components/admin/AdminMessages";
import { AdminBadges } from "@/components/admin/AdminBadges";
import { AdminModeration } from "@/components/admin/AdminModeration";
import { AdminSupportChats } from "@/components/admin/AdminSupportChats";
import { AdminButtonLinks } from "@/components/admin/AdminButtonLinks";
import { AdminProducts } from "@/components/admin/AdminProducts";
import { AdminCourse } from "@/components/admin/AdminCourse";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const AdminImprintEditor = ({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) => {
  const [content, setContent] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      const stored = localStorage.getItem('imprint_content');
      setContent(stored || '');
    }
  }, [open]);

  const handleSave = () => {
    localStorage.setItem('imprint_content', content);
    toast({ title: 'Saved', description: 'Imprint content updated. Changes will appear on the Imprint page.' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Imprint Page</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Imprint Content (HTML supported)</Label>
            <Textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={20}
              placeholder="Enter your imprint/impressum content here..."
              className="font-mono text-xs"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1">Save Imprint</Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const AdminVipVideo = () => {
  const [url, setUrl] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    setUrl(localStorage.getItem('vip_upgrade_video_url') || '');
  }, []);

  const save = () => {
    localStorage.setItem('vip_upgrade_video_url', url.trim());
    toast({ title: 'Saved', description: 'VIP upgrade video URL updated.' });
  };

  return (
    <Card>
      <CardHeader className="py-4">
        <CardTitle className="text-base">VIP Upgrade Page Video</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Label>YouTube video URL</Label>
        <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
        <p className="text-xs text-muted-foreground">Paste any YouTube URL. Leave blank to hide the video section.</p>
        <div className="flex gap-2">
          <Button onClick={save}>Save Video URL</Button>
          {url && <Button variant="outline" onClick={() => { setUrl(''); localStorage.removeItem('vip_upgrade_video_url'); toast({ title: 'Cleared' }); }}>Clear</Button>}
        </div>
      </CardContent>
    </Card>
  );
};


const AdminPages = () => {
  const navigate = useNavigate();
  const [editImprint, setEditImprint] = useState(false);

  const pages = [
    { name: 'Homepage', path: '/', buttons: [], editable: false },
    { name: 'Sales Page ($19.99)', path: '/pricing', buttons: ['keto_starter'], editable: false },
    { name: 'VIP Upgrade', path: '/vip-upgrade', buttons: ['vip_monthly', 'vip_lifetime'], editable: false },
    { name: 'Thank You (Basic)', path: '/thank-you', buttons: ['thankyou_basic_vip_upgrade', 'thankyou_basic_dashboard'], editable: false },
    { name: 'Thank You (VIP)', path: '/thank-you-vip', buttons: ['thankyou_vip_supplement', 'thankyou_vip_dashboard'], editable: false },
    { name: 'Shop / Supplement', path: '/shop', buttons: ['shop_1_bottle', 'shop_3_bottles', 'shop_6_bottles'], editable: false },
    { name: 'Onboarding Quiz', path: '/onboarding', buttons: [], editable: false },
    { name: 'Imprint', path: '/imprint', buttons: [], editable: true },
    { name: 'Recipes', path: '/recipes', buttons: [], editable: false },
    { name: 'Tracker', path: '/tracker', buttons: [], editable: false },
    { name: 'Progress', path: '/progress', buttons: [], editable: false },
    { name: 'Challenges', path: '/challenges', buttons: [], editable: false },
    { name: 'Marketplace', path: '/marketplace', buttons: [], editable: false },
    { name: 'Community', path: '/community', buttons: [], editable: false },
    { name: 'Blog', path: '/blog', buttons: [], editable: false },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Page Management</h3>
      <p className="text-sm text-muted-foreground">View all pages and manage their payment/redirect button URLs below.</p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Page</TableHead>
            <TableHead>Path</TableHead>
            <TableHead>Buttons</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pages.map(p => (
            <TableRow key={p.path}>
              <TableCell className="font-medium text-sm">{p.name}</TableCell>
              <TableCell className="text-muted-foreground text-xs">{p.path}</TableCell>
              <TableCell>
                {p.buttons.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {p.buttons.map(b => (
                      <Badge key={b} variant="secondary" className="text-xs">{b}</Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="space-x-1">
                <Button size="sm" variant="outline" onClick={() => navigate(p.path)}>View</Button>
                {p.editable && (
                  <Button size="sm" variant="outline" onClick={() => setEditImprint(true)}>
                    <Pencil className="h-3 w-3 mr-1" /> Edit
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Button Links Management */}
      <AdminButtonLinks />

      <AdminImprintEditor open={editImprint} onOpenChange={setEditImprint} />
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
            <TabsTrigger value="products" className="flex items-center gap-1 text-xs">
              <Package className="h-3.5 w-3.5" /><span className="hidden sm:inline">Products</span>
            </TabsTrigger>
            <TabsTrigger value="pages" className="flex items-center gap-1 text-xs">
              <Layout className="h-3.5 w-3.5" /><span className="hidden sm:inline">Pages</span>
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="flex items-center gap-1 text-xs">
              <Crown className="h-3.5 w-3.5" /><span className="hidden sm:inline">Subs</span>
            </TabsTrigger>
            <TabsTrigger value="course" className="flex items-center gap-1 text-xs">
              <GraduationCap className="h-3.5 w-3.5" /><span className="hidden sm:inline">Course</span>
            </TabsTrigger>
            <TabsTrigger value="vipvideo" className="flex items-center gap-1 text-xs">
              <Crown className="h-3.5 w-3.5" /><span className="hidden sm:inline">VIP Video</span>
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="flex items-center gap-1 text-xs">
              <Webhook className="h-3.5 w-3.5" /><span className="hidden sm:inline">Webhooks</span>
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
          <TabsContent value="products"><AdminProducts /></TabsContent>
          <TabsContent value="pages"><AdminPages /></TabsContent>
          <TabsContent value="subscriptions"><AdminSubscriptions /></TabsContent>
          <TabsContent value="course"><AdminCourse /></TabsContent>
          <TabsContent value="vipvideo"><AdminVipVideo /></TabsContent>
          <TabsContent value="webhooks"><AdminWebhookLogs /></TabsContent>

        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
