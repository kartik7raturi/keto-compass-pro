import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Heart, MessageCircle, Share2, Users, Trophy, Send, MoreVertical, Pencil, Trash2, Flag, Ban, UserCircle, MessageSquare, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ChartContainer } from "@/components/ui/chart";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip } from "recharts";
import { usePointsSystem, POINT_VALUES } from "@/hooks/usePointsSystem";
import { CommunityGuidelines } from "./CommunityGuidelines";
import { ReportDialog } from "./ReportDialog";
import { UserProfileDialog } from "./UserProfileDialog";
import { PostComments } from "./PostComments";
import { useOnlinePresence } from "@/hooks/useOnlinePresence";
import { useSearchParams } from "react-router-dom";
import { CommunityMessaging } from "./CommunityMessaging";
import { useIsMobile } from "@/hooks/use-mobile";
import { CommunitySidebarPanel } from "./community/CommunitySidebarPanel";

interface Community {
  id: string;
  name: string;
  description: string;
  image_url: string;
  member_count: number;
}

interface CommunityPost {
  id: string;
  user_id: string;
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

interface CommunityMember {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
}

interface FollowedUser {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
}

const Community = () => {
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [followedUsers, setFollowedUsers] = useState<FollowedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const { awardPoints } = usePointsSystem();
  const { isOnline } = useOnlinePresence();
  const [searchParams] = useSearchParams();
  const initialMessageUser = searchParams.get('user');
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<'discussion' | 'messages' | 'groups'>(initialMessageUser ? 'messages' : 'discussion');
  const [showSidePanel, setShowSidePanel] = useState(false);

  const [newPostContent, setNewPostContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [hasAcceptedGuidelines, setHasAcceptedGuidelines] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [reportPost, setReportPost] = useState<CommunityPost | null>(null);
  const [viewingUser, setViewingUser] = useState<string | null>(null);
  const [blockedUsers, setBlockedUsers] = useState<Set<string>>(new Set());
  const [showMessaging, setShowMessaging] = useState(!!initialMessageUser);
  const [messagingUserId, setMessagingUserId] = useState<string | null>(initialMessageUser);

  const startDirectMessage = (userId: string) => {
    setMessagingUserId(userId);
    setShowMessaging(true);
    if (isMobile) {
      setActiveTab('messages');
    }
  };

  const fetchFollowedUsers = async () => {
    if (!user) return;
    try {
      const { data: follows } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', user.id);
      
      if (follows && follows.length > 0) {
        const followingIds = follows.map(f => f.following_id);
        const { data: profiles } = await supabase
          .from('public_profiles')
          .select('user_id, display_name, avatar_url')
          .in('user_id', followingIds);
        
        setFollowedUsers(profiles?.map(p => ({
          user_id: p.user_id,
          display_name: p.display_name || 'User',
          avatar_url: p.avatar_url
        })) || []);
      }
    } catch (error) {
      console.error('Error fetching followed users:', error);
    }
  };

  useEffect(() => {
    fetchCommunities();
    if (user) {
      checkGuidelinesAcceptance();
      fetchBlockedUsers();
      fetchFollowedUsers();
    }
  }, [user]);

  useEffect(() => {
    if (selectedCommunity) {
      fetchPosts(selectedCommunity.id);
      fetchMembers(selectedCommunity.id);
    }
  }, [selectedCommunity]);

  const checkGuidelinesAcceptance = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('community_guidelines_acceptance')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (data) {
      setHasAcceptedGuidelines(true);
    } else {
      setShowGuidelines(true);
    }
  };

  const fetchBlockedUsers = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('user_blocks')
      .select('blocked_id')
      .eq('blocker_id', user.id);
    
    setBlockedUsers(new Set(data?.map(b => b.blocked_id) || []));
  };

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

  const fetchMembers = async (communityId: string) => {
    try {
      const { data } = await supabase
        .from('community_members')
        .select('user_id')
        .eq('community_id', communityId)
        .limit(20);
      
      if (data && data.length > 0) {
        const userIds = data.map(m => m.user_id);
        const { data: profiles } = await supabase
          .from('public_profiles')
          .select('user_id, display_name, avatar_url')
          .in('user_id', userIds);
        
        setMembers(profiles?.map(p => ({
          user_id: p.user_id,
          display_name: p.display_name || 'User',
          avatar_url: p.avatar_url
        })) || []);
      } else {
        setMembers([]);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
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
        .from('public_profiles')
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

  const updatePost = async (postId: string) => {
    if (!editContent.trim()) return;
    
    try {
      await supabase
        .from('community_posts')
        .update({ content: editContent.trim() })
        .eq('id', postId);
      
      setPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, content: editContent.trim() } : p
      ));
      setEditingPostId(null);
      setEditContent('');
      toast({ title: 'Post updated!' });
    } catch (error) {
      toast({ title: 'Error updating post', variant: 'destructive' });
    }
  };

