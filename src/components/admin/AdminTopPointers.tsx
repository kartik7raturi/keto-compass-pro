import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trophy, Star } from "lucide-react";

interface TopPointer {
  user_id: string;
  display_name: string;
  email: string;
  avatar_url: string;
  total_points: number;
  current_level: number;
}

export const AdminTopPointers = () => {
  const [pointers, setPointers] = useState<TopPointer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopPointers();
  }, []);

  const fetchTopPointers = async () => {
    try {
      setLoading(true);
      
      // Get top users by points
      const { data: progressData, error } = await supabase
        .from('user_progress')
        .select('user_id, total_points, current_level')
        .order('total_points', { ascending: false })
        .limit(20);

      if (error) throw error;

      if (!progressData || progressData.length === 0) {
        setPointers([]);
        return;
      }

      // Get profiles for these users
      const userIds = progressData.map(p => p.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, email, avatar_url')
        .in('user_id', userIds);

      // Combine data
      const pointerList: TopPointer[] = progressData.map((progress) => {
        const profile = profiles?.find((p) => p.user_id === progress.user_id);
        return {
          user_id: progress.user_id,
          display_name: profile?.display_name || 'Unknown',
          email: profile?.email || '',
          avatar_url: profile?.avatar_url || '',
          total_points: progress.total_points,
          current_level: progress.current_level
        };
      });

      setPointers(pointerList);
    } catch (error) {
      console.error('Error fetching top pointers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Star className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Top Global Pointers</h3>
      </div>

      {pointers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No user progress data found yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {pointers.map((pointer, index) => (
            <Card key={pointer.user_id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-bold">
                    {index < 3 ? (
                      <Trophy className={`h-4 w-4 ${
                        index === 0 ? 'text-yellow-500' : 
                        index === 1 ? 'text-gray-400' : 'text-amber-600'
                      }`} />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={pointer.avatar_url} />
                    <AvatarFallback>
                      {pointer.display_name?.charAt(0)?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{pointer.display_name}</div>
                    <div className="text-sm text-muted-foreground truncate">{pointer.email}</div>
                  </div>
                  <div className="flex gap-2">
                    <Badge className="bg-primary">
                      Level {pointer.current_level}
                    </Badge>
                    <Badge variant="secondary">
                      {pointer.total_points} pts
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
