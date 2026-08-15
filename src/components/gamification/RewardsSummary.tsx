import { motion } from 'framer-motion';
import { Trophy, TrendingUp } from 'lucide-react';
import type { AwardResult } from '@/lib/gamification';
import { computeLevel } from '@/lib/gamification';
import { useGamification } from '@/hooks/useGamification';

export default function RewardsSummary({ award }: { award: AwardResult | null }) {
  const { progress } = useGamification();
  if (!award) return null;
  const lvl = computeLevel(progress.recentScores);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5 border border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent"
    >
      <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
        <Trophy className="w-4 h-4 text-amber-500" /> Recompensas
      </h3>

      <div className="grid sm:grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
          <TrendingUp className="w-5 h-5 text-primary" />
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Nível</p>
            <p className="text-sm font-bold">{lvl.level}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border/40">
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {lvl.next ? `Próximo: ${lvl.next}` : 'Máximo'}
            </p>
            <div className="mt-1 h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-primary transition-all" style={{ width: `${lvl.progressTo}%` }} />
            </div>
          </div>
        </div>
      </div>

      {award.newAchievements.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            Conquistas desbloqueadas
          </p>
          <div className="flex flex-wrap gap-2">
            {award.newAchievements.map((a) => (
              <motion.div
                key={a.id}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/15 border border-amber-500/40"
              >
                <span className="text-lg">{a.icon}</span>
                <div>
                  <p className="text-xs font-semibold">{a.title}</p>
                  <p className="text-[10px] text-muted-foreground">{a.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
