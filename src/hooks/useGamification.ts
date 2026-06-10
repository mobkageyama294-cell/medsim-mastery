import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  DEFAULT_PROGRESS,
  UserProgress,
  awardCase as awardCaseLogic,
  CaseResult,
  AwardResult,
} from '@/lib/gamification';

const LS_KEY = 'medsim:progress:v1';

function loadLocal(): UserProgress {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    return { ...DEFAULT_PROGRESS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

function saveLocal(p: UserProgress) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(p)); } catch { /* noop */ }
}

function rowToProgress(row: any): UserProgress {
  return {
    coins: row?.coins ?? 0,
    achievements: row?.achievements ?? [],
    totalCases: row?.total_cases ?? 0,
    currentStreak: row?.current_streak ?? 0,
    bestStreak: row?.best_streak ?? 0,
    recentScores: row?.recent_scores ?? [],
    specialtyHits: {},
    caseIds: [],
  };
}

function mergeProgress(local: UserProgress, remote: UserProgress): UserProgress {
  return {
    ...local,
    coins: Math.max(local.coins, remote.coins),
    achievements: Array.from(new Set([...local.achievements, ...remote.achievements])),
    totalCases: Math.max(local.totalCases, remote.totalCases),
    currentStreak: remote.currentStreak,
    bestStreak: Math.max(local.bestStreak, remote.bestStreak),
    recentScores: remote.recentScores.length >= local.recentScores.length
      ? remote.recentScores
      : local.recentScores,
  };
}

export function useGamification() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress>(() => loadLocal());

  // Sync from Cloud on login
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        console.warn('[gamification] cloud read failed', error);
        return;
      }
      if (data) {
        const merged = mergeProgress(loadLocal(), rowToProgress(data));
        setProgress(merged);
        saveLocal(merged);
      } else {
        const local = loadLocal();
        await supabase.from('user_progress').insert({
          user_id: user.id,
          coins: local.coins,
          achievements: local.achievements,
          total_cases: local.totalCases,
          current_streak: local.currentStreak,
          best_streak: local.bestStreak,
          recent_scores: local.recentScores,
        });
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  const persist = useCallback(async (next: UserProgress) => {
    saveLocal(next);
    if (!user) return;
    const { error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: user.id,
        coins: next.coins,
        achievements: next.achievements,
        total_cases: next.totalCases,
        current_streak: next.currentStreak,
        best_streak: next.bestStreak,
        recent_scores: next.recentScores,
      }, { onConflict: 'user_id' });
    if (error) console.warn('[gamification] cloud write failed', error);
  }, [user]);

  const awardCase = useCallback((result: CaseResult): AwardResult => {
    const out = awardCaseLogic(progress, result);
    setProgress(out.progress);
    persist(out.progress);
    return out;
  }, [progress, persist]);

  const spendCoins = useCallback((amount: number): boolean => {
    if (progress.coins < amount) return false;
    const next = { ...progress, coins: progress.coins - amount };
    setProgress(next);
    persist(next);
    return true;
  }, [progress, persist]);

  const addCoins = useCallback((amount: number) => {
    const next = { ...progress, coins: progress.coins + amount };
    setProgress(next);
    persist(next);
  }, [progress, persist]);

  return { progress, awardCase, spendCoins, addCoins };
}
