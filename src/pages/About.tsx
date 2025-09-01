import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Users, Heart, Award } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">About Ketopia</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We're passionate about helping people achieve their health goals through the ketogenic lifestyle
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <Target className="h-8 w-8 text-keto-green mb-2" />
              <CardTitle>Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                To provide the most comprehensive and user-friendly platform for anyone starting or maintaining 
                a ketogenic lifestyle. We believe that with the right tools and support, everyone can achieve 
                their health and wellness goals.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-keto-green mb-2" />
              <CardTitle>Our Community</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We've built a supportive community of over 100,000 keto enthusiasts who share recipes, 
                tips, and celebrate each other's successes. Join us and never feel alone on your journey.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-center">Our Story</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6 max-w-3xl mx-auto">
              Ketopia was founded in 2020 by a team of health enthusiasts who struggled to find 
              a comprehensive tool for tracking their ketogenic journey. After experiencing the life-changing 
              benefits of keto themselves, they wanted to create a platform that would make the diet accessible 
              and sustainable for everyone.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-keto-green mb-1">100K+</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-keto-green mb-1">50K+</div>
                <div className="text-sm text-muted-foreground">Success Stories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-keto-green mb-1">1000+</div>
                <div className="text-sm text-muted-foreground">Keto Recipes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-keto-green mb-1">24/7</div>
                <div className="text-sm text-muted-foreground">Support</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <Heart className="h-8 w-8 text-keto-green mb-2" />
              <CardTitle>Our Values</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Evidence-based approach to nutrition</li>
                <li>• Supportive and inclusive community</li>
                <li>• Continuous improvement and innovation</li>
                <li>• Privacy and data security</li>
                <li>• Accessibility for all users</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Award className="h-8 w-8 text-keto-green mb-2" />
              <CardTitle>Recognition</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">2024</Badge>
                <span className="text-sm">Best Health App - Digital Health Awards</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">2023</Badge>
                <span className="text-sm">Top Nutrition Tracker - App Store</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">2022</Badge>
                <span className="text-sm">Innovation in Wellness - TechCrunch</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;