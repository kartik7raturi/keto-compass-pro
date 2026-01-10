import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Comment {
  id: string;
  user_id: string;
  content: string;
  author_name: string;
  author_avatar: string | null;
  created_at: string;
  parent_comment_id: string | null;
  replies?: Comment[];
}

interface PostCommentsProps {
  postId: string;
  commentsCount: number;
  onCommentsCountChange: (delta: number) => void;
}

export const PostComments = ({ postId, commentsCount, onCommentsCountChange }: PostCommentsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (expanded) {
      fetchComments();
    }
  }, [expanded, postId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('post_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (data) {
        // Organize into threads
        const topLevelComments: Comment[] = [];
        const repliesMap: Record<string, Comment[]> = {};

        data.forEach((comment: Comment) => {
          if (comment.parent_comment_id) {
            if (!repliesMap[comment.parent_comment_id]) {
              repliesMap[comment.parent_comment_id] = [];
            }
            repliesMap[comment.parent_comment_id].push(comment);
          } else {
            topLevelComments.push(comment);
          }
        });

        // Attach replies to parent comments
        topLevelComments.forEach((comment) => {
          comment.replies = repliesMap[comment.id] || [];
        });

        setComments(topLevelComments);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitComment = async (parentCommentId: string | null = null) => {
    const content = parentCommentId ? replyContent : newComment;
    if (!user || !content.trim()) return;

    setSubmitting(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('user_id', user.id)
        .maybeSingle();

      const { data, error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: content.trim(),
          author_name: profile?.display_name || user.email?.split('@')[0] || 'User',
          author_avatar: profile?.avatar_url,
          parent_comment_id: parentCommentId,
        })
        .select()
        .single();

      if (error) throw error;

      // Update community_posts comments_count
      await supabase
        .from('community_posts')
        .update({ comments_count: commentsCount + 1 })
        .eq('id', postId);

      onCommentsCountChange(1);

      if (parentCommentId) {
        // Add reply to parent
        setComments(prev =>
          prev.map(c =>
            c.id === parentCommentId
              ? { ...c, replies: [...(c.replies || []), data as Comment] }
              : c
          )
        );
        setReplyContent('');
        setReplyingTo(null);
      } else {
        setComments(prev => [...prev, { ...(data as Comment), replies: [] }]);
        setNewComment('');
      }

      toast({ title: 'Comment added!' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      await supabase.from('post_comments').delete().eq('id', commentId);

      // Update comments count
      await supabase
        .from('community_posts')
        .update({ comments_count: Math.max(0, commentsCount - 1) })
        .eq('id', postId);

      onCommentsCountChange(-1);

      // Remove from state
      setComments(prev => {
        const filtered = prev.filter(c => c.id !== commentId);
        return filtered.map(c => ({
          ...c,
          replies: (c.replies || []).filter(r => r.id !== commentId),
        }));
      });

      toast({ title: 'Comment deleted' });
    } catch (error) {
      toast({ title: 'Error deleting comment', variant: 'destructive' });
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  const totalComments = comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0);

  return (
    <div className="mt-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm"
      >
        <MessageCircle className="h-4 w-4" />
        <span>{commentsCount} comments</span>
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {expanded && (
        <div className="mt-3 space-y-3">
          {/* Add comment */}
          {user && (
            <div className="flex gap-2">
              <Textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[60px] text-sm resize-none"
              />
              <Button
                size="sm"
                onClick={() => submitComment()}
                disabled={submitting || !newComment.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Comments list */}
          {loading ? (
            <div className="text-center text-sm text-muted-foreground py-4">Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-4">No comments yet</div>
          ) : (
            <ScrollArea className="max-h-[300px]">
              <div className="space-y-3 pr-2">
                {comments.map((comment) => (
                  <div key={comment.id} className="space-y-2">
                    {/* Main comment */}
                    <div className="flex gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={comment.author_avatar || undefined} />
                        <AvatarFallback className="text-xs">
                          {comment.author_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 bg-muted/50 rounded-lg p-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{comment.author_name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(comment.created_at)}
                            </span>
                            {user?.id === comment.user_id && (
                              <button
                                onClick={() => deleteComment(comment.id)}
                                className="text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-sm mt-1">{comment.content}</p>
                        {user && (
                          <button
                            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                            className="text-xs text-muted-foreground hover:text-foreground mt-1"
                          >
                            Reply
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Reply input */}
                    {replyingTo === comment.id && (
                      <div className="ml-9 flex gap-2">
                        <Textarea
                          placeholder={`Reply to ${comment.author_name}...`}
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          className="min-h-[50px] text-sm resize-none"
                        />
                        <Button
                          size="sm"
                          onClick={() => submitComment(comment.id)}
                          disabled={submitting || !replyContent.trim()}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="ml-9 space-y-2">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={reply.author_avatar || undefined} />
                              <AvatarFallback className="text-xs">
                                {reply.author_name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 bg-muted/30 rounded-lg p-2">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-xs">{reply.author_name}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">
                                    {formatTimeAgo(reply.created_at)}
                                  </span>
                                  {user?.id === reply.user_id && (
                                    <button
                                      onClick={() => deleteComment(reply.id)}
                                      className="text-muted-foreground hover:text-destructive"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  )}
                                </div>
                              </div>
                              <p className="text-xs mt-1">{reply.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      )}
    </div>
  );
};