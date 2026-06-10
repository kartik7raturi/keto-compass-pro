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

  v_expires_at := CASE
    WHEN p_plan = 'vip_lifetime' THEN now() + interval '365 days'
    WHEN p_plan = 'vip' THEN now() + interval '35 days'
    ELSE now() + interval '1 year'
  END;

  IF v_user_id IS NULL THEN
    -- Buyer hasn't signed up yet. Don't error — return pending so webhook still 200s.
    RETURN json_build_object('success', true, 'pending', true, 'email', p_email, 'plan', p_plan);
  END IF;

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