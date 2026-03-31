import { useEffect } from 'react';

interface DigiStoreBadgeProps {
  type: 'salespage' | 'thankyoupage';
}

const DigiStoreBadge = ({ type }: DigiStoreBadgeProps) => {
  useEffect(() => {
    const scriptId = `digistore-badge-${type}`;
    if (document.getElementById(scriptId)) return;

    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'text/javascript';
    script.src = type === 'salespage'
      ? 'https://www.digistore24.com/trusted-badge/45066/AatZCjWZMThhewq/salespage'
      : 'https://www.digistore24.com/trusted-badge/45067/0ThMJ3ktAFg80gz/thankyoupage';
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById(scriptId);
      if (el) el.remove();
    };
  }, [type]);

  return null;
};

export default DigiStoreBadge;
