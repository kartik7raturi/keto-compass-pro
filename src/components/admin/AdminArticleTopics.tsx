import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, Trash2, Play } from "lucide-react";

interface TopicRow {
  id: string;
  topic: string;
  category: string;
  status: string;
  scheduled_for: string | null;
  error_message: string | null;
  generated_article_id: string | null;
  created_at: string;
}

export const AdminArticleTopics = () => {
  const { toast } = useToast();
  const [topics, setTopics] = useState<TopicRow[]>([]);
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState("general");
  const [scheduledFor, setScheduledFor] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("article_topics_queue")
      .select("*")
      .order("created_at", { ascending: false });
    setTopics((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addTopic = async () => {
    if (!topic.trim()) return;
    const { error } = await supabase.from("article_topics_queue").insert({
      topic: topic.trim(),
      category: category.trim() || "general",
      scheduled_for: scheduledFor || null,
      status: "pending",
    });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Topic added to queue" });
    setTopic(""); setScheduledFor("");
    load();
  };

  const addBulk = async () => {
    const raw = prompt("Paste one topic per line:");
    if (!raw) return;
    const lines = raw.split(/\n/).map(s => s.trim()).filter(Boolean);
    if (!lines.length) return;
    const rows = lines.map(t => ({ topic: t, category, status: "pending" }));
    const { error } = await supabase.from("article_topics_queue").insert(rows);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: `${lines.length} topics queued` });
    load();
  };

  const removeTopic = async (id: string) => {
    if (!confirm("Delete this topic?")) return;
    await supabase.from("article_topics_queue").delete().eq("id", id);
    load();
  };

  const generateNow = async (id?: string) => {
    setBusyId(id || "next");
    const { data, error } = await supabase.functions.invoke("generate-daily-article", {
      body: id ? { topic_id: id } : {},
    });
    setBusyId(null);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Article generated", description: (data as any)?.article?.title || "Done" });
    load();
  };

  const statusColor = (s: string) => s === "generated" ? "default" : s === "failed" ? "destructive" : "secondary";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" /> AI Article Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <Label>Topic</Label>
              <Input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Best keto breakfasts under 5g net carbs" />
            </div>
            <div>
              <Label>Category</Label>
              <Input value={category} onChange={e => setCategory(e.target.value)} placeholder="beginner / nutrition / tips" />
            </div>
            <div>
              <Label>Scheduled for (optional)</Label>
              <Input type="date" value={scheduledFor} onChange={e => setScheduledFor(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={addTopic}>Add to Queue</Button>
            <Button variant="outline" onClick={addBulk}>Bulk add…</Button>
            <Button variant="secondary" onClick={() => generateNow()} disabled={busyId === "next"}>
              {busyId === "next" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
              Generate & Publish Next Pending
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            A daily cron job automatically publishes one pending topic every day at 07:00 UTC. You can also generate manually.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-4"><CardTitle className="text-base">Queue ({topics.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : topics.length === 0 ? (
            <p className="text-sm text-muted-foreground">No topics yet. Add some above.</p>
          ) : (
            <div className="space-y-2">
              {topics.map(t => (
                <div key={t.id} className="flex items-center justify-between gap-3 p-3 border rounded-lg">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{t.topic}</p>
                    <div className="flex gap-2 mt-1 flex-wrap text-xs text-muted-foreground items-center">
                      <Badge variant={statusColor(t.status) as any}>{t.status}</Badge>
                      <span>{t.category}</span>
                      {t.scheduled_for && <span>· {t.scheduled_for}</span>}
                      {t.error_message && <span className="text-destructive">· {t.error_message}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {t.status === "pending" && (
                      <Button size="sm" variant="outline" onClick={() => generateNow(t.id)} disabled={busyId === t.id}>
                        {busyId === t.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => removeTopic(t.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
