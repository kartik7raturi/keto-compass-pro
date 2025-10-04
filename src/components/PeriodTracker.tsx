import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface PeriodLog {
  id: string;
  start_date: string;
  end_date: string | null;
  flow_intensity: string | null;
  symptoms: string[];
  notes: string | null;
}

export const PeriodTracker = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [logs, setLogs] = useState<PeriodLog[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [flowIntensity, setFlowIntensity] = useState<string>("medium");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const symptomOptions = ["Cramps", "Fatigue", "Bloating", "Mood Swings", "Headache", "Acne"];

  useEffect(() => {
    if (user) {
      fetchLogs();
    }
  }, [user]);

  const fetchLogs = async () => {
    const { data } = await supabase
      .from('period_logs')
      .select('*')
      .eq('user_id', user?.id)
      .order('start_date', { ascending: false });

    if (data) setLogs(data);
  };

  const handleSubmit = async () => {
    if (!startDate) {
      toast({ variant: "destructive", title: "Please select a start date" });
      return;
    }

    try {
      await supabase.from('period_logs').insert({
        user_id: user?.id,
        start_date: startDate,
        end_date: endDate || null,
        flow_intensity: flowIntensity,
        symptoms: symptoms,
        notes: notes
      });

      toast({ title: "Period log added successfully!" });
      setDialogOpen(false);
      resetForm();
      fetchLogs();
    } catch (error) {
      toast({ variant: "destructive", title: "Error adding log" });
    }
  };

  const resetForm = () => {
    setStartDate("");
    setEndDate("");
    setFlowIntensity("medium");
    setSymptoms([]);
    setNotes("");
  };

  const toggleSymptom = (symptom: string) => {
    setSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const calculateCycleLength = () => {
    if (logs.length < 2) return null;
    const firstDate = new Date(logs[1].start_date);
    const secondDate = new Date(logs[0].start_date);
    const diffTime = Math.abs(secondDate.getTime() - firstDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const predictNextPeriod = () => {
    const cycleLength = calculateCycleLength();
    if (!cycleLength || logs.length === 0) return null;
    
    const lastPeriod = new Date(logs[0].start_date);
    const nextPeriod = new Date(lastPeriod);
    nextPeriod.setDate(nextPeriod.getDate() + cycleLength);
    return nextPeriod.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-pink-500" />
              Period Tracker
            </CardTitle>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Log
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Period Log</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>End Date (Optional)</Label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Flow Intensity</Label>
                    <Select value={flowIntensity} onValueChange={setFlowIntensity}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="heavy">Heavy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Symptoms</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {symptomOptions.map((symptom) => (
                        <Badge
                          key={symptom}
                          variant={symptoms.includes(symptom) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleSymptom(symptom)}
                        >
                          {symptom}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any additional notes..."
                    />
                  </div>
                  <Button onClick={handleSubmit} className="w-full">
                    Save Log
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {logs.length > 0 && (
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-secondary/50 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Average Cycle</div>
                <div className="text-2xl font-bold">
                  {calculateCycleLength() || "N/A"} days
                </div>
              </div>
              <div className="p-4 bg-secondary/50 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Predicted Next</div>
                <div className="text-2xl font-bold">
                  {predictNextPeriod() || "N/A"}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {logs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No period logs yet. Add your first log to start tracking!
              </p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold">
                        {new Date(log.start_date).toLocaleDateString()}
                        {log.end_date && ` - ${new Date(log.end_date).toLocaleDateString()}`}
                      </div>
                      {log.flow_intensity && (
                        <Badge variant="outline" className="mt-1">
                          {log.flow_intensity}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {log.symptoms && log.symptoms.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {log.symptoms.map((symptom) => (
                        <Badge key={symptom} variant="secondary" className="text-xs">
                          {symptom}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {log.notes && (
                    <p className="text-sm text-muted-foreground">{log.notes}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
