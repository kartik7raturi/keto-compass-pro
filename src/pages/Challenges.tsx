import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Target, Calendar, Trophy, Users, Flame, Timer, Dumbbell, Droplet } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Challenge {
  id: string;
  title: string;
  description: string;
  duration_days: number;
  challenge_type: string;
  target_value: number | null;
  target_unit: string | null;
}

interface UserChallenge {
  id: string;
  challenge_id: string;
  start_date: string;
  current_progress: number;
  is_completed: boolean;
  challenges: Challenge;
}

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  challenges_completed: number;
  total_points: number;
}

const Challenges = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchChallenges();
    fetchLeaderboard();
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

  const fetchLeaderboard = async () => {
    try {
      // Get users with completed challenges count
      const { data: completedChallenges } = await supabase
        .from('user_challenges')
        .select('user_id')
        .eq('is_completed', true);

      const userCounts: Record<string, number> = {};
      completedChallenges?.forEach(uc => {
        userCounts[uc.user_id] = (userCounts[uc.user_id] || 0) + 1;
      });

      // Get user progress for points
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('user_id, total_points');

      const pointsMap: Record<string, number> = {};
      progressData?.forEach(p => {
        pointsMap[p.user_id] = p.total_points;
      });

      // Get user profiles
      const userIds = [...new Set([...Object.keys(userCounts), ...Object.keys(pointsMap)])];
      
      if (userIds.length === 0) {
        setLeaderboard([]);
        return;
      }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', userIds);

      const leaderboardData: LeaderboardEntry[] = profiles?.map(p => ({
        user_id: p.user_id,
        display_name: p.display_name || 'Anonymous',
        avatar_url: p.avatar_url,
        challenges_completed: userCounts[p.user_id] || 0,
        total_points: pointsMap[p.user_id] || 0,
      })) || [];

      leaderboardData.sort((a, b) => b.total_points - a.total_points);
      setLeaderboard(leaderboardData.slice(0, 10));
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
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
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">Challenges</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join challenges to push your limits, earn badges, and compete with the community.
          </p>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid grid-cols-5 w-full max-w-lg mx-auto mb-8">
            <TabsTrigger value="all" onClick={() => setFilter('all')}>All</TabsTrigger>
            <TabsTrigger value="keto" onClick={() => setFilter('keto')}>Keto</TabsTrigger>
            <TabsTrigger value="fasting" onClick={() => setFilter('fasting')}>Fasting</TabsTrigger>
            <TabsTrigger value="workout" onClick={() => setFilter('workout')}>Workout</TabsTrigger>
            <TabsTrigger value="water" onClick={() => setFilter('water')}>Water</TabsTrigger>
          </TabsList>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Challenges List */}
            <div className="lg:col-span-2">
              <TabsContent value="all" className="mt-0">
                <ChallengesList 
                  challenges={filteredChallenges}
                  isJoined={isJoined}
                  joinChallenge={joinChallenge}
                  getChallengeIcon={getChallengeIcon}
                />
              </TabsContent>
              <TabsContent value="keto" className="mt-0">
                <ChallengesList 
                  challenges={filteredChallenges}
                  isJoined={isJoined}
                  joinChallenge={joinChallenge}
                  getChallengeIcon={getChallengeIcon}
                />
              </TabsContent>
              <TabsContent value="fasting" className="mt-0">
                <ChallengesList 
                  challenges={filteredChallenges}
                  isJoined={isJoined}
                  joinChallenge={joinChallenge}
                  getChallengeIcon={getChallengeIcon}
                />
              </TabsContent>
              <TabsContent value="workout" className="mt-0">
                <ChallengesList 
                  challenges={filteredChallenges}
                  isJoined={isJoined}
                  joinChallenge={joinChallenge}
                  getChallengeIcon={getChallengeIcon}
                />
              </TabsContent>
              <TabsContent value="water" className="mt-0">
                <ChallengesList 
                  challenges={filteredChallenges}
                  isJoined={isJoined}
                  joinChallenge={joinChallenge}
                  getChallengeIcon={getChallengeIcon}
                />
              </TabsContent>
            </div>

            {/* Leaderboard */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Leaderboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {leaderboard.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      No participants yet. Be the first!
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {leaderboard.map((entry, index) => (
                        <div key={entry.user_id} className="flex items-center gap-3">
                          <span className={`font-bold text-lg w-6 ${
                            index === 0 ? 'text-yellow-500' : 
                            index === 1 ? 'text-gray-400' : 
                            index === 2 ? 'text-amber-600' : 'text-muted-foreground'
                          }`}>
                            {index + 1}
                          </span>
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={entry.avatar_url || undefined} />
                            <AvatarFallback>{entry.display_name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{entry.display_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {entry.challenges_completed} challenges
                            </p>
                          </div>
                          <Badge variant="secondary">{entry.total_points} pts</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Active Challenges */}
              {user && userChallenges.length > 0 && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Your Active Challenges
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {userChallenges.filter(uc => !uc.is_completed).slice(0, 3).map((uc) => (
                        <div key={uc.id} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-sm">{uc.challenges?.title}</span>
                            <span className="text-xs text-muted-foreground">
                              {uc.current_progress}%
                            </span>
                          </div>
                          <Progress value={uc.current_progress || 0} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

interface ChallengesListProps {
  challenges: Challenge[];
  isJoined: (id: string) => boolean;
  joinChallenge: (id: string) => void;
  getChallengeIcon: (type: string) => React.ReactNode;
}

const ChallengesList = ({ challenges, isJoined, joinChallenge, getChallengeIcon }: ChallengesListProps) => {
  if (challenges.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No challenges available in this category.
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {challenges.map((challenge) => (
        <Card key={challenge.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getChallengeIcon(challenge.challenge_type)}
                <span className="text-lg">{challenge.title}</span>
              </div>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {challenge.duration_days} days
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{challenge.description}</p>
            {challenge.target_value && (
              <p className="text-sm text-muted-foreground mb-4">
                Target: {challenge.target_value} {challenge.target_unit}
              </p>
            )}
            <Button
              className="w-full"
              variant={isJoined(challenge.id) ? 'secondary' : 'default'}
              onClick={() => joinChallenge(challenge.id)}
              disabled={isJoined(challenge.id)}
            >
              {isJoined(challenge.id) ? 'Joined!' : 'Join Challenge'}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Challenges;
