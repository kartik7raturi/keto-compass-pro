import { useEffect } from 'react';

const DigiStoreUpsell = () => {
  useEffect(() => {
    const scriptId = 'digistore-upsell-script';
    if (document.getElementById(scriptId)) return;

    const s = document.createElement('script');
    s.id = scriptId;
    s.src = 'https://www.digistore24-scripts.com/service/digistore.js';
    document.head.appendChild(s);

    s.onload = () => {
      try {
        (window as any).digistoreUpsell?.();
      } catch (e) {
        // silently ignore
      }
    };

    return () => {
      const el = document.getElementById(scriptId);
      if (el) el.remove();
    };
  }, []);

  return null;
};

export default DigiStoreUpsell;
