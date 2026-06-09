import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, RefreshCw, Eye, Webhook } from "lucide-react";
import { format } from "date-fns";

type Log = {
  id: string;
  transaction_receipt: string | null;
  transaction_type: string | null;
  product_id: string | null;
  customer_email: string | null;
  amount: number | null;
  raw_payload: Record<string, unknown>;
  signature_valid: boolean;
  processed: boolean;
  duplicate: boolean;
  response_status: number | null;
  response_body: string | null;
  error_message: string | null;
  created_at: string;
};

export const AdminWebhookLogs = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Log | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("jvzoo_webhook_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (!error && data) setLogs(data as Log[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const statusBadge = (log: Log) => {
    if (!log.signature_valid) return <Badge variant="destructive">Invalid Sig</Badge>;
    if (log.duplicate) return <Badge variant="secondary">Duplicate</Badge>;
    if (log.processed) return <Badge className="bg-green-600">Processed</Badge>;
    if (log.error_message) return <Badge variant="destructive">Error</Badge>;
    return <Badge variant="outline">Ignored</Badge>;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Webhook className="h-5 w-5" /> JVZoo Webhook Logs
        </CardTitle>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : logs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No webhook events yet. They will appear here as JVZoo posts notifications.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Receipt</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>HTTP</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs whitespace-nowrap">
                      {format(new Date(log.created_at), "MMM d, HH:mm:ss")}
                    </TableCell>
                    <TableCell className="text-xs">{log.transaction_type || "—"}</TableCell>
                    <TableCell className="text-xs font-mono">{log.transaction_receipt || "—"}</TableCell>
                    <TableCell className="text-xs">{log.customer_email || "—"}</TableCell>
                    <TableCell className="text-xs">{log.amount != null ? `$${log.amount}` : "—"}</TableCell>
                    <TableCell>{statusBadge(log)}</TableCell>
                    <TableCell className="text-xs">{log.response_status ?? "—"}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => setSelected(log)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <Dialog open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Webhook Event Detail</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div><strong>Time:</strong> {format(new Date(selected.created_at), "PPpp")}</div>
              <div><strong>Status:</strong> {statusBadge(selected)} (HTTP {selected.response_status})</div>
              {selected.error_message && (
                <div className="text-destructive"><strong>Error:</strong> {selected.error_message}</div>
              )}
              <div>
                <strong>Raw Payload:</strong>
                <pre className="bg-muted p-3 rounded text-xs overflow-x-auto mt-1">
                  {JSON.stringify(selected.raw_payload, null, 2)}
                </pre>
              </div>
              <div>
                <strong>Response:</strong>
                <pre className="bg-muted p-3 rounded text-xs overflow-x-auto mt-1">
                  {selected.response_body || "—"}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};
