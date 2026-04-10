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
   setVitalSigns(newCase.vitalSigns);}, [selectedCase]);
{
      id: "3",
      title: "Dor Abdominal Aguda - Caso Dona Mercedes",
      specialty: "Semiologia Abdominal (Portinho)",
      correctDiagnosis: "Colecistite Aguda",
      baseVitals: { bp: "135/85", hr: 92, ox: 96 },
      labResults: { 
        "Sinal de Murphy": "Positivo (Interrupção súbita da inspiração à palpação profunda do ponto cístico)", 
        "Hemograma": "Leucocitose com desvio à esquerda",
        "Ultrassom de Abdome": "Vesícula biliar com paredes espessadas (>4mm) e cálculos impactados no infundíbulo",
        "Exame Físico": "Dor à palpação em hipocôndrio direito, sem sinais de peritonite generalizada"
      },
      unnecessaryExams: ["Troponina", "Endoscopia Digestiva Alta", "Amilase"]
    },
    {
      id: "4",
      title: "Dispneia e Edema - Caso Sr. Waldir",
      specialty: "Semiologia Cardiovascular (Guyton)",
      correctDiagnosis: "Insuficiência Cardíaca Congestiva",
      baseVitals: { bp: "160/100", hr: 110, ox: 89 },
      labResults: { 
        "Ictus Cordis": "Desviado para o 6º espaço intercostal esquerdo, linha axilar anterior (Portinho)", 
        "Ausculta Pulmonar": "Estertores finos (crepitantes) em bases pulmonares bilateralmente",
        "Ausculta Cardíaca": "Presença de Terceira Bulha (B3), sugerindo sobrecarga de volume (Guyton)",
        "Raio-X de Tórax": "Congestão hilária e aumento da área cardíaca"
      },
      unnecessaryExams: ["D-Dímero", "Cintilografia Óssea", "Colonoscopia"]
    },
    {
      id: "5",
      title: "Cefaleia e Rigidez - Caso Jovem Lucas",
      specialty: "Semiologia Neurológica (Portinho)",
      correctDiagnosis: "Meningite Bacteriana",
      baseVitals: { bp: "110/70", hr: 118, ox: 95 },
      labResults: { 
        "Sinal de Kernig": "Positivo (Resistência e dor à extensão da perna com a coxa flexionada)", 
        "Sinal de Brudzinski": "Positivo (Flexão involuntária das pernas ao flexionar o pescoço)",
        "Líquor": "Aspecto turvo, hipercitose neutrofílica, glicose baixa e proteína elevada",
        "Fundo de Olho": "Sem evidência de papiledema"
      },
      unnecessaryExams: ["Eletroencefalograma", "Ressonância Magnética de Crânio", "Ecocardiograma"]
    },
    {
      id: "6",
      title: "Dor Lombar Irradiada - Caso Ricardo",
      specialty: "Decálogo da Dor (Nefrologia)",
      correctDiagnosis: "Litíase Renal",
      baseVitals: { bp: "150/90", hr: 105, ox: 98 },
      labResults: { 
        "Característica da Dor": "Início súbito, tipo cólica, intensidade 9/10, irradiando para região inguinal e testículo (Decálogo)", 
        "Punho-Percussão (Sinal de Giordano)": "Positivo à direita",
        "EAS (Urina 1)": "Hematúria microscópica intensa",
        "Tomografia (Protocolo Stone)": "Cálculo de 6mm em ureter proximal direito"
      },
      unnecessaryExams: ["Amilase", "Raio-X de Tórax", "D-Dímero"]
    },
    {
      id: "7",
      title: "Febre e Tosse Produtiva - Caso Camila",
      specialty: "Semiologia Pulmonar (Portinho)",
      correctDiagnosis: "Pneumonia Lobar",
      baseVitals: { bp: "115/75", hr: 102, ox: 91 },
      labResults: { 
        "Frêmito Toraco-Vocal (FTV)": "Aumentado em terço inferior do hemitórax direito (Portinho)", 
        "Percussão": "Macicez em base pulmonar direita",
        "Ausculta": "Sopro tubário e estertores crepitantes em base direita",
        "Raio-X de Tórax": "Consolidação alveolar com broncogramas aéreos em lobo inferior direito"
      },
      
      unnecessaryExams: ["Espirometria", "Ecocardiograma", "Troponina"]
    },
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
