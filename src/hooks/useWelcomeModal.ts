import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';

const LAST_LOGIN_KEY = 'keto_last_login_shown';

export const useWelcomeModal = () => {
  const { user, loading } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (loading || !user) return;

    const lastShown = localStorage.getItem(LAST_LOGIN_KEY);
    const today = new Date().toDateString();

    // Show modal if it hasn't been shown today
    if (lastShown !== today) {
      // Small delay to let the page render first
      const timer = setTimeout(() => {
        setShowWelcome(true);
        localStorage.setItem(LAST_LOGIN_KEY, today);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [user, loading]);

  const closeWelcome = () => setShowWelcome(false);

  return { showWelcome, closeWelcome };
};
