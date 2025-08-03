import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu, User, LogOut, X, ChevronDown } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-keto-green to-keto-green-dark flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-keto-green to-keto-green-dark bg-clip-text text-transparent">
              Keto Compass Pro
            </span>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <button 
            onClick={() => navigate('/')} 
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Home
          </button>
          <button 
            onClick={() => navigate('/recipes')} 
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Recipes
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Tracker
                <ChevronDown className="h-3 w-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => navigate('/tracker')}>
                Macro Tracker
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/planner')}>
                Meal Planner
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/weekly-plan')}>
                Weekly Plan
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/quick-meals')}>
                Quick Meals
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/custom-plan')}>
                Custom Plan
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <button 
            onClick={() => navigate('/progress')} 
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Progress
          </button>
          <button 
            onClick={() => navigate('/community')} 
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Community
          </button>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:block">
                Welcome, {user.email}
              </span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>
                Sign In
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-keto-green to-keto-green-dark hover:opacity-90 transition-opacity" onClick={() => navigate('/auth')}>
                Get Started
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur">
          <nav className="container py-4 space-y-2">
            <button 
              onClick={() => handleNavigation('/')} 
              className="block w-full text-left py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Home
            </button>
            <button 
              onClick={() => handleNavigation('/recipes')} 
              className="block w-full text-left py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Recipes
            </button>
            <button 
              onClick={() => handleNavigation('/tracker')} 
              className="block w-full text-left py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Macro Tracker
            </button>
            <button 
              onClick={() => handleNavigation('/planner')} 
              className="block w-full text-left py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Meal Planner
            </button>
            <button 
              onClick={() => handleNavigation('/weekly-plan')} 
              className="block w-full text-left py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Weekly Plan
            </button>
            <button 
              onClick={() => handleNavigation('/quick-meals')} 
              className="block w-full text-left py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Quick Meals
            </button>
            <button 
              onClick={() => handleNavigation('/custom-plan')} 
              className="block w-full text-left py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Custom Plan
            </button>
            <button 
              onClick={() => handleNavigation('/progress')} 
              className="block w-full text-left py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Progress
            </button>
            <button 
              onClick={() => handleNavigation('/community')} 
              className="block w-full text-left py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Community
            </button>
            {!user && (
              <>
                <button 
                  onClick={() => handleNavigation('/auth')} 
                  className="block w-full text-left py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Sign In
                </button>
                <Button 
                  className="w-full mt-2 bg-gradient-to-r from-keto-green to-keto-green-dark hover:opacity-90 transition-opacity" 
                  onClick={() => handleNavigation('/auth')}
                >
                  Get Started
                </Button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;