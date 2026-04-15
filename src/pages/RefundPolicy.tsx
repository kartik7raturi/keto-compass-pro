import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Shield, Check, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Return & Refund Policy</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We stand behind our products with a 60-day money back guarantee.
          </p>
        </div>

        <div className="space-y-8">
          {/* 60-Day Guarantee */}
          <Card className="border-primary/20">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                60-Day Money Back Guarantee
              </h2>
              <p className="text-muted-foreground mb-4">
                We offer a <strong>60-day money back guarantee</strong> on all plans purchased through our platform. 
                If you are not satisfied with your purchase for any reason, you may request a full refund within 
                60 days of your purchase date.
              </p>
              <p className="text-muted-foreground">
                To request a refund, please contact our support team at{' '}
                <a href="/contact" className="text-primary hover:underline">our contact page</a> or 
                through the Digistore24 platform where your purchase was processed.
              </p>
            </CardContent>
          </Card>

          {/* What's Included */}
          <Card>
            <CardContent className="p-6 md:p-8">
              <h2 className="text-xl font-bold mb-4">What Our Plans Include</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  '1000+ Keto Recipes',
                  'Daily Food & Macro Tracker',
                  'Progress Dashboard',
                  'Community Access',
                  'Recipe Favorites & Reviews',
                  'Weekly Meal Planner (VIP)',
                  'Workout & Fasting Trackers (VIP)',
                  'Advanced Analytics (VIP)',
                  'Custom Meal Plans (VIP)',
                  'Challenges & Leaderboards (VIP)',
                ].map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                Important Disclaimers
              </h2>
              <div className="space-y-4 text-sm text-muted-foreground">
                <p>
                  <strong>Results Disclaimer:</strong> Individual results vary significantly based on effort, consistency, 
                  adherence to dietary plans, physical activity, health conditions, and other factors. 
                  Ketopia does not guarantee any specific health outcomes, weight loss results, or dietary success. 
                  The information provided through our platform is for educational and informational purposes only.
                </p>
                <p>
                  <strong>Recipe & Nutrition Disclaimer:</strong> All recipes, meal plans, nutritional information, and dietary 
                  suggestions provided on this platform are for general informational purposes only. Ketopia and its administrators 
                  do not guarantee the accuracy, completeness, or suitability of any recipe, ingredient list, calorie count, 
                  or nutritional value. Users are solely responsible for verifying ingredients for allergens, dietary restrictions, 
                  and personal health requirements. Always consult with a qualified healthcare professional or registered 
                  dietitian before making significant changes to your diet.
                </p>
                <p>
                  <strong>Medical Disclaimer:</strong> The content on Ketopia is not intended to be a substitute for professional 
                  medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health 
                  provider with any questions you may have regarding a medical condition. Never disregard professional medical 
                  advice or delay in seeking it because of something you have read on this platform.
                </p>
                <p>
                  <strong>No Liability:</strong> Ketopia, its owners, administrators, and affiliates shall not be held liable 
                  for any damages, injuries, health issues, or losses arising from the use of recipes, meal plans, workout 
                  routines, supplements, or any other content provided on this platform. Users engage with all content at their 
                  own risk and discretion.
                </p>
                <p>
                  <strong>Supplement Disclaimer:</strong> Any supplements promoted or sold through this platform have not been 
                  evaluated by the Food and Drug Administration (FDA). These products are not intended to diagnose, treat, cure, 
                  or prevent any disease. Consult your healthcare provider before taking any supplements.
                </p>
                <p>
                  <strong>Earnings Disclaimer:</strong> These earnings are not representative of every participant's experience. 
                  The average participant will earn significantly less or no money at all through this product or service. 
                  This product does not guarantee income or specific financial outcomes.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* How to Request */}
          <Card>
            <CardContent className="p-6 md:p-8">
              <h2 className="text-xl font-bold mb-4">How to Request a Refund</h2>
              <ol className="space-y-3 text-sm text-muted-foreground list-decimal list-inside">
                <li>Contact our support team through the <a href="/contact" className="text-primary hover:underline">Contact page</a> or via email.</li>
                <li>Include your order number and the email address used for purchase.</li>
                <li>Briefly describe why you'd like a refund (optional but helpful).</li>
                <li>Refunds are processed within 5-10 business days through the original payment method (Digistore24).</li>
              </ol>
              <p className="text-xs text-muted-foreground mt-4">
                Last updated: April 2026
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RefundPolicy;
