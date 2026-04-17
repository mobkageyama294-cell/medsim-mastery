
## Plano de Atualização: Sistema de Avaliação + Filtros + Feedback Detalhado

### 1. Novo Sistema de Pontuação (0-100, 25 pts cada critério)

**Arquivo:** `src/lib/scoring.ts` (novo)

Função `calculateFinalScore(state, currentCase)` que retorna:
```ts
{
  total: number,           // 0-100
  humanitarian: number,    // 0-25 (deriva de empathyScore)
  accuracy: number,        // 0-25 (match com correctDiagnosis)
  technicalLanguage: number, // 0-25 (analisa termos médicos no chat do user)
  efficiency: number,      // 0-25 (penaliza exames desnecessários)
  unnecessaryExamsRequested: string[],
  diagnosisMatch: 'exact' | 'partial' | 'incorrect',
  autoFeedback: string     // texto gerado dinamicamente
}
```

**Lógicas:**
- **Humanitário**: `(empathyScore / 100) * 25`
- **Acurácia**: comparação por tokens-chave entre `diagnosisAttempt` e `correctDiagnosis` (exact = 25, partial = 15, incorrect = 0)
- **Linguagem técnica**: contar termos médicos (lista curada: "anamnese", "ausculta", "diagnóstico diferencial", "propedêutica", "sintomatologia", "etiologia", "prognóstico", "evolução", etc.) nas mensagens `role: 'user'` → escala até 25
- **Eficiência**: `25 - (examsRequested ∩ unnecessaryExams).length * 5`, mínimo 0
- **autoFeedback**: regras condicionais combinando os 4 critérios

### 2. Filtro de Dificuldade (substituir "Tipos de Casos")

**Arquivo:** `src/pages/CaseSelection.tsx`

- Remover filtro atual de specialty/tipos
- Adicionar pills: `Todos | Iniciante | Intermediário | Avançado`
- Filtrar `cases.filter(c => difficulty === 'Todos' || c.difficulty === selected)`
- Se `c.difficulty` ausente → tratar como "Iniciante" (default seguro)
- Adicionar badge visual de dificuldade em cada card (cores: verde/amarelo/vermelho)

### 3. Tela de Resultados Reformulada

**Arquivo:** `src/components/simulation/FeedbackReport.tsx` (refatorar)

Estrutura nova:
1. **Hero**: Nota final grande (ex: "78/100") com ícone de status + título do caso
2. **4 Barras de Progresso** (uma por critério) com label, valor `/25` e cor adaptativa
3. **Seção "Diagnóstico"**: card com `Correto: X` vs `Sua hipótese: Y` (verde/vermelho)
4. **Seção "Exames Desnecessários Solicitados"**: lista com ícone de alerta; se vazia → mensagem positiva "Nenhum exame desnecessário — excelente eficiência!"
5. **Seção "Observações de Melhoria"**: card destacado com `autoFeedback` gerado
6. **Seção "Análise de Empatia"**: manter breakdown atual dos 5 fatores
7. Botões: "Tentar Outro" / "Compartilhar"

### 4. Segurança (Optional Chaining em todos os pontos)

- `FeedbackReport`: proteger `state?.currentCase?.correctDiagnosis ?? 'N/A'`, `state?.empathyHistory ?? []`, `state?.examsRequested ?? []`
- `scoring.ts`: defaults para todos os inputs (`unnecessaryExams ?? []`, `messages ?? []`)
- `Simulation.tsx`: já tem guards; verificar passagem de `state` completo ao FeedbackReport
- Salvar `final_score` no Supabase em `case_history.insert` (campo novo opcional — ou reusar `reasoning_score` se schema imutável)

### Arquivos afetados
```text
+ src/lib/scoring.ts                         (novo — lógica de pontuação)
~ src/components/simulation/FeedbackReport.tsx (refatoração completa)
~ src/pages/CaseSelection.tsx                (trocar filtros)
~ src/pages/Simulation.tsx                   (passar dados completos ao feedback)
```

### Notas técnicas
- Lista de termos médicos será definida inline em `scoring.ts` (~30 termos PT-BR)
- Match de diagnóstico: normalizar (lowercase, sem acentos), procurar substring de 15+ chars + tokens significativos
- Cores das barras: ≥80% success, ≥50% warning, <50% destructive
- `difficulty` no `cases.json`: se não existir nos 24 casos, manter fallback "Iniciante" — não bloqueia entrega
