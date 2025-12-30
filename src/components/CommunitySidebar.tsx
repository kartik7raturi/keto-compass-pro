import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Users, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Community {
  id: string;
  name: string;
  image_url: string | null;
  member_count: number;
}

interface CommunitySidebarProps {
  selectedCommunityId: string | null;
  onSelectCommunity: (community: Community) => void;
}

const CommunitySidebar = ({ selectedCommunityId, onSelectCommunity }: CommunitySidebarProps) => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      const { data } = await supabase
        .from('communities')
        .select('*')
        .order('member_count', { ascending: false });
      setCommunities(data || []);
    } catch (error) {
      console.error('Error fetching communities:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-16 md:w-20 bg-muted/50 border-r flex flex-col items-center py-4 gap-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="w-16 md:w-20 bg-muted/30 border-r flex flex-col">
      <ScrollArea className="flex-1">
        <div className="flex flex-col items-center py-3 gap-2">
          {communities.map((community) => (
            <Tooltip key={community.id} delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onSelectCommunity(community)}
                  className={`
                    w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden
                    transition-all duration-200 hover:scale-105
                    ${selectedCommunityId === community.id 
                      ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' 
                      : 'hover:ring-2 hover:ring-muted-foreground/50'
                    }
                  `}
                >
                  {community.image_url ? (
                    <img 
                      src={community.image_url} 
                      alt={community.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="flex flex-col">
                <span className="font-medium">{community.name}</span>
                <span className="text-xs text-muted-foreground">{community.member_count} members</span>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default CommunitySidebar;
