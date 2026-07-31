import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-secondary/50 pt-16 pb-8">
      <div className="container px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-keto-green to-keto-yellow flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-keto-green to-keto-yellow bg-clip-text text-transparent">
                Ketopia
              </span>
            </div>
            <p className="text-muted-foreground mb-4 text-sm">
              Your complete companion for a successful keto journey. Track, learn, and thrive with our community.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" asChild>
                <a href="mailto:sankhobusiness@gmail.com" aria-label="Email Ketopia">
                  <Mail className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Features</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/tracker" className="hover:text-keto-green transition-colors">Macro Tracker</Link></li>
              <li><Link to="/recipes" className="hover:text-keto-green transition-colors">Recipe Library</Link></li>
              <li><Link to="/progress" className="hover:text-keto-green transition-colors">Progress Dashboard</Link></li>
              <li><Link to="/tracker/weekly-plan" className="hover:text-keto-green transition-colors">Meal Planner</Link></li>
              <li><Link to="/marketplace" className="hover:text-keto-green transition-colors">Marketplace</Link></li>
              <li><Link to="/community" className="hover:text-keto-green transition-colors">Community</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/guide" className="hover:text-keto-green transition-colors">Keto Guide</Link></li>
              <li><Link to="/blog" className="hover:text-keto-green transition-colors">Blog</Link></li>
              <li><Link to="/stories" className="hover:text-keto-green transition-colors">Success Stories</Link></li>
              <li><Link to="/pricing" className="hover:text-keto-green transition-colors">Pricing</Link></li>
              <li><Link to="/vip-upgrade" className="hover:text-keto-green transition-colors">VIP Upgrade</Link></li>
              <li><Link to="/ketopia-plr" className="hover:text-keto-green transition-colors">Ketopia PLR</Link></li>
              <li><Link to="/shop" className="hover:text-keto-green transition-colors">Shop</Link></li>
              <li><Link to="/faq" className="hover:text-keto-green transition-colors">FAQ</Link></li>
              <li><Link to="/support" className="hover:text-keto-green transition-colors">Support</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-keto-green transition-colors">About Us</Link></li>
              <li><Link to="/careers" className="hover:text-keto-green transition-colors">Careers</Link></li>
              <li><Link to="/privacy" className="hover:text-keto-green transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-keto-green transition-colors">Terms of Service</Link></li>
              <li><Link to="/refund-policy" className="hover:text-keto-green transition-colors">Return & Refund Policy</Link></li>
              <li><Link to="/imprint" className="hover:text-keto-green transition-colors">Imprint</Link></li>
              <li><Link to="/contact" className="hover:text-keto-green transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t pt-8">
          <p className="text-xs text-muted-foreground text-center mb-4">
            These earnings are not representative of every participant's experience. Individual results may vary based on effort, consistency, and other factors. This product does not guarantee income or specific health outcomes.
          </p>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2026 Ketopia. All rights reserved.
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
