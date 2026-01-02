import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Heart, MessageCircle, Send, MoreVertical, Flag, Ban, 
  Pencil, Trash2, UserCircle, MessageSquare, Trophy
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { usePointsSystem, POINT_VALUES } from '@/hooks/usePointsSystem';
import { CommunityGuidelines } from './CommunityGuidelines';
import { ReportDialog } from './ReportDialog';
import { UserProfileDialog } from './UserProfileDialog';

interface Post {
  id: string;
  user_id: string;
  author_name: string;
  author_avatar: string | null;
  content: string;
  image_url: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
}

interface ChallengeCommunityProps {
  challengeId: string;
  challengeTitle: string;
}

// Spam/promotion detection patterns
const SPAM_PATTERNS = [
  /https?:\/\/[^\s]+/gi,
  /www\.[^\s]+/gi,
  /\b(buy|sale|discount|offer|free|click|subscribe|promo|deal)\b/gi,
  /\b(dm me|message me|contact me for)\b/gi,
  /\b(follow my|check out my|visit my)\b/gi,
];

export const ChallengeCommunity = ({ challengeId, challengeTitle }: ChallengeCommunityProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { awardPoints } = usePointsSystem();
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [newContent, setNewContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [hasAcceptedGuidelines, setHasAcceptedGuidelines] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [reportPost, setReportPost] = useState<Post | null>(null);
  const [viewingUser, setViewingUser] = useState<string | null>(null);
  const [blockedUsers, setBlockedUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      checkGuidelinesAcceptance();
      fetchBlockedUsers();
    }
    fetchPosts();
  }, [user, challengeId]);

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

  const fetchPosts = async () => {
    try {
      const { data } = await supabase
        .from('challenge_posts')
        .select('*')
        .eq('challenge_id', challengeId)
        .eq('is_flagged', false)
        .order('created_at', { ascending: false });
      
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const detectSpam = (content: string): boolean => {
    return SPAM_PATTERNS.some(pattern => pattern.test(content));
  };

  const createPost = async () => {
    if (!user || !newContent.trim()) return;
    
    // Check for spam/promotion
    if (detectSpam(newContent)) {
      toast({
        title: 'Content not allowed',
        description: 'Links, promotions, and advertisements are not permitted.',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('user_id', user.id)
        .maybeSingle();

      const { data, error } = await supabase
        .from('challenge_posts')
        .insert({
          challenge_id: challengeId,
          user_id: user.id,
          author_name: profile?.display_name || user.email?.split('@')[0] || 'User',
          author_avatar: profile?.avatar_url,
          content: newContent.trim()
        })
        .select()
        .single();

      if (error) throw error;
      
      setPosts(prev => [data as Post, ...prev]);
      setNewContent('');
      awardPoints(POINT_VALUES.CREATE_POST, 'posting in challenge community!');
      toast({ title: 'Posted successfully!' });
    } catch (error) {
      console.error('Error creating post:', error);
      toast({ title: 'Error creating post', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const updatePost = async (postId: string) => {
    if (!editContent.trim()) return;
    
    if (detectSpam(editContent)) {
      toast({
        title: 'Content not allowed',
        description: 'Links, promotions, and advertisements are not permitted.',
        variant: 'destructive'
      });
      return;
    }

    try {
      await supabase
        .from('challenge_posts')
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
    try {
      await supabase.from('challenge_posts').delete().eq('id', postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
      toast({ title: 'Post deleted' });
    } catch (error) {
      toast({ title: 'Error deleting post', variant: 'destructive' });
    }
  };

  const likePost = async (postId: string) => {
    if (!user) return;
    
    try {
      const { data: existing } = await supabase
        .from('challenge_post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        await supabase.from('challenge_post_likes').delete().eq('id', existing.id);
        setPosts(prev => prev.map(p => 
          p.id === postId ? { ...p, likes_count: Math.max(0, p.likes_count - 1) } : p
        ));
      } else {
        await supabase.from('challenge_post_likes').insert({ post_id: postId, user_id: user.id });
        setPosts(prev => prev.map(p => 
          p.id === postId ? { ...p, likes_count: p.likes_count + 1 } : p
        ));
        awardPoints(POINT_VALUES.LIKE_POST, 'engaging with the community!');
      }
    } catch (error) {
      console.error('Error liking post:', error);
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

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Filter out blocked users' posts
  const visiblePosts = posts.filter(p => !blockedUsers.has(p.user_id));

  if (!hasAcceptedGuidelines && user) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="h-5 w-5 text-primary" />
          {challengeTitle} Community
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Post Composer */}
        {user && (
          <div className="space-y-2">
            <Textarea
              placeholder="Share your progress, tips, or encouragement..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="min-h-[80px] resize-none"
            />
            <Button 
              onClick={createPost} 
              disabled={submitting || !newContent.trim()}
              size="sm"
            >
              <Send className="h-4 w-4 mr-2" />
              {submitting ? 'Posting...' : 'Post'}
            </Button>
          </div>
        )}

        {/* Posts */}
        <ScrollArea className="h-[400px]">
          <div className="space-y-3 pr-2">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : visiblePosts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No posts yet. Be the first to share!
              </div>
            ) : (
              visiblePosts.map((post) => (
                <div key={post.id} className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-start gap-3">
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
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setViewingUser(post.user_id)}
                            className="font-medium text-sm hover:underline"
                          >
                            {post.author_name}
                          </button>
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(post.created_at)}
                          </span>
                        </div>
                        
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
                        <p className="text-sm mt-1">{post.content}</p>
                      )}

                      <div className="flex items-center gap-4 mt-2">
                        <button
                          onClick={() => likePost(post.id)}
                          className="flex items-center gap-1 text-muted-foreground hover:text-red-500 transition-colors"
                        >
                          <Heart className="h-4 w-4" />
                          <span className="text-xs">{post.likes_count}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

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
      </CardContent>
    </Card>
  );
};
