import { useState, useEffect, useCallback } from 'react';

export interface ClinicalCase {
  id: string;
  title: string;
  specialty: string;
  correctDiagnosis: string;
  baseVitals: { bp: string; hr: number; ox: number };
  labResults: Record<string, string>;
  unnecessaryExams: string[];
}

export const useSimulation = () => {
  const [cases] = useState<ClinicalCase[]>([
    {
      id: "1",
      title: "Dor Torácica Súbita e Irradiada",
      specialty: "Cardiologia",
      correctDiagnosis: "Dissecação Aórtica",
      baseVitals: { bp: "190/110", hr: 105, ox: 94 },
      labResults: { 
        "Raio-X de Tórax": "Alargamento de mediastino importante", 
        "ECG": "Ritmo sinusal, sem sinais de isquemia",
        "Ausculta": "Sopro diastólico em foco aórtico"
      },
      unnecessaryExams: ["Troponina Serial"]
    },
    {
      id: "2",
      title: "Febre, Cefaleia e Exantema",
      specialty: "Infectologia",
      correctDiagnosis: "Dengue com Sinais de Alarme",
      baseVitals: { bp: "90/60", hr: 112, ox: 97 },
      labResults: { 
        "Hemograma": "Plaquetas: 75.000, Leucopenia", 
        "Prova do Laço": "Positiva",
        "Hematócrito": "Elevado em 20%"
      },
      unnecessaryExams: ["Tomografia de Crânio"]
    }
  ]);

  const [state, setState] = useState({
    isFinished: false,
    studentLevel: "Internato",
    reasoningScore: 100,
    patientHealth: 100,
    costEffectiveness: 100,
    physicalExamDone: false,
    examsRequested: [] as string[],
    messages: [{ role: 'system' as const, content: `Paciente aguardando atendimento para o caso: Dor Torácica Súbita` }],
    currentCase: null as ClinicalCase | null,
    diagnosisAttempt: ""
  });

  const [vitalSigns, setVitalSigns] = useState({ bp: "190/110", hr: 105, ox: 94 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Inicializa o primeiro caso imediatamente
    setState(prev => ({ ...prev, currentCase: cases[0] }));
    setVitalSigns(cases[0].baseVitals);
    setIsLoading(false);
  }, [cases]);

  const fluctuateVitals = useCallback(() => {
    setVitalSigns(prev => ({
      ...prev,
      hr: prev.hr + (Math.random() > 0.5 ? 1 : -1),
      ox: Math.min(100, prev.ox + (Math.random() > 0.5 ? 0.1 : -0.1))
    }));
  }, []);

  const handleExam = (exam: string) => {
    if (!state.currentCase) return;
    const result = state.currentCase.labResults[exam] || "Resultado normal ou não digno de nota.";
    
    setState(prev => ({
      ...prev,
      examsRequested: [...prev.examsRequested, exam],
      messages: [...prev.messages, { role: 'assistant', content: `Resultado do exame ${exam}: ${result}` }]
    }));
  };

  const submitDiagnosis = (diagnosis: string) => {
    setState(prev => ({ ...prev, isFinished: true, diagnosisAttempt: diagnosis }));
  };

  const resetSimulation = () => {
    setState(prev => ({
      ...prev,
      isFinished: false,
      examsRequested: [],
      messages: [{ role: 'system', content: `Novo atendimento iniciado: ${cases[0].title}` }]
    }));
    setVitalSigns(cases[0].baseVitals);
  };

  return {
    state,
    vitalSigns,
    isLoading,
    fluctuateVitals,
    handleExam,
    submitDiagnosis,
    resetSimulation
  };
};
