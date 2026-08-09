import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { SEO } from '@/components/seo/SEO';

interface GroupPreview {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  is_public: boolean;
  member_count: number;
}

const JoinGroup = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [group, setGroup] = useState<GroupPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [alreadyMember, setAlreadyMember] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!groupId) return;
    fetchGroup();
  }, [groupId, user]);

  const fetchGroup = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('user_groups')
      .select('id, name, description, image_url, is_public, member_count')
      .eq('id', groupId)
      .maybeSingle();

    if (!data) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setGroup(data);

    if (user) {
      const { data: membership } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .maybeSingle();
      setAlreadyMember(!!membership);
    }
    setLoading(false);
  };

  const handleJoin = async () => {
    if (!user) {
      // Send them to sign in, then bounce back to this invite link afterward
      navigate(`/auth?redirect=${encodeURIComponent(`/community/join/${groupId}`)}`);
      return;
    }
    if (!group) return;

    setJoining(true);
    try {
      const { error } = await supabase
        .from('group_members')
        .insert({ group_id: group.id, user_id: user.id, role: 'member' });

      if (error) throw error;
      toast({ title: `Welcome to ${group.name}!` });
      navigate('/community');
    } catch (error: any) {
      toast({ title: 'Could not join group', description: error.message, variant: 'destructive' });
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO path="/join-group" title="Join Group" description="You've been invited to join a Ketopia community group." noindex />
      <Header />
      <main className="flex-1 container mx-auto px-4 py-16 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Group Invite</CardTitle>
          </CardHeader>
          <CardContent>
            {loading || authLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : notFound || !group ? (
              <div className="text-center space-y-3 py-4">
                <p className="text-muted-foreground">This invite link is invalid or the group no longer exists.</p>
                <Button onClick={() => navigate('/community')}>Go to Community</Button>
              </div>
            ) : (
              <div className="text-center space-y-4 py-2">
                <Avatar className="h-20 w-20 mx-auto">
                  <AvatarImage src={group.image_url || ''} />
                  <AvatarFallback className="text-2xl"><Users className="h-8 w-8" /></AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold">{group.name}</h2>
                  {group.description && (
                    <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">{group.member_count} members</p>
                </div>

                {alreadyMember ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">You're already in this group.</p>
                    <Button className="w-full" onClick={() => navigate('/community')}>Open Community</Button>
                  </div>
                ) : !group.is_public ? (
                  <p className="text-sm text-muted-foreground">
                    This is a private group — ask the owner to send you a direct invite instead.
                  </p>
                ) : (
                  <Button className="w-full" onClick={handleJoin} disabled={joining}>
                    {joining && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {user ? 'Join Group' : 'Sign In to Join'}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default JoinGroup;
