import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Shield, Flag, Ban, UserX, AlertTriangle, Check, X, Eye, 
  Unlock, Clock, Search
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthContext';

interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  post_id: string | null;
  reason: string;
  details: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  resolved_at: string | null;
}

interface Ban {
  id: string;
  user_id: string;
  ban_type: string;
  reason: string;
  banned_by: string;
  expires_at: string | null;
  created_at: string;
  lifted_at: string | null;
  is_active: boolean;
}

export const AdminModeration = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [bans, setBans] = useState<Ban[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [banUserId, setBanUserId] = useState('');
  const [banType, setBanType] = useState('suspended');
  const [banReason, setBanReason] = useState('');
  const [banDuration, setBanDuration] = useState('7');
  const [adminNotes, setAdminNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [reportsRes, bansRes] = await Promise.all([
        supabase.from('user_reports').select('*').order('created_at', { ascending: false }),
        supabase.from('user_bans').select('*').order('created_at', { ascending: false })
      ]);

      setReports(reportsRes.data || []);
      setBans(bansRes.data || []);
    } catch (error) {
      console.error('Error fetching moderation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const resolveReport = async (reportId: string, status: 'resolved' | 'dismissed') => {
    if (!user) return;

    try {
      await supabase
        .from('user_reports')
        .update({
          status,
          admin_notes: adminNotes || null,
          resolved_at: new Date().toISOString()
        })
        .eq('id', reportId);

      setReports(prev => prev.map(r =>
        r.id === reportId ? { ...r, status, admin_notes: adminNotes, resolved_at: new Date().toISOString() } : r
      ));
      setSelectedReport(null);
      setAdminNotes('');
      toast({ title: `Report ${status}` });
    } catch (error) {
      toast({ title: 'Error updating report', variant: 'destructive' });
    }
  };

  const createBan = async () => {
    if (!user || !banUserId || !banReason) return;

    try {
      const expiresAt = banType === 'suspended' && banDuration !== 'permanent'
        ? new Date(Date.now() + parseInt(banDuration) * 24 * 60 * 60 * 1000).toISOString()
        : null;

      await supabase.from('user_bans').insert({
        user_id: banUserId,
        ban_type: banType,
        reason: banReason,
        banned_by: user.id,
        expires_at: expiresAt
      });

      fetchData();
      setShowBanDialog(false);
      resetBanForm();
      toast({ title: 'User banned successfully' });
    } catch (error) {
      toast({ title: 'Error banning user', variant: 'destructive' });
    }
  };

  const liftBan = async (banId: string) => {
    try {
      await supabase
        .from('user_bans')
        .update({ is_active: false, lifted_at: new Date().toISOString() })
        .eq('id', banId);

      setBans(prev => prev.map(b =>
        b.id === banId ? { ...b, is_active: false, lifted_at: new Date().toISOString() } : b
      ));
      toast({ title: 'Ban lifted' });
    } catch (error) {
      toast({ title: 'Error lifting ban', variant: 'destructive' });
    }
  };

  const resetBanForm = () => {
    setBanUserId('');
    setBanType('suspended');
    setBanReason('');
    setBanDuration('7');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Pending</Badge>;
      case 'resolved':
        return <Badge variant="secondary" className="bg-green-100 text-green-700">Resolved</Badge>;
      case 'dismissed':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-700">Dismissed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const pendingReports = reports.filter(r => r.status === 'pending');
  const activeBans = bans.filter(b => b.is_active);
  const inactiveBans = bans.filter(b => !b.is_active);

  if (loading) {
    return <div className="text-center py-8">Loading moderation data...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Community Moderation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="reports">
          <TabsList className="mb-4">
            <TabsTrigger value="reports" className="flex items-center gap-1">
              <Flag className="h-4 w-4" />
              Reports
              {pendingReports.length > 0 && (
                <Badge variant="destructive" className="ml-1">{pendingReports.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="bans" className="flex items-center gap-1">
              <Ban className="h-4 w-4" />
              Bans ({activeBans.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <div className="flex justify-between items-center mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button onClick={() => setShowBanDialog(true)}>
                <UserX className="h-4 w-4 mr-2" />
                Ban User
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No reports yet
                    </TableCell>
                  </TableRow>
                ) : (
                  reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>{formatDate(report.created_at)}</TableCell>
                      <TableCell>
                        <span className="capitalize">{report.reason.replace('_', ' ')}</span>
                      </TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedReport(report)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {report.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => resolveReport(report.id, 'resolved')}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => resolveReport(report.id, 'dismissed')}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TabsContent>

          {/* Active Bans Tab */}
          <TabsContent value="bans">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeBans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No active bans
                    </TableCell>
                  </TableRow>
                ) : (
                  activeBans.map((ban) => (
                    <TableRow key={ban.id}>
                      <TableCell className="font-mono text-xs">
                        {ban.user_id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <Badge variant={ban.ban_type === 'banned' ? 'destructive' : 'secondary'}>
                          {ban.ban_type}
                        </Badge>
                      </TableCell>
                      <TableCell>{ban.reason}</TableCell>
                      <TableCell>
                        {ban.expires_at ? formatDate(ban.expires_at) : 'Permanent'}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => liftBan(ban.id)}
                        >
                          <Unlock className="h-4 w-4 mr-1" />
                          Unban
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Banned</TableHead>
                  <TableHead>Lifted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inactiveBans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No ban history
                    </TableCell>
                  </TableRow>
                ) : (
                  inactiveBans.map((ban) => (
                    <TableRow key={ban.id}>
                      <TableCell className="font-mono text-xs">
                        {ban.user_id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{ban.ban_type}</Badge>
                      </TableCell>
                      <TableCell>{ban.reason}</TableCell>
                      <TableCell>{formatDate(ban.created_at)}</TableCell>
                      <TableCell>{ban.lifted_at ? formatDate(ban.lifted_at) : '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>

        {/* Report Detail Dialog */}
        <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Report Details</DialogTitle>
            </DialogHeader>
            {selectedReport && (
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium">Reason:</span>
                  <p className="capitalize">{selectedReport.reason.replace('_', ' ')}</p>
                </div>
                {selectedReport.details && (
                  <div>
                    <span className="text-sm font-medium">Details:</span>
                    <p className="text-sm text-muted-foreground">{selectedReport.details}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium">Reported User:</span>
                  <p className="font-mono text-xs">{selectedReport.reported_user_id}</p>
                </div>
                {selectedReport.status === 'pending' && (
                  <div>
                    <span className="text-sm font-medium">Admin Notes:</span>
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add notes about this report..."
                    />
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              {selectedReport?.status === 'pending' && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => resolveReport(selectedReport.id, 'dismissed')}
                  >
                    Dismiss
                  </Button>
                  <Button
                    onClick={() => {
                      setBanUserId(selectedReport.reported_user_id);
                      setSelectedReport(null);
                      setShowBanDialog(true);
                    }}
                    variant="destructive"
                  >
                    Ban User
                  </Button>
                  <Button onClick={() => resolveReport(selectedReport.id, 'resolved')}>
                    Resolve
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Ban User Dialog */}
        <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Ban User
              </DialogTitle>
              <DialogDescription>
                This action will prevent the user from participating in the community.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">User ID</label>
                <Input
                  value={banUserId}
                  onChange={(e) => setBanUserId(e.target.value)}
                  placeholder="Enter user ID..."
                />
              </div>
              <div>
                <label className="text-sm font-medium">Ban Type</label>
                <Select value={banType} onValueChange={setBanType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="suspended">Suspended (Temporary)</SelectItem>
                    <SelectItem value="banned">Banned (Permanent)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {banType === 'suspended' && (
                <div>
                  <label className="text-sm font-medium">Duration</label>
                  <Select value={banDuration} onValueChange={setBanDuration}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 day</SelectItem>
                      <SelectItem value="3">3 days</SelectItem>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="permanent">Permanent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <label className="text-sm font-medium">Reason</label>
                <Textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Reason for ban..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBanDialog(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={createBan}
                disabled={!banUserId || !banReason}
              >
                Ban User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
