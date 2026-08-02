import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const ADMIN_EMAIL = 'sankhobusiness@gmail.com';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'forgot'>('signin');
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const { signIn, resetPassword } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect');

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await resetPassword(resetEmail);
      if (error) {
        toast({ title: "Couldn't send reset email", description: error.message, variant: "destructive" });
      } else {
        setResetSent(true);
      }
    } catch {
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
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
        navigate(redirectTo || '/progress');
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
          {mode === 'forgot' ? (
            resetSent ? (
              <div className="text-center py-4 space-y-4">
                <p className="text-sm text-muted-foreground">
                  If an account exists for <strong>{resetEmail}</strong>, we've sent a password reset link to it. Check your inbox (and spam folder).
                </p>
                <Button variant="ghost" onClick={() => { setMode('signin'); setResetSent(false); }}>
                  Back to sign in
                </Button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Enter your email and we'll send you a link to reset your password.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input id="reset-email" type="email" placeholder="Enter your email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-primary to-primary/80 hover:opacity-90" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Reset Link
                </Button>
                <Button type="button" variant="ghost" className="w-full" onClick={() => setMode('signin')}>
                  Back to sign in
                </Button>
              </form>
            )
          ) : (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signin-email">Email</Label>
              <Input id="signin-email" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="signin-password">Password</Label>
                <button
                  type="button"
                  className="text-xs text-primary hover:underline"
                  onClick={() => setMode('forgot')}
                >
                  Forgot password?
                </button>
              </div>
              <Input id="signin-password" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-primary to-primary/80 hover:opacity-90" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>
          )}
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
