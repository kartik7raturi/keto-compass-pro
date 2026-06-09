CREATE TABLE public.jvzoo_webhook_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_receipt text,
  transaction_type text,
  product_id text,
  customer_email text,
  amount numeric,
  raw_payload jsonb NOT NULL,
  signature_valid boolean NOT NULL DEFAULT false,
  processed boolean NOT NULL DEFAULT false,
  duplicate boolean NOT NULL DEFAULT false,
  response_status integer,
  response_body text,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX jvzoo_webhook_logs_unique_txn
  ON public.jvzoo_webhook_logs (transaction_receipt, transaction_type)
  WHERE transaction_receipt IS NOT NULL AND processed = true;

CREATE INDEX jvzoo_webhook_logs_created_at_idx
  ON public.jvzoo_webhook_logs (created_at DESC);

GRANT ALL ON public.jvzoo_webhook_logs TO service_role;
GRANT SELECT ON public.jvzoo_webhook_logs TO authenticated;

ALTER TABLE public.jvzoo_webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view webhook logs"
  ON public.jvzoo_webhook_logs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));