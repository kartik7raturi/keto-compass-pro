import { useEffect } from 'react';

const DigiStorePromo = () => {
  useEffect(() => {
    const scriptId = 'digistore-promo-script';
    if (document.getElementById(scriptId)) return;

    // Load digistore script
    const s1 = document.createElement('script');
    s1.id = scriptId;
    s1.src = 'https://www.digistore24-scripts.com/service/digistore.js';
    document.head.appendChild(s1);

    s1.onload = () => {
      try {
        (window as any).digistorePromocode?.({ product_id: 678112, adjust_domain: true });
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

export default DigiStorePromo;
