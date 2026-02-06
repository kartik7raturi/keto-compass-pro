import { useState, useRef, useEffect } from "react";
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
import { Camera, Upload, User, Edit, Trophy, Star, Users, FileText, Award, MessageCircle, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { usePointsSystem } from "@/hooks/usePointsSystem";
import { DietModeSelector } from "@/components/DietModeSelector";
import ProfileBadges from "@/components/ProfileBadges";

interface ProfileStats {
  followerCount: number;
  followingCount: number;
  postsCount: number;
  badgesCount: number;
  recipesCount: number;
}

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { userProgress } = usePointsSystem();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [displayName, setDisplayName] = useState(user?.user_metadata?.display_name || "");
  const [stats, setStats] = useState<ProfileStats>({
    followerCount: 0,
    followingCount: 0,
    postsCount: 0,
    badgesCount: 0,
    recipesCount: 0
  });

  // Fetch profile data on mount
  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchProfileStats();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('avatar_url, display_name')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (data) {
        setAvatarUrl(data.avatar_url || "");
        setDisplayName(data.display_name || user?.email?.split('@')[0] || "");
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchProfileStats = async () => {
    if (!user) return;
    
    try {
      // Fetch all stats in parallel
      const [followersRes, followingRes, postsRes, badgesRes, recipesRes] = await Promise.all([
        supabase.from('user_follows').select('id', { count: 'exact', head: true }).eq('following_id', user.id),
        supabase.from('user_follows').select('id', { count: 'exact', head: true }).eq('follower_id', user.id),
        supabase.from('community_posts').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('user_badges').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('user_recipes').select('id', { count: 'exact', head: true }).eq('user_id', user.id)
      ]);

      setStats({
        followerCount: followersRes.count || 0,
        followingCount: followingRes.count || 0,
        postsCount: postsRes.count || 0,
        badgesCount: badgesRes.count || 0,
        recipesCount: recipesRes.count || 0
      });
    } catch (error) {
      console.error('Error fetching profile stats:', error);
    }
  };

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
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user?.id,
          avatar_url: publicUrl,
          display_name: displayName || user?.email?.split('@')[0],
          email: user?.email
        }, {
          onConflict: 'user_id'
        });

      if (profileError) throw profileError;

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
    if (!displayName.trim()) {
      toast({
        variant: "destructive",
        title: "Invalid name",
        description: "Display name cannot be empty",
      });
      return;
    }

    try {
      // Update profile table with email to ensure row exists
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user?.id,
          display_name: displayName.trim(),
          email: user?.email
        }, {
          onConflict: 'user_id'
        });

      if (profileError) throw profileError;

      // Update auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { display_name: displayName.trim() }
      });

      if (authError) throw authError;

      toast({
        title: "Name updated!",
        description: "Your display name has been updated successfully.",
      });

      // Refresh profile data
      await fetchProfile();
    } catch (error: any) {
      console.error('Profile update error:', error);
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

                  {/* Diet Mode Selection */}
                  <DietModeSelector />

                  <Separator />

                  {/* Transformation Photos */}
                  <div className="space-y-3">
                    <Label>Progress Photos</Label>
                    <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                      <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h4 className="font-semibold mb-2">Upload Your Transformation Photos</h4>
                      <p className="text-muted-foreground text-sm mb-4">
                        Share your progress with the community and inspire others on their diet journey
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
              {/* Social Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Activity Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold">{stats.followerCount}</div>
                      <div className="text-xs text-muted-foreground">Followers</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold">{stats.followingCount}</div>
                      <div className="text-xs text-muted-foreground">Following</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold">{stats.postsCount}</div>
                      <div className="text-xs text-muted-foreground">Posts</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold">{stats.recipesCount}</div>
                      <div className="text-xs text-muted-foreground">Recipes</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

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
                    <div className="flex justify-between items-center">
                      <span className="text-sm flex items-center gap-2">
                        <Award className="h-4 w-4 text-yellow-500" />
                        Badges Earned
                      </span>
                      <Badge variant="secondary">{stats.badgesCount}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <ProfileBadges />

              {/* 24/7 Chat Support Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    Support
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Need help? Our support team is available 24/7 to assist you.
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.location.href = '/contact'}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    24/7 Chat Support
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full"
                    onClick={() => window.location.href = '/support'}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Help Center
                  </Button>
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