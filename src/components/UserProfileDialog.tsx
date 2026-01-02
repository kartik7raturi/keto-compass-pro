import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Trophy, Award, MessageSquare, Star, Target, Flame,
  Timer, Dumbbell, Droplet, Crown, Medal
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useNavigate } from 'react-router-dom';

interface UserProfileDialogProps {
  open: boolean;
  onClose: () => void;
  userId: string;
}

interface UserProfile {
  display_name: string;
  avatar_url: string | null;
}

interface UserBadge {
  id: string;
  badge_id: string;
  earned_at: string;
  badges: {
    name: string;
    icon: string;
    badge_type: string;
    description: string;
  };
}

interface UserPost {
  id: string;
  content: string;
  created_at: string;
  likes_count: number;
}

const iconMap: Record<string, React.ReactNode> = {
  award: <Award className="h-5 w-5" />,
  crown: <Crown className="h-5 w-5" />,
  star: <Star className="h-5 w-5" />,
  flame: <Flame className="h-5 w-5" />,
  timer: <Timer className="h-5 w-5" />,
  dumbbell: <Dumbbell className="h-5 w-5" />,
  droplet: <Droplet className="h-5 w-5" />,
  medal: <Medal className="h-5 w-5" />,
  target: <Target className="h-5 w-5" />,
};

export const UserProfileDialog = ({ open, onClose, userId }: UserProfileDialogProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [progress, setProgress] = useState<{ total_points: number; current_level: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && userId) {
      fetchUserData();
    }
  }, [open, userId]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('user_id', userId)
        .maybeSingle();
      setProfile(profileData);

      // Fetch badges
      const { data: badgesData } = await supabase
        .from('user_badges')
        .select('*, badges(*)')
        .eq('user_id', userId);
      setBadges(badgesData as unknown as UserBadge[] || []);

      // Fetch progress
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('total_points, current_level')
        .eq('user_id', userId)
        .maybeSingle();
      setProgress(progressData);

      // Fetch recent posts
      const { data: postsData } = await supabase
        .from('challenge_posts')
        .select('id, content, created_at, likes_count')
        .eq('user_id', userId)
        .eq('is_flagged', false)
        .order('created_at', { ascending: false })
        .limit(10);
      setPosts(postsData || []);

    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startChat = () => {
    onClose();
    navigate(`/messages?user=${userId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Loading...</div>
        ) : (
          <div className="space-y-4">
            {/* Profile Header */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="text-lg">
                  {profile?.display_name?.[0] || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-bold text-lg">{profile?.display_name || 'User'}</h3>
                {progress && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Trophy className="h-3 w-3" />
                      Level {progress.current_level}
                    </Badge>
                    <span>{progress.total_points} points</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {user && user.id !== userId && (
              <Button onClick={startChat} className="w-full">
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            )}

            {/* Tabs */}
            <Tabs defaultValue="badges">
              <TabsList className="w-full">
                <TabsTrigger value="badges" className="flex-1">
                  Badges ({badges.length})
                </TabsTrigger>
                <TabsTrigger value="posts" className="flex-1">
                  Posts ({posts.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="badges">
                <ScrollArea className="h-[200px]">
                  {badges.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No badges earned yet
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {badges.map((ub) => (
                        <div 
                          key={ub.id} 
                          className="p-2 bg-muted/50 rounded-lg flex flex-col items-center text-center"
                          title={ub.badges?.description}
                        >
                          <div className="p-2 bg-primary/10 rounded-full text-primary">
                            {iconMap[ub.badges?.icon] || <Award className="h-5 w-5" />}
                          </div>
                          <span className="text-xs mt-1 line-clamp-1">
                            {ub.badges?.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="posts">
                <ScrollArea className="h-[200px]">
                  {posts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No posts yet
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {posts.map((post) => (
                        <Card key={post.id}>
                          <CardContent className="p-3">
                            <p className="text-sm line-clamp-2">{post.content}</p>
                            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                              <span>{formatDate(post.created_at)}</span>
                              <span>{post.likes_count} likes</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
