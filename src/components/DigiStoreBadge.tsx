import { useEffect } from 'react';

interface DigiStoreBadgeProps {
  type: 'salespage' | 'thankyoupage';
}

const DigiStoreBadge = ({ type }: DigiStoreBadgeProps) => {
  useEffect(() => {
    const scriptId = `digistore-badge-${type}`;
    if (document.getElementById(scriptId)) return;

    // Add CSS to force horizontal layout
    const styleId = 'digistore-badge-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .ds24-badge, [class*="ds24-trusted"], [id*="ds24"] {
          position: fixed !important;
          bottom: 0 !important;
          left: 0 !important;
          right: 0 !important;
          top: auto !important;
          width: 100% !important;
          max-width: 100% !important;
          height: auto !important;
          max-height: 40px !important;
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          justify-content: center !important;
          z-index: 40 !important;
          background: #f9f9f9 !important;
          border-top: 1px solid #e0e0e0 !important;
          padding: 4px 8px !important;
          overflow: hidden !important;
        }
        .ds24-badge img, [class*="ds24-trusted"] img, [id*="ds24"] img {
          height: 28px !important;
          width: auto !important;
          max-width: none !important;
        }
      `;
      document.head.appendChild(style);
    }

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
