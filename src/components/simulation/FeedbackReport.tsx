import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Activity, DollarSign, Brain, RefreshCcw, Share2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function FeedbackReport({ state, onRestart }: { state: any, onRestart: () => void }) {
  const isCorrect = state.diagnosisAttempt.toLowerCase().includes(state.currentCase.correctDiagnosis.toLowerCase());

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-4xl mx-auto p-4 space-y-6"
    >
      <Card className="border-t-4 border-t-primary shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {isCorrect ? 
              <CheckCircle2 className="w-16 h-16 text-green-500" /> : 
              <XCircle className="w-16 h-16 text-red-500" />
            }
          </div>
          <CardTitle className="text-3xl font-bold">
            {isCorrect ? "Diagnóstico Correto!" : "Diagnóstico Incorreto"}
          </CardTitle>
          <p className="text-muted-foreground">Caso: {state.currentCase.title}</p>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Grid de Métricas Principais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard 
              icon={<Brain className="text-blue-500" />} 
              label="Raciocínio Clínico" 
              value={`${state.reasoningScore}%`} 
            />
            <MetricCard 
              icon={<Activity className="text-red-500" />} 
              label="Segurança do Paciente" 
              value={`${state.patientHealth}%`} 
            />
            <MetricCard 
              icon={<DollarSign className="text-green-500" />} 
              label="Custo-Efetividade" 
              value={`${state.costEffectiveness}%`} 
            />
          </div>

          {/* Explicação Clínica - Onde está o valor educacional */}
          <div className="bg-muted p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-3">Discussão do Caso</h3>
            <p className="text-sm leading-relaxed mb-4">
              O diagnóstico final era <strong>{state.currentCase.correctDiagnosis}</strong>. 
              {isCorrect 
                ? " Você identificou corretamente os sinais de alerta e conduziu a investigação de forma assertiva."
                : " Você não identificou os sinais chaves. Lembre-se que em casos assim, a prioridade é descartar emergências fatais."}
            </p>
            <div className="text-xs text-muted-foreground">
              <strong>Exames Solicitados:</strong> {state.examsRequested.join(', ') || 'Nenhum'}
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button onClick={onRestart} variant="outline" className="flex gap-2">
              <RefreshCcw className="w-4 h-4" /> Tentar Outro Caso
            </Button>
            <Button className="flex gap-2 bg-primary">
              <Share2 className="w-4 h-4" /> Compartilhar Desempenho
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function MetricCard({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex flex-col items-center p-4 bg-background border rounded-xl shadow-sm">
      <div className="p-2 bg-muted rounded-full mb-2">{icon}</div>
      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</span>
      <span className="text-2xl font-bold">{value}</span>
    </div>
  );
}
