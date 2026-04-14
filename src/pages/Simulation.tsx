import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardHeader from '@/components/simulation/DashboardHeader';
import CasePanel from '@/components/simulation/CasePanel';
import ChatInterface from '@/components/simulation/ChatInterface';
import ActionPanel from '@/components/simulation/ActionPanel';
import FeedbackReport from '@/components/simulation/FeedbackReport';
import { useSimulation } from '@/hooks/useSimulation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export default function Simulation() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    state,
    vitalSigns,
    isLoading,
    fluctuateVitals,
    sendMessage,
    performPhysicalExam,
    requestExam,
    submitDiagnosis,
  } = useSimulation(caseId);

  useEffect(() => {
    const interval = setInterval(fluctuateVitals, 3000);
    return () => clearInterval(interval);
  }, [fluctuateVitals]);

  useEffect(() => {
    if (state.isFinished && user && state.currentCase) {
      const isCorrect = state.diagnosisAttempt
        ?.toLowerCase()
        .includes(state.currentCase.correctDiagnosis.toLowerCase().substring(0, 20));

      supabase.from('case_history').insert({
        user_id: user.id,
        case_id: state.currentCase.id,
        case_title: state.currentCase.title,
        diagnosis_attempt: state.diagnosisAttempt,
        correct_diagnosis: state.currentCase.correctDiagnosis,
        reasoning_score: state.reasoningScore,
        patient_health: state.patientHealth,
        cost_effectiveness: state.costEffectiveness,
        is_correct: !!isCorrect,
      }).then(({ error }) => {
        if (error) console.error('Failed to save case history:', error);
      });
    }
  }, [state.isFinished]);

  if (state.isFinished) {
    return <FeedbackReport state={state} onRestart={() => navigate('/')} />;
  }

  if (!state.currentCase) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
        <p className="text-muted-foreground font-medium">Preparando prontuário...</p>
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
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-4">
          <CasePanel clinicalCase={state.currentCase} vitalSigns={vitalSigns} />
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-8 h-[500px] lg:h-[600px]">
          <ChatInterface messages={state.messages} onSendMessage={sendMessage} isLoading={isLoading} />
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
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
