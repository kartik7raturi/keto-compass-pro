import { useState, useEffect, useRef, useCallback } from 'react';
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
  MapPin, Search, Plus, ShoppingBag, 
  MessageCircle, Edit, Trash2, Clock, DollarSign, Upload, Image,
  Send, ArrowLeft, Truck, Store, ExternalLink, Star, Package, BarChart3, Home,
  Globe, Building2, MapPinned, Filter
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
}

interface FoodReview {
  id: string;
  listing_id: string;
  seller_id: string;
  reviewer_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer_name?: string;
  reviewer_avatar?: string;
}

interface OrderDetail {
  buyerName: string;
  buyerAvatar: string | null;
  quantity: number;
  deliveryType: string;
  address: string;
  pickupTime: string;
  orderedAt: string;
  listingTitle: string;
  listingId: string;
  buyerId: string;
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

const CITY_TOWNS: Record<string, string[]> = {
  'Los Angeles': ['Hollywood','Santa Monica','Beverly Hills','Downtown LA','Venice','Westwood','Pasadena','Burbank'],
  'San Francisco': ['Mission District','SoMa','Financial District','Chinatown','Nob Hill','Sunset District'],
  'New York City': ['Manhattan','Brooklyn','Queens','Bronx','Staten Island','Harlem','Williamsburg'],
  'Houston': ['Downtown','Midtown','The Heights','Montrose','Katy','Sugar Land'],
  'Dallas': ['Downtown','Uptown','Deep Ellum','Oak Lawn','Bishop Arts','Plano'],
  'Chicago': ['Loop','Lincoln Park','Wicker Park','Hyde Park','Lakeview','Logan Square'],
  'Miami': ['Downtown','South Beach','Brickell','Wynwood','Coconut Grove','Little Havana'],
  'London': ['Westminster','Camden','Greenwich','Hackney','Islington','Kensington','Shoreditch','Soho'],
  'Manchester': ['City Centre','Salford','Didsbury','Chorlton','Ancoats'],
  'Toronto': ['Downtown','Scarborough','North York','Etobicoke','Mississauga'],
  'Sydney': ['CBD','Bondi','Surry Hills','Newtown','Parramatta','Manly'],
  'Melbourne': ['CBD','St Kilda','Fitzroy','South Yarra','Richmond','Carlton'],
  'Brisbane': ['CBD','South Bank','Fortitude Valley','West End','New Farm'],
  'Auckland CBD': ['Ponsonby','Parnell','Newmarket','Grey Lynn','Mt Eden'],
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
  const [buyQuantity, setBuyQuantity] = useState(1);
  const [buyAddress, setBuyAddress] = useState('');

  // Unified messages state
  const [allConversations, setAllConversations] = useState<{listing: FoodListing; otherUserId: string; otherUserName: string; messages: MarketMessage[]; unreadCount: number; isSeller: boolean}[]>([]);
  const [selectedChat, setSelectedChat] = useState<{listing: FoodListing; otherUserId: string; otherUserName: string; isSeller: boolean} | null>(null);
  const [chatMessages, setChatMessages] = useState<MarketMessage[]>([]);
  const [replyText, setReplyText] = useState('');

  // Message dialog (from browse)
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messageListing, setMessageListing] = useState<FoodListing | null>(null);
  const [messageText, setMessageText] = useState('');
  const [conversationMessages, setConversationMessages] = useState<MarketMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Reviews
  const [reviews, setReviews] = useState<FoodReview[]>([]);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewListing, setReviewListing] = useState<FoodListing | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [townFilter, setTownFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // User saved location
  const [savedLocation, setSavedLocation] = useState<{country: string; state: string; city: string; town: string}>({ country: '', state: '', city: '', town: '' });
  const [locationLoaded, setLocationLoaded] = useState(false);

  // Dashboard order detail
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [dashOrders, setDashOrders] = useState<OrderDetail[]>([]);

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

  // Load user's saved location from profile
  useEffect(() => {
    const loadUserLocation = async () => {
      if (!user) { setLocationLoaded(true); return; }
      try {
        const { data } = await supabase.from('profiles').select('country, state, city, town').eq('user_id', user.id).maybeSingle();
        if (data) {
          const loc = {
            country: (data as Record<string, string | null>).country || '',
            state: (data as Record<string, string | null>).state || '',
            city: (data as Record<string, string | null>).city || '',
            town: (data as Record<string, string | null>).town || ''
          };
          setSavedLocation(loc);
          // Auto-fill browse filters
          if (loc.country) setCountryFilter(loc.country);
          if (loc.state) setStateFilter(loc.state);
          if (loc.city) setCityFilter(loc.city);
          if (loc.town) setTownFilter(loc.town);
          // Auto-fill create form
          setFormData(prev => ({
            ...prev,
            country: loc.country || 'USA',
            state: loc.state || '',
            city: loc.city || '',
            town: loc.town || ''
          }));
        }
      } catch (err) {
        console.error('Error loading user location:', err);
      }
      setLocationLoaded(true);
    };
    loadUserLocation();
  }, [user]);

  const saveUserLocation = useCallback(async (loc: {country: string; state: string; city: string; town: string}) => {
    if (!user) return;
    try {
      await supabase.from('profiles').update({
        country: loc.country || null,
        state: loc.state || null,
        city: loc.city || null,
        town: loc.town || null
      } as Record<string, string | null>).eq('user_id', user.id);
      setSavedLocation(loc);
    } catch (err) {
      console.error('Error saving location:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchListings();
    if (user) { fetchMyListings(); fetchAllMessages(); }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages, chatMessages]);

  // Real-time message subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('marketplace-dm-realtime')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'direct_messages',
        filter: `receiver_id=eq.${user.id}`
      }, (payload) => {
        const newMsg = payload.new as MarketMessage;
        if (newMsg.content?.includes('[FOOD:')) {
          if (selectedChat) {
            setChatMessages(prev => prev.find(m => m.id === newMsg.id) ? prev : [...prev, newMsg]);
          }
          if (messageListing) {
            setConversationMessages(prev => prev.find(m => m.id === newMsg.id) ? prev : [...prev, newMsg]);
          }
          fetchAllMessages();
        }
      })
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'direct_messages',
        filter: `sender_id=eq.${user.id}`
      }, (payload) => {
        const newMsg = payload.new as MarketMessage;
        if (newMsg.content?.includes('[FOOD:')) {
          if (selectedChat) {
            setChatMessages(prev => prev.find(m => m.id === newMsg.id) ? prev : [...prev, newMsg]);
          }
          if (messageListing) {
            setConversationMessages(prev => prev.find(m => m.id === newMsg.id) ? prev : [...prev, newMsg]);
          }
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, selectedChat, messageListing]);

  const fetchListings = async () => {
    try {
      // Public browse never selects seller contact columns (not readable by anonymous visitors)
      const { data, error } = await supabase
        .from('food_listings')
        .select('id, seller_id, title, description, price, quantity, category, is_vegetarian, calories, carbs, protein, fat, ingredients, image_url, country, state, city, town, latitude, longitude, is_available, is_sold_out, delivery_type, google_maps_link, food_tag, is_verified, views_count, view_count, keto_certified, delivery_radius_km, min_order_amount, created_at, updated_at')
        .eq('is_available', true).order('created_at', { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) {
        const sellerIds = [...new Set(data.map(l => l.seller_id))];
        const { data: profiles } = await supabase
          .from('public_profiles').select('user_id, display_name, avatar_url').in('user_id', sellerIds);
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

  const fetchAllMessages = async () => {
    if (!user) return;
    try {
      const { data: sentMsgs } = await supabase.from('direct_messages').select('*').eq('sender_id', user.id).order('created_at', { ascending: false });
      const { data: receivedMsgs } = await supabase.from('direct_messages').select('*').eq('receiver_id', user.id).order('created_at', { ascending: false });
      const allMsgs = [...(sentMsgs || []), ...(receivedMsgs || [])];
      const convMap = new Map<string, { listingId: string; otherUserId: string; messages: MarketMessage[] }>();
      for (const msg of allMsgs) {
        const match = msg.content.match(/\[FOOD:([^\]]+)\]/);
        if (!match) continue;
        const listingId = match[1];
        const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        const key = `${listingId}-${otherUserId}`;
        if (!convMap.has(key)) convMap.set(key, { listingId, otherUserId, messages: [] });
        convMap.get(key)!.messages.push(msg);
      }
      const results: typeof allConversations = [];
      for (const [, conv] of convMap) {
        const { data: listing } = await supabase.from('food_listings').select('*').eq('id', conv.listingId).maybeSingle();
        if (!listing) continue;
        const { data: profile } = await supabase.from('public_profiles').select('display_name, avatar_url').eq('user_id', conv.otherUserId).maybeSingle();
        const isSeller = listing.seller_id === user.id;
        const unread = conv.messages.filter(m => m.receiver_id === user.id && !m.is_read).length;
        const sorted = conv.messages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        results.push({
          listing: listing as FoodListing,
          otherUserId: conv.otherUserId,
          otherUserName: profile?.display_name || (isSeller ? 'Buyer' : 'Seller'),
          messages: sorted, unreadCount: unread, isSeller
        });
      }
      results.sort((a, b) => new Date(b.messages[0]?.created_at || 0).getTime() - new Date(a.messages[0]?.created_at || 0).getTime());
      setAllConversations(results);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchChatMessages = async (otherUserId: string, listingId: string) => {
    if (!user) return;
    const { data } = await supabase
      .from('direct_messages').select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true });
    const filtered = (data || []).filter(m => m.content.includes(`[FOOD:${listingId}]`));
    setChatMessages(filtered);
    const unreadIds = filtered.filter(m => m.receiver_id === user.id && !m.is_read).map(m => m.id);
    if (unreadIds.length > 0) {
      await supabase.from('direct_messages').update({ is_read: true }).in('id', unreadIds);
      fetchAllMessages();
    }
  };

  const sendChatReply = async () => {
    if (!user || !selectedChat || !replyText.trim()) return;
    try {
      const content = `[FOOD:${selectedChat.listing.id}] Re: ${selectedChat.listing.title} — ${replyText.trim()}`;
      const { error } = await supabase.from('direct_messages').insert({
        sender_id: user.id, receiver_id: selectedChat.otherUserId, content
      });
      if (error) throw error;
      setReplyText('');
      fetchChatMessages(selectedChat.otherUserId, selectedChat.listing.id);
    } catch {
      toast({ title: 'Error sending reply', variant: 'destructive' });
    }
  };

  const uploadFoodImage = async (file: File): Promise<string | null> => {
    if (!user) return null;
    try {
      const ext = file.name.split('.').pop();
      const path = `food/${user.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('recipe-media').upload(path, file, { cacheControl: '3600', upsert: false });
      if (error) { toast({ title: 'Image upload failed', description: error.message, variant: 'destructive' }); return null; }
      const { data } = supabase.storage.from('recipe-media').getPublicUrl(path);
      return data.publicUrl;
    } catch {
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
        seller_id: user.id, title: formData.title.trim(),
        description: formData.description.trim() || null,
        price: parseFloat(formData.price) || 0, quantity: parseInt(formData.quantity) || 1,
        category: formData.category, is_vegetarian: formData.food_tag === 'veg' || formData.food_tag === 'vegan',
        calories: formData.calories ? parseInt(formData.calories) : null,
        carbs: formData.carbs ? parseInt(formData.carbs) : null,
        protein: formData.protein ? parseInt(formData.protein) : null,
        fat: formData.fat ? parseInt(formData.fat) : null,
        ingredients: formData.ingredients ? formData.ingredients.split(',').map(i => i.trim()) : null,
        image_url: imageUrl, country: formData.country || 'USA',
        state: formData.state.trim() || null, city: formData.city || null, town: formData.town || null,
        delivery_type: formData.delivery_type,
        google_maps_link: (formData.delivery_type === 'takeaway' || formData.delivery_type === 'both') ? (formData.google_maps_link.trim() || null) : null,
        food_tag: formData.food_tag
      });
      if (error) throw error;
      // Save location to profile
      await saveUserLocation({ country: formData.country, state: formData.state, city: formData.city, town: formData.town });
      toast({ title: 'Listing created successfully!' });
      setCreateDialogOpen(false);
      resetForm(); setImageFile(null); setImagePreview(null);
      fetchListings(); fetchMyListings();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      toast({ title: 'Error creating listing', description: msg, variant: 'destructive' });
    }
  };

  const updateListing = async () => {
    if (!user || !editingListing) return;
    try {
      let imageUrl = editingListing.image_url;
      if (editImageFile) { const newUrl = await uploadFoodImage(editImageFile); if (newUrl) imageUrl = newUrl; }
      const { error } = await supabase.from('food_listings').update({
        title: editFormData.title.trim(), description: editFormData.description.trim() || null,
        price: parseFloat(editFormData.price) || 0, quantity: parseInt(editFormData.quantity) || 1,
        category: editFormData.category, is_vegetarian: editFormData.food_tag === 'veg' || editFormData.food_tag === 'vegan',
        calories: editFormData.calories ? parseInt(editFormData.calories) : null,
        carbs: editFormData.carbs ? parseInt(editFormData.carbs) : null,
        protein: editFormData.protein ? parseInt(editFormData.protein) : null,
        fat: editFormData.fat ? parseInt(editFormData.fat) : null,
        ingredients: editFormData.ingredients ? editFormData.ingredients.split(',').map(i => i.trim()) : null,
        image_url: imageUrl, country: editFormData.country || 'USA',
        state: editFormData.state.trim() || null, city: editFormData.city || null, town: editFormData.town || null,
        delivery_type: editFormData.delivery_type,
        google_maps_link: (editFormData.delivery_type === 'takeaway' || editFormData.delivery_type === 'both') ? (editFormData.google_maps_link.trim() || null) : null,
        food_tag: editFormData.food_tag
      }).eq('id', editingListing.id);
      if (error) throw error;
      await saveUserLocation({ country: editFormData.country, state: editFormData.state, city: editFormData.city, town: editFormData.town });
      toast({ title: 'Listing updated!' });
      setEditDialogOpen(false); setEditingListing(null); setEditImageFile(null); setEditImagePreview(null);
      fetchListings(); fetchMyListings();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      toast({ title: 'Error updating listing', description: msg, variant: 'destructive' });
    }
  };

  const openEditDialog = (listing: FoodListing) => {
    setEditingListing(listing);
    setEditFormData({
      title: listing.title, description: listing.description || '',
      price: listing.price.toString(), quantity: listing.quantity.toString(),
      category: listing.category, is_vegetarian: listing.is_vegetarian || false,
      calories: listing.calories?.toString() || '', carbs: listing.carbs?.toString() || '',
      protein: listing.protein?.toString() || '', fat: listing.fat?.toString() || '',
      ingredients: listing.ingredients?.join(', ') || '', country: listing.country || 'USA',
      state: listing.state || '', city: listing.city || '', town: listing.town || '',
      delivery_type: listing.delivery_type || 'takeaway',
      google_maps_link: listing.google_maps_link || '', food_tag: listing.food_tag || 'non-veg'
    });
    setEditImagePreview(listing.image_url);
    setEditDialogOpen(true);
  };

  const deleteListing = async (id: string) => {
    if (!window.confirm('Delete this listing? This cannot be undone.')) return;
    try {
      await supabase.from('food_listings').delete().eq('id', id);
      toast({ title: 'Listing deleted' });
      fetchMyListings(); fetchListings();
    } catch {
      toast({ title: 'Error deleting listing', variant: 'destructive' });
    }
  };

  const toggleSoldOut = async (id: string, currentStatus: boolean | null) => {
    try {
      await supabase.from('food_listings').update({ is_sold_out: !currentStatus }).eq('id', id);
      toast({ title: currentStatus ? 'Marked as available' : 'Marked as sold out' });
      fetchMyListings(); fetchListings();
    } catch {
      toast({ title: 'Error updating listing', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '', description: '', price: '0', quantity: '1', category: 'meal',
      is_vegetarian: false, calories: '', carbs: '', protein: '', fat: '',
      ingredients: '',
      country: savedLocation.country || 'USA',
      state: savedLocation.state || '',
      city: savedLocation.city || '',
      town: savedLocation.town || '',
      delivery_type: 'takeaway', google_maps_link: '', food_tag: 'non-veg'
    });
  };

  const sendListingMessage = async () => {
    if (!user || !messageListing || !messageText.trim()) return;
    try {
      const content = `[FOOD:${messageListing.id}] Re: ${messageListing.title} — ${messageText.trim()}`;
      const { error } = await supabase.from('direct_messages').insert({
        sender_id: user.id, receiver_id: messageListing.seller_id, content
      });
      if (error) throw error;
      setMessageText('');
      toast({ title: 'Message sent!' });
      fetchConversation(messageListing.seller_id, messageListing.id);
      fetchAllMessages();
    } catch {
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
    const unreadIds = filtered.filter(m => m.receiver_id === user.id && !m.is_read).map(m => m.id);
    if (unreadIds.length > 0) {
      await supabase.from('direct_messages').update({ is_read: true }).in('id', unreadIds);
      fetchAllMessages();
    }
  };

  const openMessageDialog = (listing: FoodListing) => {
    setMessageListing(listing);
    setMessageDialogOpen(true);
    if (user) fetchConversation(listing.seller_id, listing.id);
  };

  // Buy now with quantity decrease
  const handleBuyNow = (listing: FoodListing, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setBuyListing(listing);
    setBuyQuantity(1);
    setBuyAddress('');
    setBuyPickupTime('');
    setBuyDialogOpen(true);
  };

  const confirmBuy = async () => {
    if (!user || !buyListing) return;
    try {
      const isDelivery = buyListing.delivery_type === 'delivery' || (buyListing.delivery_type === 'both' && buyAddress.trim().length > 0);
      const fulfillmentPart = isDelivery
        ? ` — 📍 Delivery Address: ${buyAddress.trim() || 'Not provided'}`
        : ` — ⏰ Pickup: ${buyPickupTime || 'ASAP'}`;
      const content = `[FOOD:${buyListing.id}] 🛒 ORDER: I want to buy ${buyQuantity}x "${buyListing.title}" — Total: $${(buyListing.price * buyQuantity).toFixed(2)} — ${isDelivery ? 'Home Delivery' : 'Takeaway'}${fulfillmentPart}`;
      const { error } = await supabase.from('direct_messages').insert({
        sender_id: user.id, receiver_id: buyListing.seller_id, content
      });
      if (error) throw error;

      // Decrease quantity on the listing
      const newQty = Math.max(0, buyListing.quantity - buyQuantity);
      await supabase.from('food_listings').update({
        quantity: newQty,
        is_sold_out: newQty === 0
      }).eq('id', buyListing.id);

      // Save buyer location
      if (buyAddress.trim()) {
        // location is already saved from profile
      }

      toast({ title: 'Order placed!', description: 'The seller has been notified.' });
      setBuyDialogOpen(false); setBuyListing(null); setBuyPickupTime(''); setBuyQuantity(1); setBuyAddress('');
      fetchAllMessages(); fetchListings(); fetchMyListings();
    } catch {
      toast({ title: 'Error placing order', variant: 'destructive' });
    }
  };

  // Parse orders from messages for dashboard
  const parseDashboardOrders = useCallback(async () => {
    if (!user) return;
    const orders: OrderDetail[] = [];
    for (const conv of allConversations) {
      if (!conv.isSeller) continue;
      for (const msg of conv.messages) {
        if (!msg.content.includes('🛒 ORDER')) continue;
        // Parse order details
        const qtyMatch = msg.content.match(/buy (\d+)x/);
        const qty = qtyMatch ? parseInt(qtyMatch[1]) : 1;
        const addressMatch = msg.content.match(/📍 Delivery Address: (.+?)(?:$|—)/);
        const address = addressMatch ? addressMatch[1].trim() : '';
        const pickupMatch = msg.content.match(/⏰ Pickup: (.+?)(?:$|—)/);
        const pickupTime = pickupMatch ? pickupMatch[1].trim() : '';
        const isDelivery = msg.content.includes('Home Delivery');
        
        const { data: buyerProfile } = await supabase.from('public_profiles').select('display_name, avatar_url').eq('user_id', conv.otherUserId).maybeSingle();
        
        orders.push({
          buyerName: buyerProfile?.display_name || conv.otherUserName,
          buyerAvatar: buyerProfile?.avatar_url || null,
          quantity: qty,
          deliveryType: isDelivery ? 'delivery' : 'takeaway',
          address,
          pickupTime,
          orderedAt: msg.created_at,
          listingTitle: conv.listing.title,
          listingId: conv.listing.id,
          buyerId: conv.otherUserId
        });
      }
    }
    orders.sort((a, b) => new Date(b.orderedAt).getTime() - new Date(a.orderedAt).getTime());
    setDashOrders(orders);
  }, [user, allConversations]);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      parseDashboardOrders();
    }
  }, [activeTab, allConversations, parseDashboardOrders]);

  // Reviews
  const fetchReviews = async (listingId: string) => {
    const { data } = await supabase.from('food_listing_reviews').select('*').eq('listing_id', listingId).order('created_at', { ascending: false });
    if (data) {
      const reviewerIds = [...new Set(data.map(r => r.reviewer_id))];
      const { data: profiles } = await supabase.from('public_profiles').select('user_id, display_name, avatar_url').in('user_id', reviewerIds);
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      setReviews(data.map(r => ({
        ...r, reviewer_name: profileMap.get(r.reviewer_id)?.display_name || 'User',
        reviewer_avatar: profileMap.get(r.reviewer_id)?.avatar_url || null
      })));
    }
  };

  const submitReview = async () => {
    if (!user || !reviewListing) return;
    try {
      const { error } = await supabase.from('food_listing_reviews').upsert({
        listing_id: reviewListing.id, seller_id: reviewListing.seller_id,
        reviewer_id: user.id, rating: reviewRating, comment: reviewComment.trim() || null
      }, { onConflict: 'listing_id,reviewer_id' });
      if (error) throw error;
      toast({ title: 'Review submitted!' });
      setReviewDialogOpen(false); setReviewComment(''); setReviewRating(5);
      if (selectedListing) fetchReviews(selectedListing.id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast({ title: 'Error submitting review', description: msg, variant: 'destructive' });
    }
  };

  const filteredListings = listings.filter(listing => {
    if (searchQuery && !listing.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (countryFilter && listing.country?.toLowerCase() !== countryFilter.toLowerCase()) return false;
    if (stateFilter && listing.state?.toLowerCase() !== stateFilter.toLowerCase()) return false;
    if (cityFilter && listing.city?.toLowerCase() !== cityFilter.toLowerCase()) return false;
    if (townFilter && listing.town?.toLowerCase() !== townFilter.toLowerCase()) return false;
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

  const totalUnread = allConversations.reduce((sum, c) => sum + c.unreadCount, 0);
  const totalOrders = dashOrders.length;
  const totalQuantityLeft = myListings.reduce((sum, l) => sum + (l.is_sold_out ? 0 : l.quantity), 0);
  const activeLCount = myListings.filter(l => !l.is_sold_out).length;
  const soldOutCount = myListings.filter(l => l.is_sold_out).length;

  const filterCities = stateFilter ? (STATE_CITIES[stateFilter] || []) : [];
  const filterTowns = cityFilter ? (CITY_TOWNS[cityFilter] || []) : [];

  const renderLocationFields = (data: typeof formData, setData: (d: typeof formData) => void) => {
    const cities = data.state ? (STATE_CITIES[data.state] || []) : [];
    const towns = data.city ? (CITY_TOWNS[data.city] || []) : [];
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
          {towns.length > 0 ? (
            <Select value={data.town} onValueChange={(v) => setData({ ...data, town: v })}>
              <SelectTrigger><SelectValue placeholder="Select town" /></SelectTrigger>
              <SelectContent><ScrollArea className="h-48">
                {towns.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </ScrollArea></SelectContent>
            </Select>
          ) : (
            <Input value={data.town} onChange={(e) => setData({ ...data, town: e.target.value })} placeholder="Town" />
          )}
        </div>
      </div>
    );
  };

  const renderFormFields = (data: typeof formData, setData: (d: typeof formData) => void, imgFile: File | null, setImgFile: (f: File | null) => void, preview: string | null, setPreview: (s: string | null) => void) => (
    <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
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
      <div className="border-t pt-4">
        <Label className="text-base font-semibold mb-2 flex items-center gap-2"><Truck className="h-4 w-4" /> Delivery Option</Label>
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
        <Label>Ingredients (comma-separated)</Label>
        <Input value={data.ingredients} onChange={(e) => setData({ ...data, ingredients: e.target.value })} placeholder="chicken, butter, cream..." />
      </div>
      <div className="border-t pt-4">
        <Label className="text-base font-semibold mb-2 flex items-center gap-2"><MapPin className="h-4 w-4" /> Location</Label>
        {renderLocationFields(data, setData)}
      </div>
    </div>
  );

  const renderDeliveryIcon = (deliveryType: string) => {
    switch (deliveryType) {
      case 'delivery':
        return <Badge className="bg-blue-500/90 text-white text-[10px] gap-1 px-1.5"><Truck className="h-3 w-3" />Delivery</Badge>;
      case 'takeaway':
        return <Badge variant="outline" className="text-[10px] gap-1 px-1.5 border-amber-400 text-amber-700 bg-amber-50"><Store className="h-3 w-3" />Pickup</Badge>;
      case 'both':
        return <Badge variant="outline" className="text-[10px] gap-1 px-1.5 border-purple-400 text-purple-700 bg-purple-50"><Truck className="h-3 w-3" /><Store className="h-3 w-3" /></Badge>;
      default:
        return null;
    }
  };

  const renderStars = (rating: number, interactive = false, onChange?: (r: number) => void) => (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`h-4 w-4 ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'} ${interactive ? 'cursor-pointer' : ''}`}
          onClick={() => interactive && onChange?.(i)} />
      ))}
    </div>
  );

  const activeFilterCount = [countryFilter, stateFilter, cityFilter, townFilter].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">🥑 Ketopia Marketplace</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">Buy, sell, or share keto-friendly foods with your local community.</p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); if (v === 'my-messages' && user) fetchAllMessages(); if (v === 'dashboard' && user) { fetchMyListings(); fetchAllMessages(); } }} className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <TabsList className="w-full sm:w-auto flex-wrap h-auto">
              <TabsTrigger value="browse" className="flex-1 sm:flex-none">Browse</TabsTrigger>
              <TabsTrigger value="my-messages" className="relative flex-1 sm:flex-none">
                Messages
                {totalUnread > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] rounded-full h-4 w-4 flex items-center justify-center">{totalUnread}</span>
                )}
              </TabsTrigger>
              <TabsTrigger value="my-listings" className="flex-1 sm:flex-none">My Listings</TabsTrigger>
              {user && <TabsTrigger value="dashboard" className="flex-1 sm:flex-none gap-1"><BarChart3 className="h-3 w-3" />Dashboard</TabsTrigger>}
            </TabsList>
            {user && (
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2"><Plus className="h-4 w-4" />Create Listing</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-auto">
                  <DialogHeader><DialogTitle>Create Food Listing</DialogTitle></DialogHeader>
                  {renderFormFields(formData, setFormData as (d: typeof formData) => void, imageFile, setImageFile, imagePreview, setImagePreview)}
                  <Button onClick={createListing} className="w-full">Create Listing</Button>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* BROWSE TAB */}
          <TabsContent value="browse">
            <Card className="mb-6">
              <CardContent className="pt-4">
                {/* Main row: search + icon filter toggle + price + tag */}
                <div className="flex flex-wrap gap-2 items-center">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search food..." className="pl-9" />
                  </div>
                  <Button variant={showFilters ? 'default' : 'outline'} size="sm" className="gap-1 relative" onClick={() => setShowFilters(!showFilters)}>
                    <Filter className="h-4 w-4" />
                    <span className="hidden sm:inline">Location</span>
                    {activeFilterCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] rounded-full h-4 w-4 flex items-center justify-center">{activeFilterCount}</span>
                    )}
                  </Button>
                  <Select value={priceFilter} onValueChange={(v: 'all' | 'free' | 'paid') => setPriceFilter(v)}>
                    <SelectTrigger className="w-[110px]"><SelectValue placeholder="Price" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Prices</SelectItem>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={tagFilter} onValueChange={setTagFilter}>
                    <SelectTrigger className="w-[130px]"><SelectValue placeholder="Tag" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tags</SelectItem>
                      {FOOD_TAGS.map(t => <SelectItem key={t.value} value={t.value}>{t.icon} {t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Expandable location filters */}
                {showFilters && (
                  <div className="mt-3 pt-3 border-t grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <Select value={countryFilter || 'all'} onValueChange={(v) => { setCountryFilter(v === 'all' ? '' : v); setStateFilter(''); setCityFilter(''); setTownFilter(''); }}>
                      <SelectTrigger className="text-xs h-8">
                        <Globe className="h-3 w-3 mr-1 shrink-0" />
                        <SelectValue placeholder="Country" />
                      </SelectTrigger>
                      <SelectContent><ScrollArea className="h-48">
                        <SelectItem value="all">All Countries</SelectItem>
                        {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </ScrollArea></SelectContent>
                    </Select>
                    <Select value={stateFilter || 'all'} onValueChange={(v) => { setStateFilter(v === 'all' ? '' : v); setCityFilter(''); setTownFilter(''); }}>
                      <SelectTrigger className="text-xs h-8">
                        <MapPin className="h-3 w-3 mr-1 shrink-0" />
                        <SelectValue placeholder="State" />
                      </SelectTrigger>
                      <SelectContent><ScrollArea className="h-48">
                        <SelectItem value="all">All States</SelectItem>
                        {(countryFilter ? COUNTRY_STATES[countryFilter] || [] : []).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </ScrollArea></SelectContent>
                    </Select>
                    <Select value={cityFilter || 'all'} onValueChange={(v) => { setCityFilter(v === 'all' ? '' : v); setTownFilter(''); }}>
                      <SelectTrigger className="text-xs h-8">
                        <Building2 className="h-3 w-3 mr-1 shrink-0" />
                        <SelectValue placeholder="City" />
                      </SelectTrigger>
                      <SelectContent><ScrollArea className="h-48">
                        <SelectItem value="all">All Cities</SelectItem>
                        {filterCities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </ScrollArea></SelectContent>
                    </Select>
                    <Select value={townFilter || 'all'} onValueChange={(v) => setTownFilter(v === 'all' ? '' : v)}>
                      <SelectTrigger className="text-xs h-8">
                        <MapPinned className="h-3 w-3 mr-1 shrink-0" />
                        <SelectValue placeholder="Town" />
                      </SelectTrigger>
                      <SelectContent><ScrollArea className="h-48">
                        <SelectItem value="all">All Towns</SelectItem>
                        {filterTowns.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </ScrollArea></SelectContent>
                    </Select>
                    {activeFilterCount > 0 && (
                      <Button variant="ghost" size="sm" className="text-xs h-8 col-span-2 sm:col-span-4" onClick={() => { setCountryFilter(''); setStateFilter(''); setCityFilter(''); setTownFilter(''); }}>
                        Clear location filters
                      </Button>
                    )}
                  </div>
                )}
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
                    <Card key={listing.id} className={`overflow-hidden hover:shadow-lg transition-shadow cursor-pointer ${listing.is_sold_out ? 'opacity-60' : ''}`} onClick={() => { setSelectedListing(listing); fetchReviews(listing.id); }}>
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
                        <div className="absolute top-2 right-2">
                          {renderDeliveryIcon(listing.delivery_type)}
                        </div>
                        {listing.is_sold_out && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Badge variant="destructive" className="text-lg">SOLD OUT</Badge>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-3">
                        <h3 className="font-semibold truncate">{listing.title}</h3>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {[listing.town, listing.city, listing.state].filter(Boolean).join(', ') || 'Location not set'}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Package className="h-3 w-3" /> Qty: {listing.quantity}
                          </p>
                        </div>
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

          {/* MY MESSAGES TAB */}
          <TabsContent value="my-messages">
            {!user ? (
              <div className="text-center py-12 text-muted-foreground">Please sign in</div>
            ) : (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" /> All Messages
                    {totalUnread > 0 && <Badge variant="destructive" className="text-xs">{totalUnread} unread</Badge>}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!selectedChat ? (
                    allConversations.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No messages yet. Browse listings and message sellers!</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {allConversations.map((conv) => (
                          <button key={`${conv.listing.id}-${conv.otherUserId}`}
                            className="w-full p-3 flex items-center gap-3 hover:bg-muted/50 rounded-lg text-left transition-colors border"
                            onClick={() => {
                              setSelectedChat({ listing: conv.listing, otherUserId: conv.otherUserId, otherUserName: conv.otherUserName, isSeller: conv.isSeller });
                              fetchChatMessages(conv.otherUserId, conv.listing.id);
                            }}
                          >
                            <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden shrink-0">
                              {conv.listing.image_url ? (
                                <img src={conv.listing.image_url} alt={conv.listing.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="flex items-center justify-center h-full"><ShoppingBag className="h-4 w-4 text-muted-foreground" /></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm truncate">{conv.listing.title}</span>
                                <Badge variant="outline" className="text-[10px] shrink-0">{conv.isSeller ? 'Seller' : 'Buyer'}</Badge>
                                {conv.unreadCount > 0 && <Badge variant="destructive" className="text-[10px] h-4 px-1">{conv.unreadCount} new</Badge>}
                              </div>
                              <p className="text-xs text-muted-foreground truncate">
                                {conv.otherUserName}: {extractMessageText(conv.messages[0]?.content || '')}
                              </p>
                            </div>
                            <ArrowLeft className="h-4 w-4 rotate-180 text-muted-foreground shrink-0" />
                          </button>
                        ))}
                      </div>
                    )
                  ) : (
                    <div>
                      <Button variant="ghost" size="sm" onClick={() => { setSelectedChat(null); fetchAllMessages(); }} className="mb-2">
                        <ArrowLeft className="h-4 w-4 mr-1" /> Back
                      </Button>
                      <p className="text-sm font-medium mb-2">Chat with {selectedChat.otherUserName} about &quot;{selectedChat.listing.title}&quot;</p>
                      <ScrollArea className="h-60 border rounded-lg p-3 mb-2">
                        <div className="space-y-2">
                          {chatMessages.map(msg => (
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
                        <Input value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Reply..." onKeyDown={(e) => e.key === 'Enter' && sendChatReply()} />
                        <Button onClick={sendChatReply} disabled={!replyText.trim()} size="sm"><Send className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* MY LISTINGS TAB */}
          <TabsContent value="my-listings">
            {!user ? (
              <div className="text-center py-12 text-muted-foreground">Please sign in</div>
            ) : myListings.length === 0 ? (
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
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold">{listing.title}</h3>
                            <Badge variant="outline" className={`text-xs ${tag.color}`}>{tag.icon} {tag.label}</Badge>
                            {renderDeliveryIcon(listing.delivery_type)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {listing.price === 0 ? 'Free' : `$${listing.price.toFixed(2)}`} • Qty: {listing.quantity}
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
          </TabsContent>

          {/* SELLER DASHBOARD TAB */}
          <TabsContent value="dashboard">
            {!user ? (
              <div className="text-center py-12 text-muted-foreground">Please sign in</div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Package className="h-8 w-8 mx-auto text-primary mb-2" />
                      <p className="text-2xl font-bold">{myListings.length}</p>
                      <p className="text-xs text-muted-foreground">Total Listings</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <ShoppingBag className="h-8 w-8 mx-auto text-green-500 mb-2" />
                      <p className="text-2xl font-bold">{totalOrders}</p>
                      <p className="text-xs text-muted-foreground">Orders Received</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <BarChart3 className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                      <p className="text-2xl font-bold">{totalQuantityLeft}</p>
                      <p className="text-xs text-muted-foreground">Total Qty Left</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <MessageCircle className="h-8 w-8 mx-auto text-orange-500 mb-2" />
                      <p className="text-2xl font-bold">{allConversations.filter(c => c.isSeller).length}</p>
                      <p className="text-xs text-muted-foreground">Buyer Chats</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader><CardTitle className="text-base">Listing Overview</CardTitle></CardHeader>
                  <CardContent>
                    <div className="flex gap-4 mb-4">
                      <Badge className="bg-green-500 text-white">{activeLCount} Active</Badge>
                      <Badge variant="destructive">{soldOutCount} Sold Out</Badge>
                    </div>
                    {myListings.length > 0 ? (
                      <div className="space-y-3">
                        {myListings.map(listing => {
                          const listingOrderCount = dashOrders.filter(o => o.listingId === listing.id).length;
                          return (
                            <div key={listing.id} className="flex items-center gap-3 p-3 border rounded-lg">
                              <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden shrink-0">
                                {listing.image_url ? <img src={listing.image_url} alt="" className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full"><Image className="h-5 w-5 text-muted-foreground" /></div>}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm truncate">{listing.title}</span>
                                  {listing.is_sold_out && <Badge variant="destructive" className="text-[10px]">Sold</Badge>}
                                  {renderDeliveryIcon(listing.delivery_type)}
                                </div>
                                <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                                  <span>💰 {listing.price === 0 ? 'Free' : `$${listing.price.toFixed(2)}`}</span>
                                  <span>📦 Qty: {listing.quantity}</span>
                                  <span>🛒 {listingOrderCount} orders</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">No listings yet</p>
                    )}
                  </CardContent>
                </Card>

                {/* Orders Detail Section */}
                <Card>
                  <CardHeader><CardTitle className="text-base flex items-center gap-2"><ShoppingBag className="h-4 w-4" /> Order Details</CardTitle></CardHeader>
                  <CardContent>
                    {dashOrders.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No orders received yet</p>
                    ) : selectedOrder ? (
                      <div>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(null)} className="mb-3">
                          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Orders
                        </Button>
                        <div className="border rounded-lg p-4 space-y-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={selectedOrder.buyerAvatar || ''} />
                              <AvatarFallback>{selectedOrder.buyerName[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">{selectedOrder.buyerName}</p>
                              <p className="text-xs text-muted-foreground">Ordered on {formatTime(selectedOrder.orderedAt)}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-muted/50 rounded-lg p-3">
                              <p className="text-xs text-muted-foreground">Food Item</p>
                              <p className="font-semibold text-sm">{selectedOrder.listingTitle}</p>
                            </div>
                            <div className="bg-muted/50 rounded-lg p-3">
                              <p className="text-xs text-muted-foreground">Quantity</p>
                              <p className="font-semibold text-sm">{selectedOrder.quantity}x</p>
                            </div>
                          </div>
                          <div className="bg-muted/50 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              {selectedOrder.deliveryType === 'delivery' ? <><Truck className="h-3 w-3" /> Home Delivery</> : <><Store className="h-3 w-3" /> Takeaway / Pickup</>}
                            </p>
                            {selectedOrder.deliveryType === 'delivery' ? (
                              <div className="mt-2">
                                <p className="text-xs text-muted-foreground">Buyer&apos;s Delivery Address:</p>
                                <p className="font-medium text-sm mt-1 flex items-center gap-1">
                                  <Home className="h-3 w-3 text-blue-500" />
                                  {selectedOrder.address || 'No address provided'}
                                </p>
                              </div>
                            ) : (
                              <div className="mt-2">
                                <p className="text-xs text-muted-foreground">Pickup Time:</p>
                                <p className="font-medium text-sm mt-1 flex items-center gap-1">
                                  <Clock className="h-3 w-3 text-amber-500" />
                                  {selectedOrder.pickupTime || 'ASAP'}
                                </p>
                              </div>
                            )}
                          </div>
                          <Button variant="outline" size="sm" className="w-full" onClick={() => {
                            setActiveTab('my-messages');
                            const conv = allConversations.find(c => c.listing.id === selectedOrder.listingId && c.otherUserId === selectedOrder.buyerId);
                            if (conv) {
                              setSelectedChat({ listing: conv.listing, otherUserId: conv.otherUserId, otherUserName: conv.otherUserName, isSeller: conv.isSeller });
                              fetchChatMessages(conv.otherUserId, conv.listing.id);
                            }
                          }}>
                            <MessageCircle className="h-4 w-4 mr-1" /> Message Buyer
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {dashOrders.map((order, idx) => (
                          <button key={idx}
                            className="w-full p-3 flex items-center gap-3 hover:bg-muted/50 rounded-lg text-left transition-colors border"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Avatar className="h-8 w-8 shrink-0">
                              <AvatarImage src={order.buyerAvatar || ''} />
                              <AvatarFallback className="text-xs">{order.buyerName[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm truncate">{order.listingTitle}</span>
                                <Badge variant="outline" className="text-[10px]">{order.quantity}x</Badge>
                                {order.deliveryType === 'delivery' ? (
                                  <Badge className="bg-blue-500/90 text-white text-[10px] gap-0.5 px-1"><Truck className="h-2.5 w-2.5" /></Badge>
                                ) : (
                                  <Badge variant="outline" className="text-[10px] gap-0.5 px-1 border-amber-400 text-amber-700 bg-amber-50"><Store className="h-2.5 w-2.5" /></Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">{order.buyerName} • {formatTime(order.orderedAt)}</p>
                            </div>
                            <ArrowLeft className="h-4 w-4 rotate-180 text-muted-foreground shrink-0" />
                          </button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-auto">
            <DialogHeader><DialogTitle>Edit Listing</DialogTitle></DialogHeader>
            {renderFormFields(editFormData, setEditFormData as (d: typeof editFormData) => void, editImageFile, setEditImageFile, editImagePreview, setEditImagePreview)}
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
                      {renderDeliveryIcon(selectedListing.delivery_type)}
                      <Badge variant="outline" className="gap-1"><Package className="h-3 w-3" /> Qty: {selectedListing.quantity}</Badge>
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
                        {[selectedListing.town, selectedListing.city, selectedListing.state, selectedListing.country].filter(Boolean).join(', ')}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {user && user.id !== selectedListing.seller_id && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => openMessageDialog(selectedListing)}>
                            <MessageCircle className="h-4 w-4 mr-1" /> Message
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => { setReviewListing(selectedListing); setReviewDialogOpen(true); }}>
                            <Star className="h-4 w-4 mr-1" /> Review
                          </Button>
                        </>
                      )}
                      {!selectedListing.is_sold_out && (
                        <Button size="sm" onClick={() => handleBuyNow(selectedListing)}>Buy Now</Button>
                      )}
                    </div>
                  </div>

                  {/* Reviews section */}
                  {reviews.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2"><Star className="h-4 w-4" /> Reviews ({reviews.length})</h4>
                      <div className="space-y-3 max-h-48 overflow-y-auto">
                        {reviews.map(r => (
                          <div key={r.id} className="flex gap-3 p-2 bg-muted/30 rounded-lg">
                            <Avatar className="h-7 w-7">
                              <AvatarImage src={r.reviewer_avatar || ''} />
                              <AvatarFallback className="text-[10px]">{r.reviewer_name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-xs">{r.reviewer_name}</span>
                                {renderStars(r.rating)}
                              </div>
                              {r.comment && <p className="text-xs text-muted-foreground mt-1">{r.comment}</p>}
                              <p className="text-[10px] text-muted-foreground mt-1">{formatTime(r.created_at)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
                  <p className="text-xs text-muted-foreground">Available: {buyListing.quantity}</p>
                </div>
                <div>
                  <Label>Quantity</Label>
                  <Input type="number" min={1} max={buyListing.quantity} value={buyQuantity} onChange={(e) => setBuyQuantity(Math.min(parseInt(e.target.value) || 1, buyListing.quantity))} />
                  {buyListing.price > 0 && (
                    <p className="text-sm font-medium mt-1 text-right">Total: ${(buyListing.price * buyQuantity).toFixed(2)}</p>
                  )}
                </div>
                {(buyListing.delivery_type === 'delivery' || buyListing.delivery_type === 'both') && (
                  <div>
                    <Label className="flex items-center gap-2"><Home className="h-4 w-4" /> Delivery Address</Label>
                    <Textarea value={buyAddress} onChange={(e) => setBuyAddress(e.target.value)} placeholder="Enter your full delivery address..." className="mt-1" />
                  </div>
                )}
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
                  {buyListing.delivery_type === 'delivery' ? '🚚 Order for Delivery' : buyListing.delivery_type === 'both' ? '📦 Place Order' : '🏪 Confirm Takeaway'}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Review Dialog */}
        <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Review: {reviewListing?.title}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Rating</Label>
                <div className="mt-1">{renderStars(reviewRating, true, setReviewRating)}</div>
              </div>
              <div>
                <Label>Comment (optional)</Label>
                <Textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder="Share your experience..." />
              </div>
              <Button onClick={submitReview} className="w-full">Submit Review</Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
};

export default Marketplace;
