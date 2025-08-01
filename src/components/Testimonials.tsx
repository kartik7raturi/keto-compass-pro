import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Quote } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      age: 32,
      image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      role: "Working Mom",
      weightLoss: "35 lbs",
      timeframe: "6 months",
      testimonial: "This app made keto tracking so simple! I lost 35 pounds while juggling work and kids. The recipe suggestions saved my meal planning time.",
      rating: 5
    },
    {
      name: "Mike Rodriguez",
      age: 45,
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      role: "Business Executive",
      weightLoss: "28 lbs", 
      timeframe: "4 months",
      testimonial: "Finally found an app that fits my busy lifestyle. The macro tracking is seamless and the community support kept me motivated throughout my journey.",
      rating: 5
    },
    {
      name: "Emma Wilson", 
      age: 29,
      image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      role: "Fitness Enthusiast",
      weightLoss: "22 lbs",
      timeframe: "3 months", 
      testimonial: "The detailed macro breakdown and progress tracking features are amazing. I've never felt more in control of my health and nutrition goals.",
      rating: 5
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-background to-muted/20">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Real Stories, Real Results
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands who have transformed their lives with our keto tracking platform
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="relative overflow-hidden group hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="absolute top-4 right-4 text-muted-foreground/20">
                  <Quote className="h-8 w-8" />
                </div>
                
                <div className="flex items-center gap-4 mb-4">
                  <img 
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}, {testimonial.age}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mb-4">
                  <Badge variant="secondary" className="bg-keto-green-light text-keto-green">
                    -{testimonial.weightLoss}
                  </Badge>
                  <Badge variant="outline">
                    {testimonial.timeframe}
                  </Badge>
                </div>

                <p className="text-muted-foreground leading-relaxed">
                  "{testimonial.testimonial}"
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;