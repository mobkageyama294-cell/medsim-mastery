import { useState, useEffect, useCallback, useRef } from 'react';
import { ClinicalCase, CLINICAL_CASES } from '@/data/clinicalCases';
import { supabase } from '@/integrations/supabase/client';

export type MessageRole = 'system' | 'user' | 'assistant' | 'patient';

export interface ChatMessage {
  role: MessageRole;
  content: string;
}

export interface SimulationState {
  isFinished: boolean;
  studentLevel: string;
  reasoningScore: number;
  patientHealth: number;
  costEffectiveness: number;
  physicalExamDone: boolean;
  examsRequested: string[];
  messages: ChatMessage[];
  currentCase: ClinicalCase | null;
  diagnosisAttempt: string;
}

export const useSimulation = (caseId?: string) => {
  const selectedCase = CLINICAL_CASES.find(c => c.id === caseId) || CLINICAL_CASES[0];

  const [state, setState] = useState<SimulationState>({
    isFinished: false,
    studentLevel: 'Internato',
    reasoningScore: 100,
    patientHealth: 100,
    costEffectiveness: 100,
    physicalExamDone: false,
    examsRequested: [],
    messages: [{ role: 'system', content: `Paciente ${selectedCase.patientName}, ${selectedCase.patientAge}a, deu entrada com queixa de: "${selectedCase.chiefComplaint}"` }],
    currentCase: selectedCase,
    diagnosisAttempt: '',
  });

  const [vitalSigns, setVitalSigns] = useState(selectedCase.vitalSigns);
  const [isLoading, setIsLoading] = useState(false);
  const stateRef = useRef(state);

  useEffect(() => { stateRef.current = state; }, [state]);

  const fluctuateVitals = useCallback(() => {
    setVitalSigns(prev => ({
      ...prev,
      fc: prev.fc + (Math.random() > 0.5 ? 1 : -1),
      sao2: Math.min(100, Math.max(85, prev.sao2 + (Math.random() > 0.5 ? 0.1 : -0.1))),
      fr: prev.fr + (Math.random() > 0.7 ? 1 : Math.random() < 0.3 ? -1 : 0),
    }));
  }, []);

  const sendMessage = useCallback(async (msg: string) => {
    if (!stateRef.current.currentCase) return;
    const userMsg: ChatMessage = { role: 'user', content: msg };
    setState(prev => ({ ...prev, messages: [...prev.messages, userMsg] }));
    setIsLoading(true);

    try {
      const caseCtx = stateRef.current.currentCase;
      const { data, error } = await supabase.functions.invoke('patient-chat', {
        body: {
          messages: [...stateRef.current.messages, userMsg],
          caseContext: {
            patientName: caseCtx.patientName,
            patientAge: caseCtx.patientAge,
            patientSex: caseCtx.patientSex,
            chiefComplaint: caseCtx.chiefComplaint,
            history: caseCtx.history,
            patientPersonality: caseCtx.patientPersonality,
            vitalSigns: vitalSigns,
          },
        },
      });

      const content = error ? 'Desculpe, não consigo responder agora...' : (data?.content || '...');
      setState(prev => ({ ...prev, messages: [...prev.messages, { role: 'patient', content }] }));
    } catch {
      setState(prev => ({ ...prev, messages: [...prev.messages, { role: 'patient', content: '...não consigo falar agora...' }] }));
    } finally {
      setIsLoading(false);
    }
  }, [vitalSigns]);

  const performPhysicalExam = useCallback(() => {
    if (!state.currentCase || state.physicalExamDone) return;
    const examText = Object.entries(state.currentCase.physicalExam)
      .map(([area, finding]) => `**${area}:** ${finding}`)
      .join('\n');
    setState(prev => ({
      ...prev,
      physicalExamDone: true,
      messages: [...prev.messages, { role: 'system', content: `📋 **Exame Físico Completo:**\n${examText}` }],
    }));
  }, [state.currentCase, state.physicalExamDone]);

  const requestExam = useCallback((exam: string) => {
    if (!state.currentCase) return;
    const isUnnecessary = state.currentCase.unnecessaryExams.includes(exam);
    const result = state.currentCase.labResults[exam] || 'Resultado dentro dos parâmetros normais.';

    setState(prev => ({
      ...prev,
      examsRequested: [...prev.examsRequested, exam],
      costEffectiveness: isUnnecessary ? Math.max(0, prev.costEffectiveness - 15) : prev.costEffectiveness,
      reasoningScore: isUnnecessary ? Math.max(0, prev.reasoningScore - 5) : prev.reasoningScore,
      messages: [
        ...prev.messages,
        { role: 'system', content: `🔬 **Resultado — ${exam}:** ${result}${isUnnecessary ? '\n⚠️ *Exame considerado desnecessário para este caso.*' : ''}` },
      ],
    }));
  }, [state.currentCase]);

  const submitDiagnosis = useCallback((diagnosis: string) => {
    setState(prev => ({ ...prev, isFinished: true, diagnosisAttempt: diagnosis }));
  }, []);

  const resetSimulation = useCallback((caseIndex?: number) => {
    const newCase = caseIndex !== undefined ? CLINICAL_CASES[caseIndex] : selectedCase;
    setState({
      isFinished: false,
      studentLevel: 'Internato',
      reasoningScore: 100,
      patientHealth: 100,
      costEffectiveness: 100,
      physicalExamDone: false,
      examsRequested: [],
      messages: [{ role: 'system', content: `Paciente ${newCase.patientName}, ${newCase.patientAge}a, deu entrada com queixa de: "${newCase.chiefComplaint}"` }],
      currentCase: newCase,
      diagnosisAttempt: '',
    });
    setVitalSigns(newCase.vitalSigns);
  }, [selectedCase]);

  return {
    state,
    vitalSigns,
    isLoading,
    fluctuateVitals,
    sendMessage,
    performPhysicalExam,
    requestExam,
    submitDiagnosis,
    resetSimulation,
  };
};
