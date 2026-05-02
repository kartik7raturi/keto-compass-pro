import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const checkHasPaidPlan = async (userId: string) => {
    const { data } = await supabase
      .from('user_subscriptions')
      .select('plan_type, is_active')
      .eq('user_id', userId)
      .maybeSingle();
    return data && data.is_active && ['basic', 'vip', 'vip_lifetime'].includes(data.plan_type);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast({ title: "Error signing in", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Welcome back!" });
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const hasPaid = await checkHasPaidPlan(user.id);
          navigate(hasPaid ? '/progress' : '/pricing');
        } else {
          navigate('/');
        }
      }
    } catch {
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-foreground font-bold text-lg">K</span>
          </div>
          <CardTitle className="text-2xl">Welcome Back to Ketopia</CardTitle>
          <CardDescription>
            Sign in to access your keto dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signin-email">Email</Label>
              <Input id="signin-email" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signin-password">Password</Label>
              <Input id="signin-password" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-primary to-primary/80 hover:opacity-90" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>
          <p className="text-sm text-center text-muted-foreground mt-4">
            Don't have an account?{' '}
            <button className="text-primary hover:underline font-medium" onClick={() => navigate('/onboarding')}>
              Get your free keto plan
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
