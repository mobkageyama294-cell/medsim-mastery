import { Coins } from 'lucide-react';
import { useGamification } from '@/hooks/useGamification';
import { computeLevel } from '@/lib/gamification';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export default function ProgressChip() {
  const { progress } = useGamification();
  const lvl = computeLevel(progress.recentScores);

  return (
    <div className="flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="hidden sm:flex items-center gap-2 rounded-lg border border-border/50 bg-muted/30 px-2.5 py-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              {lvl.level}
            </span>
            <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${lvl.progressTo}%` }}
              />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          Média das últimas {lvl.sample || 0}: {lvl.average}/100
          {lvl.next ? ` · próximo: ${lvl.next} (${lvl.nextAt})` : ' · nível máximo'}
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1">
            <Coins className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-xs font-semibold tabular-nums text-amber-600 dark:text-amber-400">
              {progress.coins}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>Moedas para comprar dicas</TooltipContent>
      </Tooltip>
    </div>
  );
}
