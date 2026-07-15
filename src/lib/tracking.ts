// Unified tracking utility: UTM attribution, funnel_events, Meta Pixel.
import { supabase } from '@/integrations/supabase/client';

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;
type UtmKey = typeof UTM_KEYS[number];
export type UtmData = Partial<Record<UtmKey, string>> & { landing_page?: string; referrer?: string };

const UTM_STORAGE_KEY = 'ketopia_utm_attribution';
const SESSION_STORAGE_KEY = 'ketopia_session_id';

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

// ---------- Session ----------
export function getSessionId(): string {
  try {
    let sid = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!sid) {
      sid = `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem(SESSION_STORAGE_KEY, sid);
    }
    return sid;
  } catch {
    return `s_${Date.now()}`;
  }
}

// ---------- UTM ----------
export function captureUtmFromUrl(): UtmData | null {
  if (typeof window === 'undefined') return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const utm: UtmData = {};
    let has = false;
    UTM_KEYS.forEach((k) => {
      const v = params.get(k);
      if (v) { utm[k] = v; has = true; }
    });
    if (has) {
      utm.landing_page = window.location.pathname + window.location.search;
      utm.referrer = document.referrer || undefined;
      // First-touch attribution: don't overwrite once set
      const existing = localStorage.getItem(UTM_STORAGE_KEY);
      if (!existing) {
        localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify({ ...utm, first_seen_at: new Date().toISOString() }));
      }
      // Last-touch attribution: always update
      sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utm));
      return utm;
    }
  } catch {
    // ignore
  }
  return null;
}

export function getStoredUtm(): { first_touch: UtmData | null; last_touch: UtmData | null } {
  try {
    const first = localStorage.getItem(UTM_STORAGE_KEY);
    const last = sessionStorage.getItem(UTM_STORAGE_KEY);
    return {
      first_touch: first ? JSON.parse(first) : null,
      last_touch: last ? JSON.parse(last) : null,
    };
  } catch {
    return { first_touch: null, last_touch: null };
  }
}

// ---------- Meta Pixel ----------
export function fbTrack(event: string, params?: Record<string, any>) {
  try {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', event, params || {});
    }
  } catch {
    // ignore
  }
}

export function fbTrackCustom(event: string, params?: Record<string, any>) {
  try {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('trackCustom', event, params || {});
    }
  } catch {
    // ignore
  }
}

// ---------- Funnel logging ----------
async function logFunnelEvent(event_name: string, page?: string, metadata?: Record<string, any>) {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const user_id = sessionData.session?.user?.id ?? null;
    const utm = getStoredUtm();
    await supabase.from('funnel_events').insert({
      event_name,
      page: page ?? (typeof window !== 'undefined' ? window.location.pathname : null),
      session_id: getSessionId(),
      user_id,
      metadata: {
        ...(metadata || {}),
        utm_first_touch: utm.first_touch || null,
        utm_last_touch: utm.last_touch || null,
        referrer: typeof document !== 'undefined' ? document.referrer || null : null,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      },
    } as any);
  } catch {
    // silent
  }
}

// ---------- High-level named events ----------
export function trackPageView(path?: string) {
  fbTrack('PageView');
  void logFunnelEvent('page_view', path);
}

export function trackLead(source: string, metadata?: Record<string, any>) {
  fbTrack('Lead', { content_name: source, ...metadata });
  void logFunnelEvent('lead', undefined, { source, ...metadata });
}

export function trackSignup(metadata?: Record<string, any>) {
  fbTrack('CompleteRegistration', { content_name: 'signup', ...metadata });
  void logFunnelEvent('signup', undefined, metadata);
}

export function trackLogin(metadata?: Record<string, any>) {
  fbTrackCustom('Login', metadata);
  void logFunnelEvent('login', undefined, metadata);
}

export function trackViewContent(content_name: string, metadata?: Record<string, any>) {
  fbTrack('ViewContent', { content_name, ...metadata });
  void logFunnelEvent('view_content', undefined, { content_name, ...metadata });
}

export function trackAddToCart(product: string, value?: number, currency = 'USD', metadata?: Record<string, any>) {
  fbTrack('AddToCart', { content_name: product, value, currency, ...metadata });
  void logFunnelEvent('add_to_cart', undefined, { product, value, currency, ...metadata });
}

export function trackBuyNowClick(product: string, value?: number, currency = 'USD', metadata?: Record<string, any>) {
  fbTrack('InitiateCheckout', { content_name: product, value, currency, ...metadata });
  fbTrackCustom('BuyNowClick', { content_name: product, value, currency, ...metadata });
  void logFunnelEvent('buy_now_click', undefined, { product, value, currency, ...metadata });
}

export function trackPurchase(product: string, value: number, currency = 'USD', metadata?: Record<string, any>) {
  fbTrack('Purchase', { content_name: product, value, currency, ...metadata });
  void logFunnelEvent('purchase', undefined, { product, value, currency, ...metadata });
}
