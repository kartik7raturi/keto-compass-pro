import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { ExternalLink, Save } from 'lucide-react';

interface ButtonLink {
  id: string;
  button_key: string;
  label: string;
  url: string;
}

export const AdminButtonLinks = () => {
  const [links, setLinks] = useState<ButtonLink[]>([]);
  const [editedUrls, setEditedUrls] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    const { data } = await supabase.from('button_links').select('*').order('created_at');
    setLinks((data as ButtonLink[]) || []);
  };

  const handleSave = async (link: ButtonLink) => {
    const newUrl = editedUrls[link.id] ?? link.url;
    const { error } = await supabase
      .from('button_links')
      .update({ url: newUrl, updated_at: new Date().toISOString() })
      .eq('id', link.id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Saved', description: `URL updated for ${link.label}` });
      fetchLinks();
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Button / Payment Link Management</h3>
      <p className="text-sm text-muted-foreground">Manage payment URLs for all pricing buttons across the website.</p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Button</TableHead>
            <TableHead>Payment URL</TableHead>
            <TableHead className="w-24">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {links.map(link => (
            <TableRow key={link.id}>
              <TableCell className="font-medium text-sm">{link.label}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Input
                    value={editedUrls[link.id] ?? link.url}
                    onChange={e => setEditedUrls(prev => ({ ...prev, [link.id]: e.target.value }))}
                    placeholder="https://..."
                    className="text-xs"
                  />
                  {(editedUrls[link.id] ?? link.url) && (
                    <a href={editedUrls[link.id] ?? link.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </a>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Button size="sm" onClick={() => handleSave(link)}>
                  <Save className="h-3 w-3 mr-1" /> Save
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
