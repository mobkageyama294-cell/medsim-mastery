import { useState, useCallback, useEffect } from 'react';
import { ClinicalCase, fetchClinicalCases } from '@/data/clinicalCases';
import { supabase } from '@/integrations/supabase/client';

export type { ClinicalCase } from '@/data/clinicalCases';

export interface ChatMessage {
  role: 'system' | 'user' | 'patient' | 'assistant';
  content: string;
}

export interface EmpathyFactors {
  tom: number;
  acolhimento: number;
  perguntasAbertas: number;
  escutaAtiva: number;
  linguagemAcessivel: number;
}

export interface EmpathyData {
  score: number;
  factors: EmpathyFactors;
  feedback: string;
}

export interface SimulationState {
  isFinished: boolean;
  studentLevel: string;
  reasoningScore: number;
  patientHealth: number;
  costEffectiveness: number;
  empathyScore: number;
  empathyHistory: EmpathyData[];
  physicalExamDone: boolean;
  examsRequested: string[];
  messages: ChatMessage[];
  currentCase: ClinicalCase | null;
  diagnosisAttempt: string;
}

const initialState: SimulationState = {
  isFinished: false,
  studentLevel: 'Internato',
  reasoningScore: 100,
  patientHealth: 100,
  costEffectiveness: 100,
  empathyScore: 50,
  empathyHistory: [],
  physicalExamDone: false,
  examsRequested: [],
  messages: [],
  currentCase: null,
  diagnosisAttempt: '',
};

const buildWelcome = (c: ClinicalCase): ChatMessage => ({
  role: 'system',
  content: `Novo paciente: ${c.patientName}, ${c.patientAge}a, ${c.patientSex === 'M' ? '♂' : '♀'}. Queixa: "${c.chiefComplaint}". Conduza a anamnese.`,
});

export const useSimulation = (initialCaseId?: string) => {
  const [cases, setCases] = useState<ClinicalCase[]>([]);
  const [casesLoading, setCasesLoading] = useState(true);
  const [casesError, setCasesError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [state, setState] = useState<SimulationState>(initialState);
  const [vitalSigns, setVitalSigns] = useState({ pa: '0/0', fc: 0, sao2: 0, temp: 36, fr: 16 });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch cases from JSON on mount
  useEffect(() => {
    let cancelled = false;
    const loadCases = async () => {
      setCasesLoading(true);
      setCasesError(null);

      try {
        const data = await fetchClinicalCases();
        if (cancelled) return;

        setCases(data);

        if (data.length === 0) {
          setState((prev) => ({ ...prev, currentCase: null, messages: [] }));
          setCasesError('Erro ao carregar banco de dados do GitHub');
          setCasesLoading(false);
          return;
        }

        if (initialCaseId) {
          const c = data.find((x) => x.id === initialCaseId) || null;

          if (c) {
            setState({
              ...initialState,
              currentCase: c,
              messages: [buildWelcome(c)],
            });
            setVitalSigns(c.vitalSigns);
          } else {
            setState((prev) => ({ ...prev, currentCase: null }));
          }
        }

        setCasesLoading(false);
      } catch (err) {
        if (cancelled) return;
        console.error(err);
        setCases([]);
        setCasesError('Erro ao carregar banco de dados do GitHub');
        setCasesLoading(false);
      }
    };

    loadCases();

    return () => { cancelled = true; };
  }, [initialCaseId, reloadToken]);

  const retryCases = useCallback(() => {
    setReloadToken((prev) => prev + 1);
  }, []);

  const loadCase = useCallback((id: string) => {
    const c = cases.find((x) => x.id === id);
    if (!c) return;
    setState({
      ...initialState,
      currentCase: c,
      messages: [buildWelcome(c)],
    });
    setVitalSigns(c.vitalSigns);
  }, [cases]);

  const fluctuateVitals = useCallback(() => {
    if (!state.currentCase) return;
    setVitalSigns((prev) => ({
      ...prev,
      fc: prev.fc + (Math.random() > 0.5 ? 1 : -1),
      sao2: Math.min(100, prev.sao2 + (Math.random() > 0.5 ? 0.1 : -0.1)),
    }));
  }, [state.currentCase]);

  const sendMessage = useCallback(async (text: string) => {
    if (!state.currentCase) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    setState((prev) => ({ ...prev, messages: [...prev.messages, userMsg] }));
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('patient-chat', {
        body: {
          messages: [...state.messages, userMsg],
          caseContext: state.currentCase,
        },
      });

      if (error) {
        setState((prev) => ({
          ...prev,
          messages: [...prev.messages, { role: 'system' as const, content: 'Erro de conexão com o paciente.' }],
        }));
      } else {
        const reply: ChatMessage = { role: 'patient', content: data.content };

        if (data.empathy) {
          const empathyData = data.empathy as EmpathyData;
          setState((prev) => {
            const newHistory = [...prev.empathyHistory, empathyData];
            const avgScore = Math.round(
              (newHistory.reduce((sum, e) => sum + e.score, 0) / newHistory.length) * 10
            );
            return {
              ...prev,
              messages: [...prev.messages, reply],
              empathyScore: Math.min(100, avgScore),
              empathyHistory: newHistory,
            };
          });
        } else {
          setState((prev) => ({ ...prev, messages: [...prev.messages, reply] }));
        }
      }
    } catch {
      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, { role: 'system' as const, content: 'Erro de conexão com o paciente.' }],
      }));
    } finally {
      setIsLoading(false);
    }
  }, [state.messages, state.currentCase]);

  const performPhysicalExam = useCallback(() => {
    if (!state.currentCase || state.physicalExamDone) return;
    const examText = Object.entries(state.currentCase.physicalExam)
      .map(([k, v]) => `**${k}:** ${v}`)
      .join('\n');
    const msg: ChatMessage = { role: 'system', content: `📋 **Exame Físico Realizado:**\n${examText}` };
    setState((prev) => ({
      ...prev,
      physicalExamDone: true,
      reasoningScore: Math.max(0, prev.reasoningScore + 5),
      messages: [...prev.messages, msg],
    }));
  }, [state.currentCase, state.physicalExamDone]);

  const requestExam = useCallback((exam: string) => {
    if (!state.currentCase) return;
    const isUnnecessary = state.currentCase.unnecessaryExams.includes(exam);
    const result = state.currentCase.labResults[exam] || 'Resultado dentro dos parâmetros normais.';
    const msg: ChatMessage = {
      role: 'system',
      content: `🔬 **${exam}:** ${result}`,
    };
    setState((prev) => ({
      ...prev,
      examsRequested: [...prev.examsRequested, exam],
      costEffectiveness: isUnnecessary ? Math.max(0, prev.costEffectiveness - 10) : prev.costEffectiveness,
      messages: [...prev.messages, msg],
    }));
  }, [state.currentCase]);

  const submitDiagnosis = useCallback((diagnosis: string) => {
    setState((prev) => ({ ...prev, isFinished: true, diagnosisAttempt: diagnosis }));
  }, []);

  return {
    state,
    cases,
    casesLoading,
    casesError,
    retryCases,
    vitalSigns,
    isLoading,
    loadCase,
    fluctuateVitals,
    sendMessage,
    performPhysicalExam,
    requestExam,
    submitDiagnosis,
  };
};
