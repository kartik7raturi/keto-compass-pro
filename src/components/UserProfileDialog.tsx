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
  Timer, Dumbbell, Droplet, Crown, Medal, UserPlus, UserCheck,
  ChefHat, ThumbsUp, Footprints, Hourglass, Sword, Leaf, Users, Circle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { CommunityGuidelines } from './CommunityGuidelines';
import { useOnlinePresence } from '@/hooks/useOnlinePresence';

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

interface UserRecipe {
  id: string;
  title: string;
  upvotes: number;
  is_approved: boolean;
  created_at: string;
}

interface UserProgress {
  total_points: number;
  current_level: number;
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
  footprints: <Footprints className="h-5 w-5" />,
  hourglass: <Hourglass className="h-5 w-5" />,
  sword: <Sword className="h-5 w-5" />,
  leaf: <Leaf className="h-5 w-5" />,
  users: <Users className="h-5 w-5" />,
};

export const UserProfileDialog = ({ open, onClose, userId }: UserProfileDialogProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isOnline } = useOnlinePresence();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [recipes, setRecipes] = useState<UserRecipe[]>([]);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [rank, setRank] = useState<number | null>(null);
  const [challengesCompleted, setChallengesCompleted] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);
  
  const userIsOnline = isOnline(userId);

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
        .from('public_profiles')
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

      // Calculate global rank
      if (progressData) {
        const { count } = await supabase
          .from('user_progress')
          .select('*', { count: 'exact', head: true })
          .gt('total_points', progressData.total_points);
        setRank((count || 0) + 1);
      }

      // Fetch completed challenges count
      const { count: challengeCount } = await supabase
        .from('user_challenges')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_completed', true);
      setChallengesCompleted(challengeCount || 0);

      // Fetch user recipes
      const { data: recipesData } = await supabase
        .from('user_recipes')
        .select('id, title, upvotes, is_approved, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);
      setRecipes(recipesData || []);

      // Fetch recent posts (both community and challenge posts)
      const { data: communityPosts } = await supabase
        .from('community_posts')
        .select('id, content, created_at, likes_count')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);
      
      const { data: challengePosts } = await supabase
        .from('challenge_posts')
        .select('id, content, created_at, likes_count')
        .eq('user_id', userId)
        .eq('is_flagged', false)
        .order('created_at', { ascending: false })
        .limit(5);
      
      // Combine and sort posts
      const allPosts = [...(communityPosts || []), ...(challengePosts || [])]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);
      setPosts(allPosts);

      // Fetch follower/following counts
      const { count: followers } = await supabase
        .from('user_follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId);
      setFollowerCount(followers || 0);

      const { count: following } = await supabase
        .from('user_follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId);
      setFollowingCount(following || 0);

      // Check if current user is following this user
      if (user && user.id !== userId) {
        const { data: followData } = await supabase
          .from('user_follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', userId)
          .maybeSingle();
        setIsFollowing(!!followData);
      }

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

  const handleFollow = async () => {
    if (!user || followLoading) return;
    
    setFollowLoading(true);
    try {
      if (isFollowing) {
        // Unfollow
        await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', userId);
        
        setIsFollowing(false);
        setFollowerCount(prev => Math.max(0, prev - 1));
        toast({
          title: 'Unfollowed',
          description: `You unfollowed ${profile?.display_name}`,
        });
      } else {
        // Follow
        await supabase
          .from('user_follows')
          .insert({ follower_id: user.id, following_id: userId });
        
        setIsFollowing(true);
        setFollowerCount(prev => prev + 1);
        toast({
          title: 'Following!',
          description: `You are now following ${profile?.display_name}`,
        });
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast({
        title: 'Error',
        description: 'Could not update follow status',
        variant: 'destructive',
      });
    } finally {
      setFollowLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getRankIcon = (rankNum: number) => {
    if (rankNum === 1) return <Crown className="h-4 w-4 text-yellow-500" />;
    if (rankNum === 2) return <Medal className="h-4 w-4 text-gray-400" />;
    if (rankNum === 3) return <Medal className="h-4 w-4 text-amber-600" />;
    return <Trophy className="h-4 w-4 text-primary" />;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Loading...</div>
          ) : !profile ? (
            <div className="py-8 text-center text-muted-foreground">Profile not found</div>
          ) : (
            <div className="space-y-4 overflow-y-auto flex-1">
              {/* Profile Header */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-20 w-20 border-2 border-primary">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="text-2xl">
                      {profile?.display_name?.[0] || '?'}
                    </AvatarFallback>
                  </Avatar>
                  {/* Online Status Indicator */}
                  <div className={`absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-background ${userIsOnline ? 'bg-green-500' : 'bg-muted-foreground'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-xl">{profile?.display_name || 'User'}</h3>
                    <Badge variant={userIsOnline ? "default" : "secondary"} className={`text-xs ${userIsOnline ? 'bg-green-500 hover:bg-green-600' : ''}`}>
                      {userIsOnline ? 'Online' : 'Offline'}
                    </Badge>
                  </div>
                  
                  {/* Stats Row */}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {rank && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        {getRankIcon(rank)}
                        Rank #{rank}
                      </Badge>
                    )}
                    {progress && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Trophy className="h-3 w-3" />
                        Level {progress.current_level}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Points & Challenges */}
                  <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                    {progress && <span>{progress.total_points} points</span>}
                    <span>{challengesCompleted} challenges</span>
                  </div>
                  
                  {/* Follower/Following counts */}
                  <div className="flex gap-4 mt-1 text-sm">
                    <span><strong>{followerCount}</strong> followers</span>
                    <span><strong>{followingCount}</strong> following</span>
                  </div>
                </div>
              </div>

              {/* Achievements Summary */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-muted/50 rounded-lg">
                  <Award className="h-5 w-5 mx-auto text-primary" />
                  <div className="font-bold">{badges.length}</div>
                  <div className="text-xs text-muted-foreground">Badges</div>
                </div>
                <div className="p-2 bg-muted/50 rounded-lg">
                  <ChefHat className="h-5 w-5 mx-auto text-primary" />
                  <div className="font-bold">{recipes.length}</div>
                  <div className="text-xs text-muted-foreground">Recipes</div>
                </div>
                <div className="p-2 bg-muted/50 rounded-lg">
                  <MessageSquare className="h-5 w-5 mx-auto text-primary" />
                  <div className="font-bold">{posts.length}</div>
                  <div className="text-xs text-muted-foreground">Posts</div>
                </div>
              </div>

              {/* Action Buttons */}
              {user && user.id !== userId && (
                <div className="flex gap-2">
                  <Button onClick={handleFollow} variant="outline" className="flex-1">
                    {isFollowing ? (
                      <>
                        <UserCheck className="h-4 w-4 mr-2" />
                        Following
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Follow
                      </>
                    )}
                  </Button>
                  <Button onClick={startChat} className="flex-1">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                </div>
              )}

              {/* Community Guidelines Link */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-muted-foreground"
                onClick={() => setShowGuidelines(true)}
              >
                View Community Guidelines
              </Button>

              {/* Tabs */}
              <Tabs defaultValue="badges" className="flex-1">
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="badges">
                    Badges
                  </TabsTrigger>
                  <TabsTrigger value="recipes">
                    Recipes
                  </TabsTrigger>
                  <TabsTrigger value="posts">
                    Posts
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="badges">
                  <ScrollArea className="h-[180px]">
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
                            <span className="text-xs mt-1 line-clamp-2">
                              {ub.badges?.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="recipes">
                  <ScrollArea className="h-[180px]">
                    {recipes.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        No recipes submitted yet
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {recipes.map((recipe) => (
                          <Card key={recipe.id}>
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{recipe.title}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatDate(recipe.created_at)}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {recipe.is_approved && (
                                    <Badge variant="secondary" className="text-xs">Approved</Badge>
                                  )}
                                  <Badge variant="outline" className="flex items-center gap-1">
                                    <ThumbsUp className="h-3 w-3" />
                                    {recipe.upvotes || 0}
                                  </Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="posts">
                  <ScrollArea className="h-[180px]">
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

      {/* Community Guidelines Dialog */}
      {showGuidelines && (
        <CommunityGuidelines 
          open={showGuidelines} 
          onAccept={() => setShowGuidelines(false)} 
        />
      )}
    </>
  );
};
