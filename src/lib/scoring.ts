import type { ClinicalCase, ChatMessage, EmpathyData } from '@/hooks/useSimulation';

export interface ScoreBreakdown {
  total: number;
  humanitarian: number;
  accuracy: number;
  technicalLanguage: number;
  efficiency: number;
  unnecessaryRequested: string[];
  diagnosisMatch: 'exact' | 'partial' | 'incorrect';
  autoFeedback: string;
}

const TECHNICAL_TERMS = [
  'anamnese','ausculta','palpacao','percussao','inspecao','propedeutica',
  'diagnostico diferencial','sintomatologia','etiologia','prognostico',
  'evolucao','sinal','sintoma','irradiacao','pulso','pressao arterial',
  'frequencia cardiaca','saturacao','taquicardia','bradicardia','dispneia',
  'cianose','edema','febre','hipertensao','hipotensao','sopro','estertor',
  'abdome','torax','cefaleia','nausea','vomito','parestesia','sincope',
  'hemograma','troponina','ecocardiograma','tomografia','ressonancia',
];

function normalize(s: string): string {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function diagnosisAccuracy(attempt: string, correct: string): { score: number; match: ScoreBreakdown['diagnosisMatch'] } {
  const a = normalize(attempt);
  const c = normalize(correct);
  if (!a || !c) return { score: 0, match: 'incorrect' };
  if (a === c || a.includes(c) || c.includes(a)) return { score: 25, match: 'exact' };

  const stop = new Set(['de','do','da','com','sem','e','a','o','em','por']);
  const tokensC = c.split(' ').filter((t) => t.length > 3 && !stop.has(t));
  const tokensA = new Set(a.split(' '));
  const hits = tokensC.filter((t) => tokensA.has(t)).length;
  const ratio = tokensC.length ? hits / tokensC.length : 0;

  if (ratio >= 0.5) return { score: 18, match: 'partial' };
  if (ratio >= 0.25) return { score: 10, match: 'partial' };
  return { score: 0, match: 'incorrect' };
}

function technicalScore(messages: ChatMessage[]): number {
  const userText = normalize(
    (messages || []).filter((m) => m?.role === 'user').map((m) => m.content).join(' ')
  );
  if (!userText) return 0;
  const hits = TECHNICAL_TERMS.reduce((acc, term) => acc + (userText.includes(term) ? 1 : 0), 0);
  return Math.min(25, Math.round((hits / 8) * 25));
}

function humanitarianScore(empathyScore: number, history: EmpathyData[]): number {
  const base = (empathyScore ?? 0) / 100;
  const engagement = Math.min(1, (history?.length ?? 0) / 4);
  return Math.round((base * 0.8 + engagement * 0.2) * 25);
}

function efficiencyScore(requested: string[], unnecessary: string[]): { score: number; bad: string[] } {
  const bad = (requested ?? []).filter((e) => (unnecessary ?? []).includes(e));
  const score = Math.max(0, 25 - bad.length * 8);
  return { score, bad };
}

function buildAutoFeedback(b: Omit<ScoreBreakdown, 'autoFeedback'>): string {
  const parts: string[] = [];
  if (b.diagnosisMatch === 'exact') parts.push('Excelente acurácia diagnóstica — você acertou em cheio.');
  else if (b.diagnosisMatch === 'partial') parts.push('Sua hipótese esteve parcialmente correta; revise os critérios definidores da patologia.');
  else parts.push('O diagnóstico final divergiu do esperado — vale revisar os achados-chave deste quadro clínico.');

  if (b.unnecessaryRequested.length > 0)
    parts.push(`Foram solicitados ${b.unnecessaryRequested.length} exame(s) desnecessário(s), gerando custos e desconforto evitáveis ao paciente.`);
  else parts.push('Investigação enxuta — você não solicitou exames supérfluos.');

  if (b.humanitarian < 13) parts.push('Trabalhe a abordagem empática: acolhimento, escuta ativa e linguagem acessível.');
  else if (b.humanitarian >= 20) parts.push('Comunicação humanizada exemplar.');

  if (b.technicalLanguage < 10) parts.push('Use mais terminologia médica formal durante a anamnese.');

  return parts.join(' ');
}

export function calculateFinalScore(state: {
  diagnosisAttempt?: string;
  empathyScore?: number;
  empathyHistory?: EmpathyData[];
  examsRequested?: string[];
  messages?: ChatMessage[];
  currentCase?: ClinicalCase | null;
}): ScoreBreakdown {
  const c = state?.currentCase;
  const acc = diagnosisAccuracy(state?.diagnosisAttempt ?? '', c?.correctDiagnosis ?? '');
  const hum = humanitarianScore(state?.empathyScore ?? 0, state?.empathyHistory ?? []);
  const tech = technicalScore(state?.messages ?? []);
  const eff = efficiencyScore(state?.examsRequested ?? [], c?.unnecessaryExams ?? []);

  const partial = {
    humanitarian: hum,
    accuracy: acc.score,
    technicalLanguage: tech,
    efficiency: eff.score,
    unnecessaryRequested: eff.bad,
    diagnosisMatch: acc.match,
    total: hum + acc.score + tech + eff.score,
  };

  return { ...partial, autoFeedback: buildAutoFeedback(partial) };
}
