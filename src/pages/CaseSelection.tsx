import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Stethoscope, Brain, Heart, Clock, Trophy, LogOut, ChevronRight, Shield } from 'lucide-react';
import { CLINICAL_CASES, ClinicalCase } from '@/data/clinicalCases';
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

  const difficultyConfig = {
    Iniciante: { color: 'bg-success/20 text-success border-success/30', icon: Shield },
    Intermediário: { color: 'bg-warning/20 text-warning border-warning/30', icon: Brain },
    Avançado: { color: 'bg-destructive/20 text-destructive border-destructive/30', icon: Heart },
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
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
            <p className="text-[10px] text-muted-foreground">{user?.email}</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CLINICAL_CASES.map((c, i) => {
          const status = getCaseStatus(c.id);
          const diff = difficultyConfig[c.difficulty];
          const DiffIcon = diff.icon;

          return (
            <motion.button
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => navigate(`/simulation/${c.id}`)}
              className="glass-card p-5 text-left hover:glow-primary hover:border-primary/30 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <DiffIcon className="w-4 h-4 text-muted-foreground" />
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${diff.color}`}>
                    {c.difficulty}
                  </span>
                </div>
                {status && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${status.is_correct ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
                    {status.is_correct ? '✓ Acertou' : '✗ Errou'}
                  </span>
                )}
              </div>

              <h3 className="text-sm font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                {c.title}
              </h3>

              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] text-muted-foreground">
                  {c.patientName}, {c.patientAge}a, {c.patientSex === 'M' ? '♂' : '♀'}
                </span>
              </div>

              <p className="text-xs text-muted-foreground italic mb-4 line-clamp-2">
                "{c.chiefComplaint}"
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> ~15min
                  </span>
                  {status && (
                    <span className="flex items-center gap-1">
                      <Brain className="w-3 h-3" /> {status.reasoning_score}%
                    </span>
                  )}
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
