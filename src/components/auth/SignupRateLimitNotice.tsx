import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Clock, Mail, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { isRateLimitError, getRetryAfterSeconds } from '@/lib/authRateLimit';

interface Props {
  email: string;
  until: number; // epoch ms when the user may retry
  onUntilChange: (until: number) => void;
}

/** Shown when sign-ups are temporarily limited. Counts down and offers a fresh verification email. */
export const SignupRateLimitNotice = ({ email, until, onUntilChange }: Props) => {
  const { toast } = useToast();
  const [now, setNow] = useState(Date.now());
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const secondsLeft = Math.max(0, Math.ceil((until - now) / 1000));
  const waiting = secondsLeft > 0;

  const resend = async () => {
    if (!email) return;
    setResending(true);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    setResending(false);
    if (error) {
      if (isRateLimitError(error)) onUntilChange(Date.now() + getRetryAfterSeconds(error) * 1000);
      toast({ title: "Couldn't send email yet", description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Verification email sent', description: `Check ${email} (and your spam folder).` });
    }
  };

  return (
    <Alert className="border-primary/40 bg-primary/5">
      <Clock className="h-4 w-4" />
      <AlertTitle>Sign-ups are busy right now</AlertTitle>
      <AlertDescription className="space-y-3">
        <p>
          Too many sign-up emails were sent in a short time. Your details are saved —
          {waiting ? <> you can try again in <strong>{secondsLeft}s</strong>.</> : <> you can try again now.</>}
        </p>
        <p className="text-sm text-muted-foreground">
          Already signed up with this email? Request a fresh verification email instead.
        </p>
        <Button type="button" variant="outline" size="sm" onClick={resend} disabled={waiting || resending || !email}>
          {resending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
          {waiting ? `Resend verification email (${secondsLeft}s)` : 'Resend verification email'}
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default SignupRateLimitNotice;
