import { useState, useEffect, useCallback } from 'react';

interface ClinicalCase {
  id: string;
  title: string;
  specialty: string;
  correctDiagnosis: string;
  baseVitals: { bp: string; hr: number; ox: number };
  labResults: Record<string, string>;
  unnecessaryExams: string[];
}

export const useSimulation = () => {
  const [cases, setCases] = useState<ClinicalCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState({
    isFinished: false,
    studentLevel: "Internato",
    reasoningScore: 100,
    patientHealth: 100,
    costEffectiveness: 100,
    physicalExamDone: false,
    examsRequested: [] as string[],
    messages: [{ role: 'system', content: 'Carregando casos clínicos...' }],
    currentCase: null as ClinicalCase | null,
    diagnosisAttempt: ""
  });

  const [vitalSigns, setVitalSigns] = useState({ bp: "0/0", hr: 0, ox: 0 });

  // Busca os casos no JSON
  useEffect(() => {
    fetch('/src/data/cases.json')
      .then(res => res.json())
      .then((data: ClinicalCase[]) => {
        setCases(data);
        if (data.length > 0) {
          setState(prev => ({
            ...prev,
            currentCase: data[0],
            messages: [{ role: 'system', content: `Paciente aguardando atendimento para o caso: ${data[0].title}` }]
          }));
          setVitalSigns(data[0].baseVitals);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro ao carregar casos:", err);
        setLoading(false);
      });
  }, []);

  // Funções de simulação
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
    const result = state.currentCase.labResults[exam] || "Resultado pendente";
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
    if (cases.length > 0) {
      setState(prev => ({
        ...prev,
        isFinished: false,
        examsRequested: [],
        currentCase: cases[0],
        messages: [{ role: 'system', content: `Novo atendimento iniciado: ${cases[0].title}` }]
      }));
      setVitalSigns(cases[0].baseVitals);
    }
  };

  return {
    state,
    vitalSigns,
    isLoading: loading,
    fluctuateVitals,
    handleExam,
    submitDiagnosis,
    resetSimulation
  };
};
