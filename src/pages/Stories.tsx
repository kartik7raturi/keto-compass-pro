import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const Stories = () => {
  const stories = [
    {
      name: "Sarah Johnson",
      weightLoss: "45 lbs",
      timeframe: "8 months",
      story: "Starting keto changed my life completely. I lost 45 pounds and gained so much energy!",
      initials: "SJ"
    },
    {
      name: "Mike Chen",
      weightLoss: "60 lbs",
      timeframe: "1 year",
      story: "The keto lifestyle helped me reverse my pre-diabetes and feel amazing every day.",
      initials: "MC"
    },
    {
      name: "Emily Rodriguez",
      weightLoss: "35 lbs",
      timeframe: "6 months",
      story: "I never thought I could stick to a diet, but keto made it so sustainable and enjoyable.",
      initials: "ER"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Success Stories</h1>
          <p className="text-xl text-muted-foreground">Real transformations from our keto community</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story, index) => (
            <Card key={index} className="h-full">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback>{story.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{story.name}</CardTitle>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="secondary">{story.weightLoss} lost</Badge>
                      <Badge variant="outline">{story.timeframe}</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground italic">"{story.story}"</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Share Your Story</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Have you achieved success with keto? We'd love to hear about your transformation 
                and inspire others in our community.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Stories;