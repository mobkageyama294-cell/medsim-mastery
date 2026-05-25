// Gamificação Fase 1: níveis, conquistas, moedas
import type { ScoreBreakdown } from './scoring';
import type { ClinicalCase } from '@/data/clinicalCases';

export interface UserProgress {
  coins: number;
  achievements: string[];
  totalCases: number;
  currentStreak: number;
  bestStreak: number;
  recentScores: number[]; // últimas 50
  specialtyHits: Record<string, number>; // contagem de acertos por especialidade
  caseIds: string[]; // ids concluídos (únicos)
}

export const DEFAULT_PROGRESS: UserProgress = {
  coins: 0,
  achievements: [],
  totalCases: 0,
  currentStreak: 0,
  bestStreak: 0,
  recentScores: [],
  specialtyHits: {},
  caseIds: [],
};

// ---------- Níveis ----------
export interface LevelInfo {
  name: string;
  min: number; // média mínima das últimas 10
  next?: string;
  nextAt?: number;
}

const LEVELS: LevelInfo[] = [
  { name: 'Interno', min: 0, next: 'Residente', nextAt: 60 },
  { name: 'Residente', min: 60, next: 'Especialista', nextAt: 80 },
  { name: 'Especialista', min: 80, next: 'Mestre', nextAt: 92 },
  { name: 'Mestre', min: 92 },
];

export function computeLevel(recentScores: number[] = []) {
  const last10 = recentScores.slice(-10);
  const avg = last10.length
    ? last10.reduce((a, b) => a + b, 0) / last10.length
    : 0;
  const current = [...LEVELS].reverse().find((l) => avg >= l.min) ?? LEVELS[0];
  const progressTo = current.nextAt
    ? Math.min(100, Math.round(((avg - current.min) / (current.nextAt - current.min)) * 100))
    : 100;
  return {
    average: Math.round(avg),
    level: current.name,
    next: current.next,
    nextAt: current.nextAt,
    progressTo,
    sample: last10.length,
  };
}

// ---------- Conquistas ----------
export interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'fast_dx', icon: '🩺', title: 'Diagnóstico Rápido', description: 'Acertar em menos de 2 minutos' },
  { id: 'perfect', icon: '📚', title: 'Perfeccionista', description: 'Tirar nota 100 em um caso' },
  { id: 'efficient', icon: '🔬', title: 'Eficiente', description: 'Fechar caso sem exames desnecessários' },
  { id: 'empathic', icon: '❤️', title: 'Empático', description: 'Pontuação máxima em tratamento humanitário' },
  { id: 'specialist', icon: '🏆', title: 'Especialista', description: 'Acertar 5 casos da mesma especialidade' },
  { id: 'master_cases', icon: '⭐', title: 'Mestre dos Casos', description: 'Concluir todos os 150 casos' },
  { id: 'precision', icon: '🎯', title: 'Precisão Cirúrgica', description: 'Acertar 10 diagnósticos seguidos' },
  { id: 'tireless', icon: '📖', title: 'Estudante Incansável', description: 'Completar 50 casos no total' },
];

export interface CaseResult {
  score: ScoreBreakdown;
  durationSeconds: number;
  clinicalCase: ClinicalCase;
}

export interface AwardResult {
  progress: UserProgress;
  coinsEarned: number;
  newAchievements: Achievement[];
}

const TOTAL_CASES = 150;
const SUCCESS_THRESHOLD = 70;

export function awardCase(prev: UserProgress, result: CaseResult): AwardResult {
  const { score, durationSeconds, clinicalCase } = result;
  const isHit = score.total >= SUCCESS_THRESHOLD;
  const isExact = score.diagnosisMatch === 'exact';

  // moedas: 10 por caso + 5 se nota > 80
  const coinsEarned = 10 + (score.total > 80 ? 5 : 0);

  const recentScores = [...prev.recentScores, score.total].slice(-50);
  const isNewCase = !prev.caseIds.includes(clinicalCase.id);
  const caseIds = isNewCase ? [...prev.caseIds, clinicalCase.id] : prev.caseIds;
  const totalCases = caseIds.length;

  const currentStreak = isExact ? prev.currentStreak + 1 : 0;
  const bestStreak = Math.max(prev.bestStreak, currentStreak);

  const specialtyHits = { ...prev.specialtyHits };
  if (isExact) {
    const s = clinicalCase.specialty || 'Clínica Médica';
    specialtyHits[s] = (specialtyHits[s] ?? 0) + 1;
  }

  // Conquistas
  const unlocked = new Set(prev.achievements);
  const newly: Achievement[] = [];
  const tryUnlock = (id: string) => {
    if (unlocked.has(id)) return;
    const a = ACHIEVEMENTS.find((x) => x.id === id);
    if (!a) return;
    unlocked.add(id);
    newly.push(a);
  };

  if (isExact && durationSeconds > 0 && durationSeconds < 120) tryUnlock('fast_dx');
  if (score.total === 100) tryUnlock('perfect');
  if (isHit && score.unnecessaryRequested.length === 0) tryUnlock('efficient');
  if (score.humanitarian >= 25) tryUnlock('empathic');
  if (Object.values(specialtyHits).some((n) => n >= 5)) tryUnlock('specialist');
  if (totalCases >= TOTAL_CASES) tryUnlock('master_cases');
  if (currentStreak >= 10) tryUnlock('precision');
  if (totalCases >= 50) tryUnlock('tireless');

  const progress: UserProgress = {
    coins: prev.coins + coinsEarned,
    achievements: Array.from(unlocked),
    totalCases,
    currentStreak,
    bestStreak,
    recentScores,
    specialtyHits,
    caseIds,
  };

  return { progress, coinsEarned, newAchievements: newly };
}

// ---------- Dicas (estáticas, derivadas do JSON do caso) ----------
export interface Hint {
  tier: 1 | 2 | 3;
  cost: number;
  label: string;
  content: string;
}

export function buildHints(c: ClinicalCase): Hint[] {
  const abnormal = describeAbnormalVitals(c);
  const tier1 = abnormal || `Atenção aos sinais vitais: PA ${c.vitalSigns?.pa}, FC ${c.vitalSigns?.fc}.`;
  const tier2 = `O quadro envolve o sistema/área: ${c.organ || c.specialty}.`;
  const tier3 = `O diagnóstico provável é: ${c.correctDiagnosis}.`;
  return [
    { tier: 1, cost: 1, label: 'Dica básica', content: tier1 },
    { tier: 2, cost: 3, label: 'Dica intermediária', content: tier2 },
    { tier: 3, cost: 5, label: 'Dica avançada', content: tier3 },
  ];
}

function describeAbnormalVitals(c: ClinicalCase): string | null {
  const v = c?.vitalSigns;
  if (!v) return null;
  const out: string[] = [];
  if (typeof v.temp === 'number' && v.temp >= 38) out.push(`febre (${v.temp}°C)`);
  if (typeof v.fc === 'number' && v.fc > 110) out.push(`taquicardia (FC ${v.fc})`);
  if (typeof v.fc === 'number' && v.fc < 55) out.push(`bradicardia (FC ${v.fc})`);
  if (typeof v.sao2 === 'number' && v.sao2 < 93) out.push(`hipoxemia (SatO₂ ${v.sao2}%)`);
  if (typeof v.fr === 'number' && v.fr > 22) out.push(`taquipneia (FR ${v.fr})`);
  if (!out.length) return null;
  return `O paciente apresenta ${out.join(' e ')}.`;
}
