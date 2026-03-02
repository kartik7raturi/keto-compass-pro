import { useState, useEffect, useRef } from 'react';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MapPin, Search, Plus, ShoppingBag, Leaf, Drumstick, 
  MessageCircle, Edit, Trash2, AlertTriangle, Clock, DollarSign, Upload, Image,
  Send, ArrowLeft, Truck, Store, Heart, ExternalLink
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
  delivery_type: string;
  google_maps_link: string | null;
  food_tag: string;
  seller_name?: string;
  seller_avatar?: string;
}

interface MarketMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean | null;
  created_at: string;
  sender_name?: string;
}

const COUNTRIES = ['USA', 'Canada', 'UK', 'Australia', 'New Zealand'];

const COUNTRY_STATES: Record<string, string[]> = {
  'USA': ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'],
  'Canada': ['Alberta','British Columbia','Manitoba','New Brunswick','Newfoundland and Labrador','Nova Scotia','Ontario','Prince Edward Island','Quebec','Saskatchewan'],
  'UK': ['England','Scotland','Wales','Northern Ireland'],
  'Australia': ['New South Wales','Victoria','Queensland','South Australia','Western Australia','Tasmania','Northern Territory','ACT'],
  'New Zealand': ['Auckland','Wellington','Canterbury','Waikato','Bay of Plenty','Otago','Manawatu-Wanganui','Hawkes Bay','Taranaki','Northland','Southland','Nelson','Marlborough','Gisborne','Tasman','West Coast'],
};

const STATE_CITIES: Record<string, string[]> = {
  'California': ['Los Angeles','San Francisco','San Diego','San Jose','Sacramento','Oakland','Fresno','Long Beach','Anaheim','Bakersfield'],
  'New York': ['New York City','Buffalo','Rochester','Albany','Syracuse','Yonkers'],
  'Texas': ['Houston','Dallas','Austin','San Antonio','Fort Worth','El Paso','Arlington','Plano'],
  'Florida': ['Miami','Orlando','Tampa','Jacksonville','Fort Lauderdale','St. Petersburg'],
  'Illinois': ['Chicago','Aurora','Naperville','Rockford','Joliet','Springfield'],
  'Pennsylvania': ['Philadelphia','Pittsburgh','Allentown','Erie','Reading'],
  'Ohio': ['Columbus','Cleveland','Cincinnati','Toledo','Akron','Dayton'],
  'Georgia': ['Atlanta','Augusta','Savannah','Columbus','Macon'],
  'Michigan': ['Detroit','Grand Rapids','Ann Arbor','Lansing','Flint'],
  'Washington': ['Seattle','Spokane','Tacoma','Vancouver','Bellevue'],
  'Ontario': ['Toronto','Ottawa','Mississauga','Brampton','Hamilton','London'],
  'British Columbia': ['Vancouver','Victoria','Surrey','Burnaby','Richmond'],
  'Quebec': ['Montreal','Quebec City','Laval','Gatineau','Longueuil'],
  'Alberta': ['Calgary','Edmonton','Red Deer','Lethbridge'],
  'England': ['London','Manchester','Birmingham','Liverpool','Leeds','Bristol','Sheffield'],
  'Scotland': ['Edinburgh','Glasgow','Aberdeen','Dundee','Inverness'],
  'Wales': ['Cardiff','Swansea','Newport','Bangor'],
  'Northern Ireland': ['Belfast','Derry','Lisburn','Newry'],
  'New South Wales': ['Sydney','Newcastle','Wollongong','Central Coast'],
  'Victoria': ['Melbourne','Geelong','Ballarat','Bendigo'],
  'Queensland': ['Brisbane','Gold Coast','Sunshine Coast','Townsville','Cairns'],
  'Auckland': ['Auckland CBD','North Shore','Manukau','Waitakere'],
  'Wellington': ['Wellington CBD','Lower Hutt','Upper Hutt','Porirua'],
  'Canterbury': ['Christchurch','Timaru','Ashburton'],
};

