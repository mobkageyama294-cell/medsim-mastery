CREATE TABLE public.coin_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pack_coins INTEGER NOT NULL CHECK (pack_coins > 0),
  amount_paid NUMERIC(10,2) NOT NULL CHECK (amount_paid >= 0),
  currency TEXT NOT NULL DEFAULT 'BRL',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','failed','refunded')),
  provider TEXT NOT NULL DEFAULT 'simulated',
  paddle_order_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.coin_purchases TO authenticated;
GRANT ALL ON public.coin_purchases TO service_role;

ALTER TABLE public.coin_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own purchases"
  ON public.coin_purchases FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own purchases"
  ON public.coin_purchases FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

CREATE OR REPLACE FUNCTION public.update_coin_purchases_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_coin_purchases_updated_at
  BEFORE UPDATE ON public.coin_purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_coin_purchases_updated_at();

CREATE INDEX idx_coin_purchases_user_id ON public.coin_purchases(user_id);
CREATE INDEX idx_coin_purchases_status ON public.coin_purchases(status);