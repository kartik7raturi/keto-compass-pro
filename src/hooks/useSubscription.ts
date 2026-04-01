import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';

export type PlanType = 'free' | 'basic' | 'vip';

interface Subscription {
  plan_type: PlanType;
  is_active: boolean;
  payment_type: string | null;
  amount_paid: number;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [surveyCompleted, setSurveyCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchSubscription();
      checkSurvey();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchSubscription = async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from('user_subscriptions')
      .select('plan_type, is_active, payment_type, amount_paid')
      .eq('user_id', user.id)
      .maybeSingle();
    setSubscription(data as Subscription | null);
    setLoading(false);
  };

  const checkSurvey = async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from('user_survey_responses')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
    setSurveyCompleted(!!data);
  };

  const hasAccess = (feature: string): boolean => {
    if (!subscription) return false;
    if (!subscription.is_active) return false;
    const plan = subscription.plan_type;
    
    const basicFeatures = ['recipes', 'tracker', 'basic_progress'];
    const vipFeatures = [
      'keto30', 'fasting', 'workout', 'water', 'weekly_plan', 'period',
      'custom_plan', 'weight_trend', 'energy_balance', 'visual_progress',
      'weekly_report', 'challenges', 'marketplace', 'advanced_progress'
    ];

    if (plan === 'vip') return true;
    if (plan === 'basic') return basicFeatures.includes(feature);
    return false;
  };

  const hasPaidPlan = (): boolean => {
    if (!subscription) return false;
    return subscription.is_active && (subscription.plan_type === 'basic' || subscription.plan_type === 'vip');
  };

  const upgradePlan = async (planType: PlanType, paymentType: string, amount: number) => {
    if (!user?.id) return;
    await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: user.id,
        plan_type: planType,
        payment_type: paymentType,
        amount_paid: amount,
        is_active: true,
        started_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
    await fetchSubscription();
  };

  return { subscription, loading, hasAccess, hasPaidPlan, upgradePlan, surveyCompleted };
};
