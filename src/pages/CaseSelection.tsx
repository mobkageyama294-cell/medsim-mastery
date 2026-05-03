import { useCallback, useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertCircle,
  Clock,
  Search,
  Filter,
  ChevronRight,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { fetchClinicalCases, type ClinicalCase } from '@/data/clinicalCases';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

/** Extract a spoiler-free label from the case description (patient + chief complaint). */
function obfuscatedLabel(c: ClinicalCase): string {
  // description usually starts with "Name, age. complaint…"
  const desc = c.history || c.chiefComplaint || '';
  // Try to grab everything after the first period/dot that follows the age
  const match = desc.match(/\d+a\.\s*(.+)/);
  if (match) return match[1].trim();
  return c.chiefComplaint || desc;
}

interface CaseHistoryItem {
  case_id: string;
  is_correct: boolean;
  reasoning_score: number;
}

const SPECIALTY_COLORS: Record<string, string> = {
  Cardiologia: 'bg-red-500/10 text-red-500 dark:text-red-400 border-red-500/20',
  Neurologia: 'bg-violet-500/10 text-violet-500 dark:text-violet-400 border-violet-500/20',
  'Cirurgia Geral': 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  Infectologia: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  Nefrologia: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
  Pneumologia: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
  Gastroenterologia: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  Proctologia: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
  'Clínica Médica': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
};

export default function CaseSelection() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cases, setCases] = useState<ClinicalCase[]>([]);
  const [history, setHistory] = useState<CaseHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeDifficulty, setActiveDifficulty] = useState<string | null>(null);

  const DIFFICULTY_LEVELS = ['Iniciante', 'Intermediário', 'Avançado'] as const;
  const DIFFICULTY_STYLES: Record<string, string> = {
    'Iniciante': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    'Intermediário': 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    'Avançado': 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  };

  const loadCases = useCallback(async () => {
    setLoading(true);
    setError(null);

    const data = await fetchClinicalCases();
    setCases(data);

    if (data.length === 0) {
      setError('Erro ao carregar banco de dados do GitHub');
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadCases();
  }, [loadCases]);

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

  const specialties = useMemo(() => [...new Set(cases.map((c) => c.specialty))], [cases]);

  const filtered = useMemo(() => {
    let result = cases;
    if (activeDifficulty) {
      result = result.filter((c) => (c?.difficulty ?? 'Iniciante') === activeDifficulty);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          obfuscatedLabel(c).toLowerCase().includes(q) ||
          (c?.history || c?.chiefComplaint || '').toLowerCase().includes(q) ||
          (c?.specialty ?? '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [cases, activeDifficulty, search]);

  const getCaseStatus = (caseId: string) => {
    const attempts = history.filter((h) => h.case_id === caseId);
    if (attempts.length === 0) return null;
    return attempts.reduce((a, b) => (a.reasoning_score > b.reasoning_score ? a : b));
  };

  const completedCount = useMemo(
    () => new Set(history.map((h) => h.case_id)).size,
    [history]
  );

  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      {/* Hero stats */}
      <div className="border-b border-border/40 bg-card/50">
        <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-6 md:py-8">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-xl md:text-2xl font-bold text-foreground mb-1">Casos Clínicos</h1>
            <p className="text-sm text-muted-foreground">
              {loading
                ? 'Carregando banco de dados...'
                : `${cases.length} casos disponíveis · ${completedCount} concluídos`}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-6">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="flex flex-wrap items-center gap-3">
                <span>{error}</span>
                <button type="button" onClick={loadCases} className="text-sm font-medium text-primary hover:underline">
                  Tentar Novamente
                </button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mb-4" />
            <p className="text-muted-foreground text-sm font-medium">Acessando Banco de Dados de Casos...</p>
          </div>
        ) : (
          <>
            {/* Toolbar: search + filters */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mb-6 space-y-4"
            >
              {/* Search */}
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar caso clínico..."
                  className="pl-9 h-10 bg-card border-border/60"
                />
              </div>

              {/* Difficulty pills */}
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <button
                  onClick={() => setActiveDifficulty(null)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    !activeDifficulty
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card text-muted-foreground border-border/60 hover:border-primary/40 hover:text-foreground'
                  }`}
                >
                  Todos os níveis
                </button>
                {DIFFICULTY_LEVELS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setActiveDifficulty(activeDifficulty === d ? null : d)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                      activeDifficulty === d
                        ? 'bg-primary text-primary-foreground border-primary'
                        : `${DIFFICULTY_STYLES[d]} hover:border-primary/40`
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Count */}
            <p className="text-xs text-muted-foreground mb-4">
              {filtered.length} {filtered.length === 1 ? 'caso encontrado' : 'casos encontrados'}
            </p>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((c, i) => {
                const status = getCaseStatus(c.id);
                const specColor = SPECIALTY_COLORS[c.specialty] || 'bg-muted text-muted-foreground border-border';

                return (
                  <motion.button
                    key={c.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.025, duration: 0.3 }}
                    onClick={() => navigate(`/simulation/${c.id}`)}
                    className="group relative flex flex-col rounded-xl border border-border/60 bg-card p-5 text-left transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
                  >
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Activity className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        {status ? (
                          status.is_correct ? (
                            <Badge variant="outline" className="gap-1 text-[10px] border-success/30 text-success bg-success/10">
                              <CheckCircle2 className="h-3 w-3" /> Acertou
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1 text-[10px] border-destructive/30 text-destructive bg-destructive/10">
                              <XCircle className="h-3 w-3" /> Errou
                            </Badge>
                          )
                        ) : (
                          <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">
                            Pendente
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Obfuscated title — never show diagnosis */}
                    <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors mb-1.5 line-clamp-2">
                      Paciente: {obfuscatedLabel(c)}
                    </h3>
                    <div className="flex items-center gap-1.5 flex-wrap mb-3">
                      <Badge variant="outline" className={`w-fit text-[10px] ${specColor}`}>
                        {c?.specialty ?? 'Clínica Médica'}
                      </Badge>
                      <Badge variant="outline" className={`w-fit text-[10px] ${DIFFICULTY_STYLES[c?.difficulty ?? 'Iniciante'] ?? ''}`}>
                        {c?.difficulty ?? 'Iniciante'}
                      </Badge>
                    </div>

                    {/* Brief context without revealing diagnosis */}
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-4 flex-1">
                      Atendimento de {c.specialty.toLowerCase()} — investigue, conduza a anamnese e formule sua hipótese diagnóstica.
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-border/40">
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="h-3 w-3" /> ~15 min
                      </div>
                      <span className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                        Iniciar <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-3 opacity-40" />
                <p className="text-sm">Nenhum caso encontrado para o filtro selecionado.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