  const deletePost = async (postId: string) => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    try {
      await supabase.from('community_posts').delete().eq('id', postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
      toast({ title: 'Post deleted' });
    } catch (error) {
      toast({ title: 'Error deleting post', variant: 'destructive' });
    }
  };

  const blockUser = async (userId: string) => {
    if (!user) return;
    try {
      await supabase.from('user_blocks').insert({ blocker_id: user.id, blocked_id: userId });
      setBlockedUsers(prev => new Set([...prev, userId]));
      toast({ title: 'User blocked', description: 'You will no longer see their posts.' });
    } catch (error) {
      toast({ title: 'Error blocking user', variant: 'destructive' });
    }
  };

  // Filter blocked users posts
  const visiblePosts = posts.filter(p => !blockedUsers.has(p.user_id));

  // Show guidelines for new users
  if (!hasAcceptedGuidelines && user && showGuidelines) {
    return (
      <CommunityGuidelines 
        open={showGuidelines} 
        onAccept={() => {
          setShowGuidelines(false);
          setHasAcceptedGuidelines(true);
        }} 
      />
    );
  }

  if (loading && !selectedCommunity) {
    return <div className="container mx-auto px-4 py-8">Loading communities...</div>;
  }

  // Mobile view with tabs
  if (isMobile) {
    return (
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-2xl font-bold mb-4">Communities</h1>
        
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'discussion' | 'messages' | 'groups')}>
          <TabsList className="w-full mb-4 grid grid-cols-3">
            <TabsTrigger value="discussion" className="gap-1 text-xs">
              <Users className="h-3 w-3" />
              Discussion
            </TabsTrigger>
            <TabsTrigger value="groups" className="gap-1 text-xs">
              <Users className="h-3 w-3" />
              Groups
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-1 text-xs">
              <MessageSquare className="h-3 w-3" />
              Messages
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="groups" className="mt-0">
            <CommunitySidebarPanel onStartDirectMessage={startDirectMessage} />
          </TabsContent>
          
