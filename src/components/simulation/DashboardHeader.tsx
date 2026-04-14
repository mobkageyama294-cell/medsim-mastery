import { GraduationCap, Brain, HeartPulse, DollarSign, HandHeart } from 'lucide-react';
import { motion } from 'framer-motion';

interface DashboardHeaderProps {
  studentLevel: string;
  reasoningScore: number;
  patientHealth: number;
  costEffectiveness: number;
  empathyScore?: number;
}

function HealthBar({ value, label, icon: Icon, color }: { value: number; label: string; icon: any; color: string }) {
  const barColor = value > 60 ? 'bg-success' : value > 30 ? 'bg-warning' : 'bg-destructive';

  return (
    <div className="flex items-center gap-3 min-w-0">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-muted-foreground truncate">{label}</span>
          <span className="text-xs font-mono font-semibold text-foreground">{value}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${barColor}`}
            initial={{ width: '100%' }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </div>
    </div>
  );
}

export default function DashboardHeader({ studentLevel, reasoningScore, patientHealth, costEffectiveness, empathyScore = 50 }: DashboardHeaderProps) {
  return (
    <header className="glass-card glow-primary p-4">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <span className="text-xl">🩺</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gradient-primary">MedSim Pro</h1>
            <p className="text-xs text-muted-foreground">Simulação Clínica de Alta Fidelidade</p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
          <GraduationCap className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">{studentLevel}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1 max-w-3xl">
          <HealthBar value={reasoningScore} label="Raciocínio" icon={Brain} color="bg-primary/20 text-primary" />
          <HealthBar value={patientHealth} label="Saúde" icon={HeartPulse} color="bg-success/20 text-success" />
          <HealthBar value={costEffectiveness} label="Custo" icon={DollarSign} color="bg-warning/20 text-warning" />
          <HealthBar value={empathyScore} label="Empatia" icon={HandHeart} color="bg-accent/20 text-accent" />
        </div>
      </div>
    </header>
  );
}
