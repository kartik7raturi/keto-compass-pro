import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Upload, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  original_price: number | null;
  image_url: string | null;
  benefits: string[];
  ingredients: string[];
  is_active: boolean;
}

export const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const emptyProduct: Product = {
    id: '', title: '', description: '', price: 0, original_price: null,
    image_url: null, benefits: [], ingredients: [], is_active: true
  };

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    setProducts((data as Product[]) || []);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from('product-images').upload(path, file);
    if (error) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    } else {
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path);
      setEditing({ ...editing, image_url: publicUrl });
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!editing) return;
    const payload = {
      title: editing.title,
      description: editing.description,
      price: editing.price,
      original_price: editing.original_price,
      image_url: editing.image_url,
      benefits: editing.benefits,
      ingredients: editing.ingredients,
      is_active: editing.is_active,
    };

    if (isNew) {
      const { error } = await supabase.from('products').insert(payload);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    } else {
      const { error } = await supabase.from('products').update(payload).eq('id', editing.id);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    }
    toast({ title: 'Saved!' });
    setEditing(null);
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await supabase.from('products').delete().eq('id', id);
    toast({ title: 'Deleted' });
    fetchProducts();
  };

  const updateBenefits = (val: string) => {
    if (!editing) return;
    setEditing({ ...editing, benefits: val.split('\n').filter(Boolean) });
  };

  const updateIngredients = (val: string) => {
    if (!editing) return;
    setEditing({ ...editing, ingredients: val.split('\n').filter(Boolean) });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Product Management</h3>
        <Button onClick={() => { setEditing({ ...emptyProduct }); setIsNew(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Add Product
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map(p => (
            <TableRow key={p.id}>
              <TableCell>
                {p.image_url ? (
                  <img src={p.image_url} alt={p.title} className="h-12 w-12 object-cover rounded" />
                ) : <div className="h-12 w-12 bg-muted rounded" />}
              </TableCell>
              <TableCell className="font-medium">{p.title}</TableCell>
              <TableCell>${p.price}</TableCell>
              <TableCell>
                <Badge variant={p.is_active ? 'default' : 'secondary'}>
                  {p.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell className="space-x-1">
                <Button size="sm" variant="outline" onClick={() => { setEditing(p); setIsNew(false); }}>
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(p.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isNew ? 'Add Product' : 'Edit Product'}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div>
                <Label>Product Image</Label>
                <div className="flex items-center gap-4 mt-1">
                  {editing.image_url && (
                    <img src={editing.image_url} alt="" className="h-24 w-24 object-cover rounded-lg" />
                  )}
                  <label className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted transition-colors">
                      <Upload className="h-4 w-4" />
                      <span className="text-sm">{uploading ? 'Uploading...' : 'Upload Photo'}</span>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                  </label>
                </div>
              </div>

              <div>
                <Label>Title</Label>
                <Input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea value={editing.description || ''} onChange={e => setEditing({ ...editing, description: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Price ($)</Label>
                  <Input type="number" step="0.01" value={editing.price} onChange={e => setEditing({ ...editing, price: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                  <Label>Original Price ($)</Label>
                  <Input type="number" step="0.01" value={editing.original_price || ''} onChange={e => setEditing({ ...editing, original_price: parseFloat(e.target.value) || null })} />
                </div>
              </div>

              <div>
                <Label>Benefits (one per line)</Label>
                <Textarea value={editing.benefits.join('\n')} onChange={e => updateBenefits(e.target.value)} rows={5} />
              </div>

              <div>
                <Label>Ingredients (one per line)</Label>
                <Textarea value={editing.ingredients.join('\n')} onChange={e => updateIngredients(e.target.value)} rows={5} />
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" checked={editing.is_active} onChange={e => setEditing({ ...editing, is_active: e.target.checked })} />
                <Label>Active</Label>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} className="flex-1">Save Product</Button>
                <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
