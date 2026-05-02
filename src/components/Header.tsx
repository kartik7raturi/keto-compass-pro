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

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDisplayName, setUserDisplayName] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);
  const { subscription } = useSubscription();

  const hasPaid = subscription && subscription.is_active && (subscription.plan_type === 'basic' || subscription.plan_type === 'vip');
  const isVip = subscription && subscription.is_active && subscription.plan_type === 'vip';

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleNavigation = (path: string) => {
    // If user is logged in but hasn't paid, redirect feature pages to pricing
    if (user && !hasPaid && !isAdmin) {
      const freePages = ['/', '/contact', '/pricing', '/onboarding', '/auth', '/imprint', '/privacy', '/terms', '/refund-policy', '/about', '/faq', '/blog'];
      if (!freePages.includes(path)) {
        navigate('/pricing');
        setMobileMenuOpen(false);
        return;
      }
    }
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
        
        setIsAdmin(!!roleData);
      }
    };

    fetchUserProfile();
  }, [user]);

  const getNavItems = () => {
    if (!user) {
      return [
        { label: 'Home', path: '/' },
        { label: 'Pricing', path: '/pricing' },
        { label: 'Contact', path: '/contact' },
      ];
    }
    if (!hasPaid) {
      return [
        { label: 'Home', path: '/' },
        { label: 'Pricing', path: '/pricing' },
        { label: 'Contact', path: '/contact' },
      ];
    }
    const items = [
      { label: 'Home', path: '/' },
      { label: 'Recipes', path: '/recipes' },
      { label: 'Tracker', path: '/tracker' },
      { label: 'Challenges', path: '/challenges' },
      { label: 'Progress', path: '/progress' },
      { label: 'Community', path: '/community' },
      { label: 'Marketplace', path: '/marketplace' },
    ];
    return items;
  };

  const navItems = getNavItems();

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
        
        <nav className="hidden md:flex items-center gap-4 lg:gap-6">
          {navItems.map(item => (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-1 md:gap-2">
              <NotificationBell />
              <span className="text-sm text-muted-foreground hidden lg:block">
                Welcome, {userDisplayName}
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
                  {!isVip && hasPaid && (
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
                  {hasPaid && (
                    <>
                      <DropdownMenuItem onClick={() => navigate('/progress')}>
                        Progress Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/tracker')}>
                        Tracker
                      </DropdownMenuItem>
                    </>
                  )}
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
            {navItems.map(item => (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className="block w-full text-left py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
