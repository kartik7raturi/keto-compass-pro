import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, DollarSign } from "lucide-react";

const Careers = () => {
  const openings = [
    {
      title: "Senior React Developer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      salary: "$120K - $150K",
      description: "Join our frontend team to build beautiful, responsive user interfaces for our keto tracking platform."
    },
    {
      title: "Nutritionist & Content Creator",
      department: "Content",
      location: "San Francisco, CA",
      type: "Full-time",
      salary: "$80K - $100K",
      description: "Create evidence-based keto content and recipes to help our community succeed on their journey."
    },
    {
      title: "Product Marketing Manager",
      department: "Marketing",
      location: "Remote",
      type: "Full-time",
      salary: "$90K - $120K",
      description: "Drive product adoption and user engagement through strategic marketing campaigns and partnerships."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Join Our Team</h1>
          <p className="text-xl text-muted-foreground">Help us revolutionize the way people approach ketogenic living</p>
        </div>

        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-center">Why Work With Us?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <h3 className="font-semibold mb-2">Make an Impact</h3>
                <p className="text-sm text-muted-foreground">
                  Help millions of people transform their health and achieve their wellness goals
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Remote-First</h3>
                <p className="text-sm text-muted-foreground">
                  Work from anywhere with flexible hours and a strong work-life balance
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Growth Opportunities</h3>
                <p className="text-sm text-muted-foreground">
                  Continuous learning, mentorship, and career advancement in a fast-growing company
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Open Positions</h2>
          <div className="space-y-6">
            {openings.map((job, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl">{job.title}</CardTitle>
                      <CardDescription>{job.description}</CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{job.department}</Badge>
                      <Badge variant="outline">{job.type}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {job.type}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {job.salary}
                      </div>
                    </div>
                    <Button>Apply Now</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Don't See Your Role?</CardTitle>
            <CardDescription>We're always looking for talented individuals to join our team</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Even if we don't have an opening that matches your skills right now, we'd love to hear from you. 
              Send us your resume and tell us how you'd like to contribute to our mission.
            </p>
            <Button variant="outline">Send Resume</Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Careers;