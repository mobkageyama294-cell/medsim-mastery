import { useState, useEffect, useCallback } from 'react';

export interface ClinicalCase {
  id: string;
  title: string;
  specialty: string;
  correctDiagnosis: string;
  description: string;
  baseVitals: { bp: string; hr: number; ox: number };
  labResults: Record<string, string>;
  unnecessaryExams: string[];
}

export const useSimulation = () => {
  const [cases, setCases] = useState<ClinicalCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [state, setState] = useState({
    isFinished: false,
    studentLevel: "Internato",
    reasoningScore: 100,
    patientHealth: 100,
    costEffectiveness: 100,
    physicalExamDone: false,
    examsRequested: [] as string[],
    messages: [{ role: 'system' as const, content: 'Carregando prontuários...' }],
    currentCase: null as ClinicalCase | null,
    diagnosisAttempt: ""
  });

  const [vitalSigns, setVitalSigns] = useState({ bp: "0/0", hr: 0, ox: 0 });

  // FUNÇÃO QUE LÊ O ARQUIVO JSON
  useEffect(() => {
    fetch('/src/data/cases.json')
      .then(res => res.json())
      .then((data: ClinicalCase[]) => {
        setCases(data);
        if (data.length > 0) {
          setState(prev => ({
            ...prev,
            currentCase: data[0],
            messages: [{ role: 'system', content: `Paciente aguardando: ${data[0].title}. O que deseja fazer?` }]
          }));
          setVitalSigns(data[0].baseVitals);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Erro ao ler cases.json:", err);
        setIsLoading(false);
      });
  }, []);

  const fluctuateVitals = useCallback(() => {
    if (!state.currentCase) return;
    setVitalSigns(prev => ({
      ...prev,
      hr: prev.hr + (Math.random() > 0.5 ? 1 : -1),
      ox: Math.min(100, prev.ox + (Math.random() > 0.5 ? 0.1 : -0.1))
    }));
  }, [state.currentCase]);

  const handleExam = (exam: string) => {
    if (!state.currentCase) return;
    const result = state.currentCase.labResults[exam] || "Resultado normal.";
    setState(prev => ({
      ...prev,
      examsRequested: [...prev.examsRequested, exam],
      messages: [...prev.messages, { role: 'assistant', content: `Exame: ${exam}. Resultado: ${result}` }]
    }));
  };

  const submitDiagnosis = (diagnosis: string) => {
    setState(prev => ({ ...prev, isFinished: true, diagnosisAttempt: diagnosis }));
  };

  const nextCase = (index: number) => {
    if (cases[index]) {
      setState(prev => ({
        ...prev,
        isFinished: false,
        examsRequested: [],
        currentCase: cases[index],
        messages: [{ role: 'system', content: `Novo caso iniciado: ${cases[index].title}` }]
      }));
      setVitalSigns(cases[index].baseVitals);
    }
  };

  return {
    state,
    cases, // Exportando a lista completa para o componente de seleção
    vitalSigns,
    isLoading,
    fluctuateVitals,
    handleExam,
    submitDiagnosis,
    nextCase
  };
};
