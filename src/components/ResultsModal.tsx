/**
 * Interface que define os dados necessários para o cálculo da pontuação.
 */
export interface ScoringInput {
  userDiagnosis: string;
  correctDiagnosis: string;
  unnecessaryExamsRequested: string[]; 
  dialogueText: string;
  technicalTerms?: string[]; // Termos extras opcionais
}

// Configurações de Pontuação
const MAX_SCORE_PER_CATEGORY = 25;
const POINTS_PER_MATCH = 5;

const EMPATHY_KEYWORDS = [
  "acolher", "entendo", "compreendo", "vamos cuidar", "tranquilo",
  "fique tranquilo", "vou ajudar", "calma", "estou aqui",
  "vamos resolver", "sem preocupação", "entendo sua preocupação"
];

const MEDICAL_TERMS = [
  "diagnóstico", "propedêutica", "exame físico", "sinais vitais",
  "anamnese", "hipótese", "conduta", "terapêutica", "prognóstico",
  "sintomas", "quadro clínico", "exames complementares"
];

/**
 * Função utilitária para contar ocorrências de palavras-chave num texto.
 * @param text O texto a ser analisado.
 * @param keywords Lista de palavras ou frases para procurar.
 */
function countKeywordMatches(text: string, keywords: string[]): number {
  if (!text) return 0;
  const lowerText = text.toLowerCase();
  let count = 0;

  for (const kw of keywords) {
    // Usamos includes para frases, mas Regex seria mais preciso para palavras exatas
    if (lowerText.includes(kw.toLowerCase())) {
      count++;
    }
  }
  return count;
}

/**
 * Avalia o tratamento humanitário com base em palavras de empatia.
 */
function scoreHumanizedTreatment(dialogueText: string): number {
  const matches = countKeywordMatches(dialogueText, EMPATHY_KEYWORDS);
  return Math.min(MAX_SCORE_PER_CATEGORY, matches * POINTS_PER_MATCH);
}

/**
 * Avalia a precisão do diagnóstico comparando a resposta do usuário com a correta.
 */
function scoreDiagnosticAccuracy(userDiag: string, correctDiag: string): number {
  if (!userDiag || !correctDiag) return 0;

  const normalize = (s: string) => s.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s]/g, '');
  
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

/**
 * Avalia o uso de termos técnicos médicos.
 */
function scoreTechnicalLanguage(dialogueText: string, extraTerms: string[] = []): number {
  const allTerms = [...MEDICAL_TERMS, ...extraTerms];
  const count = countKeywordMatches(dialogueText, allTerms);
  return Math.min(MAX_SCORE_PER_CATEGORY, count * POINTS_PER_MATCH);
}

/**
 * Penaliza a pontuação com base em exames desnecessários solicitados.
 */
function scoreInvestigationEfficiency(unnecessaryRequested: string[]): number {
  const penalty = Math.min(MAX_SCORE_PER_CATEGORY, unnecessaryRequested.length * POINTS_PER_MATCH);
  return MAX_SCORE_PER_CATEGORY - penalty;
}

/**
 * Calcula a pontuação total e gera um feedback detalhado.
 */
export function calculateScore(input: ScoringInput) {
  const scores = {
    humanized: scoreHumanizedTreatment(input.dialogueText),
    accuracy: scoreDiagnosticAccuracy(input.userDiagnosis, input.correctDiagnosis),
    technical: scoreTechnicalLanguage(input.dialogueText, input.technicalTerms),
    efficiency: scoreInvestigationEfficiency(input.unnecessaryExamsRequested),
  };

  const total = scores.humanized + scores.accuracy + scores.technical + scores.efficiency;

  return {
    total,
    ...scores,
    feedback: generateFeedback(total, scores, input)
  };
}

/**
 * Gera a string de feedback baseada nos resultados.
 */
function generateFeedback(total: number, scores: any, input: ScoringInput): string {
  let parts: string[] = [];

  // Diagnóstico
  if (scores.accuracy >= 20) parts.push("✅ Diagnóstico correto!");
  else if (scores.accuracy >= 10) parts.push("⚠️ Diagnóstico parcialmente correto.");
  else parts.push("❌ Diagnóstico incorreto.");

  // Eficiência
  if (scores.efficiency < 20) {
    parts.push(`Solicitou ${input.unnecessaryExamsRequested.length} exame(s) desnecessário(s) (${input.unnecessaryExamsRequested.join(", ")}).`);
  } else {
    parts.push("Boa eficiência na solicitação de exames.");
  }

  // Sugestões
  if (scores.humanized < 15) parts.push("Melhore o acolhimento ao paciente.");
  if (scores.technical < 15) parts.push("Utilize mais termos técnicos.");

  // Conclusão
  if (total >= 90) parts.push("Excelente desempenho!");
  else if (total >= 70) parts.push("Bom trabalho, mas ainda pode melhorar.");
  else parts.push("Revise os critérios e tente novamente.");

  return parts.join(" ");
}
