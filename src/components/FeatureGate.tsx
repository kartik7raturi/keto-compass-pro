import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface FeatureGateProps {
  feature: string;
  children: React.ReactNode;
  fallbackMessage?: string;
}

const FeatureGate: React.FC<FeatureGateProps> = ({ feature, children, fallbackMessage }) => {
  const { hasAccess, loading } = useSubscription();
  const navigate = useNavigate();

  // Show content while loading to prevent flash
  if (loading) return <>{children}</>;

  if (!hasAccess(feature)) {
    return (
      <div className="relative">
        <div className="blur-sm pointer-events-none select-none opacity-40">{children}</div>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/70 backdrop-blur-sm rounded-lg z-10">
          <Lock className="h-10 w-10 text-primary mb-3" />
          <p className="text-sm text-muted-foreground mb-3 text-center px-4">
            {fallbackMessage || 'This feature requires a VIP upgrade'}
          </p>
          <Button
            size="sm"
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-90"
            onClick={() => navigate('/vip-upgrade')}
          >
            🔓 Upgrade to VIP
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default FeatureGate;
