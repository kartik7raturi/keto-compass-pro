import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Pencil, Trash2, CheckCircle, XCircle, Loader2, Plus, Upload, ImageIcon,
  Bold, Italic, Heading1, Heading2, List, Link as LinkIcon, Type,
} from "lucide-react";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[] | null;
  featured_image_url: string | null;
  is_published: boolean;
  view_count: number;
  user_id: string;
  created_at: string;
  profiles?: { display_name: string; email: string } | null;
}

const emptyDraft = (userId: string): Article => ({
  id: '', title: '', slug: '', excerpt: '', content: '', category: 'general',
  tags: [], featured_image_url: null, is_published: false, view_count: 0,
  user_id: userId, created_at: new Date().toISOString(),
});

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);

export const AdminArticles = () => {
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Article | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const inlineInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchArticles(); }, []);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const { data: rows } = await supabase.from('articles').select('*').order('created_at', { ascending: false });
      if (rows && rows.length > 0) {
        const ids = [...new Set(rows.map((a: any) => a.user_id).filter(Boolean))];
        const { data: profiles } = await supabase.from('profiles').select('user_id, display_name, email').in('user_id', ids);
        setArticles(rows.map((a: any) => ({ ...a, profiles: profiles?.find((p: any) => p.user_id === a.user_id) || null })));
      } else setArticles([]);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  const openNew = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setEditing(emptyDraft(user.id));
    setIsNew(true);
    setTagInput('');
  };

  const openEdit = (a: Article) => {
    setEditing({ ...a, tags: a.tags || [] });
    setIsNew(false);
    setTagInput('');
  };

  const uploadImage = async (file: File, folder: string): Promise<string | null> => {
    const ext = file.name.split('.').pop();
    const path = `articles/${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from('recipe-media').upload(path, file);
    if (error) { toast({ title: 'Upload failed', description: error.message, variant: 'destructive' }); return null; }
    return supabase.storage.from('recipe-media').getPublicUrl(path).data.publicUrl;
  };

  const onCoverPick = async (file: File | null) => {
    if (!file || !editing) return;
    const url = await uploadImage(file, 'cover');
    if (url) setEditing({ ...editing, featured_image_url: url });
  };

  const onInlinePick = async (file: File | null) => {
    if (!file || !editing) return;
    const url = await uploadImage(file, 'inline');
    if (!url) return;
    insertAtCursor(`\n<img src="${url}" alt="" class="w-full rounded-lg my-4" />\n`);
  };

  const insertAtCursor = (snippet: string) => {
    const el = contentRef.current;
    if (!el || !editing) return;
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const next = el.value.slice(0, start) + snippet + el.value.slice(end);
    setEditing({ ...editing, content: next });
    setTimeout(() => { el.focus(); el.selectionEnd = start + snippet.length; }, 0);
  };

  const wrapSelection = (before: string, after: string) => {
    const el = contentRef.current;
    if (!el || !editing) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const sel = el.value.slice(start, end) || 'text';
    const next = el.value.slice(0, start) + before + sel + after + el.value.slice(end);
    setEditing({ ...editing, content: next });
    setTimeout(() => { el.focus(); el.selectionEnd = start + before.length + sel.length + after.length; }, 0);
  };

  const addTag = () => {
    if (!editing || !tagInput.trim()) return;
    const t = tagInput.trim().toLowerCase();
    if ((editing.tags || []).includes(t)) return;
    setEditing({ ...editing, tags: [...(editing.tags || []), t] });
    setTagInput('');
  };
  const removeTag = (t: string) => editing && setEditing({ ...editing, tags: (editing.tags || []).filter(x => x !== t) });

  const save = async () => {
    if (!editing) return;
    if (!editing.title.trim() || !editing.content.trim()) {
      toast({ title: 'Title and content are required', variant: 'destructive' }); return;
    }
    setSaving(true);
    const slug = editing.slug?.trim() || slugify(editing.title) + '-' + Date.now().toString(36);
    const payload: any = {
      title: editing.title.trim(),
      slug,
      excerpt: editing.excerpt || '',
      content: editing.content,
      category: editing.category || 'general',
      tags: editing.tags || [],
      featured_image_url: editing.featured_image_url,
      is_published: editing.is_published,
    };
    let error;
    if (isNew) {
      payload.user_id = editing.user_id;
      ({ error } = await supabase.from('articles').insert(payload));
    } else {
      ({ error } = await supabase.from('articles').update(payload).eq('id', editing.id));
    }
    setSaving(false);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: isNew ? 'Article created' : 'Article updated' });
    setEditing(null); setIsNew(false);
    fetchArticles();
  };

  const del = async (id: string) => {
    if (!confirm('Delete this article?')) return;
    const { error } = await supabase.from('articles').delete().eq('id', id);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Deleted' }); fetchArticles(); }
  };

  const togglePub = async (id: string, cur: boolean) => {
    await supabase.from('articles').update({ is_published: !cur }).eq('id', id);
    fetchArticles();
  };

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Articles ({articles.length})</h3>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />New Article</Button>
      </div>

      <div className="grid gap-4">
        {articles.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No articles yet.</CardContent></Card>
        ) : articles.map(a => (
          <Card key={a.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4 min-w-0 flex-1">
                  {a.featured_image_url && (
                    <img src={a.featured_image_url} alt="" className="w-24 h-24 rounded-lg object-cover flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <CardTitle className="text-xl truncate">{a.title}</CardTitle>
                    <p className="text-sm text-muted-foreground truncate">
                      by {a.profiles?.display_name || 'Unknown'} · /{a.slug}
                    </p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <Badge variant={a.is_published ? 'default' : 'secondary'}>{a.is_published ? 'Published' : 'Draft'}</Badge>
                      <Badge variant="outline">{a.category}</Badge>
                      {(a.tags || []).slice(0, 4).map(t => <Badge key={t} variant="outline" className="text-xs">#{t}</Badge>)}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{a.excerpt}</p>
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={() => openEdit(a)}><Pencil className="h-4 w-4 mr-2" />Edit</Button>
                <Button variant="outline" size="sm" onClick={() => togglePub(a.id, a.is_published)}>
                  {a.is_published ? <><XCircle className="h-4 w-4 mr-2" />Unpublish</> : <><CheckCircle className="h-4 w-4 mr-2" />Publish</>}
                </Button>
                <Button variant="destructive" size="sm" onClick={() => del(a.id)}><Trash2 className="h-4 w-4 mr-2" />Delete</Button>
                <span className="text-xs text-muted-foreground ml-auto self-center">{a.view_count} views</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={(v) => { if (!v) { setEditing(null); setIsNew(false); } }}>
        <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isNew ? 'New Article' : 'Edit Article'}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <Label>Title *</Label>
                  <Input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value, slug: editing.slug || slugify(e.target.value) })} />
                </div>
                <div>
                  <Label>Slug</Label>
                  <Input value={editing.slug} onChange={e => setEditing({ ...editing, slug: e.target.value })} />
                </div>
                <div>
                  <Label>Category</Label>
                  <Input value={editing.category} onChange={e => setEditing({ ...editing, category: e.target.value })} placeholder="beginner / nutrition / tips" />
                </div>
                <div>
                  <Label>Tags</Label>
                  <div className="flex gap-2">
                    <Input value={tagInput} onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                      placeholder="Add tag + Enter" />
                    <Button type="button" variant="outline" size="sm" onClick={addTag}>Add</Button>
                  </div>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {(editing.tags || []).map(t => (
                      <Badge key={t} variant="secondary" className="cursor-pointer" onClick={() => removeTag(t)}>
                        #{t} ✕
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <Label>Cover Image</Label>
                <div className="flex gap-3 items-center mt-1">
                  {editing.featured_image_url && (
                    <img src={editing.featured_image_url} alt="cover" className="w-32 h-20 rounded object-cover" />
                  )}
                  <Button type="button" variant="outline" size="sm" onClick={() => coverInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    {editing.featured_image_url ? 'Replace' : 'Upload'}
                  </Button>
                  {editing.featured_image_url && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => setEditing({ ...editing, featured_image_url: null })}>Remove</Button>
                  )}
                  <input ref={coverInputRef} type="file" accept="image/*" className="hidden"
                    onChange={e => onCoverPick(e.target.files?.[0] || null)} />
                </div>
              </div>

              <div>
                <Label>Excerpt</Label>
                <Textarea value={editing.excerpt || ''} onChange={e => setEditing({ ...editing, excerpt: e.target.value })} rows={2} />
              </div>

              <div>
                <Label>Content (HTML supported)</Label>
                <div className="flex gap-1 flex-wrap p-2 border rounded-t-md bg-muted/40">
                  <Button type="button" size="sm" variant="ghost" title="H1" onClick={() => wrapSelection('<h1>', '</h1>')}><Heading1 className="h-4 w-4" /></Button>
                  <Button type="button" size="sm" variant="ghost" title="H2" onClick={() => wrapSelection('<h2>', '</h2>')}><Heading2 className="h-4 w-4" /></Button>
                  <Button type="button" size="sm" variant="ghost" title="Paragraph" onClick={() => wrapSelection('<p>', '</p>')}><Type className="h-4 w-4" /></Button>
                  <Button type="button" size="sm" variant="ghost" title="Bold" onClick={() => wrapSelection('<strong>', '</strong>')}><Bold className="h-4 w-4" /></Button>
                  <Button type="button" size="sm" variant="ghost" title="Italic" onClick={() => wrapSelection('<em>', '</em>')}><Italic className="h-4 w-4" /></Button>
                  <Button type="button" size="sm" variant="ghost" title="List" onClick={() => wrapSelection('<ul>\n  <li>', '</li>\n</ul>')}><List className="h-4 w-4" /></Button>
                  <Button type="button" size="sm" variant="ghost" title="Link" onClick={() => {
                    const href = prompt('URL:'); if (href) wrapSelection(`<a href="${href}" target="_blank">`, '</a>');
                  }}><LinkIcon className="h-4 w-4" /></Button>
                  <Button type="button" size="sm" variant="ghost" title="Insert image" onClick={() => inlineInputRef.current?.click()}>
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <input ref={inlineInputRef} type="file" accept="image/*" className="hidden"
                    onChange={e => { onInlinePick(e.target.files?.[0] || null); e.target.value = ''; }} />
                  <select className="ml-2 text-xs border rounded px-2 bg-background"
                    onChange={e => { if (e.target.value) wrapSelection(`<span style="font-family:${e.target.value}">`, '</span>'); e.target.value = ''; }}>
                    <option value="">Font…</option>
                    <option value="Georgia, serif">Georgia</option>
                    <option value="'Times New Roman', serif">Times</option>
                    <option value="Arial, sans-serif">Arial</option>
                    <option value="'Courier New', monospace">Courier</option>
                    <option value="Verdana, sans-serif">Verdana</option>
                  </select>
                </div>
                <Textarea ref={contentRef} value={editing.content}
                  onChange={e => setEditing({ ...editing, content: e.target.value })}
                  rows={16} className="font-mono text-sm rounded-t-none" />
              </div>

              <label className="flex items-center gap-2">
                <input type="checkbox" checked={editing.is_published}
                  onChange={e => setEditing({ ...editing, is_published: e.target.checked })} className="rounded" />
                Published
              </label>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditing(null); setIsNew(false); }}>Cancel</Button>
            <Button onClick={save} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isNew ? 'Create Article' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
