import { Button } from "@/components/ui/button";
import { Menu, User } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => console.log('Mobile menu clicked')}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-keto-green to-keto-yellow flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-keto-green to-keto-yellow bg-clip-text text-transparent">
              Keto Compass Pro
            </span>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <a href="#tracker" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Tracker
          </a>
          <a href="#recipes" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Recipes
          </a>
          <a href="#progress" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Progress
          </a>
          <a href="#community" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Community
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => console.log('Sign In clicked')}>
            Sign In
          </Button>
          <Button size="sm" className="bg-gradient-to-r from-keto-green to-keto-yellow hover:opacity-90 transition-opacity" onClick={() => console.log('Get Started clicked')}>
            Get Started
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;