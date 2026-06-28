-- Allow anonymous funnel tracking (pre-login visitors) and authenticated inserts
GRANT INSERT ON public.funnel_events TO anon;

DROP POLICY IF EXISTS "Users can insert own funnel events" ON public.funnel_events;

CREATE POLICY "Anyone can insert funnel events"
  ON public.funnel_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());