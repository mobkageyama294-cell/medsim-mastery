import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CoinPack {
  id: string;
  coins: number;
  priceBRL: number;
  popular?: boolean;
  paddlePriceId?: string;
}

export const COIN_PACKS: CoinPack[] = [
  { id: 'pack-10', coins: 10, priceBRL: 5.0 },
  { id: 'pack-20', coins: 20, priceBRL: 10.0 },
  { id: 'pack-50', coins: 50, priceBRL: 25.0, popular: true },
  { id: 'pack-100', coins: 100, priceBRL: 50.0 },
  { id: 'pack-250', coins: 250, priceBRL: 125.0 },
  { id: 'pack-300', coins: 300, priceBRL: 150.0 },
];

export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

interface CoinPurchaseRecord {
  id: string;
  user_id: string;
  pack_coins: number;
  amount_paid: number;
  currency: string;
  status: string;
  paddle_order_id?: string | null;
  created_at: string;
  updated_at: string;
}

export async function createPurchaseRecord(pack: CoinPack): Promise<CoinPurchaseRecord | null> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    toast.error('Você precisa estar logado para comprar moedas.');
    return null;
  }

  const { data, error } = await (supabase as any)
    .from('coin_purchases')
    .insert({
      user_id: userData.user.id,
      pack_coins: pack.coins,
      amount_paid: pack.priceBRL,
      currency: 'BRL',
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('[coinStore] createPurchaseRecord failed', error);
    toast.error('Erro ao iniciar compra. Tente novamente.');
    return null;
  }

  return data as CoinPurchaseRecord;
}

export async function completePurchase(purchaseId: string): Promise<boolean> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return false;

  const { error: updateError } = await (supabase as any)
    .from('coin_purchases')
    .update({ status: 'completed', updated_at: new Date().toISOString() })
    .eq('id', purchaseId)
    .eq('user_id', userData.user.id);

  if (updateError) {
    console.error('[coinStore] completePurchase update failed', updateError);
    return false;
  }

  const { data: purchase } = await (supabase as any)
    .from('coin_purchases')
    .select('pack_coins')
    .eq('id', purchaseId)
    .single();

  if (!purchase) return false;

  const { data: progress } = await supabase
    .from('user_progress')
    .select('coins')
    .eq('user_id', userData.user.id)
    .single();

  const currentCoins = progress?.coins ?? 0;
  const newCoins = currentCoins + (purchase.pack_coins as number);

  const { error: upsertError } = await supabase
    .from('user_progress')
    .upsert(
      {
        user_id: userData.user.id,
        coins: newCoins,
      },
      { onConflict: 'user_id' }
    );

  if (upsertError) {
    console.error('[coinStore] completePurchase upsert failed', upsertError);
    return false;
  }

  return true;
}

export async function simulatePurchase(pack: CoinPack): Promise<boolean> {
  const record = await createPurchaseRecord(pack);
  if (!record) return false;

  const ok = await completePurchase(record.id);
  if (ok) {
    toast.success(`+${pack.coins} moedas adicionadas!`);
  }
  return ok;
}
