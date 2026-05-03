import { motion } from 'framer-motion';
import {
  CheckCircle2, XCircle, RefreshCcw, Share2, HandHeart, Brain,
  Stethoscope, FlaskConical, AlertTriangle, Sparkles,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { calculateFinalScore } from '@/lib/scoring';
import type { EmpathyData } from '@/hooks/useSimulation';

export default function FeedbackReport({ state, onRestart }: { state: any; onRestart: () => void }) {
  const currentCase = state?.currentCase;
  const correctDx = currentCase?.correctDiagnosis ?? 'Não informado';
  const attempt = state?.diagnosisAttempt?.trim() || 'Não informado';

  const score = calculateFinalScore({
    diagnosisAttempt: state?.diagnosisAttempt,
    empathyScore: state?.empathyScore,
    empathyHistory: state?.empathyHistory ?? [],
    examsRequested: state?.examsRequested ?? [],
    messages: state?.messages ?? [],
    currentCase,
  });

  const isCorrect = score.diagnosisMatch === 'exact';
  const empathyHistory: EmpathyData[] = state?.empathyHistory ?? [];

  const totalColor =
    score.total >= 80 ? 'text-success' : score.total >= 50 ? 'text-warning' : 'text-destructive';

  const criteria = [
    { label: 'Tratamento Humanitário', value: score.humanitarian, icon: HandHeart },
    { label: 'Acurácia Diagnóstica', value: score.accuracy, icon: Brain },
    { label: 'Linguagem Técnica', value: score.technicalLanguage, icon: Stethoscope },
    { label: 'Eficiência na Investigação', value: score.efficiency, icon: FlaskConical },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-4xl mx-auto p-4 space-y-6"
    >
      <div className="glass-card glow-primary p-8 text-center">
        <div className="flex justify-center mb-3">
          {isCorrect ? <CheckCircle2 className="w-12 h-12 text-success" /> : <XCircle className="w-12 h-12 text-destructive" />}
        </div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Nota Final</p>
        <div className={`text-7xl font-bold tabular-nums ${totalColor}`}>
          {score.total}<span className="text-2xl text-muted-foreground">/100</span>
        </div>
        <p className="text-sm text-muted-foreground mt-3">
          Resumo da Simulação · {currentCase?.specialty ?? 'Caso Clínico'}
        </p>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold mb-5 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" /> Avaliação por Critério
        </h3>
        <div className="space-y-5">
          {criteria.map((c) => {
            const pct = (c.value / 25) * 100;
            const barColor = pct >= 80 ? 'bg-success' : pct >= 50 ? 'bg-warning' : 'bg-destructive';
            return (
              <div key={c.label}>
                <div className="flex items-center justify-between mb-1.5 text-sm">
                  <div className="flex items-center gap-2">
                    <c.icon className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{c.label}</span>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">
                    {c.value}<span className="opacity-60">/25</span>
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div className={`h-full ${barColor} transition-all duration-700`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass-card p-5 border border-success/20">
          <p className="text-[10px] uppercase tracking-widest text-success mb-1">Diagnóstico Correto</p>
          <p className="text-sm font-semibold text-foreground">{correctDx}</p>
        </div>
        <div className={`glass-card p-5 border ${isCorrect ? 'border-success/20' : 'border-destructive/20'}`}>
          <p className={`text-[10px] uppercase tracking-widest mb-1 ${isCorrect ? 'text-success' : 'text-destructive'}`}>
            Sua Hipótese
          </p>
          <p className="text-sm font-semibold text-foreground">{attempt}</p>
          <Badge variant="outline" className={`mt-2 text-[10px] ${
            score.diagnosisMatch === 'exact' ? 'border-success/40 text-success' :
            score.diagnosisMatch === 'partial' ? 'border-warning/40 text-warning' :
            'border-destructive/40 text-destructive'
          }`}>
            {score.diagnosisMatch === 'exact' ? 'Acerto pleno' :
             score.diagnosisMatch === 'partial' ? 'Parcialmente correto' : 'Incorreto'}
          </Badge>
        </div>
      </div>

      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-warning" /> Exames Desnecessários Solicitados
        </h3>
        {score.unnecessaryRequested.length === 0 ? (
          <p className="text-xs text-success">✓ Nenhum exame supérfluo — investigação eficiente.</p>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 mb-3">
              {score.unnecessaryRequested.map((e) => (
                <Badge key={e} variant="outline" className="border-destructive/30 text-destructive bg-destructive/5">{e}</Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Estes exames não eram necessários para o quadro e geraram custos e desconforto evitáveis.
            </p>
          </>
        )}
      </div>

      <div className="glass-card p-5 border border-primary/20 bg-primary/5">
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" /> Observações de Melhoria
        </h3>
        <p className="text-sm leading-relaxed text-foreground">{score.autoFeedback}</p>
      </div>

      {empathyHistory.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <HandHeart className="w-4 h-4 text-accent" /> Análise de Empatia
          </h3>
          <Progress value={state?.empathyScore ?? 0} />
          <p className="text-xs text-muted-foreground mt-2">
            Pontuação média: {state?.empathyScore ?? 0}% em {empathyHistory.length} interações.
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <button
          onClick={onRestart}
          className="flex items-center justify-center gap-2 px-6 py-2.5 border border-border rounded-lg hover:bg-muted/50 text-foreground transition-colors"
        >
          <RefreshCcw className="w-4 h-4" /> Tentar Outro Caso
        </button>
        <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/80 transition-colors shadow-lg">
          <Share2 className="w-4 h-4" /> Compartilhar Resultado
        </button>
      </div>
    </motion.div>
  );
}
