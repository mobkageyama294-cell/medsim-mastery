import { useState, useCallback } from 'react';
import { ClinicalCase, CLINICAL_CASES } from '@/data/clinicalCases';

export interface ChatMessage {
  id: string;
  role: 'user' | 'patient' | 'system';
  content: string;
  timestamp: Date;
}

export interface SimulationState {
  currentCase: ClinicalCase;
  studentLevel: string;
  reasoningScore: number;
  patientHealth: number;
  costEffectiveness: number;
  messages: ChatMessage[];
  examsRequested: string[];
  physicalExamDone: boolean;
  isFinished: boolean;
  diagnosisAttempt: string | null;
  actionsLog: string[];
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export function useSimulation() {
  const [state, setState] = useState<SimulationState>(() => ({
    currentCase: CLINICAL_CASES[0],
    studentLevel: 'Residente R1',
    reasoningScore: 100,
    patientHealth: 85,
    costEffectiveness: 100,
    messages: [
      {
        id: generateId(),
        role: 'system',
        content: `Caso iniciado: **${CLINICAL_CASES[0].title}**. O paciente ${CLINICAL_CASES[0].patientName}, ${CLINICAL_CASES[0].patientAge} anos, ${CLINICAL_CASES[0].patientSex === 'M' ? 'masculino' : 'feminino'}, acaba de chegar à emergência. Inicie a anamnese.`,
        timestamp: new Date(),
      },
      {
        id: generateId(),
        role: 'patient',
        content: CLINICAL_CASES[0].chiefComplaint,
        timestamp: new Date(),
      },
    ],
    examsRequested: [],
    physicalExamDone: false,
    isFinished: false,
    diagnosisAttempt: null,
    actionsLog: [],
  }));

  const [vitalSigns, setVitalSigns] = useState(CLINICAL_CASES[0].vitalSigns);

  // Simulate vital sign fluctuations
  const fluctuateVitals = useCallback(() => {
    setState(prev => {
      const base = prev.currentCase.vitalSigns;
      const healthFactor = prev.patientHealth / 100;
      setVitalSigns({
        pa: base.pa,
        fc: Math.round(base.fc + (Math.random() - 0.5) * 8 + (1 - healthFactor) * 15),
        sao2: Math.max(85, Math.min(100, Math.round(base.sao2 + (Math.random() - 0.5) * 2 - (1 - healthFactor) * 5))),
        temp: +(base.temp + (Math.random() - 0.5) * 0.3).toFixed(1),
        fr: Math.round(base.fr + (Math.random() - 0.5) * 3 + (1 - healthFactor) * 4),
      });
      return prev;
    });
  }, []);

  const sendMessage = useCallback((content: string) => {
    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    // Simulate patient response
    const responses = [
      'Sim, doutor(a)... a dor começou de repente...',
      'Não, nunca tive isso antes...',
      'Estou com muito medo... o que está acontecendo comigo?',
      'A dor está muito forte... não consigo ficar deitado...',
      'Minha família tem problema de coração, sim...',
      'Tomo remédio pra pressão, mas às vezes esqueço...',
      'Fumei a vida toda... uns 2 maços por dia...',
      'A dor irradia pro braço esquerdo... e pro queixo também...',
    ];

    const patientMsg: ChatMessage = {
      id: generateId(),
      role: 'patient',
      content: responses[Math.floor(Math.random() * responses.length)],
      timestamp: new Date(),
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMsg, patientMsg],
      reasoningScore: Math.min(100, prev.reasoningScore + 2),
    }));
  }, []);

  const performPhysicalExam = useCallback(() => {
    setState(prev => {
      if (prev.physicalExamDone) return prev;
      const examEntries = Object.entries(prev.currentCase.physicalExam);
      const examText = examEntries.map(([area, finding]) => `**${area}:** ${finding}`).join('\n\n');
      
      return {
        ...prev,
        physicalExamDone: true,
        reasoningScore: Math.min(100, prev.reasoningScore + 5),
        actionsLog: [...prev.actionsLog, 'Exame físico realizado'],
        messages: [
          ...prev.messages,
          {
            id: generateId(),
            role: 'system',
            content: `📋 **Exame Físico Completo:**\n\n${examText}`,
            timestamp: new Date(),
          },
        ],
      };
    });
  }, []);

  const requestExam = useCallback((examName: string) => {
    setState(prev => {
      if (prev.examsRequested.includes(examName)) return prev;
      
      const result = prev.currentCase.labResults[examName];
      const isUnnecessary = prev.currentCase.unnecessaryExams.includes(examName);
      
      const costPenalty = isUnnecessary ? 15 : 0;
      const healthPenalty = isUnnecessary ? 3 : 0;
      
      const sysMsg: ChatMessage = {
        id: generateId(),
        role: 'system',
        content: result
          ? `🔬 **Resultado — ${examName}:**\n\n${result}`
          : isUnnecessary
          ? `⚠️ **${examName}** — Exame não indicado para este quadro clínico. Custo-efetividade penalizada.`
          : `🔬 **${examName}:** Resultado dentro da normalidade.`,
        timestamp: new Date(),
      };

      return {
        ...prev,
        examsRequested: [...prev.examsRequested, examName],
        costEffectiveness: Math.max(0, prev.costEffectiveness - costPenalty),
        patientHealth: Math.max(0, prev.patientHealth - healthPenalty),
        reasoningScore: isUnnecessary ? Math.max(0, prev.reasoningScore - 8) : Math.min(100, prev.reasoningScore + 3),
        actionsLog: [...prev.actionsLog, `Exame solicitado: ${examName}`],
        messages: [...prev.messages, sysMsg],
      };
    });
  }, []);

  const submitDiagnosis = useCallback((diagnosis: string) => {
    setState(prev => {
      const correct = prev.currentCase.correctDiagnosis.toLowerCase();
      const attempt = diagnosis.toLowerCase();
      const isCorrect = correct.includes(attempt) || attempt.includes('infarto') || attempt.includes('iam');
      
      return {
        ...prev,
        isFinished: true,
        diagnosisAttempt: diagnosis,
        reasoningScore: isCorrect ? Math.min(100, prev.reasoningScore + 15) : Math.max(0, prev.reasoningScore - 20),
        patientHealth: isCorrect ? prev.patientHealth : Math.max(0, prev.patientHealth - 20),
      };
    });
  }, []);

  const resetSimulation = useCallback((caseIndex = 0) => {
    const newCase = CLINICAL_CASES[caseIndex % CLINICAL_CASES.length];
    setState({
      currentCase: newCase,
      studentLevel: 'Residente R1',
      reasoningScore: 100,
      patientHealth: 85,
      costEffectiveness: 100,
      messages: [
        {
          id: generateId(),
          role: 'system',
          content: `Caso iniciado: **${newCase.title}**. O paciente ${newCase.patientName}, ${newCase.patientAge} anos, ${newCase.patientSex === 'M' ? 'masculino' : 'feminino'}, acaba de chegar à emergência. Inicie a anamnese.`,
          timestamp: new Date(),
        },
        {
          id: generateId(),
          role: 'patient',
          content: newCase.chiefComplaint,
          timestamp: new Date(),
        },
      ],
      examsRequested: [],
      physicalExamDone: false,
      isFinished: false,
      diagnosisAttempt: null,
      actionsLog: [],
    });
    setVitalSigns(newCase.vitalSigns);
  }, []);

  return {
    state,
    vitalSigns,
    fluctuateVitals,
    sendMessage,
    performPhysicalExam,
    requestExam,
    submitDiagnosis,
    resetSimulation,
  };
}
