import { Activity, Thermometer, Wind, Heart, Droplets } from 'lucide-react';
import { motion } from 'framer-motion';
import { ClinicalCase } from '@/data/clinicalCases';

interface CasePanelProps {
  clinicalCase: ClinicalCase | null;
  vitalSigns?: ClinicalCase['vitalSigns'] | null;
}

function VitalSign({ icon: Icon, label, value, unit, alert }: { icon: any; label: string; value: string | number; unit: string; alert?: boolean }) {
  return (
    <motion.div
      className={`flex items-center gap-3 p-3 rounded-lg border ${alert ? 'border-destructive/40 bg-destructive/5' : 'border-border/50 bg-muted/30'}`}
      animate={alert ? { scale: [1, 1.02, 1] } : {}}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      <Icon className={`w-4 h-4 ${alert ? 'text-destructive' : 'text-primary'}`} />
      <div className="flex-1">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className={`text-sm font-mono font-bold ${alert ? 'text-destructive' : 'text-foreground'}`}>
          {value} <span className="text-xs font-normal text-muted-foreground">{unit}</span>
        </p>
      </div>
      {alert && <span className="w-2 h-2 rounded-full bg-destructive animate-pulse-glow" />}
    </motion.div>
  );
}

export default function CasePanel({ clinicalCase, vitalSigns }: CasePanelProps) {
  if (!clinicalCase) {
    return <div className="glass-card p-5 h-full flex items-center justify-center text-sm text-muted-foreground">Carregando caso clínico...</div>;
  }

  const currentVitalSigns = vitalSigns ?? clinicalCase.vitalSigns ?? { pa: '0/0', fc: 0, sao2: 0, temp: 36, fr: 16 };

  return (
    <div className="glass-card p-5 space-y-5 h-full">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">Caso Clínico</h2>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
            clinicalCase.difficulty === 'Avançado' ? 'bg-destructive/20 text-destructive' :
            clinicalCase.difficulty === 'Intermediário' ? 'bg-warning/20 text-warning' :
            'bg-success/20 text-success'
          }`}>
            {clinicalCase.difficulty}
          </span>
        </div>
        <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
          <p className="text-xs text-muted-foreground mb-1">Paciente</p>
          <p className="text-sm font-medium">{clinicalCase.patientName || 'Paciente'}, {clinicalCase.patientAge || 0}a, {clinicalCase.patientSex === 'F' ? '♀' : '♂'}</p>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Queixa Principal</h3>
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
          <p className="text-sm text-foreground italic">"{clinicalCase.chiefComplaint || clinicalCase.history || 'Queixa não informada.'}"</p>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sinais Vitais</h3>
          <span className="w-2 h-2 rounded-full bg-success animate-pulse-glow" />
          <span className="text-[10px] text-success">AO VIVO</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <VitalSign icon={Heart} label="PA" value={currentVitalSigns?.pa ?? clinicalCase?.vitalSigns?.pa ?? '0/0'} unit="mmHg" alert={Number.parseInt(currentVitalSigns?.pa ?? '0/0', 10) > 140} />
          <VitalSign icon={Activity} label="FC" value={Math.round(currentVitalSigns?.fc ?? 0)} unit="bpm" alert={(currentVitalSigns?.fc ?? 0) > 100} />
          <VitalSign icon={Droplets} label="SaO₂" value={Math.round((currentVitalSigns?.sao2 ?? 0) * 10) / 10} unit="%" alert={(currentVitalSigns?.sao2 ?? 0) < 95} />
          <VitalSign icon={Thermometer} label="Temp" value={currentVitalSigns?.temp ?? 36} unit="°C" />
          <VitalSign icon={Wind} label="FR" value={currentVitalSigns?.fr ?? 16} unit="irpm" alert={(currentVitalSigns?.fr ?? 0) > 20} />
        </div>
      </div>
    </div>
  );
}
