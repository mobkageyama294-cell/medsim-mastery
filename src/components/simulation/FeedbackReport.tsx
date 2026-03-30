import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Activity, DollarSign, Brain, RefreshCcw, Share2 } from 'lucide-react';

export default function FeedbackReport({ state, onRestart }: { state: any, onRestart: () => void }) {
  const isCorrect = state.diagnosisAttempt?.toLowerCase().includes(state.currentCase.correctDiagnosis.toLowerCase());

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-4xl mx-auto p-4 space-y-6"
    >
      <div className="bg-white dark:bg-slate-900 rounded-xl border-t-4 border-t-blue-600 shadow-xl overflow-hidden">
        <div className="p-6 text-center border-b">
          <div className="flex justify-center mb-4">
            {isCorrect ? 
              <CheckCircle2 className="w-16 h-16 text-green-500" /> : 
              <XCircle className="w-16 h-16 text-red-500" />
            }
          </div>
          <h2 className="text-3xl font-bold">
            {isCorrect ? "Diagnóstico Correto!" : "Diagnóstico Incorreto"}
          </h2>
          <p className="text-slate-500">Caso: {state.currentCase.title}</p>
        </div>

        <div className="p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard icon={<Brain className="text-blue-500" />} label="Raciocínio" value={`${state.reasoningScore}%`} />
            <MetricCard icon={<Activity className="text-red-500" />} label="Segurança" value={`${state.patientHealth}%`} />
            <MetricCard icon={<DollarSign className="text-green-500" />} label="Eficiência" value={`${state.costEffectiveness}%`} />
          </div>

          <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-3">Discussão do Caso</h3>
            <p className="text-sm leading-relaxed mb-4">
              O diagnóstico final era <strong>{state.currentCase.correctDiagnosis}</strong>. 
              {isCorrect 
                ? " Você identificou corretamente os sinais de alerta."
                : " Você não identificou os sinais chaves. Estude mais este tema."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <button 
              onClick={onRestart}
              className="flex items-center justify-center gap-2 px-6 py-2 border rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <RefreshCcw className="w-4 h-4" /> Tentar Outro
            </button>
            <button className="flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg">
              <Share2 className="w-4 h-4" /> Compartilhar
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function MetricCard({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex flex-col items-center p-4 bg-white dark:bg-slate-900 border rounded-xl shadow-sm">
      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full mb-2">{icon}</div>
      <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">{label}</span>
      <span className="text-2xl font-bold">{value}</span>
    </div>
  );
}
