import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Stethoscope, Brain, Heart, Clock, Trophy, LogOut, ChevronRight, Shield, Activity } from 'lucide-react';
import { CLINICAL_CASES } from '@/data/clinicalCases';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface CaseHistoryItem {
  case_id: string;
  is_correct: boolean;
  reasoning_score: number;
  completed_at: string;
}

export default function CaseSelection() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [history, setHistory] = useState<CaseHistoryItem[]>([]);

  useEffect(() => {
    if (user) {
      supabase
        .from('case_history')
        .select('case_id, is_correct, reasoning_score, completed_at')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .then(({ data }) => {
          if (data) setHistory(data);
        });
    }
  }, [user]);

  const getCaseStatus = (caseId: string) => {
    const attempts = history.filter(h => h.case_id === caseId);
    if (attempts.length === 0) return null;
    const best = attempts.reduce((a, b) => (a.reasoning_score > b.reasoning_score ? a : b));
    return best;
  };

  const difficultyConfig: Record<string, { color: string; icon: typeof Shield }> = {
    Iniciante: { color: 'bg-success/20 text-success border-success/30', icon: Shield },
    Intermediário: { color: 'bg-warning/20 text-warning border-warning/30', icon: Brain },
    Avançado: { color: 'bg-destructive/20 text-destructive border-destructive/30', icon: Heart },
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card glow-primary p-4 mb-8 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gradient-primary">MedSim Pro</h1>
            <p className="text-xs text-muted-foreground">Selecione um caso clínico</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
            <Trophy className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-primary">
              {history.filter(h => h.is_correct).length}/{CLINICAL_CASES.length} concluídos
            </span>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs font-medium text-foreground">{user?.user_metadata?.full_name || user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
            title="Sair"
          >
            <LogOut className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </motion.header>

      <div className="space-y-3">
        {CLINICAL_CASES.map((c, i) => {
          const status = getCaseStatus(c.id);
          const diff = difficultyConfig[c.difficulty];
          const DiffIcon = diff.icon;

          return (
            <motion.button
              key={c.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => navigate(`/simulation/${c.id}`)}
              className="glass-card w-full p-4 text-left hover:glow-primary hover:border-primary/30 transition-all group flex items-center gap-4"
            >
              <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Activity className="w-6 h-6 text-primary" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {c.organ} — {c.specialty}
                  </h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${diff.color}`}>
                    {c.difficulty}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {c.patientName}, {c.patientAge}a, {c.patientSex === 'M' ? '♂' : '♀'} — "{c.chiefComplaint}"
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-3">
                {status && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${status.is_correct ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
                    {status.is_correct ? '✓ Acertou' : '✗ Errou'}
                  </span>
                )}
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Clock className="w-3 h-3" /> ~15min
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
