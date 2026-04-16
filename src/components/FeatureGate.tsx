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
  const { hasAccess, loading, subscription } = useSubscription();
  const navigate = useNavigate();

  if (loading) return <>{children}</>;

  if (!hasAccess(feature)) {
    const isBasicUser = subscription?.is_active && subscription?.plan_type === 'basic';
    return (
      <div className="relative">
        <div className="blur-sm pointer-events-none select-none opacity-40">{children}</div>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/70 backdrop-blur-sm rounded-lg z-10">
          <Lock className="h-10 w-10 text-primary mb-3" />
          <p className="text-sm text-muted-foreground mb-3 text-center px-4">
            {fallbackMessage || (isBasicUser ? 'This feature requires a VIP upgrade' : 'This feature requires a paid plan')}
          </p>
          <Button
            size="sm"
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-90"
            onClick={() => navigate(isBasicUser ? '/vip-upgrade' : '/pricing')}
          >
            🔓 {isBasicUser ? 'Upgrade to VIP' : 'Get Started'}
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default FeatureGate;
