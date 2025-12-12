import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Award, Crown, Star, Flame, Timer, Dumbbell, Droplet, Users, Medal, Footprints, Leaf } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';

interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: string;
  badge_type: string;
  earned_at?: string;
}

const iconMap: Record<string, React.ReactNode> = {
  award: <Award className="h-6 w-6" />,
  crown: <Crown className="h-6 w-6" />,
  star: <Star className="h-6 w-6" />,
  flame: <Flame className="h-6 w-6" />,
  timer: <Timer className="h-6 w-6" />,
  hourglass: <Timer className="h-6 w-6" />,
  dumbbell: <Dumbbell className="h-6 w-6" />,
  droplet: <Droplet className="h-6 w-6" />,
  users: <Users className="h-6 w-6" />,
  medal: <Medal className="h-6 w-6" />,
  footprints: <Footprints className="h-6 w-6" />,
  leaf: <Leaf className="h-6 w-6" />,
  sword: <Award className="h-6 w-6" />,
};

const ProfileBadges = () => {
  const [allBadges, setAllBadges] = useState<BadgeData[]>([]);
  const [earnedBadgeIds, setEarnedBadgeIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchBadges();
  }, [user]);

  const fetchBadges = async () => {
    try {
      // Fetch all badges
      const { data: badges } = await supabase
        .from('badges')
        .select('*')
        .order('badge_type');
      
      setAllBadges(badges || []);

      // Fetch earned badges if user is logged in
      if (user) {
        const { data: userBadges } = await supabase
          .from('user_badges')
          .select('badge_id, earned_at')
          .eq('user_id', user.id);
        
        const earnedIds = new Set(userBadges?.map(ub => ub.badge_id) || []);
        setEarnedBadgeIds(earnedIds);
      }
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeColor = (type: string, earned: boolean) => {
    if (!earned) return 'bg-muted text-muted-foreground opacity-50';
    
    switch (type) {
      case 'challenge': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'keto': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'fasting': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'workout': return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
      case 'water': return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300';
      case 'community': return 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300';
      default: return 'bg-primary/10 text-primary';
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading badges...</div>;
  }

  const earnedBadges = allBadges.filter(b => earnedBadgeIds.has(b.id));
  const unearnedBadges = allBadges.filter(b => !earnedBadgeIds.has(b.id));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-yellow-500" />
          Badges & Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        {earnedBadges.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Earned ({earnedBadges.length})</h4>
            <div className="flex flex-wrap gap-3">
              {earnedBadges.map((badge) => (
                <Tooltip key={badge.id}>
                  <TooltipTrigger>
                    <div className={`p-3 rounded-full ${getBadgeColor(badge.badge_type, true)} transition-transform hover:scale-110`}>
                      {iconMap[badge.icon] || <Award className="h-6 w-6" />}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-semibold">{badge.name}</p>
                    <p className="text-sm text-muted-foreground">{badge.description}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        )}

        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            Available ({unearnedBadges.length})
          </h4>
          <div className="flex flex-wrap gap-3">
            {unearnedBadges.map((badge) => (
              <Tooltip key={badge.id}>
                <TooltipTrigger>
                  <div className={`p-3 rounded-full ${getBadgeColor(badge.badge_type, false)}`}>
                    {iconMap[badge.icon] || <Award className="h-6 w-6" />}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-semibold">{badge.name}</p>
                  <p className="text-sm text-muted-foreground">{badge.description}</p>
                  <Badge variant="outline" className="mt-1">Not earned yet</Badge>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileBadges;
