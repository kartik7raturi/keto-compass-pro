import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UserSearchProps {
  onStartChat: (userId: string) => void;
}

interface SearchResult {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  username: string | null;
}

export const UserSearch = ({ onStartChat }: UserSearchProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim() || !user) return;

    setLoading(true);
    try {
      const cleanQuery = query.trim().replace(/^@/, '');
      
      // Search by display name or username only (not UUID)
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url, username')
        .or(`display_name.ilike.%${cleanQuery}%,username.ilike.%${cleanQuery}%`)
        .neq('user_id', user.id)
        .limit(10);

      if (error) {
        console.error('Search error:', error);
        toast({ title: 'Search failed', variant: 'destructive' });
        return;
      }

      setResults(data || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessageRequest = async (receiverId: string) => {
    if (!user) return;

    try {
      const { data: existing } = await supabase
        .from('message_requests')
        .select('id, status')
        .eq('sender_id', user.id)
        .eq('receiver_id', receiverId)
        .maybeSingle();

      if (existing) {
        if (existing.status === 'approved') {
          onStartChat(receiverId);
        } else {
          toast({ title: 'Message request already sent' });
        }
        return;
      }

      const { data: theirRequest } = await supabase
        .from('message_requests')
        .select('id, status')
        .eq('sender_id', receiverId)
        .eq('receiver_id', user.id)
        .maybeSingle();

      if (theirRequest?.status === 'approved') {
        onStartChat(receiverId);
        return;
      }

      await supabase.from('message_requests').insert({
        sender_id: user.id,
        receiver_id: receiverId
      });

      toast({ title: 'Message request sent!' });
    } catch (error) {
      console.error('Error sending request:', error);
      toast({ title: 'Error sending request', variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Search className="h-4 w-4" />
          Find Users
        </CardTitle>
      </CardHeader>
      <CardContent className="py-2 space-y-3">
        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or @username..."
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={loading}>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {results.length > 0 && (
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {results.map((result) => (
                <div key={result.user_id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={result.avatar_url || ''} />
                    <AvatarFallback>{result.display_name?.[0] || '?'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium truncate block">
                      {result.display_name || 'Unknown'}
                    </span>
                    {result.username && (
                      <span className="text-[10px] text-muted-foreground font-mono block">
                        @{result.username}
                      </span>
                    )}
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => sendMessageRequest(result.user_id)}>
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {results.length === 0 && query && !loading && (
          <p className="text-center text-sm text-muted-foreground py-4">
            No users found
          </p>
        )}
      </CardContent>
    </Card>
  );
};
