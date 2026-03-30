import { motion } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { RotateCcw, Award, TrendingUp, Shield, Heart, DollarSign } from 'lucide-react';
import { SimulationState } from '@/hooks/useSimulation';

interface FeedbackReportProps {
  state: SimulationState;
  onRestart: () => void;
}

export default function FeedbackReport({ state, onRestart }: FeedbackReportProps) {
  const isCorrectDiagnosis = state.diagnosisAttempt && (
    state.currentCase.correctDiagnosis.toLowerCase().includes(state.diagnosisAttempt.toLowerCase()) ||
    state.diagnosisAttempt.toLowerCase().includes('infarto') ||
    state.diagnosisAttempt.toLowerCase().includes('iam') ||
    state.diagnosisAttempt.toLowerCase().includes('hemorragia')
  );

  const precision = isCorrectDiagnosis ? 90 : 30;
  const empathy = Math.min(100, 50 + state.messages.filter(m => m.role === 'user').length * 5);
  const safety = state.patientHealth;
  const cost = state.costEffectiveness;
  const overall = Math.round((precision + empathy + safety + cost) / 4);

  const data = [
    { subject: 'Precisão Diagnóstica', value: precision },
    { subject: 'Empatia', value: empathy },
    { subject: 'Custo-Efetividade', value: cost },
    { subject: 'Segurança do Paciente', value: safety },
  ];

  const metrics = [
    { icon: TrendingUp, label: 'Precisão Diagnóstica', value: precision, color: 'text-primary' },
    { icon: Heart, label: 'Empatia', value: empathy, color: 'text-accent' },
    { icon: DollarSign, label: 'Custo-Efetividade', value: cost, color: 'text-warning' },
    { icon: Shield, label: 'Segurança', value: safety, color: 'text-success' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center p-4"
    >
      <div className="glass-card glow-primary p-8 w-full max-w-3xl space-y-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
            <Award className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-gradient-primary">Relatório de Desempenho</h2>
          <p className="text-sm text-muted-foreground">{state.currentCase.title}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={data}>
                <PolarGrid stroke="hsl(217 33% 18%)" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: 'hsl(215 20% 55%)', fontSize: 11 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fill: 'hsl(215 20% 55%)', fontSize: 10 }}
                />
                <Radar
                  name="Desempenho"
                  dataKey="value"
                  stroke="hsl(199 89% 48%)"
                  fill="hsl(199 89% 48%)"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            {metrics.map((m) => (
              <div key={m.label} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                <m.icon className={`w-5 h-5 ${m.color}`} />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${m.value}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                      />
                    </div>
                    <span className="text-sm font-mono font-semibold">{m.value}%</span>
                  </div>
                </div>
              </div>
            ))}

            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-center">
              <p className="text-xs text-muted-foreground mb-1">Pontuação Geral</p>
              <p className="text-3xl font-bold text-gradient-primary">{overall}%</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
            <p className="text-xs text-muted-foreground mb-1">Seu Diagnóstico</p>
            <p className="text-sm font-medium">{state.diagnosisAttempt || 'Não informado'}</p>
          </div>
          <div className={`p-4 rounded-lg border ${isCorrectDiagnosis ? 'bg-success/5 border-success/20' : 'bg-destructive/5 border-destructive/20'}`}>
            <p className="text-xs text-muted-foreground mb-1">Diagnóstico Correto</p>
            <p className="text-sm font-medium">{state.currentCase.correctDiagnosis}</p>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          Iniciar Novo Caso
        </button>
      </div>
    </motion.div>
  );
}
