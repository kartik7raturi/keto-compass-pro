import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Shield, Ban, MessageSquareOff, Link2Off, AlertTriangle, Heart, Users, ThumbsUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';

interface CommunityGuidelinesProps {
  open: boolean;
  onAccept: () => void;
}

const guidelines = [
  {
    icon: Ban,
    title: "No Promotions or Advertisements",
    description: "Keep the community focused on support, not sales. Any promotional content will be removed.",
    color: "text-red-500"
  },
  {
    icon: MessageSquareOff,
    title: "No Political Discussions",
    description: "This is a health-focused community. Keep conversations relevant to wellness and diet goals.",
    color: "text-orange-500"
  },
  {
    icon: Link2Off,
    title: "No Link Sharing or Promotional Images",
    description: "External links and promotional images are not allowed to keep everyone safe.",
    color: "text-yellow-600"
  },
  {
    icon: AlertTriangle,
    title: "No Spam or Abusive Content",
    description: "Be respectful. Harassment, hate speech, or spam will result in immediate suspension.",
    color: "text-red-600"
  },
  {
    icon: Heart,
    title: "Be Kind and Supportive",
    description: "Encourage fellow members on their journey. Celebrate wins and support through challenges.",
    color: "text-pink-500"
  },
  {
    icon: Users,
    title: "Respect Privacy",
    description: "Don't share personal information about others. What's shared here stays here.",
    color: "text-blue-500"
  },
  {
    icon: ThumbsUp,
    title: "Share Genuine Experiences",
    description: "Share your real journey, tips that worked for you, and honest feedback.",
    color: "text-green-500"
  }
];

export const CommunityGuidelines = ({ open, onAccept }: CommunityGuidelinesProps) => {
  const { user } = useAuth();
  const [agreed, setAgreed] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleAccept = async () => {
    if (!user || !agreed) return;
    
    setSaving(true);
    try {
      await supabase.from('community_guidelines_acceptance').upsert({
        user_id: user.id,
        version: '1.0'
      });
      onAccept();
    } catch (error) {
      console.error('Error saving acceptance:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="h-6 w-6 text-primary" />
            Community Guidelines
          </DialogTitle>
          <DialogDescription>
            Please review and accept our community guidelines before joining.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[50vh] pr-4">
          <div className="space-y-4">
            {guidelines.map((rule, index) => (
              <div key={index} className="flex gap-3 p-3 bg-muted/30 rounded-lg">
                <rule.icon className={`h-5 w-5 ${rule.color} shrink-0 mt-0.5`} />
                <div>
                  <h4 className="font-medium text-sm">{rule.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {rule.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="border-t pt-4 mt-4 space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="agree"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked === true)}
            />
            <Label htmlFor="agree" className="text-sm leading-relaxed cursor-pointer">
              I have read and agree to follow the community guidelines. I understand that
              violations may result in suspension or ban from the community.
            </Label>
          </div>

          <DialogFooter>
            <Button
              onClick={handleAccept}
              disabled={!agreed || saving}
              className="w-full sm:w-auto"
            >
              {saving ? 'Saving...' : 'Accept & Continue'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
