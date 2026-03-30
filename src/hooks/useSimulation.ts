import { useState, useCallback } from 'react';

// Tipagem para garantir que o código não quebre
interface ClinicalCase {
  id: string;
  title: string;
  correctDiagnosis: string;
  baseVitals: { bp: string; hr: number; ox: number };
  labResults: Record<string, string>;
  unnecessaryExams: string[];
}

export const useSimulation = () => {
  const [state, setState] = useState({
    isFinished: false,
    studentLevel: "Internato",
    reasoningScore: 100,
    patientHealth: 100,
    costEffectiveness: 100,
    physicalExamDone: false,
    examsRequested: [] as string[],
    messages: [{ role: 'system', content: 'Paciente aguardando atendimento...' }],
    currentCase: {
      id: "1",
      title: "Caso de Emergência",
      correctDiagnosis: "Dissecação Aórtica",
      baseVitals: { bp: "160/90", hr: 95, ox: 96 },
      labResults: { "ECG": "Ritmo Sinusal, sem supra de ST", "Troponina": "Negativa" },
      unnecessaryExams: ["Tomografia de Abdome", "Resonância Magnética"]
    } as ClinicalCase,
    diagnosisAttempt: ""
  });

  const [vitalSigns, setVitalSigns] = useState(state.currentCase.baseVitals);

  // 1. Efeito de flutuação dos sinais vitais (Realismo)
  const fluctuateVitals = useCallback(() => {
    setVitalSigns(prev => ({
      ...prev,
      hr: prev.hr + (Math.random() > 0.5 ? 1 : -1),
      ox: Math.min(100, prev.ox + (Math.random() > 0.5 ? 0.1 : -0.1))
    }));
  }, []);

  // 2. Lógica de Solicitação de Exames (Punição de Custo)
  const requestExam = (exam: string) => {
    const isUnnecessary = state.currentCase.unnecessaryExams.includes(exam);
    
    setState(prev => ({
      ...prev,
      examsRequested: [...prev.examsRequested, exam],
      costEffectiveness: isUnnecessary ? prev.costEffectiveness - 15 : prev.costEffectiveness,
      reasoningScore: isUnnecessary ? prev.reasoningScore - 5 : prev.reasoningScore,
      messages: [...prev.messages, { role: 'assistant', content: `Resultado de ${exam}: ${prev.currentCase.labResults[exam] || 'Normal.'}` }]
    }));
  };

  // 3. Lógica de Finalização e Score Final
  const submitDiagnosis = (diagnosis: string) => {
    const isCorrect = diagnosis.toLowerCase().includes(state.currentCase.correctDiagnosis.toLowerCase());
    
    // Cálculo final baseado na saúde do paciente e acerto
    const finalScore = isCorrect ? state.reasoningScore : state.reasoningScore - 40;
    
    setState(prev => ({
      ...prev,
      isFinished: true,
      reasoningScore: Math.max(0, finalScore),
      diagnosisAttempt: diagnosis
    }));
  };

  const sendMessage = (text: string) => {
    // Aqui você integraria com a API da OpenAI via Lovable
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, { role: 'user', content: text }]
    }));
  };

  const resetSimulation = (caseId: number) => {
    // Lógica para reiniciar
    window.location.reload(); 
  };

  return {
    state,
    vitalSigns,
    isLoading: false,
    fluctuateVitals,
    sendMessage,
    performPhysicalExam: () => setState(p => ({ ...p, physicalExamDone: true })),
    requestExam,
    submitDiagnosis,
    resetSimulation
  };
};
