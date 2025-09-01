import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MessageCircle, Phone, Clock } from "lucide-react";

const Support = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Support Center</h1>
          <p className="text-xl text-muted-foreground">We're here to help you succeed on your keto journey</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <Mail className="h-8 w-8 text-keto-green mb-2" />
              <CardTitle>Email Support</CardTitle>
              <CardDescription>Get detailed help via email</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">support@ketopia.com</p>
              <p className="text-xs text-muted-foreground">Response within 24 hours</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <MessageCircle className="h-8 w-8 text-keto-green mb-2" />
              <CardTitle>Live Chat</CardTitle>
              <CardDescription>Chat with our support team</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">Start Chat</Button>
              <p className="text-xs text-muted-foreground mt-2">Available 9 AM - 6 PM EST</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Phone className="h-8 w-8 text-keto-green mb-2" />
              <CardTitle>Phone Support</CardTitle>
              <CardDescription>Speak directly with our team</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">1-800-KETOPIA</p>
              <p className="text-xs text-muted-foreground">Mon-Fri 9 AM - 6 PM EST</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Contact Form</CardTitle>
              <CardDescription>Send us a message and we'll get back to you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="First Name" />
                <Input placeholder="Last Name" />
              </div>
              <Input placeholder="Email Address" type="email" />
              <Input placeholder="Subject" />
              <Textarea placeholder="How can we help you?" rows={4} />
              <Button className="w-full">Send Message</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Common Issues</CardTitle>
              <CardDescription>Quick solutions to frequent questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="border-l-4 border-keto-green pl-4">
                  <h4 className="font-semibold">Account Access</h4>
                  <p className="text-sm text-muted-foreground">Having trouble logging in? Try resetting your password.</p>
                </div>
                <div className="border-l-4 border-keto-green pl-4">
                  <h4 className="font-semibold">Tracking Issues</h4>
                  <p className="text-sm text-muted-foreground">Data not syncing? Check your internet connection and try refreshing.</p>
                </div>
                <div className="border-l-4 border-keto-green pl-4">
                  <h4 className="font-semibold">Recipe Problems</h4>
                  <p className="text-sm text-muted-foreground">Can't find a recipe? Use our search function or browse by category.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Support;