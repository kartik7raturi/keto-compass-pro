import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Heart, Leaf } from "lucide-react";

export const DietTypeSwitch = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dietType, setDietType] = useState<'keto' | 'pcos'>('keto');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDietType();
    }
  }, [user]);

  const fetchDietType = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('diet_type')
        .eq('user_id', user?.id)
        .single();

      if (data?.diet_type && (data.diet_type === 'keto' || data.diet_type === 'pcos')) {
        setDietType(data.diet_type);
      }
    } catch (error) {
      console.error('Error fetching diet type:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (checked: boolean) => {
    const newDietType = checked ? 'pcos' : 'keto';
    setDietType(newDietType);

    try {
      await supabase
        .from('profiles')
        .upsert({
          user_id: user?.id,
          diet_type: newDietType,
          email: user?.email
        });

      toast({
        title: "Diet type updated!",
        description: `Switched to ${newDietType.toUpperCase()} diet`,
      });

      // Trigger a custom event to notify other components
      window.dispatchEvent(new CustomEvent('dietTypeChanged', { detail: newDietType }));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "Could not update diet type",
      });
    }
  };

  if (loading || !user) return null;

  return (
    <div className="flex items-center gap-4 p-4 bg-card rounded-lg border">
      <Leaf className="h-5 w-5 text-keto-green" />
      <Label htmlFor="diet-switch" className="cursor-pointer">
        Keto
      </Label>
      <Switch
        id="diet-switch"
        checked={dietType === 'pcos'}
        onCheckedChange={handleToggle}
      />
      <Label htmlFor="diet-switch" className="cursor-pointer">
        PCOS
      </Label>
      <Heart className="h-5 w-5 text-pink-500" />
    </div>
  );
};
