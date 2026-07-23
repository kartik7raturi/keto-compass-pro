import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Menu, User, LogOut, X, ChevronDown, Crown } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import UserProgressWidget from "@/components/UserProgressWidget";
import NotificationBell from "@/components/NotificationBell";
import { useSubscription } from "@/hooks/useSubscription";

const ADMIN_EMAIL = 'sankhobusiness@gmail.com';

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDisplayName, setUserDisplayName] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);
  const { subscription } = useSubscription();

  const isAdminEmail = user?.email?.toLowerCase() === ADMIN_EMAIL;
  const hasPaid = isAdminEmail || (subscription && subscription.is_active && ['basic', 'vip', 'vip_lifetime'].includes(subscription.plan_type));
  const isVip = subscription && subscription.is_active && (subscription.plan_type === 'vip' || subscription.plan_type === 'vip_lifetime');

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };


  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('user_id', user.id)
          .maybeSingle();
        
        const displayName = profile?.display_name || 
                          (user.user_metadata as any)?.display_name || 
                          (user.user_metadata as any)?.full_name ||
                          (user.user_metadata as any)?.name ||
                          user.email?.split('@')[0] || 
                          'User';
        setUserDisplayName(displayName);

        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();
        
        setIsAdmin(!!roleData || isAdminEmail);
      }
    };

    fetchUserProfile();
  }, [user, isAdminEmail]);

  // 4 top-level categories with submenus
  const navGroups = (() => {
    if (!user) {
      return [
        { label: 'Home', path: '/', items: [] as { label: string; path: string }[] },
        { label: 'Recipes', path: '/recipes', items: [] },
        { label: 'Course', path: '/course-sales', items: [] },
        { label: 'Contact', path: '/contact', items: [] },
      ];
    }

    return [
      {
        label: 'Track', path: '/progress', items: [
          { label: 'Progress', path: '/progress' },
          { label: 'Tracker', path: '/tracker' },
          { label: 'Challenges', path: '/challenges' },
          { label: 'Leaderboard', path: '/leaderboard' },
        ]
      },
      {
        label: 'Eat', path: '/recipes', items: [
          { label: 'Recipes', path: '/recipes' },
          { label: 'Weekly Plan', path: '/weekly-plan' },
          { label: 'Quick Meals', path: '/quick-meals' },
          { label: 'Custom Plan', path: '/custom-plan' },
        ]
      },
      {
        label: 'Learn', path: '/course', items: [
          { label: 'Video Course', path: '/course' },
          { label: 'Keto Guide', path: '/guide' },
          { label: 'Blog', path: '/blog' },
          { label: 'FAQ', path: '/faq' },
        ]
      },
      {
        label: 'Community', path: '/community', items: [
          { label: 'Community Feed', path: '/community' },
          { label: 'Transformations', path: '/transformations' },
          { label: 'Success Stories', path: '/stories' },
          { label: 'Marketplace', path: '/marketplace' },
        ]
      },
    ];
  })();

  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b">
      <div className="container flex h-14 md:h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden h-8 w-8" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="h-7 w-7 md:h-8 md:w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">K</span>
            </div>
            <span className="font-bold text-lg md:text-xl text-foreground">Ketopia</span>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navGroups.map(group => (
            group.items.length === 0 ? (
              <button
                key={group.label}
                onClick={() => handleNavigation(group.path)}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-secondary/50"
              >
                {group.label}
              </button>
            ) : (
              <DropdownMenu key={group.label}>
                <DropdownMenuTrigger className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-secondary/50 flex items-center gap-1 outline-none">
                  {group.label} <ChevronDown className="h-3 w-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {group.items.map(item => (
                    <DropdownMenuItem key={item.path} onClick={() => handleNavigation(item.path)}>
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-1 md:gap-2">
              {/* Everyone who isn't already VIP sees the VIP upgrade CTA */}
              {!isVip && (
                <Button
                  size="sm"
                  className="hidden sm:inline-flex bg-gradient-to-r from-amber-500 to-orange-600 text-white"
                  onClick={() => navigate('/vip-upgrade')}
                >
                  <Crown className="mr-1 h-4 w-4" />
                  Upgrade to VIP
                </Button>
              )}

              <NotificationBell />
              <span className="text-sm text-muted-foreground hidden lg:block">
                Welcome, {userDisplayName}
                {isVip && <Crown className="inline ml-1 h-3 w-3 text-amber-500" />}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1 h-8">
                    <User className="h-4 w-4" />
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      My Account
                      {isVip && <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-semibold">VIP</span>}
                      {hasPaid && !isVip && <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">Basic</span>}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="p-2 space-y-3 max-h-96 overflow-y-auto">
                    <UserProgressWidget />
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/articles')}>
                    Manage Articles
                  </DropdownMenuItem>
                  {!isVip && (
                    <DropdownMenuItem onClick={() => navigate('/vip-upgrade')}>
                      <Crown className="mr-2 h-4 w-4 text-amber-500" />
                      VIP Upgrade
                    </DropdownMenuItem>
                  )}

                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      Admin Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => navigate('/progress')}>
                    Progress Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/tracker')}>
                    Tracker
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>
                Sign In
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 transition-opacity" onClick={() => navigate('/onboarding')}>
                Get Free Keto Plan
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur">
          <nav className="container py-3 px-4 space-y-1">
            {navGroups.map(group => (
              <div key={group.label} className="py-1">
                {group.items.length === 0 ? (
                  <button
                    onClick={() => handleNavigation(group.path)}
                    className="block w-full text-left py-2 text-sm font-semibold text-foreground hover:text-primary"
                  >
                    {group.label}
                  </button>
                ) : (
                  <>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide py-1">{group.label}</p>
                    {group.items.map(item => (
                      <button
                        key={item.path}
                        onClick={() => handleNavigation(item.path)}
                        className="block w-full text-left py-1.5 pl-3 text-sm text-muted-foreground hover:text-primary"
                      >
                        {item.label}
                      </button>
                    ))}
                  </>
                )}
              </div>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
