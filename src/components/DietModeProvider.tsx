import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type DietMode = 'keto' | 'pcos';

interface DietModeContextType {
  dietMode: DietMode;
  setDietMode: (mode: DietMode) => void;
  loading: boolean;
}

const DietModeContext = createContext<DietModeContextType | undefined>(undefined);

export const useDietMode = () => {
  const context = useContext(DietModeContext);
  if (!context) {
    // Return default values when outside provider
    return { dietMode: 'keto' as DietMode, setDietMode: () => {}, loading: false };
  }
  return context;
};

export const DietModeProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [dietMode, setDietModeState] = useState<DietMode>('keto');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDietMode();
    } else {
      // Check localStorage for non-authenticated users
      const saved = localStorage.getItem('dietMode') as DietMode;
      if (saved === 'keto' || saved === 'pcos') {
        setDietModeState(saved);
      }
      setLoading(false);
    }
  }, [user]);

  // Apply theme class to document
  useEffect(() => {
    document.documentElement.setAttribute('data-diet-mode', dietMode);
  }, [dietMode]);

  const fetchDietMode = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('diet_type')
        .eq('user_id', user?.id)
        .single();

      if (data?.diet_type && (data.diet_type === 'keto' || data.diet_type === 'pcos')) {
        setDietModeState(data.diet_type);
      }
    } catch (error) {
      console.error('Error fetching diet mode:', error);
    } finally {
      setLoading(false);
    }
  };

  const setDietMode = async (mode: DietMode) => {
    setDietModeState(mode);
    localStorage.setItem('dietMode', mode);

    if (user) {
      try {
        await supabase
          .from('profiles')
          .upsert({
            user_id: user.id,
            diet_type: mode,
            email: user.email
          });
      } catch (error) {
        console.error('Error saving diet mode:', error);
      }
    }

    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('dietModeChanged', { detail: mode }));
  };

  return (
    <DietModeContext.Provider value={{ dietMode, setDietMode, loading }}>
      {children}
    </DietModeContext.Provider>
  );
};
