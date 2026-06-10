import { useState } from 'react';
import { motion } from 'framer-motion';
import { Coins, Check, Loader2, Sparkles, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { COIN_PACKS, formatBRL, simulatePurchase, type CoinPack } from '@/lib/coinStore';
import { useGamification } from '@/hooks/useGamification';
import { Button } from '@/components/ui/button';

export default function CoinStore() {
  const navigate = useNavigate();
  const { progress } = useGamification();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleBuy = async (pack: CoinPack) => {
    setLoadingId(pack.id);
    try {
      // Em produção: redirecionar para checkout Paddle/Stripe.
      // Por ora usamos simulação que credita as moedas imediatamente.
      await simulatePurchase(pack);
      // Força refresh do progresso recarregando a página (simples e seguro)
      setTimeout(() => window.location.reload(), 800);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-6xl px-4 md:px-6 py-8 md:py-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>

        <header className="mb-10 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 mb-4"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Loja de Moedas
            </span>
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Recarregue suas moedas
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Use moedas para desbloquear dicas durante os casos clínicos.
            Cada 10 moedas custam apenas R$ 5,00.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border/50 bg-muted/30">
            <Coins className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium">
              Saldo atual: <span className="font-bold text-amber-600 dark:text-amber-400">{progress.coins} moedas</span>
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {COIN_PACKS.map((pack, idx) => {
            const isLoading = loadingId === pack.id;
            const valuePerCoin = pack.priceBRL / pack.coins;
            const baseValue = 0.5;
            const savings = Math.round((1 - valuePerCoin / baseValue) * 100);

            return (
              <motion.div
                key={pack.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`relative rounded-2xl border p-6 transition-all hover:scale-[1.02] ${
                  pack.popular
                    ? 'border-amber-500/50 bg-gradient-to-b from-amber-500/10 to-transparent shadow-lg shadow-amber-500/10'
                    : 'border-border/50 bg-card/50'
                }`}
              >
                {pack.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-amber-500 text-amber-950 text-[10px] font-bold uppercase tracking-wider">
                    Mais popular
                  </div>
                )}

                <div className="flex items-center justify-center w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-500/15">
                  <Coins className="w-7 h-7 text-amber-500" />
                </div>

                <div className="text-center mb-4">
                  <p className="text-4xl font-bold text-foreground">{pack.coins}</p>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">
                    moedas
                  </p>
                </div>

                <div className="text-center mb-5">
                  <p className="text-2xl font-bold text-foreground">{formatBRL(pack.priceBRL)}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {formatBRL(valuePerCoin)} por moeda
                    {savings > 0 && (
                      <span className="ml-1 text-emerald-500 font-semibold">· -{savings}%</span>
                    )}
                  </p>
                </div>

                <Button
                  onClick={() => handleBuy(pack)}
                  disabled={isLoading || loadingId !== null}
                  className={`w-full ${
                    pack.popular
                      ? 'bg-amber-500 hover:bg-amber-600 text-amber-950'
                      : ''
                  }`}
                  variant={pack.popular ? 'default' : 'outline'}
                >
                  {isLoading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processando...</>
                  ) : (
                    <><Check className="w-4 h-4 mr-2" /> Comprar agora</>
                  )}
                </Button>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-10 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>
            Pagamento processado com segurança. Modo de demonstração ativo —
            a integração de pagamento real será habilitada em breve.
          </span>
        </div>
      </div>
    </div>
  );
}
