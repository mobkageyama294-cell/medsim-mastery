import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import DashboardHeader from '@/components/simulation/DashboardHeader';
import CasePanel from '@/components/simulation/CasePanel';
import ChatInterface from '@/components/simulation/ChatInterface';
import ActionPanel from '@/components/simulation/ActionPanel';
import FeedbackReport from '@/components/simulation/FeedbackReport';
import { useSimulation } from '@/hooks/useSimulation';

export default function Index() {
  const {
    state,
    vitalSigns,
    isLoading,
    fluctuateVitals,
    sendMessage,
    performPhysicalExam,
    requestExam,
    submitDiagnosis,
    resetSimulation,
  } = useSimulation();

  useEffect(() => {
    const interval = setInterval(fluctuateVitals, 3000);
    return () => clearInterval(interval);
  }, [fluctuateVitals]);

  if (state.isFinished) {
    return <FeedbackReport state={state} onRestart={() => resetSimulation(1)} />;
  }
// Trava de segurança para esperar o JSON carregar
  if (!state.currentCase) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-slate-600 font-medium">Preparando prontuário do paciente...</p>
      </div>
    );
  }
  const availableExams = Object.keys(state.currentCase.labResults);

  return (
    <div className="min-h-screen p-3 md:p-5 space-y-4 max-w-[1600px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <DashboardHeader
          studentLevel={state.studentLevel}
          reasoningScore={state.reasoningScore}
          patientHealth={state.patientHealth}
          costEffectiveness={state.costEffectiveness}
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-4"
        >
          <CasePanel clinicalCase={state.currentCase} vitalSigns={vitalSigns} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-8 h-[500px] lg:h-[600px]"
        >
          <ChatInterface messages={state.messages} onSendMessage={sendMessage} isLoading={isLoading} />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <ActionPanel
          onPhysicalExam={performPhysicalExam}
          onRequestExam={requestExam}
          onSubmitDiagnosis={submitDiagnosis}
          onFinishCase={() => submitDiagnosis(state.diagnosisAttempt || 'Não informado')}
          physicalExamDone={state.physicalExamDone}
          examsRequested={state.examsRequested}
          availableExams={availableExams}
          availableUnnecessaryExams={state.currentCase.unnecessaryExams}
        />
      </motion.div>
    </div>
  );
}
