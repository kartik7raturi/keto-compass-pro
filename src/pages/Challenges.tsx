import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, Calendar, Trophy, Flame, Timer, Dumbbell, Droplet, MessageSquare, ChevronUp, ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ChallengeLeaderboard from '@/components/ChallengeLeaderboard';
import { ChallengeCommunity } from '@/components/ChallengeCommunity';
import ChallengeTrackerInline from '@/components/ChallengeTrackerInline';

interface Challenge {
  id: string;
  title: string;
  description: string;
  duration_days: number;
  challenge_type: string;
  target_value: number | null;
  target_unit: string | null;
  reward_points: number | null;
}

interface UserChallenge {
  id: string;
  challenge_id: string;
  start_date: string;
  current_progress: number;
  is_completed: boolean;
  challenges: Challenge;
}

const Challenges = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);
  const [expandedChallenge, setExpandedChallenge] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchChallenges();
    if (user) fetchUserChallenges();
  }, [user]);

  const fetchChallenges = async () => {
    try {
      const { data } = await supabase.from('challenges').select('*');
      setChallenges(data || []);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserChallenges = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('user_challenges')
        .select('*, challenges(*)')
        .eq('user_id', user.id);
      setUserChallenges(data as unknown as UserChallenge[] || []);
    } catch (error) {
      console.error('Error fetching user challenges:', error);
    }
  };

  const joinChallenge = async (challengeId: string) => {
    if (!user) {
      toast({ title: 'Please sign in to join challenges', variant: 'destructive' });
      return;
    }

    try {
      const { data: challenge } = await supabase
        .from('challenges')
        .select('title, challenge_type')
        .eq('id', challengeId)
        .single();

      const { error } = await supabase.from('user_challenges').insert({
        user_id: user.id,
        challenge_id: challengeId,
      });

      if (error) throw error;

      // Auto-join related community
      if (challenge) {
        const { data: communities } = await supabase
          .from('communities')
          .select('id, name')
          .or(`name.ilike.%${challenge.challenge_type || 'keto'}%,name.ilike.%challenge%`);

        if (communities && communities.length > 0) {
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

      // Create notification
      await supabase.from('notifications').insert({
        user_id: user.id,
        title: 'Challenge Joined!',
        message: `You've joined the ${challenge?.title || 'challenge'}. Good luck!`,
        type: 'challenge',
        link: '/challenges',
      });

      fetchUserChallenges();
      setExpandedChallenge(challengeId);
      toast({ title: 'Challenge joined successfully!' });
    } catch (error) {
      console.error('Error joining challenge:', error);
      toast({ title: 'Error joining challenge', variant: 'destructive' });
    }
  };

  const getChallengeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'keto': return <Flame className="h-5 w-5 text-orange-500" />;
      case 'fasting': return <Timer className="h-5 w-5 text-blue-500" />;
      case 'workout': return <Dumbbell className="h-5 w-5 text-purple-500" />;
      case 'water': return <Droplet className="h-5 w-5 text-cyan-500" />;
      default: return <Target className="h-5 w-5 text-primary" />;
    }
  };

  const filteredChallenges = filter === 'all' 
    ? challenges 
    : challenges.filter(c => c.challenge_type?.toLowerCase() === filter);

  const isJoined = (challengeId: string) => 
    userChallenges.some(uc => uc.challenge_id === challengeId);

  const getUserChallenge = (challengeId: string) =>
    userChallenges.find(uc => uc.challenge_id === challengeId);

  const activeChallenges = userChallenges.filter(uc => !uc.is_completed);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-20">Loading challenges...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">Challenges</h1>
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Join challenges to push your limits, earn badges, and compete with the community.
          </p>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="flex flex-wrap justify-center w-full max-w-lg mx-auto mb-8 h-auto gap-1">
            <TabsTrigger value="all" onClick={() => setFilter('all')} className="text-xs md:text-sm">All</TabsTrigger>
            <TabsTrigger value="keto" onClick={() => setFilter('keto')} className="text-xs md:text-sm">Keto</TabsTrigger>
            <TabsTrigger value="fasting" onClick={() => setFilter('fasting')} className="text-xs md:text-sm">Fasting</TabsTrigger>
            <TabsTrigger value="workout" onClick={() => setFilter('workout')} className="text-xs md:text-sm">Workout</TabsTrigger>
            <TabsTrigger value="water" onClick={() => setFilter('water')} className="text-xs md:text-sm">Water</TabsTrigger>
          </TabsList>

          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Challenges List */}
            <div className="lg:col-span-2 order-2 lg:order-1">
              {['all', 'keto', 'fasting', 'workout', 'water'].map(tabValue => (
                <TabsContent key={tabValue} value={tabValue} className="mt-0">
                  <div className="grid gap-4 md:grid-cols-2">
                    {filteredChallenges.length === 0 ? (
                      <div className="col-span-2 text-center py-12 text-muted-foreground">
                        No challenges available in this category.
                      </div>
                    ) : (
                      filteredChallenges.map((challenge) => {
                        const joined = isJoined(challenge.id);
                        const uc = getUserChallenge(challenge.id);
                        const isExpanded = expandedChallenge === challenge.id;

                        return (
                          <Card key={challenge.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-2">
                              <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {getChallengeIcon(challenge.challenge_type)}
                                  <span className="text-base md:text-lg">{challenge.title}</span>
                                </div>
                                <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                                  <Calendar className="h-3 w-3" />
                                  {challenge.duration_days}d
                                </Badge>
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <p className="text-sm text-muted-foreground">{challenge.description}</p>
                              
                              {challenge.target_value && (
                                <p className="text-xs text-muted-foreground">
                                  Target: {challenge.target_value} {challenge.target_unit}
                                </p>
                              )}

                              {challenge.reward_points && (
                                <div className="flex items-center gap-1 text-xs text-yellow-600">
                                  <Trophy className="h-3 w-3" />
                                  {challenge.reward_points} points reward
                                </div>
                              )}

                              {!joined ? (
                                <Button
                                  className="w-full"
                                  onClick={() => joinChallenge(challenge.id)}
                                >
                                  Join Challenge
                                </Button>
                              ) : (
                                <div className="space-y-2">
                                  <Button
                                    variant="secondary"
                                    className="w-full"
                                    onClick={() => setExpandedChallenge(isExpanded ? null : challenge.id)}
                                  >
                                    {isExpanded ? (
                                      <>Hide Tracker <ChevronUp className="h-4 w-4 ml-2" /></>
                                    ) : (
                                      <>Show Tracker <ChevronDown className="h-4 w-4 ml-2" /></>
                                    )}
                                  </Button>
                                  
                                  {isExpanded && uc && (
                                    <ChallengeTrackerInline 
                                      userChallenge={uc} 
                                      onUpdate={fetchUserChallenges} 
                                    />
                                  )}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })
                    )}
                  </div>
                </TabsContent>
              ))}
            </div>

            {/* Leaderboard */}
            <div className="order-1 lg:order-2">
              <ChallengeLeaderboard category={filter} />
            </div>
          </div>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Challenges;
