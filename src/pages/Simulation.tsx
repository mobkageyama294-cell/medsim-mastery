import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import DashboardHeader from '@/components/simulation/DashboardHeader';
import CasePanel from '@/components/simulation/CasePanel';
import ChatInterface from '@/components/simulation/ChatInterface';
import ActionPanel from '@/components/simulation/ActionPanel';
import FeedbackReport from '@/components/simulation/FeedbackReport';
import { useSimulation } from '@/hooks/useSimulation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Simulation() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    state,
    casesLoading,
    casesError,
    retryCases,
    vitalSigns,
    isLoading,
    fluctuateVitals,
    sendMessage,
    performPhysicalExam,
    requestExam,
    submitDiagnosis,
  } = useSimulation(caseId);
  const currentCase = state.currentCase;
  const [startedAt] = useState(() => Date.now());
  const durationRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(fluctuateVitals, 3000);
    return () => clearInterval(interval);
  }, [fluctuateVitals]);

  useEffect(() => {
    if (state.isFinished) {
      durationRef.current = Math.round((Date.now() - startedAt) / 1000);
    }
  }, [state.isFinished, startedAt]);

  // case_history persistence is now handled inside FeedbackReport (with full score breakdown)

  // Error state
  if (casesError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{casesError}</AlertDescription>
        </Alert>
        <div className="mt-4 flex items-center gap-4">
          <button onClick={retryCases} className="text-sm text-primary hover:underline">
            Tentar Novamente
          </button>
          <button onClick={() => navigate('/')} className="text-sm text-primary hover:underline">
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (casesLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
        <p className="text-muted-foreground font-medium">Preparando prontuário...</p>
      </div>
    );
  }

  if (!currentCase) {
    return <div className="flex min-h-screen items-center justify-center p-4 text-muted-foreground">Carregando caso clínico...</div>;
  }

  if (state.isFinished) {
    return <FeedbackReport state={state} durationSeconds={durationRef.current} onRestart={() => navigate('/')} />;
  }

  const availableExams = Object.keys(currentCase?.labResults || {});

  return (
    <div className="min-h-screen p-3 md:p-5 space-y-4 max-w-[1600px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <DashboardHeader
          studentLevel={state.studentLevel}
          reasoningScore={state.reasoningScore}
          patientHealth={state.patientHealth}
          costEffectiveness={state.costEffectiveness}
          empathyScore={state.empathyScore}
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-4">
          <CasePanel clinicalCase={currentCase} vitalSigns={vitalSigns} />
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
          availableUnnecessaryExams={currentCase.unnecessaryExams}
          clinicalCase={currentCase}
        />
      </motion.div>
    </div>
  );
}
