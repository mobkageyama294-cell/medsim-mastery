/**
 * src/utils/scoring.ts
 * 
 * Este utilitário calcula a performance de um atendimento médico
 * baseado em critérios de comunicação, técnica e precisão.
 */

export interface ScoringInput {
  userDiagnosis: string;
  correctDiagnosis: string;
  unnecessaryExamsRequested: string[];
  dialogueText: string;
  technicalTerms?: string[]; // Permite passar termos específicos do caso
}

export interface ScoringResult {
  total: number;
  breakdown: {
    humanized: number;
    accuracy: number;
    technical: number;
    efficiency: number;
  };
  feedback: string;
}

// --- Configurações e Constantes ---

const MAX_SCORE_PER_CATEGORY = 25;

const EMPATHY_KEYWORDS = [
  "acolher", "entendo", "compreendo", "cuidar", "tranquilo", 
  "ajudar", "calma", "estou aqui", "resolver", "preocupação"
];

const DEFAULT_MEDICAL_TERMS = [
  "diagnóstico", "propedêutica", "exame físico", "sinais vitais",
  "anamnese", "hipótese", "conduta", "terapêutica", "prognóstico"
];

// --- Funções Auxiliares ---

/**
 * Normaliza textos: remove espaços extras, converte para minúsculas
 * e remove acentos para garantir que a comparação seja justa.
 */
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^\w\s]/g, ' ')       // Remove pontuação
    .trim();
};

/**
 * Conta ocorrências únicas de palavras de uma lista dentro de um texto.
 */
const countMatches = (text: string, keywords: string[]): number => {
  const normalizedText = normalizeText(text);
  let matches = 0;
  
  keywords.forEach(word => {
    const normalizedWord = normalizeText(word);
    // Usa RegExp com \b para garantir que a palavra está isolada (word boundary)
    const regex = new RegExp(`\\b${normalizedWord}\\b`, 'gi');
    if (regex.test(normalizedText)) {
      matches++;
    }
  });
  
  return matches;
};

// --- Lógica de Pontuação ---

function scoreHumanizedTreatment(text: string): number {
  const matches = countMatches(text, EMPATHY_KEYWORDS);
  return Math.min(MAX_SCORE_PER_CATEGORY, matches * 5);
}

function scoreTechnicalLanguage(text: string, extraTerms: string[] = []): number {
  const allTerms = [...DEFAULT_MEDICAL_TERMS, ...extraTerms];
  const matches = countMatches(text, allTerms);
  return Math.min(MAX_SCORE_PER_CATEGORY, matches * 5);
}

function scoreDiagnosticAccuracy(userDiag: string, correctDiag: string): number {
  const user = normalizeText(userDiag);
  const correct = normalizeText(correctDiag);

  if (!user || !correct) return 0;
  if (user === correct) return 25;
  if (user.includes(correct) || correct.includes(user)) return 20;

  const userWords = user.split(/\s+/);
  const correctWords = correct.split(/\s+/);
  const common = userWords.filter(w => w.length > 3 && correctWords.includes(w)).length;

  if (common >= 2) return 15;
  if (common === 1) return 10;
  return 0;
}

function scoreInvestigationEfficiency(unnecessary: string[]): number {
  const penalty = unnecessary.length * 5;
  return Math.max(0, MAX_SCORE_PER_CATEGORY - penalty);
}

// --- Função Principal ---

export function calculateScore(input: ScoringInput): ScoringResult {
  const humanized = scoreHumanizedTreatment(input.dialogueText);
  const accuracy = scoreDiagnosticAccuracy(input.userDiagnosis, input.correctDiagnosis);
  const technical = scoreTechnicalLanguage(input.dialogueText, input.technicalTerms);
  const efficiency = scoreInvestigationEfficiency(input.unnecessaryExamsRequested);
  
  const total = humanized + accuracy + technical + efficiency;

  // Construção do Feedback
  const feedbackParts: string[] = [];

  if (accuracy >= 20) feedbackParts.push("✅ Diagnóstico preciso.");
  else if (accuracy >= 10) feedbackParts.push("⚠️ O diagnóstico foi parcial.");
  else feedbackParts.push("❌ O diagnóstico não foi atingido.");

  if (efficiency < 25) {
    feedbackParts.push(`Solicitou exames desnecessários: ${input.unnecessaryExamsRequested.join(", ")}.`);
  }

  if (humanized < 15) feedbackParts.push("Dica: Tente ser mais empático com o paciente.");
  
  const finalFeedback = feedbackParts.join(" ") + (total >= 80 ? " Excelente trabalho!" : " Continue praticando.");

  return {
    total,
    breakdown: { humanized, accuracy, technical, efficiency },
    feedback: finalFeedback
  };
}
