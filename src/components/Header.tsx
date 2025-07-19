import { Button } from "@/components/ui/button";
import { Menu, User, LogOut } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => console.log('Mobile menu clicked')}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-keto-green to-keto-green-dark flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-keto-green to-keto-green-dark bg-clip-text text-transparent">
              Keto Compass Pro
            </span>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <button onClick={() => navigate('/')} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Home
          </button>
          <a href="#tracker" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Tracker
          </a>
          <a href="#recipes" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Recipes
          </a>
          <a href="#progress" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Progress
          </a>
          <button onClick={() => navigate('/community')} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Community
          </button>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
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
    </header>
  );
};

export default Header;