const FOOD_TAGS = [
  { value: 'vegan', label: 'Vegan', icon: '🌱', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { value: 'veg', label: 'Vegetarian', icon: '🥬', color: 'bg-green-100 text-green-800 border-green-300' },
  { value: 'non-veg', label: 'Non-Veg', icon: '🍖', color: 'bg-red-100 text-red-800 border-red-300' },
  { value: 'charity', label: 'Charity', icon: '❤️', color: 'bg-pink-100 text-pink-800 border-pink-300' },
];

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
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  
  // Buy now state
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);
  const [buyListing, setBuyListing] = useState<FoodListing | null>(null);
  const [buyPickupTime, setBuyPickupTime] = useState('');
  
  // Messaging state
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messageListing, setMessageListing] = useState<FoodListing | null>(null);
  const [messageText, setMessageText] = useState('');
  const [conversationMessages, setConversationMessages] = useState<MarketMessage[]>([]);
  const [sellerMessagesOpen, setSellerMessagesOpen] = useState(false);
  const [sellerListingMessages, setSellerListingMessages] = useState<{listing: FoodListing, messages: MarketMessage[], unreadCount: number}[]>([]);
  const [selectedSellerChat, setSelectedSellerChat] = useState<{listing: FoodListing, buyerId: string, buyerName: string} | null>(null);
  const [sellerReplyText, setSellerReplyText] = useState('');
  const [sellerChatMessages, setSellerChatMessages] = useState<MarketMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [tagFilter, setTagFilter] = useState('all');

  // Form state
  const [formData, setFormData] = useState({
    title: '', description: '', price: '0', quantity: '1', category: 'meal',
    is_vegetarian: false, calories: '', carbs: '', protein: '', fat: '',
    ingredients: '', country: 'USA', state: '', city: '', town: '',
    delivery_type: 'takeaway', google_maps_link: '', food_tag: 'non-veg'
  });

  const [editFormData, setEditFormData] = useState({
    title: '', description: '', price: '0', quantity: '1', category: 'meal',
    is_vegetarian: false, calories: '', carbs: '', protein: '', fat: '',
    ingredients: '', country: 'USA', state: '', city: '', town: '',
    delivery_type: 'takeaway', google_maps_link: '', food_tag: 'non-veg'
  });

  useEffect(() => {
    fetchListings();
    if (user) fetchMyListings();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages, sellerChatMessages]);

  // Real-time message subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('marketplace-dm-realtime')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'direct_messages',
        filter: `receiver_id=eq.${user.id}`
      }, (payload) => {
        const newMsg = payload.new as any;
        // Update conversation if open
        if (messageListing && selectedListing) {
          setConversationMessages(prev => [...prev, newMsg]);
        }
        if (selectedSellerChat) {
          setSellerChatMessages(prev => [...prev, newMsg]);
        }
        // Refresh seller messages count
        if (activeTab === 'my-listings') {
          fetchSellerMessages();
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, messageListing, selectedSellerChat, activeTab]);

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
          .from('profiles').select('user_id, display_name, avatar_url').in('user_id', sellerIds);
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
      .from('food_listings').select('*').eq('seller_id', user.id).order('created_at', { ascending: false });
    setMyListings(data || []);
  };

  const fetchSellerMessages = async () => {
    if (!user) return;
    const myL = myListings.length > 0 ? myListings : (await supabase.from('food_listings').select('*').eq('seller_id', user.id)).data || [];
    
    const results: {listing: FoodListing, messages: MarketMessage[], unreadCount: number}[] = [];
    for (const listing of myL) {
      const { data: msgs } = await supabase
        .from('direct_messages').select('*')
        .eq('receiver_id', user.id)
        .order('created_at', { ascending: false });
      
      const listingMsgs = (msgs || []).filter(m => m.content.includes(`[FOOD:${listing.id}]`));
      const unread = listingMsgs.filter(m => !m.is_read).length;
      if (listingMsgs.length > 0) {
        results.push({ listing: listing as FoodListing, messages: listingMsgs, unreadCount: unread });
      }
    }
    setSellerListingMessages(results);
  };

  const uploadFoodImage = async (file: File): Promise<string | null> => {
    if (!user) return null;
    try {
      const ext = file.name.split('.').pop();
      const path = `food/${user.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('recipe-media').upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });
      if (error) {
        console.error('Upload error:', error);
        toast({ title: 'Image upload failed', description: error.message, variant: 'destructive' });
        return null;
      }
      const { data } = supabase.storage.from('recipe-media').getPublicUrl(path);
      return data.publicUrl;
    } catch (err: any) {
      console.error('Upload exception:', err);
      toast({ title: 'Image upload failed', variant: 'destructive' });
      return null;
    }
  };

  const handleImageSelect = (file: File | null, setFile: (f: File | null) => void, setPreview: (s: string | null) => void) => {
    setFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
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
        is_vegetarian: formData.food_tag === 'veg' || formData.food_tag === 'vegan',
        calories: formData.calories ? parseInt(formData.calories) : null,
        carbs: formData.carbs ? parseInt(formData.carbs) : null,
        protein: formData.protein ? parseInt(formData.protein) : null,
        fat: formData.fat ? parseInt(formData.fat) : null,
        ingredients: formData.ingredients ? formData.ingredients.split(',').map(i => i.trim()) : null,
        image_url: imageUrl,
        country: formData.country || 'USA',
        state: formData.state.trim() || null,
        city: formData.city || null,
        town: formData.town || null,
        delivery_type: formData.delivery_type,
        google_maps_link: formData.delivery_type === 'takeaway' ? (formData.google_maps_link.trim() || null) : null,
        food_tag: formData.food_tag
      });
      if (error) throw error;
      toast({ title: 'Listing created successfully!' });
      setCreateDialogOpen(false);
      resetForm();
      setImageFile(null);
      setImagePreview(null);
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
        is_vegetarian: editFormData.food_tag === 'veg' || editFormData.food_tag === 'vegan',
        calories: editFormData.calories ? parseInt(editFormData.calories) : null,
        carbs: editFormData.carbs ? parseInt(editFormData.carbs) : null,
        protein: editFormData.protein ? parseInt(editFormData.protein) : null,
        fat: editFormData.fat ? parseInt(editFormData.fat) : null,
        ingredients: editFormData.ingredients ? editFormData.ingredients.split(',').map(i => i.trim()) : null,
        image_url: imageUrl,
        country: editFormData.country || 'USA',
        state: editFormData.state.trim() || null,
        city: editFormData.city || null,
        town: editFormData.town || null,
        delivery_type: editFormData.delivery_type,
        google_maps_link: editFormData.delivery_type === 'takeaway' ? (editFormData.google_maps_link.trim() || null) : null,
        food_tag: editFormData.food_tag
      }).eq('id', editingListing.id);
      if (error) throw error;
      toast({ title: 'Listing updated!' });
      setEditDialogOpen(false);
      setEditingListing(null);
      setEditImageFile(null);
      setEditImagePreview(null);
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
      town: listing.town || '',
      delivery_type: listing.delivery_type || 'takeaway',
      google_maps_link: listing.google_maps_link || '',
      food_tag: listing.food_tag || 'non-veg'
    });
    setEditImagePreview(listing.image_url);
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
      ingredients: '', country: 'USA', state: '', city: '', town: '',
      delivery_type: 'takeaway', google_maps_link: '', food_tag: 'non-veg' });
  };

  // Send message to seller about a listing
  const sendListingMessage = async () => {
    if (!user || !messageListing || !messageText.trim()) return;
    try {
      const content = `[FOOD:${messageListing.id}] Re: ${messageListing.title} — ${messageText.trim()}`;
      const { error } = await supabase.from('direct_messages').insert({
        sender_id: user.id,
        receiver_id: messageListing.seller_id,
        content
      });
      if (error) throw error;
      setMessageText('');
      toast({ title: 'Message sent!' });
      // Refresh conversation
      fetchConversation(messageListing.seller_id, messageListing.id);
    } catch (err: any) {
      toast({ title: 'Error sending message', variant: 'destructive' });
    }
  };

  const fetchConversation = async (otherUserId: string, listingId: string) => {
    if (!user) return;
    const { data } = await supabase
      .from('direct_messages').select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true });
    
    const filtered = (data || []).filter(m => m.content.includes(`[FOOD:${listingId}]`));
    setConversationMessages(filtered);
    
    // Mark as read
    await supabase.from('direct_messages').update({ is_read: true })
      .eq('sender_id', otherUserId).eq('receiver_id', user.id);
  };

  const openMessageDialog = (listing: FoodListing) => {
    setMessageListing(listing);
    setMessageDialogOpen(true);
    if (user) fetchConversation(listing.seller_id, listing.id);
  };

  // Seller reply
  const sendSellerReply = async () => {
    if (!user || !selectedSellerChat || !sellerReplyText.trim()) return;
    try {
      const content = `[FOOD:${selectedSellerChat.listing.id}] Re: ${selectedSellerChat.listing.title} — ${sellerReplyText.trim()}`;
      const { error } = await supabase.from('direct_messages').insert({
        sender_id: user.id,
        receiver_id: selectedSellerChat.buyerId,
        content
      });
      if (error) throw error;
      setSellerReplyText('');
      fetchSellerChatMessages(selectedSellerChat.buyerId, selectedSellerChat.listing.id);
    } catch (err) {
      toast({ title: 'Error sending reply', variant: 'destructive' });
    }
  };

  const fetchSellerChatMessages = async (buyerId: string, listingId: string) => {
    if (!user) return;
    const { data } = await supabase
      .from('direct_messages').select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${buyerId}),and(sender_id.eq.${buyerId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true });
    const filtered = (data || []).filter(m => m.content.includes(`[FOOD:${listingId}]`));
    setSellerChatMessages(filtered);
    await supabase.from('direct_messages').update({ is_read: true })
      .eq('sender_id', buyerId).eq('receiver_id', user.id);
  };

  // Buy now
  const handleBuyNow = (listing: FoodListing, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setBuyListing(listing);
    setBuyDialogOpen(true);
  };

  const confirmBuy = async () => {
    if (!user || !buyListing) return;
    try {
      const content = `[FOOD:${buyListing.id}] 🛒 ORDER: I want to buy "${buyListing.title}"${buyListing.delivery_type === 'takeaway' ? ` — Pickup time: ${buyPickupTime || 'ASAP'}` : ' — Home Delivery requested'}`;
      const { error } = await supabase.from('direct_messages').insert({
        sender_id: user.id,
        receiver_id: buyListing.seller_id,
        content
      });
      if (error) throw error;
      toast({ title: 'Order placed!', description: 'The seller has been notified.' });
      setBuyDialogOpen(false);
      setBuyListing(null);
      setBuyPickupTime('');
    } catch (err) {
      toast({ title: 'Error placing order', variant: 'destructive' });
    }
  };

  const filteredListings = listings.filter(listing => {
    if (searchQuery && !listing.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (countryFilter && listing.country?.toLowerCase() !== countryFilter.toLowerCase()) return false;
    if (stateFilter && listing.state?.toLowerCase() !== stateFilter.toLowerCase()) return false;
    if (cityFilter && listing.city?.toLowerCase() !== cityFilter.toLowerCase()) return false;
    if (priceFilter === 'free' && listing.price > 0) return false;
    if (priceFilter === 'paid' && listing.price === 0) return false;
    if (tagFilter !== 'all' && listing.food_tag !== tagFilter) return false;
    return true;
  });

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  const getTagInfo = (tag: string) => FOOD_TAGS.find(t => t.value === tag) || FOOD_TAGS[2];
  
  const extractMessageText = (content: string) => {
    const match = content.match(/— (.+)$/);
    return match ? match[1] : content;
  };

  const totalUnreadSeller = sellerListingMessages.reduce((sum, s) => sum + s.unreadCount, 0);

  const renderLocationFields = (data: typeof formData, setData: (d: any) => void) => {
    const cities = data.state ? (STATE_CITIES[data.state] || []) : [];
    return (
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Country</Label>
          <Select value={data.country} onValueChange={(v) => setData({ ...data, country: v, state: '', city: '', town: '' })}>
            <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
            <SelectContent><ScrollArea className="h-48">
              {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </ScrollArea></SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">State/Province</Label>
          <Select value={data.state} onValueChange={(v) => setData({ ...data, state: v, city: '', town: '' })}>
            <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
            <SelectContent><ScrollArea className="h-48">
              {(COUNTRY_STATES[data.country] || []).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </ScrollArea></SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">City</Label>
          {cities.length > 0 ? (
            <Select value={data.city} onValueChange={(v) => setData({ ...data, city: v, town: '' })}>
              <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
              <SelectContent><ScrollArea className="h-48">
                {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </ScrollArea></SelectContent>
            </Select>
          ) : (
            <Input value={data.city} onChange={(e) => setData({ ...data, city: e.target.value })} placeholder="City" />
          )}
        </div>
        <div>
          <Label className="text-xs">Town/Area</Label>
          <Input value={data.town} onChange={(e) => setData({ ...data, town: e.target.value })} placeholder="Town" />
        </div>
      </div>
    );
  };

  const renderFormFields = (data: typeof formData, setData: (d: any) => void, imgFile: File | null, setImgFile: (f: File | null) => void, preview: string | null, setPreview: (s: string | null) => void) => (
    <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
      {/* Image Upload */}
      <div>
        <Label>Food Photo</Label>
        <div className="mt-1">
          <label className="flex flex-col items-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
            {preview ? (
              <img src={preview} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
            ) : (
              <div className="flex flex-col items-center text-muted-foreground">
                <Upload className="h-8 w-8 mb-1" />
                <span className="text-sm">Click to upload food image</span>
              </div>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageSelect(e.target.files?.[0] || null, setImgFile, setPreview)} />
          </label>
          {imgFile && <Badge variant="secondary" className="mt-2 text-xs">{imgFile.name}</Badge>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label>Food Title *</Label>
          <Input value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} placeholder="e.g., Keto Butter Chicken" />
        </div>
        <div className="col-span-2">
          <Label>Description</Label>
          <Textarea value={data.description} onChange={(e) => setData({ ...data, description: e.target.value })} placeholder="Describe your food..." />
        </div>
        <div>
          <Label>Price (USD) — 0 for Free</Label>
          <Input type="number" value={data.price} onChange={(e) => setData({ ...data, price: e.target.value })} min="0" />
        </div>
        <div>
          <Label>Quantity</Label>
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
        <div>
          <Label>Food Tag</Label>
          <Select value={data.food_tag} onValueChange={(v) => setData({ ...data, food_tag: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {FOOD_TAGS.map(t => <SelectItem key={t.value} value={t.value}>{t.icon} {t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Delivery Type */}
      <div className="border-t pt-4">
        <Label className="text-base font-semibold mb-2 block flex items-center gap-2"><Truck className="h-4 w-4" /> Delivery Option</Label>
        <Select value={data.delivery_type} onValueChange={(v) => setData({ ...data, delivery_type: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="takeaway"><span className="flex items-center gap-2"><Store className="h-3 w-3" /> Takeaway / Pickup</span></SelectItem>
            <SelectItem value="delivery"><span className="flex items-center gap-2"><Truck className="h-3 w-3" /> Home Delivery</span></SelectItem>
            <SelectItem value="both"><span className="flex items-center gap-2">Both</span></SelectItem>
          </SelectContent>
        </Select>
        {(data.delivery_type === 'takeaway' || data.delivery_type === 'both') && (
          <div className="mt-3">
            <Label className="text-xs">Google Maps Link (so buyers can find you)</Label>
            <Input value={data.google_maps_link} onChange={(e) => setData({ ...data, google_maps_link: e.target.value })} placeholder="https://maps.google.com/..." />
          </div>
        )}
      </div>

      {/* Nutrition */}
      <div className="border-t pt-4">
        <Label className="text-base font-semibold mb-2 block">Nutrition (per serving)</Label>
        <div className="grid grid-cols-4 gap-3">
          <div><Label className="text-xs">Cal</Label><Input type="number" value={data.calories} onChange={(e) => setData({ ...data, calories: e.target.value })} /></div>
          <div><Label className="text-xs">Carbs</Label><Input type="number" value={data.carbs} onChange={(e) => setData({ ...data, carbs: e.target.value })} /></div>
          <div><Label className="text-xs">Protein</Label><Input type="number" value={data.protein} onChange={(e) => setData({ ...data, protein: e.target.value })} /></div>
          <div><Label className="text-xs">Fat</Label><Input type="number" value={data.fat} onChange={(e) => setData({ ...data, fat: e.target.value })} /></div>
        </div>
      </div>
      <div>
        <Label>Ingredients (comma separated)</Label>
        <Textarea value={data.ingredients} onChange={(e) => setData({ ...data, ingredients: e.target.value })} placeholder="chicken, cream, butter..." />
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
          <p className="text-muted-foreground max-w-2xl mx-auto">Buy, sell, or share keto-friendly foods with your local community.</p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); if (v === 'my-listings' && user) { fetchMyListings(); fetchSellerMessages(); } }} className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
             <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="browse" className="flex-1 sm:flex-none">Browse</TabsTrigger>
              <TabsTrigger value="my-listings" className="relative flex-1 sm:flex-none">
                My Listings
                {totalUnreadSeller > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] rounded-full h-4 w-4 flex items-center justify-center">{totalUnreadSeller}</span>
                )}
              </TabsTrigger>
            </TabsList>
            {user && (
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2"><Plus className="h-4 w-4" />Create Listing</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-auto">
                  <DialogHeader><DialogTitle>Create Food Listing</DialogTitle></DialogHeader>
                  {renderFormFields(formData, setFormData as any, imageFile, setImageFile, imagePreview, setImagePreview)}
                  <Button onClick={createListing} className="w-full">Create Listing</Button>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* BROWSE TAB */}
          <TabsContent value="browse">
            <Card className="mb-6">
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  <div className="col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search food..." className="pl-9" />
                    </div>
                  </div>
                  <Select value={countryFilter || 'all'} onValueChange={(v) => { setCountryFilter(v === 'all' ? '' : v); setStateFilter(''); setCityFilter(''); }}>
                    <SelectTrigger><SelectValue placeholder="Country" /></SelectTrigger>
                    <SelectContent><ScrollArea className="h-48">
                      <SelectItem value="all">All Countries</SelectItem>
                      {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </ScrollArea></SelectContent>
                  </Select>
                  <Select value={stateFilter || 'all'} onValueChange={(v) => { setStateFilter(v === 'all' ? '' : v); setCityFilter(''); }}>
                    <SelectTrigger><SelectValue placeholder="State" /></SelectTrigger>
                    <SelectContent><ScrollArea className="h-48">
                      <SelectItem value="all">All States</SelectItem>
                      {(countryFilter ? COUNTRY_STATES[countryFilter] || [] : []).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </ScrollArea></SelectContent>
                  </Select>
                  <Select value={priceFilter} onValueChange={(v: any) => setPriceFilter(v)}>
                    <SelectTrigger><SelectValue placeholder="Price" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Prices</SelectItem>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={tagFilter} onValueChange={setTagFilter}>
                    <SelectTrigger><SelectValue placeholder="Tag" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tags</SelectItem>
                      {FOOD_TAGS.map(t => <SelectItem key={t.value} value={t.value}>{t.icon} {t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading...</div>
            ) : filteredListings.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No listings found</h3>
                {user && <Button onClick={() => setCreateDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Create First Listing</Button>}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredListings.map((listing) => {
                  const tag = getTagInfo(listing.food_tag);
                  return (
                    <Card key={listing.id} className={`overflow-hidden hover:shadow-lg transition-shadow cursor-pointer ${listing.is_sold_out ? 'opacity-60' : ''}`} onClick={() => setSelectedListing(listing)}>
                      <div className="aspect-video bg-muted relative overflow-hidden">
                        {listing.image_url ? (
                          <img src={listing.image_url} alt={listing.title} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground"><Image className="h-12 w-12" /></div>
                        )}
                        <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
                          {listing.price === 0 ? (
                            <Badge className="bg-green-500 text-white">FREE</Badge>
                          ) : (
                            <Badge variant="secondary"><DollarSign className="h-3 w-3" />{listing.price.toFixed(2)}</Badge>
                          )}
                          <Badge variant="outline" className={tag.color}>{tag.icon} {tag.label}</Badge>
                        </div>
                        {listing.delivery_type === 'delivery' && (
                          <Badge className="absolute top-2 right-2 bg-blue-500 text-white"><Truck className="h-3 w-3 mr-1" />Delivery</Badge>
                        )}
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
                          {[listing.city, listing.state, listing.country].filter(Boolean).join(', ') || 'Location not set'}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />{formatTime(listing.created_at)}
                        </p>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={listing.seller_avatar || ''} />
                              <AvatarFallback className="text-[10px]">{listing.seller_name?.[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground truncate">{listing.seller_name}</span>
                          </div>
                          <div className="flex gap-1">
                            {user && user.id !== listing.seller_id && (
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); openMessageDialog(listing); }}>
                                <MessageCircle className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            {!listing.is_sold_out && (
                              <Button size="sm" variant="default" className="text-xs h-7" onClick={(e) => handleBuyNow(listing, e)}>
                                Buy Now
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* MY LISTINGS TAB */}
          <TabsContent value="my-listings">
            {!user ? (
              <div className="text-center py-12 text-muted-foreground">Please sign in</div>
            ) : (
              <div className="space-y-6">
                {/* Seller Messages Section */}
                {sellerListingMessages.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" /> Buyer Messages
                        {totalUnreadSeller > 0 && <Badge variant="destructive" className="text-xs">{totalUnreadSeller} unread</Badge>}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {!selectedSellerChat ? (
                        <div className="space-y-2">
                          {sellerListingMessages.map(({ listing, messages, unreadCount }) => {
                            const uniqueBuyers = [...new Set(messages.map(m => m.sender_id))];
                            return uniqueBuyers.map(buyerId => (
                              <button key={`${listing.id}-${buyerId}`}
                                className="w-full p-3 flex items-center gap-3 hover:bg-muted/50 rounded-lg text-left transition-colors border"
                                onClick={async () => {
                                  const { data: profile } = await supabase.from('profiles').select('display_name').eq('user_id', buyerId).maybeSingle();
                                  setSelectedSellerChat({ listing: listing, buyerId, buyerName: profile?.display_name || 'Buyer' });
                                  fetchSellerChatMessages(buyerId, listing.id);
                                }}
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm truncate">{listing.title}</span>
                                    {unreadCount > 0 && <span className="bg-destructive text-destructive-foreground text-[10px] rounded-full h-4 w-4 flex items-center justify-center">{unreadCount}</span>}
                                  </div>
                                  <p className="text-xs text-muted-foreground truncate">{extractMessageText(messages[0].content)}</p>
                                </div>
                                <ArrowLeft className="h-4 w-4 rotate-180 text-muted-foreground" />
                              </button>
                            ));
                          })}
                        </div>
                      ) : (
                        <div>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedSellerChat(null)} className="mb-2">
                            <ArrowLeft className="h-4 w-4 mr-1" /> Back
                          </Button>
                          <p className="text-sm font-medium mb-2">Chat with {selectedSellerChat.buyerName} about "{selectedSellerChat.listing.title}"</p>
                          <ScrollArea className="h-60 border rounded-lg p-3 mb-2">
                            <div className="space-y-2">
                              {sellerChatMessages.map(msg => (
                                <div key={msg.id} className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
                                  <div className={`max-w-[80%] p-2 rounded-lg text-sm ${msg.sender_id === user.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                    <p>{extractMessageText(msg.content)}</p>
                                    <p className={`text-[10px] mt-0.5 ${msg.sender_id === user.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{formatTime(msg.created_at)}</p>
                                  </div>
                                </div>
                              ))}
                              <div ref={messagesEndRef} />
                            </div>
                          </ScrollArea>
                          <div className="flex gap-2">
                            <Input value={sellerReplyText} onChange={(e) => setSellerReplyText(e.target.value)} placeholder="Reply..." onKeyDown={(e) => e.key === 'Enter' && sendSellerReply()} />
                            <Button onClick={sendSellerReply} disabled={!sellerReplyText.trim()} size="sm"><Send className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* My listings */}
                {myListings.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No listings yet</h3>
                    <Button onClick={() => setCreateDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Create Listing</Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myListings.map((listing) => {
                      const tag = getTagInfo(listing.food_tag);
                      return (
                        <Card key={listing.id}>
                          <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <div className="w-full sm:w-20 h-32 sm:h-20 bg-muted rounded-lg shrink-0 overflow-hidden">
                              {listing.image_url ? (
                                <img src={listing.image_url} alt={listing.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="flex items-center justify-center h-full"><Image className="h-8 w-8 text-muted-foreground" /></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">{listing.title}</h3>
                                <Badge variant="outline" className={`text-xs ${tag.color}`}>{tag.icon} {tag.label}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {listing.price === 0 ? 'Free' : `$${listing.price.toFixed(2)}`} • Qty: {listing.quantity}
                                {listing.delivery_type === 'delivery' && ' • 🚚 Delivery'}
                                {listing.delivery_type === 'takeaway' && ' • 🏪 Takeaway'}
                                {listing.delivery_type === 'both' && ' • 🚚+🏪'}
                              </p>
                              <p className="text-xs text-muted-foreground"><Clock className="h-3 w-3 inline mr-1" />{formatTime(listing.created_at)}</p>
                            </div>
                            <div className="flex gap-2 flex-wrap w-full sm:w-auto justify-end">
                              {listing.is_sold_out && <Badge variant="destructive">Sold Out</Badge>}
                              <Button size="sm" variant="outline" onClick={() => openEditDialog(listing)}><Edit className="h-4 w-4" /></Button>
                              <Button size="sm" variant="outline" onClick={() => toggleSoldOut(listing.id, listing.is_sold_out)}>
                                {listing.is_sold_out ? 'Available' : 'Sold'}
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => deleteListing(listing.id)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-auto">
            <DialogHeader><DialogTitle>Edit Listing</DialogTitle></DialogHeader>
            {renderFormFields(editFormData, setEditFormData as any, editImageFile, setEditImageFile, editImagePreview, setEditImagePreview)}
            <Button onClick={updateListing} className="w-full">Update Listing</Button>
          </DialogContent>
        </Dialog>

        {/* Detail Dialog */}
        <Dialog open={!!selectedListing} onOpenChange={() => setSelectedListing(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            {selectedListing && (() => {
              const tag = getTagInfo(selectedListing.food_tag);
              return (
                <>
                  <DialogHeader>
                    <DialogTitle className="text-xl">{selectedListing.title}</DialogTitle>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {selectedListing.price === 0 ? (
                        <Badge className="bg-green-500 text-white">FREE</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-lg"><DollarSign className="h-3 w-3" />{selectedListing.price.toFixed(2)}</Badge>
                      )}
                      <Badge variant="outline" className={tag.color}>{tag.icon} {tag.label}</Badge>
                      {selectedListing.delivery_type === 'delivery' && <Badge className="bg-blue-500 text-white"><Truck className="h-3 w-3 mr-1" />Delivery</Badge>}
                      {selectedListing.delivery_type === 'takeaway' && <Badge variant="outline"><Store className="h-3 w-3 mr-1" />Takeaway</Badge>}
                      {selectedListing.delivery_type === 'both' && <Badge variant="outline">Delivery + Takeaway</Badge>}
                    </div>
                  </DialogHeader>
                  {selectedListing.image_url && (
                    <img src={selectedListing.image_url} alt={selectedListing.title} className="w-full h-48 object-cover rounded-lg" />
                  )}
                  {selectedListing.description && <p className="text-muted-foreground">{selectedListing.description}</p>}
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />Listed {formatTime(selectedListing.created_at)}</p>
                  
                  {selectedListing.google_maps_link && (
                    <Button variant="outline" size="sm" className="gap-2" asChild>
                      <a href={selectedListing.google_maps_link.startsWith('http') ? selectedListing.google_maps_link : `https://${selectedListing.google_maps_link}`} target="_blank" rel="noopener noreferrer">
                        <MapPin className="h-4 w-4" /> View on Google Maps <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  )}

                  {selectedListing.carbs !== null && (
                    <div className="grid grid-cols-4 gap-2 bg-muted/50 rounded-lg p-3">
                      <div className="text-center"><div className="font-bold">{selectedListing.calories || '-'}</div><div className="text-xs text-muted-foreground">Cal</div></div>
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
                        {[selectedListing.city, selectedListing.state, selectedListing.country].filter(Boolean).join(', ')}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {user && user.id !== selectedListing.seller_id && (
                        <Button variant="outline" size="sm" onClick={() => openMessageDialog(selectedListing)}>
                          <MessageCircle className="h-4 w-4 mr-1" /> Message
                        </Button>
                      )}
                      {!selectedListing.is_sold_out && (
                        <Button size="sm" onClick={() => handleBuyNow(selectedListing)}>Buy Now</Button>
                      )}
                    </div>
                  </div>
                </>
              );
            })()}
          </DialogContent>
        </Dialog>

        {/* Message Dialog */}
        <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Message Seller — {messageListing?.title}</DialogTitle></DialogHeader>
            <ScrollArea className="h-48 border rounded-lg p-3 mb-2">
              <div className="space-y-2">
                {conversationMessages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-2 rounded-lg text-sm ${msg.sender_id === user?.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      <p>{extractMessageText(msg.content)}</p>
                      <p className={`text-[10px] mt-0.5 ${msg.sender_id === user?.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{formatTime(msg.created_at)}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            <div className="flex gap-2">
              <Input value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder="Ask about this food..." onKeyDown={(e) => e.key === 'Enter' && sendListingMessage()} />
              <Button onClick={sendListingMessage} disabled={!messageText.trim()}><Send className="h-4 w-4" /></Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Buy Now Dialog */}
        <Dialog open={buyDialogOpen} onOpenChange={setBuyDialogOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Buy: {buyListing?.title}</DialogTitle></DialogHeader>
            {buyListing && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{buyListing.price === 0 ? 'FREE' : `$${buyListing.price.toFixed(2)}`}</p>
                </div>
                {(buyListing.delivery_type === 'takeaway' || buyListing.delivery_type === 'both') && (
                  <div>
                    <Label>Pickup Time</Label>
                    <Input type="datetime-local" value={buyPickupTime} onChange={(e) => setBuyPickupTime(e.target.value)} />
                    {buyListing.google_maps_link && (
                      <a href={buyListing.google_maps_link.startsWith('http') ? buyListing.google_maps_link : `https://${buyListing.google_maps_link}`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" /> Get directions <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                )}
                <Button onClick={confirmBuy} className="w-full">
                  {buyListing.delivery_type === 'delivery' ? '🚚 Order for Delivery' : '🏪 Confirm Takeaway'}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
};

export default Marketplace;
