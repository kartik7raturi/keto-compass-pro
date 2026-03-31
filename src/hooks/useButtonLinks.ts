import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ButtonLink {
  id: string;
  button_key: string;
  label: string;
  url: string;
}

export const useButtonLinks = () => {
  const [links, setLinks] = useState<Record<string, ButtonLink>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    const { data } = await supabase.from('button_links').select('*');
    const map: Record<string, ButtonLink> = {};
    data?.forEach((l: any) => { map[l.button_key] = l; });
    setLinks(map);
    setLoading(false);
  };

  const getUrl = (key: string) => links[key]?.url || '#';

  return { links, loading, getUrl, refetch: fetchLinks };
};
