import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, Share2, Users, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ChartContainer } from "@/components/ui/chart";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip } from "recharts";

interface Community {
  id: string;
  name: string;
  description: string;
  image_url: string;
  member_count: number;
}

interface CommunityChallenge {
  id: string;
  title: string;
  description: string;
  participants_count: number;
  duration_days: number;
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
  const [challenges, setChallenges] = useState<CommunityChallenge[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Post composer state
  const [newPostContent, setNewPostContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [chartSeriesStr, setChartSeriesStr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const uploadToStorage = async (file: File): Promise<string | null> => {
    if (!user) return null;
    const ext = file.name.split('.').pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from('community-media').upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (upErr) {
      toast({ title: 'Upload failed', description: upErr.message, variant: 'destructive' });
      return null;
    }
    const { data } = supabase.storage.from('community-media').getPublicUrl(path);
    return data.publicUrl;
  };

  const createPost = async () => {
    if (!user || !selectedCommunity) {
      toast({ title: 'Select a community', description: 'Please sign in and select a community.', variant: 'destructive' });
      return;
    }
    if (!newPostContent && !imageFile && !videoFile && !chartSeriesStr) {
      toast({ title: 'Nothing to post', description: 'Add text, media or chart data.' });
      return;
    }

    try {
      setSubmitting(true);
      let imageUrl: string | null = null;
      let videoUrl: string | null = null;

      if (imageFile) imageUrl = await uploadToStorage(imageFile);
      if (videoFile) videoUrl = await uploadToStorage(videoFile);

      const chartData = chartSeriesStr
        ? { series: chartSeriesStr.split(',').map(v => Number(v.trim())).filter(v => !Number.isNaN(v)) }
        : null;

      const authorName = (user.user_metadata as any)?.display_name || user.email || 'Anonymous';

      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          community_id: selectedCommunity.id,
          user_id: user.id,
          author_name: authorName,
          author_avatar: null,
          content: newPostContent || '',
          image_url: imageUrl,
          video_url: videoUrl,
          tags: [],
          chart_data: chartData,
        })
        .select('*')
        .single();

      if (error) throw error;

      setPosts(prev => [data as unknown as CommunityPost, ...prev]);
      setNewPostContent("");
      setImageFile(null);
      setVideoFile(null);
      setChartSeriesStr("");
      toast({ title: 'Posted!' });
    } catch (err: any) {
      console.error('Create post error', err);
      toast({ title: 'Error', description: err.message || 'Failed to create post', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  useEffect(() => {
    if (selectedCommunity) {
      fetchCommunityData(selectedCommunity.id);
    }
  }, [selectedCommunity]);

  const fetchCommunities = async () => {
    try {
      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .order('member_count', { ascending: false });

      if (error) throw error;
      setCommunities(data || []);
      if (data && data.length > 0) {
        setSelectedCommunity(data[0]);
      }
    } catch (error) {
      console.error('Error fetching communities:', error);
    }
  };

  const fetchCommunityData = async (communityId: string) => {
    setLoading(true);
    try {
      // Fetch challenges
      const { data: challengesData, error: challengesError } = await supabase
        .from('community_challenges')
        .select('*')
        .eq('community_id', communityId)
        .order('participants_count', { ascending: false });

      if (challengesError) throw challengesError;
      setChallenges(challengesData || []);

      // Fetch posts
      const { data: postsData, error: postsError } = await supabase
        .from('community_posts')
        .select('*')
        .eq('community_id', communityId)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;
      setPosts(postsData || []);
    } catch (error) {
      console.error('Error fetching community data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like posts",
        variant: "destructive"
      });
      return;
    }

    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('community_likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .single();

      if (existingLike) {
        // Unlike
        await supabase
          .from('community_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId);
        
        // Update post likes count manually for now
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, likes_count: Math.max(0, post.likes_count - 1) }
            : post
        ));
      } else {
        // Like
        await supabase
          .from('community_likes')
          .insert([{ user_id: user.id, post_id: postId }]);
        
        // Update post likes count manually for now
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, likes_count: post.likes_count + 1 }
            : post
        ));
      }
    } catch (error) {
      console.error('Error handling like:', error);
    }
  };

  const joinChallenge = async (communityChallengeId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to join challenges",
        variant: "destructive",
      });
      return;
    }

    try {
      // Load the community challenge to map by title
      const { data: communityChallenge, error: ccError } = await supabase
        .from('community_challenges')
        .select('title, description, duration_days, target_unit')
        .eq('id', communityChallengeId)
        .maybeSingle();

      if (ccError) throw ccError;
      if (!communityChallenge) {
        toast({ title: "Not found", description: "Challenge not found" , variant: "destructive"});
        return;
      }

      // Try to find an existing general challenge by exact title
      const { data: existingChallenge, error: findError } = await supabase
        .from('challenges')
        .select('id')
        .eq('title', communityChallenge.title)
        .maybeSingle();

      if (findError) throw findError;

      let challengeIdToUse = existingChallenge?.id as string | undefined;

      // If not found, create a new general challenge (RLS policy allows insert)
      if (!challengeIdToUse) {
        const { data: created, error: createError } = await supabase
          .from('challenges')
          .insert({
            title: communityChallenge.title,
            description: communityChallenge.description,
            duration_days: communityChallenge.duration_days,
            target_unit: communityChallenge.target_unit,
            challenge_type: 'community',
          })
          .select('id')
          .single();

        if (createError) throw createError;
        challengeIdToUse = created.id;
      }

      // Prevent duplicate join
      const { data: already, error: checkError } = await supabase
        .from('user_challenges')
        .select('id')
        .eq('user_id', user.id)
        .eq('challenge_id', challengeIdToUse)
        .maybeSingle();

      if (checkError) throw checkError;
      if (already) {
        toast({ title: "Already joined", description: "You've already joined this challenge!", variant: "destructive" });
        return;
      }

      const { error: joinError } = await supabase.from('user_challenges').insert({
        user_id: user.id,
        challenge_id: challengeIdToUse,
        start_date: new Date().toISOString().split('T')[0],
      });

      if (joinError) throw joinError;

      toast({ title: "Challenge joined!", description: "You've successfully joined the challenge. Good luck!" });
    } catch (error) {
      console.error('Error joining challenge:', error);
      toast({ title: "Error", description: "Failed to join challenge. Please try again.", variant: "destructive" });
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  if (loading && !selectedCommunity) {
    return <div className="container mx-auto px-4 py-8">Loading communities...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Community Selector */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-center mb-6">Keto Communities</h1>
        <div className="flex flex-wrap gap-4 justify-center">
          {communities.map((community) => (
            <Card 
              key={community.id} 
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedCommunity?.id === community.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedCommunity(community)}
            >
              <CardContent className="p-4 text-center">
                <img 
                  src={community.image_url} 
                  alt={community.name}
                  className="w-16 h-16 rounded-full mx-auto mb-2 object-cover"
                />
                <h3 className="font-semibold">{community.name}</h3>
                <p className="text-sm text-muted-foreground">{community.member_count} members</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {selectedCommunity?.name} Community Feed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Composer */}
              {user ? (
                <div className="border rounded-lg p-4 space-y-3">
                  <Textarea
                    placeholder={`Share something with ${selectedCommunity?.name}...`}
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                  />
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-sm text-muted-foreground">Image</label>
                      <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm text-muted-foreground">Video</label>
                      <Input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm text-muted-foreground">Chart data (comma-separated numbers)</label>
                    <Input
                      placeholder="e.g. 10, 12, 9, 14, 18"
                      value={chartSeriesStr}
                      onChange={(e) => setChartSeriesStr(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={createPost} disabled={submitting}>
                      {submitting ? 'Posting...' : 'Post'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">Sign in to create a post.</div>
              )}

              {/* Feed */}
              {loading ? (
                <div className="text-center py-8">Loading posts...</div>
              ) : posts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No posts yet in this community. Be the first to post!
                </div>
              ) : (
                posts.map((post) => (
                  <div key={post.id} className="border-b pb-6 last:border-b-0">
                    <div className="flex items-start gap-4">
                      <Avatar>
                        <AvatarImage src={post.author_avatar || undefined} />
                        <AvatarFallback>{post.author_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">{post.author_name}</span>
                          <span className="text-sm text-muted-foreground">{formatTimeAgo(post.created_at)}</span>
                        </div>
                        {post.content && <p className="mb-3 text-foreground">{post.content}</p>}
                        {post.image_url && (
                          <img 
                            src={post.image_url} 
                            alt="Community post image" 
                            className="rounded-lg w-full max-w-md mb-3 object-cover"
                            loading="lazy"
                          />
                        )}
                        {post.video_url && (
                          <video
                            controls
                            src={post.video_url}
                            className="rounded-lg w-full max-w-md mb-3"
                          />
                        )}
                        {post.chart_data?.series && Array.isArray(post.chart_data.series) && post.chart_data.series.length > 0 && (
                          <div className="my-4">
                            <ChartContainer config={{}} className="w-full">
                              <LineChart data={post.chart_data.series.map((y: number, i: number) => ({ x: i + 1, y }))}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="x" />
                                <YAxis />
                                <RechartsTooltip />
                                <Line type="monotone" dataKey="y" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                              </LineChart>
                            </ChartContainer>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {post.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <button 
                            onClick={() => handleLikePost(post.id)}
                            className="flex items-center gap-1 hover:text-primary transition-colors"
                          >
                            <Heart className="h-4 w-4" />
                            {post.likes_count}
                          </button>
                          <button className="flex items-center gap-1 hover:text-primary transition-colors">
                            <MessageCircle className="h-4 w-4" />
                            {post.comments_count}
                          </button>
                          <button className="flex items-center gap-1 hover:text-primary transition-colors">
                            <Share2 className="h-4 w-4" />
                            Share
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Active Challenges
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {challenges.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No active challenges in this community yet.
                </div>
              ) : (
                challenges.map((challenge) => (
                  <div key={challenge.id} className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">{challenge.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{challenge.description}</p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                      <span>{challenge.participants_count} participants</span>
                      <span>{challenge.duration_days} days</span>
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => joinChallenge(challenge.id)}
                    >
                      Join Challenge
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Contributors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: "Dr. Lisa K.", posts: 47, avatar: "DL" },
                { name: "Coach Emma", posts: 38, avatar: "CE" },
                { name: "Sarah M.", posts: 31, avatar: "SM" }
              ].map((user, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-primary">
                    <Trophy className="h-3 w-3" />
                    <span className="text-sm font-medium">#{index + 1}</span>
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {user.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{user.name}</div>
                    <div className="text-xs text-muted-foreground">{user.posts} posts</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div>
                <div className="text-2xl font-bold text-primary">
                  {communities.reduce((sum, c) => sum + c.member_count, 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Members</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {posts.length}
                </div>
                <div className="text-sm text-muted-foreground">Recent Posts</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {challenges.length}
                </div>
                <div className="text-sm text-muted-foreground">Active Challenges</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Community;