import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Coins, X, Lock } from 'lucide-react';
import type { ClinicalCase } from '@/data/clinicalCases';
import { buildHints, type Hint } from '@/lib/gamification';
import { useGamification } from '@/hooks/useGamification';
import { toast } from 'sonner';

export default function HintButton({ clinicalCase }: { clinicalCase: ClinicalCase | null }) {
  const [open, setOpen] = useState(false);
  const [revealed, setRevealed] = useState<Record<number, string>>({});
  const { progress, spendCoins } = useGamification();

  if (!clinicalCase) return null;
  const hints = buildHints(clinicalCase);

  const handleBuy = (h: Hint) => {
    if (revealed[h.tier]) return;
    if (!spendCoins(h.cost)) {
      toast.error(`Você precisa de ${h.cost} moedas para esta dica.`);
      return;
    }
    setRevealed((r) => ({ ...r, [h.tier]: h.content }));
    toast.success(`-${h.cost} moedas · dica desbloqueada`);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 p-3 rounded-lg border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 transition-all text-sm"
      >
        <Lightbulb className="w-4 h-4 text-amber-500" />
        <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Comprar Dica</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95 }}
              className="glass-card glow-primary p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-semibold">Loja de Dicas</h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-xs font-semibold text-amber-500">
                    <Coins className="w-3.5 h-3.5" /> {progress.coins}
                  </div>
                  <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-muted/50">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {hints.map((h) => {
                  const isRevealed = !!revealed[h.tier];
                  const canAfford = progress.coins >= h.cost;
                  return (
                    <button
                      key={h.tier}
                      onClick={() => handleBuy(h)}
                      disabled={isRevealed || !canAfford}
                      className="w-full text-left p-3 rounded-lg border border-border/50 bg-muted/20 hover:bg-amber-500/5 hover:border-amber-500/30 disabled:hover:bg-muted/20 disabled:hover:border-border/50 transition-all"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold">{h.label}</span>
                        <span className="flex items-center gap-1 text-[11px] text-amber-500 font-semibold">
                          <Coins className="w-3 h-3" /> {h.cost}
                        </span>
                      </div>
                      {isRevealed ? (
                        <p className="text-xs text-foreground/80">{h.content}</p>
                      ) : (
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          {canAfford ? 'Clique para revelar' : 'Saldo insuficiente'}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
