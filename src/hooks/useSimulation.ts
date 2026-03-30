import { useState, useEffect } from 'react';

// Tipagem para garantir que o código não quebre
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

  // EFEITO PARA BUSCAR OS DADOS DO JSON
  useEffect(() => {
    fetch('/src/data/cases.json')
      .then(res => res.json())
      .then((data: ClinicalCase[]) => {
        setCases(data);
        if (data.length > 0) {
          setState(prev => ({
            ...prev,
            currentCase: data[0], // Começa pelo primeiro caso da lista
            messages: [{ role: 'system', content: `Paciente aguardando atendimento para o caso: ${data[0].title}` }]
          }));
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro ao carregar casos:", err);
        setLoading(false);
      });
  }, []);

  // 1. Estado inicial seguro para os sinais vitais
  const [vitalSigns, setVitalSigns] = useState({ bp: "0/0", hr: 0, ox: 0 });

  // 2. Atualiza os sinais vitais assim que o caso clínico carregar
  useEffect(() => {
    if (state.currentCase) {
      setVitalSigns(state.currentCase.baseVitals);
    }
  }, [state.currentCase]);

  // Daqui para baixo você mantém as funções handleExam, handleDiagnosis, etc.
  // O restante das funções (handleExam, handleDiagnosis) continua abaixo...


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
