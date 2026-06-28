import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, PlayCircle, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface Module {
  id: string; slug: string; title: string; description: string | null;
  cover_url: string | null; sort_order: number; is_published: boolean;
}
interface Lesson {
  id: string; module_id: string; slug: string; title: string; description: string | null;
  video_url: string | null; duration_sec: number; sort_order: number;
  is_preview: boolean; is_published: boolean;
}

const emptyModule = { slug: "", title: "", description: "", cover_url: "", sort_order: 0, is_published: true };
const emptyLesson = { slug: "", title: "", description: "", video_url: "", duration_sec: 0, sort_order: 0, is_preview: false, is_published: true };

export const AdminCourse = () => {
  const { toast } = useToast();
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [modOpen, setModOpen] = useState(false);
  const [modEditing, setModEditing] = useState<Module | null>(null);
  const [modForm, setModForm] = useState<any>(emptyModule);
  const [lesOpen, setLesOpen] = useState(false);
  const [lesEditing, setLesEditing] = useState<Lesson | null>(null);
  const [lesForm, setLesForm] = useState<any>(emptyLesson);
  const [lesModuleId, setLesModuleId] = useState<string>("");

  const load = async () => {
    setLoading(true);
    const [{ data: m }, { data: l }] = await Promise.all([
      supabase.from("course_modules").select("*").order("sort_order"),
      supabase.from("course_lessons").select("*").order("sort_order"),
    ]);
    setModules((m as any) || []);
    setLessons((l as any) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openModuleDialog = (mod?: Module) => {
    if (mod) { setModEditing(mod); setModForm({ ...mod, description: mod.description || "", cover_url: mod.cover_url || "" }); }
    else { setModEditing(null); setModForm({ ...emptyModule, sort_order: modules.length }); }
    setModOpen(true);
  };

  const saveModule = async () => {
    if (!modForm.title || !modForm.slug) { toast({ title: "Title and slug required", variant: "destructive" }); return; }
    const payload = { ...modForm, description: modForm.description || null, cover_url: modForm.cover_url || null };
    const { error } = modEditing
      ? await supabase.from("course_modules").update(payload).eq("id", modEditing.id)
      : await supabase.from("course_modules").insert(payload);
    if (error) { toast({ title: "Failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: modEditing ? "Module updated" : "Module created" });
    setModOpen(false); load();
  };

  const deleteModule = async (id: string) => {
    if (!confirm("Delete this module and all its lessons?")) return;
    const { error } = await supabase.from("course_modules").delete().eq("id", id);
    if (error) { toast({ title: "Failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Module deleted" }); load();
  };

  const openLessonDialog = (moduleId: string, les?: Lesson) => {
    setLesModuleId(moduleId);
    if (les) { setLesEditing(les); setLesForm({ ...les, description: les.description || "", video_url: les.video_url || "" }); }
    else {
      setLesEditing(null);
      const count = lessons.filter(l => l.module_id === moduleId).length;
      setLesForm({ ...emptyLesson, sort_order: count });
    }
    setLesOpen(true);
  };

  const saveLesson = async () => {
    if (!lesForm.title || !lesForm.slug) { toast({ title: "Title and slug required", variant: "destructive" }); return; }
    const payload = {
      ...lesForm,
      module_id: lesModuleId,
      description: lesForm.description || null,
      video_url: lesForm.video_url || null,
      duration_sec: Number(lesForm.duration_sec) || 0,
      sort_order: Number(lesForm.sort_order) || 0,
    };
    const { error } = lesEditing
      ? await supabase.from("course_lessons").update(payload).eq("id", lesEditing.id)
      : await supabase.from("course_lessons").insert(payload);
    if (error) { toast({ title: "Failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: lesEditing ? "Lesson updated" : "Lesson created" });
    setLesOpen(false); load();
  };

  const deleteLesson = async (id: string) => {
    if (!confirm("Delete this lesson?")) return;
    const { error } = await supabase.from("course_lessons").delete().eq("id", id);
    if (error) { toast({ title: "Failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Lesson deleted" }); load();
  };

  if (loading) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /> Course Manager</h3>
          <p className="text-sm text-muted-foreground">Manage modules, video lessons, and preview gating.</p>
        </div>
        <Button onClick={() => openModuleDialog()}><Plus className="h-4 w-4 mr-1" /> New Module</Button>
      </div>

      {modules.length === 0 && (
        <Card><CardContent className="p-6 text-center text-muted-foreground">No modules yet. Create your first module to get started.</CardContent></Card>
      )}

      {modules.map((m) => {
        const ml = lessons.filter(l => l.module_id === m.id);
        return (
          <Card key={m.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div className="flex-1 min-w-0">
                <CardTitle className="flex items-center gap-2 text-base">
                  {m.title}
                  {!m.is_published && <Badge variant="outline" className="text-xs">Draft</Badge>}
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">/{m.slug} · sort {m.sort_order} · {ml.length} lesson{ml.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => openLessonDialog(m.id)}><Plus className="h-3.5 w-3.5 mr-1" /> Lesson</Button>
                <Button size="sm" variant="ghost" onClick={() => openModuleDialog(m)}><Pencil className="h-3.5 w-3.5" /></Button>
                <Button size="sm" variant="ghost" onClick={() => deleteModule(m.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {ml.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">No lessons yet.</p>
              ) : (
                <div className="divide-y border rounded-md">
                  {ml.map(l => (
                    <div key={l.id} className="flex items-center justify-between p-3 gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <PlayCircle className="h-4 w-4 text-primary flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate flex items-center gap-2">
                            {l.title}
                            {l.is_preview && <Badge variant="secondary" className="text-[10px] h-4">Preview</Badge>}
                            {!l.is_published && <Badge variant="outline" className="text-[10px] h-4">Draft</Badge>}
                          </p>
                          <p className="text-xs text-muted-foreground">/{l.slug} · {Math.round(l.duration_sec / 60)}min</p>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button size="sm" variant="ghost" onClick={() => openLessonDialog(m.id, l)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteLesson(l.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Module dialog */}
      <Dialog open={modOpen} onOpenChange={setModOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{modEditing ? "Edit module" : "New module"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={modForm.title} onChange={e => setModForm({ ...modForm, title: e.target.value })} /></div>
            <div><Label>Slug (URL)</Label><Input value={modForm.slug} onChange={e => setModForm({ ...modForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })} /></div>
            <div><Label>Description</Label><Textarea rows={3} value={modForm.description} onChange={e => setModForm({ ...modForm, description: e.target.value })} /></div>
            <div><Label>Cover image URL</Label><Input value={modForm.cover_url} onChange={e => setModForm({ ...modForm, cover_url: e.target.value })} /></div>
            <div><Label>Sort order</Label><Input type="number" value={modForm.sort_order} onChange={e => setModForm({ ...modForm, sort_order: Number(e.target.value) })} /></div>
            <div className="flex items-center gap-2"><Switch checked={modForm.is_published} onCheckedChange={(v) => setModForm({ ...modForm, is_published: v })} /><Label>Published</Label></div>
            <div className="flex gap-2 pt-2"><Button onClick={saveModule} className="flex-1">Save</Button><Button variant="outline" onClick={() => setModOpen(false)}>Cancel</Button></div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lesson dialog */}
      <Dialog open={lesOpen} onOpenChange={setLesOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{lesEditing ? "Edit lesson" : "New lesson"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={lesForm.title} onChange={e => setLesForm({ ...lesForm, title: e.target.value })} /></div>
            <div><Label>Slug (URL)</Label><Input value={lesForm.slug} onChange={e => setLesForm({ ...lesForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })} /></div>
            <div>
              <Label>Video URL (YouTube, Vimeo, or .mp4)</Label>
              <Input placeholder="https://youtube.com/watch?v=…" value={lesForm.video_url} onChange={e => setLesForm({ ...lesForm, video_url: e.target.value })} />
            </div>
            <div><Label>Description</Label><Textarea rows={3} value={lesForm.description} onChange={e => setLesForm({ ...lesForm, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Duration (seconds)</Label><Input type="number" value={lesForm.duration_sec} onChange={e => setLesForm({ ...lesForm, duration_sec: Number(e.target.value) })} /></div>
              <div><Label>Sort order</Label><Input type="number" value={lesForm.sort_order} onChange={e => setLesForm({ ...lesForm, sort_order: Number(e.target.value) })} /></div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2"><Switch checked={lesForm.is_preview} onCheckedChange={(v) => setLesForm({ ...lesForm, is_preview: v })} /><Label>Free preview</Label></div>
              <div className="flex items-center gap-2"><Switch checked={lesForm.is_published} onCheckedChange={(v) => setLesForm({ ...lesForm, is_published: v })} /><Label>Published</Label></div>
            </div>
            <div className="flex gap-2 pt-2"><Button onClick={saveLesson} className="flex-1">Save</Button><Button variant="outline" onClick={() => setLesOpen(false)}>Cancel</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
