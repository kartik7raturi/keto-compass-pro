import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Heart, MessageCircle, Share2, Users, Trophy, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ChartContainer } from "@/components/ui/chart";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip } from "recharts";
import { usePointsSystem, POINT_VALUES } from "@/hooks/usePointsSystem";

interface Community {
  id: string;
  name: string;
  description: string;
  image_url: string;
  member_count: number;
}

interface CommunityPost {
  id: string;
  author_name: string;
  author_avatar: string | null;
  content: string;
  image_url: string | null;
  video_url?: string | null;
  chart_data?: any | null;
  likes_count: number;
  comments_count: number;
  tags: string[];
  created_at: string;
}

const Community = () => {
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const { awardPoints } = usePointsSystem();

  const [newPostContent, setNewPostContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCommunities();
  }, []);

  useEffect(() => {
    if (selectedCommunity) {
      fetchPosts(selectedCommunity.id);
    }
  }, [selectedCommunity]);

  const fetchCommunities = async () => {
    try {
      const { data } = await supabase
        .from('communities')
        .select('*')
        .order('member_count', { ascending: false });
      setCommunities(data || []);
      if (data && data.length > 0) {
        setSelectedCommunity(data[0]);
      }
    } catch (error) {
      console.error('Error fetching communities:', error);
    }
  };

  const fetchPosts = async (communityId: string) => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('community_posts')
        .select('*')
        .eq('community_id', communityId)
        .order('created_at', { ascending: false });
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadToStorage = async (file: File): Promise<string | null> => {
    if (!user) return null;
    const ext = file.name.split('.').pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('community-media').upload(path, file);
    if (error) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
      return null;
    }
    const { data } = supabase.storage.from('community-media').getPublicUrl(path);
    return data.publicUrl;
  };

  const createPost = async () => {
    if (!user || !selectedCommunity) {
      toast({ title: 'Please sign in', variant: 'destructive' });
      return;
    }
    if (!newPostContent && !imageFile) {
      toast({ title: 'Add some content' });
      return;
    }

    setSubmitting(true);
    try {
      let imageUrl: string | null = null;
      if (imageFile) imageUrl = await uploadToStorage(imageFile);

      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('user_id', user.id)
        .maybeSingle();

      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          community_id: selectedCommunity.id,
          user_id: user.id,
          author_name: profile?.display_name || user.email?.split('@')[0] || 'User',
          author_avatar: profile?.avatar_url,
          content: newPostContent,
          image_url: imageUrl,
          tags: [],
        })
        .select('*')
        .single();

      if (error) throw error;
      setPosts(prev => [data as CommunityPost, ...prev]);
      setNewPostContent("");
      setImageFile(null);
      awardPoints(POINT_VALUES.CREATE_POST, "creating a post!");
      toast({ title: 'Posted!' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!user) {
      toast({ title: "Please sign in", variant: "destructive" });
      return;
    }

    try {
      const { data: existingLike } = await supabase
        .from('community_likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .single();

      if (existingLike) {
        await supabase.from('community_likes').delete().eq('id', existingLike.id);
        setPosts(prev => prev.map(post => 
          post.id === postId ? { ...post, likes_count: Math.max(0, post.likes_count - 1) } : post
        ));
      } else {
        await supabase.from('community_likes').insert({ user_id: user.id, post_id: postId });
        setPosts(prev => prev.map(post => 
          post.id === postId ? { ...post, likes_count: post.likes_count + 1 } : post
        ));
        awardPoints(POINT_VALUES.LIKE_POST, "liking a post!");
      }
    } catch (error) {
      console.error('Error handling like:', error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading && !selectedCommunity) {
    return <div className="container mx-auto px-4 py-8">Loading communities...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-6">Communities</h1>
      
      <div className="flex gap-4 h-[calc(100vh-200px)] min-h-[500px]">
        {/* Sidebar - Community Icons */}
        <div className="w-16 md:w-20 bg-muted/30 rounded-lg border flex flex-col shrink-0">
          <ScrollArea className="flex-1">
            <div className="flex flex-col items-center py-3 gap-2">
              {communities.map((community) => (
                <Tooltip key={community.id} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setSelectedCommunity(community)}
                      className={`
                        w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden
                        transition-all duration-200 hover:scale-105 shrink-0
                        ${selectedCommunity?.id === community.id 
                          ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' 
                          : 'hover:ring-2 hover:ring-muted-foreground/50'
                        }
                      `}
                    >
                      {community.image_url ? (
                        <img 
                          src={community.image_url} 
                          alt={community.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p className="font-medium">{community.name}</p>
                    <p className="text-xs text-muted-foreground">{community.member_count} members</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedCommunity && (
            <>
              {/* Community Header */}
              <Card className="mb-4 shrink-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {selectedCommunity.image_url ? (
                      <img 
                        src={selectedCommunity.image_url} 
                        alt={selectedCommunity.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h2 className="font-bold text-lg truncate">{selectedCommunity.name}</h2>
                      <p className="text-sm text-muted-foreground">
                        {selectedCommunity.member_count} members
                      </p>
                    </div>
                  </div>
                  {selectedCommunity.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {selectedCommunity.description}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Post Composer */}
              {user && (
                <Card className="mb-4 shrink-0">
                  <CardContent className="p-4 space-y-3">
                    <Textarea
                      placeholder={`Share with ${selectedCommunity.name}...`}
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      className="min-h-[80px] resize-none"
                    />
                    <div className="flex flex-wrap gap-2 items-center">
                      <Input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                        className="flex-1 min-w-[150px]"
                      />
                      <Button onClick={createPost} disabled={submitting} size="sm">
                        <Send className="h-4 w-4 mr-2" />
                        {submitting ? 'Posting...' : 'Post'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Posts Feed */}
              <ScrollArea className="flex-1">
                <div className="space-y-4 pr-2">
                  {loading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading posts...</div>
                  ) : posts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No posts yet. Be the first to post!
                    </div>
                  ) : (
                    posts.map((post) => (
                      <Card key={post.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-9 w-9 shrink-0">
                              <AvatarImage src={post.author_avatar || undefined} />
                              <AvatarFallback className="text-xs">
                                {post.author_name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm truncate">{post.author_name}</span>
                                <span className="text-xs text-muted-foreground shrink-0">
                                  {formatTimeAgo(post.created_at)}
                                </span>
                              </div>
                              {post.content && (
                                <p className="text-sm mb-3 break-words">{post.content}</p>
                              )}
                              {post.image_url && (
                                <img 
                                  src={post.image_url} 
                                  alt="Post" 
                                  className="rounded-lg w-full max-w-md mb-3 object-cover"
                                />
                              )}
                              {post.chart_data?.series && (
                                <div className="h-32 mb-3">
                                  <ChartContainer config={{}}>
                                    <LineChart data={post.chart_data.series.map((v: number, i: number) => ({ day: i + 1, value: v }))}>
                                      <CartesianGrid strokeDasharray="3 3" />
                                      <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                                      <YAxis tick={{ fontSize: 10 }} />
                                      <RechartsTooltip />
                                      <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                                    </LineChart>
                                  </ChartContainer>
                                </div>
                              )}
                              <div className="flex items-center gap-4">
                                <button
                                  onClick={() => handleLikePost(post.id)}
                                  className="flex items-center gap-1 text-muted-foreground hover:text-red-500 transition-colors"
                                >
                                  <Heart className="h-4 w-4" />
                                  <span className="text-xs">{post.likes_count}</span>
                                </button>
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <MessageCircle className="h-4 w-4" />
                                  <span className="text-xs">{post.comments_count}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Community;
