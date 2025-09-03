import { Badge } from "@/components/ui/badge";
import { Shield, Award, CheckCircle, Star, Users, Heart } from "lucide-react";

const HealthBadges = () => {
  const badges = [
    {
      icon: Shield,
      title: "FDA Compliant",
      description: "Meets all FDA guidelines for health tracking applications"
    },
    {
      icon: Award,
      title: "Certified Nutritionist Approved",
      description: "Reviewed and approved by certified nutrition professionals"
    },
    {
      icon: CheckCircle,
      title: "Evidence-Based Approach",
      description: "All recommendations based on peer-reviewed research"
    },
    {
      icon: Star,
      title: "5-Star Rated",
      description: "Highest rated keto app with 50K+ positive reviews"
    },
    {
      icon: Users,
      title: "Trusted by 100K+ Users",
      description: "Join a community of successful keto practitioners"
    },
    {
      icon: Heart,
      title: "Wellness Focused",
      description: "Promoting sustainable health and wellness practices"
    }
  ];

  return (
    <section className="py-16 bg-primary/5">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-2xl lg:text-3xl font-bold mb-3">
            Trusted & Certified Platform
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Your health and success are our priority. That's why we maintain the highest standards of quality and compliance.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {badges.map((badge, index) => (
            <div key={index} className="text-center group">
              <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-300 mb-3">
                <badge.icon className="h-8 w-8 mx-auto text-primary mb-2" />
                <Badge variant="secondary" className="text-xs font-medium">
                  {badge.title}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-tight px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {badge.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-6 bg-white rounded-full px-8 py-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">Secure & Private</span>
            </div>
            <div className="h-4 w-px bg-gray-200"></div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium">Scientifically Backed</span>
            </div>
            <div className="h-4 w-px bg-gray-200"></div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium">Award Winning</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HealthBadges;