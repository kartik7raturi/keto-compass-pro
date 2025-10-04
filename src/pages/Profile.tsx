import { useState, useRef } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Camera, Upload, User, Edit, Trophy, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { usePointsSystem } from "@/hooks/usePointsSystem";

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { userProgress } = usePointsSystem();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [displayName, setDisplayName] = useState(user?.user_metadata?.display_name || "");

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadAvatar(file);
    }
  };

  const uploadAvatar = async (file: File) => {
    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/avatar.${fileExt}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('community-media')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('community-media')
        .getPublicUrl(fileName);

      const publicUrl = data.publicUrl;
      setAvatarUrl(publicUrl);

      // Update user profile
      await supabase
        .from('profiles')
        .upsert({
          user_id: user?.id,
          avatar_url: publicUrl,
          display_name: displayName || user?.email?.split('@')[0]
        });

      toast({
        title: "Profile updated!",
        description: "Your profile picture has been uploaded successfully.",
      });

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleNameUpdate = async () => {
    try {
      // Update profile table
      await supabase
        .from('profiles')
        .upsert({
          user_id: user?.id,
          display_name: displayName,
          email: user?.email
        });

      // Update auth metadata
      await supabase.auth.updateUser({
        data: { display_name: displayName }
      });

      toast({
        title: "Name updated!",
        description: "Your display name has been updated successfully.",
      });

      // Reload to reflect changes
      window.location.reload();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">My Profile</h1>
            <p className="text-xl text-muted-foreground">Manage your account settings and track your progress</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Profile Settings */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <Avatar className="h-24 w-24">
                        <AvatarImage 
                          src={avatarUrl || user?.user_metadata?.avatar_url} 
                          alt={displayName || "Profile picture"} 
                        />
                        <AvatarFallback className="text-lg">
                          {displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{displayName || "Set your name"}</h3>
                      <p className="text-muted-foreground mb-3">{user?.email}</p>
                      <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                        <Upload className="h-4 w-4 mr-2" />
                        {uploading ? "Uploading..." : "Change Photo"}
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Name Update */}
                  <div className="space-y-3">
                    <Label htmlFor="displayName">Display Name</Label>
                    <div className="flex gap-2">
                      <Input
                        id="displayName"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Enter your display name"
                      />
                      <Button onClick={handleNameUpdate} variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Update
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Transformation Photos */}
                  <div className="space-y-3">
                    <Label>Progress Photos</Label>
                    <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                      <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h4 className="font-semibold mb-2">Upload Your Transformation Photos</h4>
                      <p className="text-muted-foreground text-sm mb-4">
                        Share your progress with the community and inspire others on their keto journey
                      </p>
                      <Button variant="outline">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Photos
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Progress Stats */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    Your Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-1">
                      Level {userProgress?.current_level || 1}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {userProgress?.total_points || 0} Total Points
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Current Streak</span>
                      <Badge variant="secondary">7 days</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Total Workouts</span>
                      <Badge variant="secondary">23</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Meals Logged</span>
                      <Badge variant="secondary">156</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl mb-1">🏆</div>
                      <div className="text-xs font-medium">First Week</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl mb-1">💪</div>
                      <div className="text-xs font-medium">10 Workouts</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl mb-1">🥑</div>
                      <div className="text-xs font-medium">Keto Master</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;