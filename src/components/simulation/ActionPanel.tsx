import { useState } from 'react';
import { Stethoscope, FlaskConical, Pill, Target, Flag, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ActionPanelProps {
  onPhysicalExam: () => void;
  onRequestExam: (exam: string) => void;
  onSubmitDiagnosis: (diagnosis: string) => void;
  onFinishCase: () => void;
  physicalExamDone: boolean;
  examsRequested: string[];
  availableExams: string[];
  availableUnnecessaryExams: string[];
}

type ModalType = 'exams' | 'diagnosis' | 'prescribe' | null;

export default function ActionPanel({
  onPhysicalExam,
  onRequestExam,
  onSubmitDiagnosis,
  onFinishCase,
  physicalExamDone,
  examsRequested,
  availableExams,
  availableUnnecessaryExams,
}: ActionPanelProps) {
  const [modal, setModal] = useState<ModalType>(null);
  const [diagnosisInput, setDiagnosisInput] = useState('');

  const allExams = [...Object.keys(Object.fromEntries(availableExams.map(e => [e, true]))), ...availableUnnecessaryExams];

  return (
    <>
      <div className="glass-card p-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Ações Rápidas</h3>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
          <button
            onClick={onPhysicalExam}
            disabled={physicalExamDone}
            className="flex items-center gap-2 p-3 rounded-lg border border-border/50 bg-muted/20 hover:bg-primary/10 hover:border-primary/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm"
          >
            <Stethoscope className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium">Exame Físico</span>
          </button>

          <button
            onClick={() => setModal('exams')}
            className="flex items-center gap-2 p-3 rounded-lg border border-border/50 bg-muted/20 hover:bg-primary/10 hover:border-primary/30 transition-all text-sm"
          >
            <FlaskConical className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium">Solicitar Exames</span>
          </button>

          <button
            onClick={() => setModal('prescribe')}
            className="flex items-center gap-2 p-3 rounded-lg border border-border/50 bg-muted/20 hover:bg-accent/10 hover:border-accent/30 transition-all text-sm"
          >
            <Pill className="w-4 h-4 text-accent" />
            <span className="text-xs font-medium">Prescrever</span>
          </button>

          <button
            onClick={() => setModal('diagnosis')}
            className="flex items-center gap-2 p-3 rounded-lg border border-border/50 bg-muted/20 hover:bg-warning/10 hover:border-warning/30 transition-all text-sm"
          >
            <Target className="w-4 h-4 text-warning" />
            <span className="text-xs font-medium">Diagnóstico Final</span>
          </button>

          <button
            onClick={onFinishCase}
            className="flex items-center gap-2 p-3 rounded-lg border border-destructive/30 bg-destructive/5 hover:bg-destructive/10 transition-all text-sm col-span-2 lg:col-span-1"
          >
            <Flag className="w-4 h-4 text-destructive" />
            <span className="text-xs font-medium text-destructive">Finalizar Caso</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card glow-primary p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold">
                  {modal === 'exams' ? '🔬 Solicitar Exames' : modal === 'diagnosis' ? '🎯 Diagnóstico Final' : '💊 Prescrever Conduta'}
                </h3>
                <button onClick={() => setModal(null)} className="p-1 rounded hover:bg-muted/50">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {modal === 'exams' && (
                <div className="space-y-2">
                  {allExams.map((exam) => (
                    <button
                      key={exam}
                      onClick={() => { onRequestExam(exam); }}
                      disabled={examsRequested.includes(exam)}
                      className="w-full text-left p-3 rounded-lg border border-border/50 bg-muted/20 hover:bg-primary/10 hover:border-primary/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm"
                    >
                      {exam} {examsRequested.includes(exam) && '✅'}
                    </button>
                  ))}
                </div>
              )}

              {modal === 'diagnosis' && (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={diagnosisInput}
                    onChange={(e) => setDiagnosisInput(e.target.value)}
                    placeholder="Digite seu diagnóstico final..."
                    className="w-full bg-muted/30 border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                  <button
                    onClick={() => { onSubmitDiagnosis(diagnosisInput); setModal(null); }}
                    disabled={!diagnosisInput.trim()}
                    className="w-full p-3 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 disabled:opacity-30 transition-all"
                  >
                    Confirmar Diagnóstico
                  </button>
                </div>
              )}

              {modal === 'prescribe' && (
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>Prescrição registrada. Em uma versão futura, será possível selecionar medicamentos e dosagens específicas.</p>
                  <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                    <p className="text-accent text-xs font-medium">✅ Conduta sintomática registrada</p>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
