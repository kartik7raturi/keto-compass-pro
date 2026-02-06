import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, Search, MessageCircle } from 'lucide-react';
import { UserGroups } from './UserGroups';
import { UserSearch } from './UserSearch';
import { MessageRequests } from './MessageRequests';
import { GroupChat } from './GroupChat';
import { useAuth } from '@/components/auth/AuthContext';

interface CommunitySidebarPanelProps {
  onStartDirectMessage: (userId: string) => void;
}

export const CommunitySidebarPanel = ({ onStartDirectMessage }: CommunitySidebarPanelProps) => {
  const { user } = useAuth();
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'groups' | 'search' | 'requests'>('groups');

  if (!user) {
    return (
      <div className="p-4 text-center text-muted-foreground text-sm">
        Sign in to access groups and search
      </div>
    );
  }

  // If a group is selected, show the group chat
  if (selectedGroupId) {
    return (
      <GroupChat 
        groupId={selectedGroupId} 
        onBack={() => setSelectedGroupId(null)} 
      />
    );
  }

  return (
    <div className="h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 shrink-0">
          <TabsTrigger value="groups" className="gap-1 text-xs" onClick={(e) => e.stopPropagation()}>
            <Users className="h-3 w-3" />
            Groups
          </TabsTrigger>
          <TabsTrigger value="search" className="gap-1 text-xs" onClick={(e) => e.stopPropagation()}>
            <Search className="h-3 w-3" />
            Find
          </TabsTrigger>
          <TabsTrigger value="requests" className="gap-1 text-xs" onClick={(e) => e.stopPropagation()}>
            <MessageCircle className="h-3 w-3" />
            Requests
          </TabsTrigger>
        </TabsList>
        
        <ScrollArea className="flex-1 mt-4">
          <TabsContent value="groups" className="mt-0">
            <UserGroups 
              selectedGroupId={selectedGroupId}
              onSelectGroup={setSelectedGroupId}
            />
          </TabsContent>
          
          <TabsContent value="search" className="mt-0">
            <UserSearch onStartChat={onStartDirectMessage} />
          </TabsContent>
          
          <TabsContent value="requests" className="mt-0">
            <MessageRequests onAcceptRequest={onStartDirectMessage} />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
};
