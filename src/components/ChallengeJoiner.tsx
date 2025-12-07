import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, Calendar, Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Challenge {
  id: string;
  title: string;
  description: string;
  duration_days: number;
  challenge_type: string;
}

const ChallengeJoiner = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [joinedChallenges, setJoinedChallenges] = useState<string[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchChallenges();
    if (user) fetchUserChallenges();
  }, [user]);

  const fetchChallenges = async () => {
    const { data } = await supabase.from('challenges').select('*');
    setChallenges(data || []);
  };

  const fetchUserChallenges = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('user_challenges')
      .select('challenge_id')
      .eq('user_id', user.id);
    setJoinedChallenges(data?.map(d => d.challenge_id) || []);
  };

  const joinChallenge = async (challengeId: string) => {
    if (!user) {
      toast({ title: "Please sign in to join challenges", variant: "destructive" });
      return;
    }

    try {
      // Get challenge details to find related community
      const { data: challenge } = await supabase
        .from('challenges')
        .select('title, challenge_type')
        .eq('id', challengeId)
        .single();

      // Insert user challenge
      const { error } = await supabase.from('user_challenges').insert({
        user_id: user.id,
        challenge_id: challengeId,
      });

      if (error) throw error;

      // Try to find and auto-join a related community based on challenge type or title
      if (challenge) {
        const { data: communities } = await supabase
          .from('communities')
          .select('id, name')
          .or(`name.ilike.%${challenge.challenge_type || 'keto'}%,name.ilike.%challenge%`);

        if (communities && communities.length > 0) {
          // Check if not already a member
          const { data: existingMember } = await supabase
            .from('community_members')
            .select('id')
            .eq('user_id', user.id)
            .eq('community_id', communities[0].id)
            .maybeSingle();

          if (!existingMember) {
            await supabase.from('community_members').insert({
              user_id: user.id,
              community_id: communities[0].id,
            });
          }
        }
      }

      setJoinedChallenges([...joinedChallenges, challengeId]);
      toast({ 
        title: "Challenge joined successfully!", 
        description: "You've been added to the challenge community." 
      });
    } catch (error) {
      console.error('Error joining challenge:', error);
      toast({ title: "Error joining challenge", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Available Challenges</h3>
      <div className="grid gap-4">
        {challenges.map((challenge) => (
          <Card key={challenge.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{challenge.title}</span>
                <Badge variant="secondary">{challenge.duration_days} days</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{challenge.description}</p>
              <Button
                className="w-full bg-gradient-to-r from-keto-green to-keto-green-dark"
                onClick={() => joinChallenge(challenge.id)}
                disabled={joinedChallenges.includes(challenge.id)}
              >
                {joinedChallenges.includes(challenge.id) ? 'Joined!' : 'Join Challenge'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ChallengeJoiner;