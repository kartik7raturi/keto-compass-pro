import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

type RequiredPlan = "any_paid" | "vip";

interface Props {
  children: ReactNode;
  required?: RequiredPlan;
}

const ADMIN_EMAIL = 'sankhobusiness@gmail.com';

/**
 * Server-side plan guard.
 * Calls the SECURITY DEFINER `get_user_plan` RPC (which auto-expires stale subs)
 * and redirects to /pricing or /vip-upgrade based on the actual server-resolved plan.
 *
 * This prevents client-side tampering: the plan_type is computed server-side
 * against auth.uid(), not read from local state.
 */
const RequirePlan = ({ children, required = "any_paid" }: Props) => {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const [plan, setPlan] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      if (!user?.id) {
        setChecking(false);
        return;
      }
      const { data, error } = await supabase.rpc("get_user_plan", { p_user_id: user.id });
      if (cancelled) return;
      if (error) {
        setPlan("free");
      } else {
        setPlan((data as string) || "free");
      }
      setChecking(false);
    };
    check();
    return () => { cancelled = true; };
  }, [user?.id, location.pathname]);

  if (authLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  if (user.email?.toLowerCase() === ADMIN_EMAIL) {
    return <>{children}</>;
  }

  const paidPlans = ["basic", "vip", "vip_lifetime"];
  const vipPlans = ["vip", "vip_lifetime"];

  if (required === "any_paid" && !paidPlans.includes(plan ?? "")) {
    return <Navigate to="/pricing" replace />;
  }
  if (required === "vip" && !vipPlans.includes(plan ?? "")) {
    return <Navigate to="/vip-upgrade" replace />;
  }

  return <>{children}</>;
};

export default RequirePlan;
