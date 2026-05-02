-- Update grant function: vip_lifetime now expires after 365 days (yearly)
CREATE OR REPLACE FUNCTION public.grant_ketopia_subscription(p_email text, p_plan text, p_amount numeric DEFAULT 0, p_product_id text DEFAULT ''::text, p_order_id text DEFAULT ''::text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID;
  v_expires_at TIMESTAMPTZ;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE LOWER(email) = LOWER(p_email) LIMIT 1;
  -- VIP yearly ($99 one-time) = 365 days; VIP monthly ($29/mo) = 35 days; basic = 1 year
  v_expires_at := CASE
    WHEN p_plan = 'vip_lifetime' THEN now() + interval '365 days'
    WHEN p_plan = 'vip' THEN now() + interval '35 days'
    ELSE now() + interval '1 year'
  END;
  INSERT INTO public.user_subscriptions
    (user_id, plan_type, payment_type, amount_paid, started_at, expires_at, is_active, payment_status, product_id, order_id)
  VALUES (v_user_id, p_plan, 'one_time', p_amount, now(), v_expires_at, true, 'paid', p_product_id, p_order_id)
  ON CONFLICT (user_id) DO UPDATE SET
    plan_type = EXCLUDED.plan_type,
    amount_paid = EXCLUDED.amount_paid,
    started_at = now(),
    expires_at = EXCLUDED.expires_at,
    is_active = true,
    payment_status = 'paid',
    product_id = EXCLUDED.product_id,
    order_id = EXCLUDED.order_id,
    updated_at = now();
  RETURN json_build_object('success', true, 'user_id', v_user_id, 'plan', p_plan, 'expires_at', v_expires_at);
END;
$function$;

-- Update get_user_plan: vip_lifetime is now subject to expiry like other plans
CREATE OR REPLACE FUNCTION public.get_user_plan(p_user_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_plan text;
  v_expires timestamptz;
  v_is_active boolean;
BEGIN
  SELECT plan_type, expires_at, is_active
  INTO v_plan, v_expires, v_is_active
  FROM user_subscriptions
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN RETURN 'free'; END IF;

  IF v_expires IS NOT NULL AND v_expires < now() THEN
    UPDATE user_subscriptions 
    SET plan_type = 'free', is_active = false, payment_status = 'expired'
    WHERE user_id = p_user_id;
    RETURN 'free';
  END IF;

  IF NOT v_is_active THEN RETURN 'free'; END IF;

  RETURN COALESCE(v_plan, 'free');
END;
$function$;

-- Update IPN processor: $99 product → vip_lifetime (12 months); preserve $200+ tier as 12 months too
CREATE OR REPLACE FUNCTION public.process_digistore_ipn(p_event_type text, p_order_id text, p_product_id text, p_customer_email text, p_customer_name text, p_amount numeric, p_currency text, p_raw_payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid;
  v_plan_type text;
  v_expires_at timestamptz;
  v_log_id uuid;
BEGIN
  INSERT INTO ipn_logs (event_type, order_id, product_id, customer_email, customer_name, amount, currency, raw_payload, status)
  VALUES (p_event_type, p_order_id, p_product_id, p_customer_email, p_customer_name, p_amount, p_currency, p_raw_payload, 'processing')
  RETURNING id INTO v_log_id;

  -- Product mapping
  -- 678112 = Basic ($19) → 1 year
  -- 680740 < $50 = VIP monthly ($29) → 31 days
  -- 680740 >= $50 = VIP yearly ($99) → 365 days
  IF p_product_id = '678112' THEN
    v_plan_type := 'basic';
    v_expires_at := now() + interval '365 days';
  ELSIF p_product_id = '680740' AND p_amount >= 50 THEN
    v_plan_type := 'vip_lifetime';
    v_expires_at := now() + interval '365 days';
  ELSIF p_product_id = '680740' THEN
    v_plan_type := 'vip';
    v_expires_at := now() + interval '31 days';
  ELSE
    v_plan_type := 'basic';
    v_expires_at := now() + interval '365 days';
  END IF;

  SELECT id INTO v_user_id FROM auth.users WHERE email = p_customer_email;

  IF v_user_id IS NULL THEN
    UPDATE ipn_logs SET status = 'user_not_found', error_message = 'No user for: ' || p_customer_email, processed_at = now() WHERE id = v_log_id;
    RETURN jsonb_build_object('success', false, 'error', 'user_not_found');
  END IF;

  IF p_event_type IN ('order_completed', 'rebill') THEN
    INSERT INTO user_subscriptions (user_id, plan_type, payment_type, amount_paid, started_at, expires_at, is_active, order_id, product_id, payment_status)
    VALUES (v_user_id, v_plan_type, 'digistore24', p_amount, now(), v_expires_at, true, p_order_id, p_product_id, 'paid')
    ON CONFLICT (user_id) DO UPDATE SET
      plan_type = EXCLUDED.plan_type,
      payment_type = 'digistore24',
      amount_paid = EXCLUDED.amount_paid,
      started_at = now(),
      expires_at = EXCLUDED.expires_at,
      is_active = true,
      order_id = EXCLUDED.order_id,
      product_id = EXCLUDED.product_id,
      payment_status = 'paid',
      cancelled_at = NULL,
      refunded_at = NULL,
      updated_at = now();

  ELSIF p_event_type = 'refund' THEN
    UPDATE user_subscriptions SET plan_type = 'free', is_active = false, payment_status = 'refunded', refunded_at = now(), updated_at = now() WHERE user_id = v_user_id;
  ELSIF p_event_type = 'chargeback' THEN
    UPDATE user_subscriptions SET plan_type = 'free', is_active = false, payment_status = 'chargeback', updated_at = now() WHERE user_id = v_user_id;
  ELSIF p_event_type IN ('subscription_cancelled', 'cancel') THEN
    UPDATE user_subscriptions SET is_active = false, payment_status = 'cancelled', cancelled_at = now(), updated_at = now() WHERE user_id = v_user_id;
  END IF;

  UPDATE ipn_logs SET status = 'processed', plan_type = v_plan_type, processed_at = now() WHERE id = v_log_id;
  RETURN jsonb_build_object('success', true, 'plan', v_plan_type, 'user_id', v_user_id);

EXCEPTION WHEN OTHERS THEN
  UPDATE ipn_logs SET status = 'error', error_message = SQLERRM, processed_at = now() WHERE id = v_log_id;
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$function$;

-- Re-grant admin user with new 12-month expiry so their session reflects the change
SELECT public.grant_ketopia_subscription('sankhobusiness@gmail.com', 'vip_lifetime', 0, '680740', 'admin-grant-yearly');