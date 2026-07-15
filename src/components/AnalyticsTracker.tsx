import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { captureUtmFromUrl, trackPageView } from '@/lib/tracking';

/**
 * Global tracker: fires Meta Pixel PageView + funnel_events page_view on every
 * route change, and captures UTM parameters on first landing.
 */
const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    captureUtmFromUrl();
    trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);

  return null;
};

export default AnalyticsTracker;
