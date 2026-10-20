import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Status {
  pixel_id: string;
  token_configured: boolean;
  token_valid: boolean;
  tracking_active: boolean;
  detail: string;
  checked_at: string;
}

const Row = ({ label, ok, okText, badText }: { label: string; ok: boolean; okText: string; badText: string }) => (
  <div className="flex items-center justify-between border-b py-3 last:border-0">
    <span className="text-sm">{label}</span>
    <Badge variant={ok ? 'default' : 'destructive'}>{ok ? okText : badText}</Badge>
  </div>
);

export const AdminTrackingStatus = () => {
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    const { data, error } = await supabase.functions.invoke('meta-capi-status', { method: 'GET' });
    if (error) setError('Could not load status.');
    else setStatus(data as Status);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Meta Conversions API</CardTitle>
          <CardDescription>Server-side purchase tracking for Facebook ads.</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </Button>
      </CardHeader>
      <CardContent>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {status && (
          <>
            <Row label="Access token saved" ok={status.token_configured} okText="Configured" badText="Missing" />
            <Row label="Token accepted by Meta" ok={status.token_valid} okText="Valid" badText={status.token_configured ? 'Invalid' : 'Not checked'} />
            <Row label="Server-side purchase tracking" ok={status.tracking_active} okText="Active" badText="Inactive" />
            <p className="text-sm text-muted-foreground mt-4">{status.detail}</p>
            <p className="text-xs text-muted-foreground mt-1">Pixel {status.pixel_id} · checked {new Date(status.checked_at).toLocaleString()}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminTrackingStatus;
