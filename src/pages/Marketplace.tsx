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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  MapPin, Search, Plus, ShoppingBag, Leaf, Drumstick, 
  MessageCircle, Star, Filter, Edit, Trash2, X, AlertTriangle
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
  is_vegetarian: boolean;
  calories: number | null;
  carbs: number | null;
  protein: number | null;
  fat: number | null;
  ingredients: string[] | null;
  image_url: string | null;
  state: string | null;
  city: string | null;
  town: string | null;
  is_available: boolean;
  is_sold_out: boolean;
  created_at: string;
  seller_name?: string;
  seller_avatar?: string;
}

const Marketplace = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [myListings, setMyListings] = useState<FoodListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<FoodListing | null>(null);
  const [activeTab, setActiveTab] = useState('browse');
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [vegFilter, setVegFilter] = useState<'all' | 'veg' | 'nonveg'>('all');
  const [maxCarbs, setMaxCarbs] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '0',
    quantity: '1',
    category: 'meal',
    is_vegetarian: false,
    calories: '',
    carbs: '',
    protein: '',
    fat: '',
    ingredients: '',
    state: '',
    city: '',
    town: ''
  });

  useEffect(() => {
    fetchListings();
    if (user) {
      fetchMyListings();
    }
  }, [user]);

  const fetchListings = async () => {
    try {
      const { data, error } = await supabase
        .from('food_listings')
        .select('*')
        .eq('is_available', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch seller profiles
      if (data && data.length > 0) {
        const sellerIds = [...new Set(data.map(l => l.seller_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, display_name, avatar_url')
          .in('user_id', sellerIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
        
        const enrichedListings = data.map(listing => ({
          ...listing,
          seller_name: profileMap.get(listing.seller_id)?.display_name || 'Unknown Seller',
          seller_avatar: profileMap.get(listing.seller_id)?.avatar_url || null
        }));

        setListings(enrichedListings);
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

  const createListing = async () => {
    if (!user) {
      toast({ title: 'Please sign in to create a listing', variant: 'destructive' });
      return;
    }

    if (!formData.title.trim()) {
      toast({ title: 'Please enter a title', variant: 'destructive' });
      return;
    }

    try {
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
        state: formData.state.trim() || null,
        city: formData.city.trim() || null,
        town: formData.town.trim() || null
      });

      if (error) throw error;

      toast({ title: 'Listing created successfully!' });
      setCreateDialogOpen(false);
      resetForm();
      fetchListings();
      fetchMyListings();
    } catch (error: any) {
      toast({ title: 'Error creating listing', description: error.message, variant: 'destructive' });
    }
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

  const toggleSoldOut = async (id: string, currentStatus: boolean) => {
    try {
      await supabase
        .from('food_listings')
        .update({ is_sold_out: !currentStatus })
        .eq('id', id);
      
      toast({ title: currentStatus ? 'Marked as available' : 'Marked as sold out' });
      fetchMyListings();
      fetchListings();
    } catch (error) {
      toast({ title: 'Error updating listing', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '0',
      quantity: '1',
      category: 'meal',
      is_vegetarian: false,
      calories: '',
      carbs: '',
      protein: '',
      fat: '',
      ingredients: '',
      state: '',
      city: '',
      town: ''
    });
  };

  const filteredListings = listings.filter(listing => {
    if (searchQuery && !listing.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (stateFilter && listing.state?.toLowerCase() !== stateFilter.toLowerCase()) return false;
    if (cityFilter && listing.city?.toLowerCase() !== cityFilter.toLowerCase()) return false;
    if (priceFilter === 'free' && listing.price > 0) return false;
    if (priceFilter === 'paid' && listing.price === 0) return false;
    if (vegFilter === 'veg' && !listing.is_vegetarian) return false;
    if (vegFilter === 'nonveg' && listing.is_vegetarian) return false;
    if (maxCarbs && listing.carbs && listing.carbs > parseInt(maxCarbs)) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center justify-center gap-3">
            <ShoppingBag className="h-8 w-8 text-primary" />
            Ketopia Marketplace
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Buy, sell, or share keto-friendly foods with your local community. 
            Find homemade meals, snacks, and desserts from nearby keto enthusiasts.
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
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Listing
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create Food Listing</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <Label>Food Title *</Label>
                        <Input
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="e.g., Keto Butter Chicken"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Description</Label>
                        <Textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Describe your food item..."
                        />
                      </div>
                      <div>
                        <Label>Price (₹) - Use 0 for Free</Label>
                        <Input
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          min="0"
                        />
                      </div>
                      <div>
                        <Label>Quantity Available</Label>
                        <Input
                          type="number"
                          value={formData.quantity}
                          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                          min="1"
                        />
                      </div>
                      <div>
                        <Label>Category</Label>
                        <Select 
                          value={formData.category} 
                          onValueChange={(v) => setFormData({ ...formData, category: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="meal">Meal</SelectItem>
                            <SelectItem value="snack">Snack</SelectItem>
                            <SelectItem value="dessert">Dessert</SelectItem>
                            <SelectItem value="beverage">Beverage</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end gap-2">
                        <Checkbox
                          id="veg"
                          checked={formData.is_vegetarian}
                          onCheckedChange={(v) => setFormData({ ...formData, is_vegetarian: v as boolean })}
                        />
                        <Label htmlFor="veg" className="flex items-center gap-1">
                          <Leaf className="h-4 w-4 text-green-500" />
                          Vegetarian
                        </Label>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <Label className="text-base font-semibold mb-2 block">Nutritional Info (per serving)</Label>
                      <div className="grid grid-cols-4 gap-3">
                        <div>
                          <Label className="text-xs">Calories</Label>
                          <Input
                            type="number"
                            value={formData.calories}
                            onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                            placeholder="kcal"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Carbs (g)</Label>
                          <Input
                            type="number"
                            value={formData.carbs}
                            onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                            placeholder="g"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Protein (g)</Label>
                          <Input
                            type="number"
                            value={formData.protein}
                            onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                            placeholder="g"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Fat (g)</Label>
                          <Input
                            type="number"
                            value={formData.fat}
                            onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
                            placeholder="g"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Ingredients (comma separated)</Label>
                      <Textarea
                        value={formData.ingredients}
                        onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                        placeholder="e.g., chicken, cream, butter, spices..."
                      />
                    </div>

                    <div className="border-t pt-4">
                      <Label className="text-base font-semibold mb-2 block flex items-center gap-2">
                        <MapPin className="h-4 w-4" /> Location
                      </Label>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label className="text-xs">State</Label>
                          <Input
                            value={formData.state}
                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                            placeholder="State"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">City</Label>
                          <Input
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            placeholder="City"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Town/Area</Label>
                          <Input
                            value={formData.town}
                            onChange={(e) => setFormData({ ...formData, town: e.target.value })}
                            placeholder="Town"
                          />
                        </div>
                      </div>
                    </div>

                    <Button onClick={createListing} className="w-full">
                      Create Listing
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <TabsContent value="browse">
            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                  <div className="col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search food..."
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <Input
                    value={stateFilter}
                    onChange={(e) => setStateFilter(e.target.value)}
                    placeholder="State"
                  />
                  <Input
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    placeholder="City"
                  />
                  <Select value={priceFilter} onValueChange={(v: any) => setPriceFilter(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Price" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Prices</SelectItem>
                      <SelectItem value="free">Free Only</SelectItem>
                      <SelectItem value="paid">Paid Only</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={vegFilter} onValueChange={(v: any) => setVegFilter(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Diet" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="veg">Vegetarian</SelectItem>
                      <SelectItem value="nonveg">Non-Veg</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Listings Grid */}
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading listings...</div>
            ) : filteredListings.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No listings found</h3>
                <p className="text-muted-foreground mb-4">Be the first to list keto food in your area!</p>
                {user && (
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Listing
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredListings.map((listing) => (
                  <Card 
                    key={listing.id} 
                    className={`overflow-hidden hover:shadow-lg transition-shadow cursor-pointer ${
                      listing.is_sold_out ? 'opacity-60' : ''
                    }`}
                    onClick={() => setSelectedListing(listing)}
                  >
                    <div className="aspect-video bg-muted relative">
                      {listing.image_url ? (
                        <img src={listing.image_url} alt={listing.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          <ShoppingBag className="h-12 w-12" />
                        </div>
                      )}
                      <div className="absolute top-2 left-2 flex gap-1">
                        {listing.price === 0 ? (
                          <Badge className="bg-green-500">FREE</Badge>
                        ) : (
                          <Badge variant="secondary">₹{listing.price}</Badge>
                        )}
                        {listing.is_vegetarian ? (
                          <Badge variant="outline" className="bg-green-100 border-green-500">
                            <Leaf className="h-3 w-3 mr-1" />Veg
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-100 border-red-500">
                            <Drumstick className="h-3 w-3 mr-1" />Non-Veg
                          </Badge>
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
                        {[listing.town, listing.city, listing.state].filter(Boolean).join(', ') || 'Location not specified'}
                      </p>
                      {listing.carbs !== null && (
                        <div className="flex gap-2 mt-2 text-xs">
                          <span className="text-blue-500">{listing.carbs}g carbs</span>
                          <span className="text-green-500">{listing.protein}g protein</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={listing.seller_avatar || ''} />
                          <AvatarFallback className="text-[10px]">{listing.seller_name?.[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground truncate">{listing.seller_name}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-listings">
            {!user ? (
              <div className="text-center py-12 text-muted-foreground">
                Please sign in to view your listings
              </div>
            ) : myListings.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No listings yet</h3>
                <p className="text-muted-foreground mb-4">Create your first food listing to share with the community</p>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Listing
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {myListings.map((listing) => (
                  <Card key={listing.id}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-20 h-20 bg-muted rounded-lg shrink-0 flex items-center justify-center">
                        {listing.image_url ? (
                          <img src={listing.image_url} alt={listing.title} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold">{listing.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {listing.price === 0 ? 'Free' : `₹${listing.price}`} • Qty: {listing.quantity}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            {listing.is_sold_out && <Badge variant="destructive">Sold Out</Badge>}
                            {listing.price === 0 && <Badge className="bg-green-500">Free</Badge>}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => toggleSoldOut(listing.id, listing.is_sold_out)}
                        >
                          {listing.is_sold_out ? 'Mark Available' : 'Mark Sold'}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => deleteListing(listing.id)}
                        >
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

        {/* Listing Detail Dialog */}
        <Dialog open={!!selectedListing} onOpenChange={() => setSelectedListing(null)}>
          <DialogContent className="max-w-lg">
            {selectedListing && (
              <>
                <DialogHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <DialogTitle className="text-xl">{selectedListing.title}</DialogTitle>
                      <div className="flex gap-2 mt-2">
                        {selectedListing.price === 0 ? (
                          <Badge className="bg-green-500">FREE</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-lg">₹{selectedListing.price}</Badge>
                        )}
                        {selectedListing.is_vegetarian ? (
                          <Badge variant="outline" className="bg-green-100 border-green-500">
                            <Leaf className="h-3 w-3 mr-1" />Veg
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-100 border-red-500">
                            <Drumstick className="h-3 w-3 mr-1" />Non-Veg
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </DialogHeader>

                {selectedListing.description && (
                  <p className="text-muted-foreground">{selectedListing.description}</p>
                )}

                {selectedListing.carbs !== null && (
                  <div className="grid grid-cols-4 gap-2 bg-muted/50 rounded-lg p-3">
                    <div className="text-center">
                      <div className="font-bold">{selectedListing.calories || '-'}</div>
                      <div className="text-xs text-muted-foreground">Calories</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-blue-500">{selectedListing.carbs}g</div>
                      <div className="text-xs text-muted-foreground">Carbs</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-green-500">{selectedListing.protein || '-'}g</div>
                      <div className="text-xs text-muted-foreground">Protein</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-orange-500">{selectedListing.fat || '-'}g</div>
                      <div className="text-xs text-muted-foreground">Fat</div>
                    </div>
                  </div>
                )}

                {selectedListing.ingredients && selectedListing.ingredients.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Ingredients</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedListing.ingredients.map((ing, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{ing}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <Avatar>
                    <AvatarImage src={selectedListing.seller_avatar || ''} />
                    <AvatarFallback>{selectedListing.seller_name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-semibold">{selectedListing.seller_name}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {[selectedListing.town, selectedListing.city, selectedListing.state].filter(Boolean).join(', ')}
                    </div>
                  </div>
                  <Button className="gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Message
                  </Button>
                </div>

                <Button variant="outline" className="w-full text-destructive hover:bg-destructive/10">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Report Listing
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
