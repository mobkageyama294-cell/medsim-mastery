// src/utils/scoring.ts

export interface ScoringInput {
  userDiagnosis: string;
  correctDiagnosis: string;
  unnecessaryExamsRequested: string[];
  dialogueText: string; // histórico completo do chat ou última resposta do usuário
}

// Palavras-chave para tratamento humanitário (empatia)
const EMPATHY_KEYWORDS = [
  "acolher", "entendo", "compreendo", "vamos cuidar", "tranquilo",
  "fique tranquilo", "vou ajudar", "calma", "estou aqui",
  "vamos resolver", "sem preocupação", "entendo sua preocupação", "obrigado"
];

// Termos técnicos médicos (exemplo básico)
const TECHNICAL_TERMS = [
  "diagnóstico", "propedêutica", "exame físico", "sinais vitais",
  "anamnese", "hipótese", "conduta", "terapêutica", "prognóstico",
  "sintomas", "quadro clínico", "exames complementares", "dor torácica",
  "cefaleia", "dispneia", "edema", "febre", "hipertensão", "taquicardia"
];

// Avalia tratamento humanitário (0-25)
function scoreHumanizedTreatment(dialogueText: string): number {
  if (!dialogueText) return 0;
  const lower = dialogueText.toLowerCase();
  let matches = 0;
  for (const kw of EMPATHY_KEYWORDS) {
    if (lower.includes(kw.toLowerCase())) matches++;
  }
  return Math.min(25, matches * 5);
}

// Acurácia diagnóstica (0-25)
function scoreDiagnosticAccuracy(userDiag: string, correctDiag: string): number {
  if (!userDiag || !correctDiag) return 0;
  const normalize = (s: string) => s.trim().toLowerCase().replace(/[^\w\s]/g, '');
  const userNorm = normalize(userDiag);
  const correctNorm = normalize(correctDiag);
  if (userNorm === correctNorm) return 25;
  if (userNorm.includes(correctNorm) || correctNorm.includes(userNorm)) return 20;
  const userWords = userNorm.split(/\s+/);
  const correctWords = correctNorm.split(/\s+/);
  const common = userWords.filter(w => correctWords.includes(w)).length;
  if (common >= 2) return 15;
  if (common === 1) return 10;
  return 0;
}

// Linguagem técnica (0-25)
function scoreTechnicalLanguage(dialogueText: string): number {
  if (!dialogueText) return 0;
  const lower = dialogueText.toLowerCase();
  let count = 0;
  for (const term of TECHNICAL_TERMS) {
    if (lower.includes(term.toLowerCase())) count++;
  }
  return Math.min(25, count * 3); // ~8 termos = 24 pontos
}

// Eficiência na investigação (0-25, penaliza por exame desnecessário)
function scoreInvestigationEfficiency(unnecessaryRequested: string[]): number {
  const penaltyPerExam = 5;
  const maxPenalty = 25;
  const penalty = Math.min(maxPenalty, unnecessaryRequested.length * penaltyPerExam);
  return 25 - penalty;
}

// Geração automática de feedback textual
function generateFeedback(
  humanized: number,
  accuracy: number,
  technical: number,
  efficiency: number,
  unnecessaryExams: string[]
): string {
  let feedback = "";
  if (accuracy >= 20) feedback += "✅ Diagnóstico correto! ";
  else if (accuracy >= 10) feedback += "⚠️ Diagnóstico parcialmente correto. ";
  else feedback += "❌ Diagnóstico incorreto. ";

  if (efficiency < 20) {
    const excess = unnecessaryExams.length;
    feedback += `Solicitou ${excess} exame(s) desnecessário(s) (${unnecessaryExams.join(", ")}). `;
  } else {
    feedback += "Boa eficiência na solicitação de exames. ";
  }

  if (humanized < 15) feedback += "Melhore o acolhimento ao paciente (use frases empáticas). ";
  if (technical < 15) feedback += "Utilize mais termos técnicos apropriados ao contexto médico. ";

  const total = humanized + accuracy + technical + efficiency;
  if (total >= 90) feedback += "Excelente desempenho!";
  else if (total >= 70) feedback += "Bom trabalho, mas ainda pode melhorar.";
  else feedback += "Revise os critérios e tente novamente.";

  return feedback;
}

// Função principal
export function calculateScore(input: ScoringInput): {
  total: number;
  humanized: number;
  accuracy: number;
  technical: number;
  efficiency: number;
  feedback: string;
} {
  const humanized = scoreHumanizedTreatment(input.dialogueText);
  const accuracy = scoreDiagnosticAccuracy(input.userDiagnosis, input.correctDiagnosis);
  const technical = scoreTechnicalLanguage(input.dialogueText);
  const efficiency = scoreInvestigationEfficiency(input.unnecessaryExamsRequested);
  const total = humanized + accuracy + technical + efficiency;

  const feedback = generateFeedback(humanized, accuracy, technical, efficiency, input.unnecessaryExamsRequested);

  return { total, humanized, accuracy, technical, efficiency, feedback };
}
