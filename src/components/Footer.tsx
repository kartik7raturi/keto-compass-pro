import { Button } from "@/components/ui/button";
import { Mail, Twitter, Instagram, Facebook } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-secondary/50 pt-16 pb-8">
      <div className="container">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-keto-green to-keto-yellow flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-keto-green to-keto-yellow bg-clip-text text-transparent">
                Ketopia
              </span>
            </div>
            <p className="text-muted-foreground mb-4">
              Your complete companion for a successful keto journey. Track, learn, and thrive with our community.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => console.log('Twitter clicked')}>
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => console.log('Instagram clicked')}>
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => console.log('Facebook clicked')}>
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => console.log('Email clicked')}>
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Features</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/tracker" className="hover:text-keto-green transition-colors">Macro Tracker</a></li>
              <li><a href="/recipes" className="hover:text-keto-green transition-colors">Recipe Library</a></li>
              <li><a href="/progress" className="hover:text-keto-green transition-colors">Progress Dashboard</a></li>
              <li><a href="/planner" className="hover:text-keto-green transition-colors">Meal Planner</a></li>
              <li><a href="/community" className="hover:text-keto-green transition-colors">Community</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/guide" className="hover:text-keto-green transition-colors">Keto Guide</a></li>
              <li><a href="/blog" className="hover:text-keto-green transition-colors">Blog</a></li>
              <li><a href="/stories" className="hover:text-keto-green transition-colors">Success Stories</a></li>
              <li><a href="/faq" className="hover:text-keto-green transition-colors">FAQ</a></li>
              <li><a href="/support" className="hover:text-keto-green transition-colors">Support</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/about" className="hover:text-keto-green transition-colors">About Us</a></li>
              <li><a href="/careers" className="hover:text-keto-green transition-colors">Careers</a></li>
              <li><a href="/privacy" className="hover:text-keto-green transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-keto-green transition-colors">Terms of Service</a></li>
              <li><a href="/contact" className="hover:text-keto-green transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 Ketopia. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Made with ❤️ for the keto community</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;