          <TabsContent value="discussion" className="mt-0">
            {/* Community Selector for Mobile */}
            <ScrollArea className="w-full mb-4">
              <div className="flex gap-2 pb-2">
                {communities.map((community) => (
                  <button
                    key={community.id}
                    onClick={() => setSelectedCommunity(community)}
                    className={`shrink-0 px-3 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedCommunity?.id === community.id 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {community.name}
                  </button>
                ))}
              </div>
            </ScrollArea>

            {/* Followed Users Quick Chat - Mobile */}
            {user && followedUsers.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                  <Heart className="h-3 w-3 text-primary" /> Quick Chat with Following
                </p>
                <ScrollArea className="w-full">
                  <div className="flex gap-2 pb-2">
                    {followedUsers.map((fUser) => (
                      <button
                        key={fUser.user_id}
                        onClick={() => startDirectMessage(fUser.user_id)}
                        className="flex flex-col items-center gap-1 shrink-0"
                      >
                        <div className="relative">
                          <Avatar className="h-10 w-10 ring-2 ring-primary/30">
                            <AvatarImage src={fUser.avatar_url || undefined} />
                            <AvatarFallback className="text-xs bg-primary/10">
                              {fUser.display_name?.[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-background ${
                            isOnline(fUser.user_id) ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                        </div>
                        <span className="text-[10px] text-muted-foreground max-w-[50px] truncate">
                          {fUser.display_name}
                        </span>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {selectedCommunity && (
              <div className="space-y-4">
                {/* Community Header */}
                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      {selectedCommunity.image_url ? (
                        <img 
                          src={selectedCommunity.image_url} 
                          alt={selectedCommunity.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h2 className="font-bold text-base truncate">{selectedCommunity.name}</h2>
                        <p className="text-xs text-muted-foreground">{selectedCommunity.member_count} members</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Post Composer */}
                {user && (
                  <Card>
                    <CardContent className="p-3 space-y-2">
                      <Textarea
                        placeholder={`Share with ${selectedCommunity.name}...`}
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        className="min-h-[60px] resize-none text-sm"
                      />
                      <div className="flex gap-2">
                        <Input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                          className="flex-1 text-xs"
                        />
                        <Button onClick={createPost} disabled={submitting} size="sm">
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Posts */}
                <div className="space-y-3">
                  {loading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading...</div>
                  ) : visiblePosts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No posts yet</div>
                  ) : (
                    visiblePosts.map((post) => (
                      <Card key={post.id}>
                        <CardContent className="p-3">
                          <div className="flex items-start gap-2">
                            <button onClick={() => setViewingUser(post.user_id)}>
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={post.author_avatar || undefined} />
                                <AvatarFallback className="text-xs">
                                  {post.author_name[0]}
                                </AvatarFallback>
                              </Avatar>
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-sm truncate">{post.author_name}</p>
                                  <p className="text-[10px] text-muted-foreground font-mono">@{post.user_id.slice(0, 8)}</p>
                                </div>
                                <span className="text-xs text-muted-foreground">{formatTimeAgo(post.created_at)}</span>
                              </div>
                              <p className="text-sm mt-1 break-words">{post.content}</p>
                              {post.image_url && (
                                <img src={post.image_url} alt="Post" className="rounded-lg w-full mt-2" />
                              )}
                              <div className="flex items-center gap-4 mt-2">
                                <button
                                  onClick={() => handleLikePost(post.id)}
                                  className="flex items-center gap-1 text-muted-foreground hover:text-red-500"
                                >
                                  <Heart className="h-4 w-4" />
                                  <span className="text-xs">{post.likes_count}</span>
                                </button>
                              </div>
                              <PostComments 
                                postId={post.id} 
                                commentsCount={post.comments_count || 0}
                                onCommentsCountChange={(delta) => {
                                  setPosts(prev => prev.map(p => 
                                    p.id === post.id ? { ...p, comments_count: Math.max(0, (p.comments_count || 0) + delta) } : p
                                  ));
                                }}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="messages" className="mt-0">
            <CommunityMessaging 
              initialUserId={messagingUserId}
              onClose={() => setMessagingUserId(null)}
            />
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        {reportPost && (
          <ReportDialog
            open={!!reportPost}
            onClose={() => setReportPost(null)}
            reportedUserId={reportPost.user_id}
            postId={reportPost.id}
          />
        )}
        {viewingUser && (
          <UserProfileDialog
            open={!!viewingUser}
            onClose={() => setViewingUser(null)}
            userId={viewingUser}
          />
        )}
      </div>
    );
  }

  // Desktop view
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Communities</h1>
        <div className="flex gap-2">
          <Button
            variant={showSidePanel ? "default" : "outline"}
            onClick={() => setShowSidePanel(!showSidePanel)}
            className="gap-2"
          >
            <Search className="h-4 w-4" />
            Groups
          </Button>
          <Button
            variant={showMessaging ? "default" : "outline"}
            onClick={() => setShowMessaging(!showMessaging)}
            className="gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            Messages
          </Button>
        </div>
      </div>
      
      <div className="flex gap-4 h-[calc(100vh-200px)] min-h-[500px]">
        {/* Sidebar - Community Icons + Member Icons with DM */}
        <div className="w-16 md:w-20 bg-muted/30 rounded-lg border flex flex-col shrink-0">
          <ScrollArea className="flex-1">
            <div className="flex flex-col items-center py-3 gap-2">
              {/* Community Icons */}
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
              
              {/* Divider - Following */}
              {user && followedUsers.length > 0 && (
                <>
                  <div className="w-8 h-px bg-primary/50 my-2" />
                  <p className="text-[10px] text-primary font-medium">Following</p>
                </>
              )}
              
              {/* Followed Users for Quick Chat */}
              {user && followedUsers.map((fUser) => (
                <Tooltip key={fUser.user_id} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <div className="relative group">
                      <button
                        onClick={() => startDirectMessage(fUser.user_id)}
                        className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden transition-all duration-200 hover:scale-105 shrink-0 ring-2 ring-primary/30 hover:ring-primary"
                      >
                        <Avatar className="w-full h-full">
                          <AvatarImage src={fUser.avatar_url || undefined} />
                          <AvatarFallback className="text-sm bg-primary/10">
                            {fUser.display_name?.[0]?.toUpperCase() || '?'}
                          </AvatarFallback>
                        </Avatar>
                        {/* Online indicator */}
                        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${
                          isOnline(fUser.user_id) ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                      </button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p className="font-medium">{fUser.display_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {isOnline(fUser.user_id) ? '● Online' : '○ Offline'}
                    </p>
                    <p className="text-xs text-primary mt-1">Click to message</p>
                  </TooltipContent>
                </Tooltip>
              ))}

              {/* Members section removed - only showing communities and following */}
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
                    <div className="min-w-0 flex-1">
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
                  
                  {/* Members section removed - following users can be messaged via sidebar */}
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
                  ) : visiblePosts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No posts yet. Be the first to post!
                    </div>
                  ) : (
                    visiblePosts.map((post) => (
                      <Card key={post.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <button onClick={() => setViewingUser(post.user_id)}>
                              <Avatar className="h-9 w-9 shrink-0 hover:ring-2 ring-primary transition-all">
                                <AvatarImage src={post.author_avatar || undefined} />
                                <AvatarFallback className="text-xs">
                                  {post.author_name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex flex-col">
                                  <button 
                                    onClick={() => setViewingUser(post.user_id)}
                                    className="font-medium text-sm truncate hover:underline text-left"
                                  >
                                    {post.author_name}
                                  </button>
                                  <span className="text-[10px] text-muted-foreground font-mono">
                                    @{post.user_id.slice(0, 8)}
                                  </span>
                                </div>
                                <span className="text-xs text-muted-foreground shrink-0">
                                  {formatTimeAgo(post.created_at)}
                                </span>
                                
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {user?.id === post.user_id ? (
                                      <>
                                        <DropdownMenuItem onClick={() => {
                                          setEditingPostId(post.id);
                                          setEditContent(post.content);
                                        }}>
                                          <Pencil className="h-4 w-4 mr-2" />
                                          Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          onClick={() => deletePost(post.id)}
                                          className="text-destructive"
                                        >
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          Delete
                                        </DropdownMenuItem>
                                      </>
                                    ) : (
                                      <>
                                        <DropdownMenuItem onClick={() => setViewingUser(post.user_id)}>
                                          <UserCircle className="h-4 w-4 mr-2" />
                                          View Profile
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setReportPost(post)}>
                                          <Flag className="h-4 w-4 mr-2" />
                                          Report
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          onClick={() => blockUser(post.user_id)}
                                          className="text-destructive"
                                        >
                                          <Ban className="h-4 w-4 mr-2" />
                                          Block User
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>

                              {editingPostId === post.id ? (
                                <div className="mt-2 space-y-2">
                                  <Textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="min-h-[60px]"
                                  />
                                  <div className="flex gap-2">
                                    <Button size="sm" onClick={() => updatePost(post.id)}>Save</Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      onClick={() => setEditingPostId(null)}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  {post.content && (
                                    <p className="text-sm mb-3 break-words">{post.content}</p>
                                  )}
                                </>
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
                              </div>
                              
                              {/* Comments Section */}
                              <PostComments 
                                postId={post.id} 
                                commentsCount={post.comments_count || 0}
                                onCommentsCountChange={(delta) => {
                                  setPosts(prev => prev.map(p => 
                                    p.id === post.id 
                                      ? { ...p, comments_count: Math.max(0, (p.comments_count || 0) + delta) }
                                      : p
                                  ));
                                }}
                              />
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

        {/* Side Panel - Groups, Search, Requests */}
        {showSidePanel && (
          <div className="w-80 shrink-0 hidden lg:block border-l pl-4">
            <CommunitySidebarPanel 
              onStartDirectMessage={(userId) => {
                startDirectMessage(userId);
                setShowSidePanel(false);
              }}
            />
          </div>
        )}

        {/* Messaging Panel */}
        {showMessaging && !showSidePanel && (
          <div className="w-80 shrink-0 hidden lg:block">
            <CommunityMessaging 
              initialUserId={messagingUserId}
              onClose={() => {
                setShowMessaging(false);
                setMessagingUserId(null);
              }}
            />
          </div>
        )}
      </div>

      {/* Report Dialog */}
      {reportPost && (
        <ReportDialog
          open={!!reportPost}
          onClose={() => setReportPost(null)}
          reportedUserId={reportPost.user_id}
          postId={reportPost.id}
        />
      )}

      {/* User Profile Dialog */}
      {viewingUser && (
        <UserProfileDialog
          open={!!viewingUser}
          onClose={() => setViewingUser(null)}
          userId={viewingUser}
        />
      )}
    </div>
  );
};

export default Community;
