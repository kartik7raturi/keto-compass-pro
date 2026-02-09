import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  MapPin, Search, Plus, ShoppingBag, Leaf, Drumstick, 
  MessageCircle, Filter, Edit, Trash2, AlertTriangle, Clock, DollarSign, Upload, Image
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface FoodListing {
  id: string;
  seller_id: string;
  title: string;
  description: string | null;
  price: number;
  quantity: number;
  category: string;
  is_vegetarian: boolean | null;
  calories: number | null;
  carbs: number | null;
  protein: number | null;
  fat: number | null;
  ingredients: string[] | null;
  image_url: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  town: string | null;
  is_available: boolean | null;
  is_sold_out: boolean | null;
  created_at: string;
  seller_name?: string;
  seller_avatar?: string;
}

const COUNTRIES = ['USA', 'Canada', 'UK', 'Australia', 'New Zealand'];

const COUNTRY_STATES: Record<string, string[]> = {
  'USA': ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'],
  'Canada': ['Alberta','British Columbia','Manitoba','New Brunswick','Newfoundland and Labrador','Nova Scotia','Ontario','Prince Edward Island','Quebec','Saskatchewan'],
  'UK': ['England','Scotland','Wales','Northern Ireland'],
  'Australia': ['New South Wales','Victoria','Queensland','South Australia','Western Australia','Tasmania','Northern Territory','ACT'],
  'New Zealand': ['Auckland','Wellington','Canterbury','Waikato','Bay of Plenty','Otago','Manawatu-Wanganui','Hawkes Bay','Taranaki','Northland','Southland','Nelson','Marlborough','Gisborne','Tasman','West Coast'],
};

