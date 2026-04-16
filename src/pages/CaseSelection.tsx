import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, ChevronRight, Clock, Activity, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SimpleCase {
  id: string;
  title: string;
  specialty: string;
  description: string;
  correctDiagnosis: string;
  baseVitals: { bp: string; hr: number; ox: number };
  labResults: Record<string, string>;
  unnecessaryExams: string[];
}

interface CaseHistoryItem {
  case_id: string;
  is_correct: boolean;
  reasoning_score: number;
}

export default function CaseSelection() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [cases, setCases] = useState<SimpleCase[]>([]);
  const [history, setHistory] = useState<CaseHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/cases.json')
      .then((res) => {
        if (!res.ok) throw new Error('fetch failed');
        return res.json();
      })
      .then((data: SimpleCase[]) => {
        console.log('Casos carregados:', data);
        setCases(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Erro ao carregar banco de dados do GitHub');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (user) {
      supabase
        .from('case_history')
        .select('case_id, is_correct, reasoning_score')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .then(({ data }) => {
          if (data) setHistory(data);
        });
    }
  }, [user]);

  const getCaseStatus = (caseId: string) => {
    const attempts = history.filter((h) => h.case_id === caseId);
    if (attempts.length === 0) return null;
    return attempts.reduce((a, b) => (a.reasoning_score > b.reasoning_score ? a : b));
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const specialtyColor: Record<string, string> = {
    Cardiologia: 'bg-destructive/15 text-destructive border-destructive/25',
    Neurologia: 'bg-primary/15 text-primary border-primary/25',
    'Cirurgia Geral': 'bg-warning/15 text-warning border-warning/25',
    Infectologia: 'bg-success/15 text-success border-success/25',
    Nefrologia: 'bg-accent/30 text-accent-foreground border-accent/40',
    Pneumologia: 'bg-secondary/50 text-secondary-foreground border-secondary/60',
    Gastroenterologia: 'bg-warning/15 text-warning border-warning/25',
    Proctologia: 'bg-muted text-muted-foreground border-border',
    'Clínica Médica': 'bg-primary/15 text-primary border-primary/25',
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card glow-primary p-4 mb-8 flex items-center justify-between"
      >
        <div>
          <h1 className="text-lg font-bold text-foreground">Selecione um Caso Clínico</h1>
          <p className="text-xs text-muted-foreground">
            {loading ? 'Acessando Banco de Dados de Casos...' : `${cases.length} casos disponíveis`}
          </p>
        </div>
        <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-muted/50 md:hidden">
          <LogOut className="w-4 h-4 text-muted-foreground" />
        </button>
      </motion.header>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
          <p className="text-muted-foreground font-medium">Acessando Banco de Dados de Casos...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cases.map((c, i) => {
            const status = getCaseStatus(c.id);
            const specColor = specialtyColor[c.specialty] || 'bg-muted text-muted-foreground border-border';

            return (
              <motion.button
                key={c.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => navigate(`/simulation/${c.id}`)}
                className="glass-card w-full p-4 text-left hover:glow-primary hover:border-primary/30 transition-all group flex items-center gap-4"
              >
                <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {c.title}
                    </h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${specColor}`}>
                      {c.specialty}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">{c.description}</p>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  {status && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        status.is_correct ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                      }`}
                    >
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
      )}
    </div>
  );
}
