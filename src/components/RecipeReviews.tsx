import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Review {
  id: string;
  comment: string;
  image_url: string | null;
  created_at: string;
  user_id: string;
  profiles?: {
    display_name: string;
    avatar_url: string | null;
  };
}

interface RecipeReviewsProps {
  recipeId: string;
}

export const RecipeReviews = ({ recipeId }: RecipeReviewsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [comment, setComment] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchReviews();
  }, [recipeId]);

  const fetchReviews = async () => {
    const { data: reviewsData } = await supabase
      .from('recipe_reviews')
      .select('*')
      .eq('recipe_id', recipeId)
      .order('created_at', { ascending: false });

    if (reviewsData && reviewsData.length > 0) {
      // Fetch profiles for all unique user IDs
      const userIds = [...new Set(reviewsData.map(r => r.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', userIds);

      // Merge profile data with reviews
      const reviewsWithProfiles = reviewsData.map(review => ({
        ...review,
        profiles: profilesData?.find(p => p.user_id === review.user_id) || null
      }));

      setReviews(reviewsWithProfiles as any);
    } else {
      setReviews([]);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to leave a review",
        variant: "destructive",
      });
      return;
    }

    if (!comment.trim()) {
      toast({
        title: "Comment required",
        description: "Please write a comment",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      let imageUrl = null;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('community-media')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('community-media')
          .getPublicUrl(fileName);

        imageUrl = data.publicUrl;
      }

      await supabase.from('recipe_reviews').insert({
        recipe_id: recipeId,
        user_id: user.id,
        comment,
        image_url: imageUrl,
      });

      toast({
        title: "Review posted!",
        description: "Thank you for sharing your experience",
      });

      setComment("");
      setImageFile(null);
      fetchReviews();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recipe Reviews</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Review Form */}
        {user && (
          <div className="space-y-3">
            <Textarea
              placeholder="Share your experience with this recipe..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-4 w-4 mr-2" />
                {imageFile ? "Change Photo" : "Add Photo"}
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Posting..." : "Post Review"}
              </Button>
            </div>
            {imageFile && (
              <p className="text-sm text-muted-foreground">
                Selected: {imageFile.name}
              </p>
            )}
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No reviews yet. Be the first to share your experience!
            </p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="border-b pb-4 last:border-b-0">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={review.profiles?.avatar_url || undefined} />
                    <AvatarFallback>
                      {review.profiles?.display_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">
                        {review.profiles?.display_name || "Anonymous"}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm mb-2">{review.comment}</p>
                    {review.image_url && (
                      <img
                        src={review.image_url}
                        alt="Review"
                        className="rounded-lg max-w-sm mt-2"
                      />
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