const Marketplace = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [myListings, setMyListings] = useState<FoodListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<FoodListing | null>(null);
  const [editingListing, setEditingListing] = useState<FoodListing | null>(null);
  const [activeTab, setActiveTab] = useState('browse');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [vegFilter, setVegFilter] = useState<'all' | 'veg' | 'nonveg'>('all');

  // Form state
  const [formData, setFormData] = useState({
    title: '', description: '', price: '0', quantity: '1', category: 'meal',
    is_vegetarian: false, calories: '', carbs: '', protein: '', fat: '',
    ingredients: '', country: 'USA', state: '', city: '', town: ''
  });

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    title: '', description: '', price: '0', quantity: '1', category: 'meal',
    is_vegetarian: false, calories: '', carbs: '', protein: '', fat: '',
    ingredients: '', country: 'USA', state: '', city: '', town: ''
  });

  useEffect(() => {
    fetchListings();
    if (user) fetchMyListings();
  }, [user]);

  const fetchListings = async () => {
    try {
      const { data, error } = await supabase
        .from('food_listings')
        .select('*')
        .eq('is_available', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data && data.length > 0) {
        const sellerIds = [...new Set(data.map(l => l.seller_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, display_name, avatar_url')
          .in('user_id', sellerIds);
        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
        setListings(data.map(listing => ({
          ...listing,
          seller_name: profileMap.get(listing.seller_id)?.display_name || 'Unknown Seller',
          seller_avatar: profileMap.get(listing.seller_id)?.avatar_url || null
        })));
      } else {
        setListings([]);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyListings = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('food_listings')
      .select('*')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false });
    setMyListings(data || []);
  };

  const uploadFoodImage = async (file: File): Promise<string | null> => {
    if (!user) return null;
    const ext = file.name.split('.').pop();
    const path = `food/${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('recipe-media').upload(path, file);
    if (error) {
      toast({ title: 'Image upload failed', description: error.message, variant: 'destructive' });
      return null;
    }
    const { data } = supabase.storage.from('recipe-media').getPublicUrl(path);
    return data.publicUrl;
  };

  const createListing = async () => {
    if (!user) { toast({ title: 'Please sign in', variant: 'destructive' }); return; }
    if (!formData.title.trim()) { toast({ title: 'Please enter a title', variant: 'destructive' }); return; }

    try {
      let imageUrl: string | null = null;
      if (imageFile) imageUrl = await uploadFoodImage(imageFile);

      const { error } = await supabase.from('food_listings').insert({
        seller_id: user.id,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        price: parseFloat(formData.price) || 0,
        quantity: parseInt(formData.quantity) || 1,
        category: formData.category,
        is_vegetarian: formData.is_vegetarian,
        calories: formData.calories ? parseInt(formData.calories) : null,
        carbs: formData.carbs ? parseInt(formData.carbs) : null,
        protein: formData.protein ? parseInt(formData.protein) : null,
        fat: formData.fat ? parseInt(formData.fat) : null,
        ingredients: formData.ingredients ? formData.ingredients.split(',').map(i => i.trim()) : null,
        image_url: imageUrl,
        country: formData.country || 'USA',
        state: formData.state.trim() || null,
        city: formData.city.trim() || null,
        town: formData.town.trim() || null
      });
      if (error) throw error;
      toast({ title: 'Listing created successfully!' });
      setCreateDialogOpen(false);
      resetForm();
      setImageFile(null);
      fetchListings();
      fetchMyListings();
    } catch (error: any) {
      toast({ title: 'Error creating listing', description: error.message, variant: 'destructive' });
    }
  };

  const updateListing = async () => {
    if (!user || !editingListing) return;
    try {
      let imageUrl = editingListing.image_url;
      if (editImageFile) {
        const newUrl = await uploadFoodImage(editImageFile);
        if (newUrl) imageUrl = newUrl;
      }
      const { error } = await supabase.from('food_listings').update({
        title: editFormData.title.trim(),
        description: editFormData.description.trim() || null,
        price: parseFloat(editFormData.price) || 0,
        quantity: parseInt(editFormData.quantity) || 1,
        category: editFormData.category,
        is_vegetarian: editFormData.is_vegetarian,
        calories: editFormData.calories ? parseInt(editFormData.calories) : null,
        carbs: editFormData.carbs ? parseInt(editFormData.carbs) : null,
        protein: editFormData.protein ? parseInt(editFormData.protein) : null,
        fat: editFormData.fat ? parseInt(editFormData.fat) : null,
        ingredients: editFormData.ingredients ? editFormData.ingredients.split(',').map(i => i.trim()) : null,
        image_url: imageUrl,
        country: editFormData.country || 'USA',
        state: editFormData.state.trim() || null,
        city: editFormData.city.trim() || null,
        town: editFormData.town.trim() || null
      }).eq('id', editingListing.id);
      if (error) throw error;
      toast({ title: 'Listing updated!' });
      setEditDialogOpen(false);
      setEditingListing(null);
      setEditImageFile(null);
      fetchListings();
      fetchMyListings();
    } catch (error: any) {
      toast({ title: 'Error updating listing', description: error.message, variant: 'destructive' });
    }
  };

  const openEditDialog = (listing: FoodListing) => {
    setEditingListing(listing);
    setEditFormData({
      title: listing.title,
      description: listing.description || '',
      price: listing.price.toString(),
      quantity: listing.quantity.toString(),
      category: listing.category,
      is_vegetarian: listing.is_vegetarian || false,
      calories: listing.calories?.toString() || '',
      carbs: listing.carbs?.toString() || '',
      protein: listing.protein?.toString() || '',
      fat: listing.fat?.toString() || '',
      ingredients: listing.ingredients?.join(', ') || '',
      country: listing.country || 'USA',
      state: listing.state || '',
      city: listing.city || '',
      town: listing.town || ''
    });
    setEditDialogOpen(true);
  };

  const deleteListing = async (id: string) => {
    try {
      await supabase.from('food_listings').delete().eq('id', id);
      toast({ title: 'Listing deleted' });
      fetchMyListings();
      fetchListings();
    } catch (error) {
      toast({ title: 'Error deleting listing', variant: 'destructive' });
    }
  };

  const toggleSoldOut = async (id: string, currentStatus: boolean | null) => {
    try {
      await supabase.from('food_listings').update({ is_sold_out: !currentStatus }).eq('id', id);
      toast({ title: currentStatus ? 'Marked as available' : 'Marked as sold out' });
      fetchMyListings();
      fetchListings();
    } catch (error) {
      toast({ title: 'Error updating listing', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', price: '0', quantity: '1', category: 'meal',
      is_vegetarian: false, calories: '', carbs: '', protein: '', fat: '',
      ingredients: '', country: 'USA', state: '', city: '', town: '' });
  };

  const filteredListings = listings.filter(listing => {
    if (searchQuery && !listing.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (countryFilter && listing.country?.toLowerCase() !== countryFilter.toLowerCase()) return false;
    if (stateFilter && listing.state?.toLowerCase() !== stateFilter.toLowerCase()) return false;
    if (cityFilter && listing.city?.toLowerCase() !== cityFilter.toLowerCase()) return false;
    if (priceFilter === 'free' && listing.price > 0) return false;
    if (priceFilter === 'paid' && listing.price === 0) return false;
    if (vegFilter === 'veg' && !listing.is_vegetarian) return false;
    if (vegFilter === 'nonveg' && listing.is_vegetarian) return false;
    return true;
  });

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  const renderLocationFields = (data: typeof formData, setData: typeof setFormData) => (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <Label className="text-xs">Country</Label>
        <Select value={data.country} onValueChange={(v) => setData({ ...data, country: v, state: '', city: '', town: '' })}>
          <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
          <SelectContent>
            {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs">State/Province</Label>
        <Select value={data.state} onValueChange={(v) => setData({ ...data, state: v, city: '', town: '' })}>
          <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
          <SelectContent>
            {(COUNTRY_STATES[data.country] || []).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs">City</Label>
        <Input value={data.city} onChange={(e) => setData({ ...data, city: e.target.value })} placeholder="City" />
      </div>
      <div>
        <Label className="text-xs">Town/Area</Label>
        <Input value={data.town} onChange={(e) => setData({ ...data, town: e.target.value })} placeholder="Town" />
      </div>
    </div>
  );

  const renderFormFields = (data: typeof formData, setData: typeof setFormData, imgFile: File | null, setImgFile: (f: File | null) => void) => (
    <div className="grid gap-4 py-4">
      <div>
        <Label>Food Photo</Label>
        <div className="mt-1 flex items-center gap-3">
          <label className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-muted transition-colors">
            <Upload className="h-4 w-4" />
            <span className="text-sm">{imgFile ? imgFile.name : 'Upload Image'}</span>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setImgFile(e.target.files?.[0] || null)} />
          </label>
          {imgFile && <Badge variant="secondary" className="text-xs">Ready</Badge>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label>Food Title *</Label>
          <Input value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} placeholder="e.g., Keto Butter Chicken" />
        </div>
        <div className="col-span-2">
          <Label>Description</Label>
          <Textarea value={data.description} onChange={(e) => setData({ ...data, description: e.target.value })} placeholder="Describe your food item..." />
        </div>
        <div>
          <Label>Price ($) - Use 0 for Free</Label>
          <Input type="number" value={data.price} onChange={(e) => setData({ ...data, price: e.target.value })} min="0" />
        </div>
        <div>
          <Label>Quantity Available</Label>
          <Input type="number" value={data.quantity} onChange={(e) => setData({ ...data, quantity: e.target.value })} min="1" />
        </div>
        <div>
          <Label>Category</Label>
          <Select value={data.category} onValueChange={(v) => setData({ ...data, category: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="meal">Meal</SelectItem>
              <SelectItem value="snack">Snack</SelectItem>
              <SelectItem value="dessert">Dessert</SelectItem>
              <SelectItem value="beverage">Beverage</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end gap-2">
          <Checkbox id="veg-check" checked={data.is_vegetarian} onCheckedChange={(v) => setData({ ...data, is_vegetarian: v as boolean })} />
          <Label htmlFor="veg-check" className="flex items-center gap-1">
            <Leaf className="h-4 w-4 text-green-500" />Vegetarian
          </Label>
        </div>
      </div>
      <div className="border-t pt-4">
        <Label className="text-base font-semibold mb-2 block">Nutritional Info (per serving)</Label>
        <div className="grid grid-cols-4 gap-3">
          <div><Label className="text-xs">Calories</Label><Input type="number" value={data.calories} onChange={(e) => setData({ ...data, calories: e.target.value })} placeholder="kcal" /></div>
          <div><Label className="text-xs">Carbs (g)</Label><Input type="number" value={data.carbs} onChange={(e) => setData({ ...data, carbs: e.target.value })} placeholder="g" /></div>
          <div><Label className="text-xs">Protein (g)</Label><Input type="number" value={data.protein} onChange={(e) => setData({ ...data, protein: e.target.value })} placeholder="g" /></div>
          <div><Label className="text-xs">Fat (g)</Label><Input type="number" value={data.fat} onChange={(e) => setData({ ...data, fat: e.target.value })} placeholder="g" /></div>
        </div>
      </div>
      <div>
        <Label>Ingredients (comma separated)</Label>
        <Textarea value={data.ingredients} onChange={(e) => setData({ ...data, ingredients: e.target.value })} placeholder="e.g., chicken, cream, butter, spices..." />
      </div>
      <div className="border-t pt-4">
        <Label className="text-base font-semibold mb-2 block flex items-center gap-2"><MapPin className="h-4 w-4" /> Location</Label>
        {renderLocationFields(data, setData)}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center justify-center gap-3">
            <ShoppingBag className="h-8 w-8 text-primary" />Ketopia Marketplace
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Buy, sell, or share keto-friendly foods with your local community.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <TabsList>
              <TabsTrigger value="browse">Browse</TabsTrigger>
              <TabsTrigger value="my-listings">My Listings</TabsTrigger>
            </TabsList>
            {user && (
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2"><Plus className="h-4 w-4" />Create Listing</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>Create Food Listing</DialogTitle></DialogHeader>
                  {renderFormFields(formData, setFormData as any, imageFile, setImageFile)}
                  <Button onClick={createListing} className="w-full">Create Listing</Button>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <TabsContent value="browse">
            <Card className="mb-6">
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
                  <div className="col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search food..." className="pl-9" />
                    </div>
                  </div>
                  <Select value={countryFilter} onValueChange={(v) => { setCountryFilter(v === 'all' ? '' : v); setStateFilter(''); }}>
                    <SelectTrigger><SelectValue placeholder="Country" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Countries</SelectItem>
                      {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={stateFilter} onValueChange={(v) => setStateFilter(v === 'all' ? '' : v)}>
                    <SelectTrigger><SelectValue placeholder="State" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All States</SelectItem>
                      {(countryFilter ? COUNTRY_STATES[countryFilter] || [] : []).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={priceFilter} onValueChange={(v: any) => setPriceFilter(v)}>
                    <SelectTrigger><SelectValue placeholder="Price" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Prices</SelectItem>
                      <SelectItem value="free">Free Only</SelectItem>
                      <SelectItem value="paid">Paid Only</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={vegFilter} onValueChange={(v: any) => setVegFilter(v)}>
                    <SelectTrigger><SelectValue placeholder="Diet" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="veg">Vegetarian</SelectItem>
                      <SelectItem value="nonveg">Non-Veg</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading listings...</div>
            ) : filteredListings.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No listings found</h3>
                <p className="text-muted-foreground mb-4">Be the first to list keto food in your area!</p>
                {user && <Button onClick={() => setCreateDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Create First Listing</Button>}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredListings.map((listing) => (
                  <Card key={listing.id} className={`overflow-hidden hover:shadow-lg transition-shadow cursor-pointer ${listing.is_sold_out ? 'opacity-60' : ''}`} onClick={() => setSelectedListing(listing)}>
                    <div className="aspect-video bg-muted relative">
                      {listing.image_url ? (
                        <img src={listing.image_url} alt={listing.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground"><Image className="h-12 w-12" /></div>
                      )}
                      <div className="absolute top-2 left-2 flex gap-1">
                        {listing.price === 0 ? (
                          <Badge className="bg-green-500">FREE</Badge>
                        ) : (
                          <Badge variant="secondary"><DollarSign className="h-3 w-3" />{listing.price}</Badge>
                        )}
                        {listing.is_vegetarian ? (
                          <Badge variant="outline" className="bg-green-100 border-green-500"><Leaf className="h-3 w-3 mr-1" />Veg</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-100 border-red-500"><Drumstick className="h-3 w-3 mr-1" />Non-Veg</Badge>
                        )}
                      </div>
                      {listing.is_sold_out && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Badge variant="destructive" className="text-lg">SOLD OUT</Badge>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-3">
                      <h3 className="font-semibold truncate">{listing.title}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {[listing.town, listing.city, listing.state, listing.country].filter(Boolean).join(', ') || 'Location not specified'}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />{formatTime(listing.created_at)}
                      </p>
                      {listing.carbs !== null && (
                        <div className="flex gap-2 mt-2 text-xs">
                          <span className="text-blue-500">{listing.carbs}g carbs</span>
                          <span className="text-green-500">{listing.protein}g protein</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={listing.seller_avatar || ''} />
                            <AvatarFallback className="text-[10px]">{listing.seller_name?.[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground truncate">{listing.seller_name}</span>
                        </div>
                        {!listing.is_sold_out && (
                          <Button size="sm" variant="default" className="text-xs h-7" onClick={(e) => { e.stopPropagation(); setSelectedListing(listing); }}>
                            Buy Now
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-listings">
            {!user ? (
              <div className="text-center py-12 text-muted-foreground">Please sign in to view your listings</div>
            ) : myListings.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No listings yet</h3>
                <Button onClick={() => setCreateDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Create Listing</Button>
              </div>
            ) : (
              <div className="space-y-3">
                {myListings.map((listing) => (
                  <Card key={listing.id}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-20 h-20 bg-muted rounded-lg shrink-0 flex items-center justify-center overflow-hidden">
                        {listing.image_url ? (
                          <img src={listing.image_url} alt={listing.title} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <Image className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold">{listing.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {listing.price === 0 ? 'Free' : `$${listing.price}`} • Qty: {listing.quantity}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />{formatTime(listing.created_at)}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {listing.is_sold_out && <Badge variant="destructive">Sold Out</Badge>}
                        <Button size="sm" variant="outline" onClick={() => openEditDialog(listing)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => toggleSoldOut(listing.id, listing.is_sold_out)}>
                          {listing.is_sold_out ? 'Available' : 'Sold'}
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteListing(listing.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Edit Listing</DialogTitle></DialogHeader>
            {renderFormFields(editFormData, setEditFormData as any, editImageFile, setEditImageFile)}
            <Button onClick={updateListing} className="w-full">Update Listing</Button>
          </DialogContent>
        </Dialog>

        {/* Detail Dialog */}
        <Dialog open={!!selectedListing} onOpenChange={() => setSelectedListing(null)}>
          <DialogContent className="max-w-lg">
            {selectedListing && (
              <>
                <DialogHeader>
                  <div>
                    <DialogTitle className="text-xl">{selectedListing.title}</DialogTitle>
                    <div className="flex gap-2 mt-2">
                      {selectedListing.price === 0 ? (
                        <Badge className="bg-green-500">FREE</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-lg"><DollarSign className="h-3 w-3" />{selectedListing.price}</Badge>
                      )}
                      {selectedListing.is_vegetarian ? (
                        <Badge variant="outline" className="bg-green-100 border-green-500"><Leaf className="h-3 w-3 mr-1" />Veg</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-100 border-red-500"><Drumstick className="h-3 w-3 mr-1" />Non-Veg</Badge>
                      )}
                    </div>
                  </div>
                </DialogHeader>
                {selectedListing.image_url && (
                  <img src={selectedListing.image_url} alt={selectedListing.title} className="w-full h-48 object-cover rounded-lg" />
                )}
                {selectedListing.description && <p className="text-muted-foreground">{selectedListing.description}</p>}
                <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />Listed {formatTime(selectedListing.created_at)}</p>
                {selectedListing.carbs !== null && (
                  <div className="grid grid-cols-4 gap-2 bg-muted/50 rounded-lg p-3">
                    <div className="text-center"><div className="font-bold">{selectedListing.calories || '-'}</div><div className="text-xs text-muted-foreground">Calories</div></div>
                    <div className="text-center"><div className="font-bold text-blue-500">{selectedListing.carbs}g</div><div className="text-xs text-muted-foreground">Carbs</div></div>
                    <div className="text-center"><div className="font-bold text-green-500">{selectedListing.protein || '-'}g</div><div className="text-xs text-muted-foreground">Protein</div></div>
                    <div className="text-center"><div className="font-bold text-orange-500">{selectedListing.fat || '-'}g</div><div className="text-xs text-muted-foreground">Fat</div></div>
                  </div>
                )}
                {selectedListing.ingredients && selectedListing.ingredients.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Ingredients</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedListing.ingredients.map((ing, i) => <Badge key={i} variant="outline" className="text-xs">{ing}</Badge>)}
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <Avatar><AvatarImage src={selectedListing.seller_avatar || ''} /><AvatarFallback>{selectedListing.seller_name?.[0]}</AvatarFallback></Avatar>
                  <div className="flex-1">
                    <div className="font-semibold">{selectedListing.seller_name}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {[selectedListing.town, selectedListing.city, selectedListing.state, selectedListing.country].filter(Boolean).join(', ')}
                    </div>
                  </div>
                  <Button className="gap-2"><MessageCircle className="h-4 w-4" />Message</Button>
                </div>
                <Button variant="outline" className="w-full text-destructive hover:bg-destructive/10">
                  <AlertTriangle className="h-4 w-4 mr-2" />Report Listing
                </Button>
              </>
            )}
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
};

export default Marketplace;
