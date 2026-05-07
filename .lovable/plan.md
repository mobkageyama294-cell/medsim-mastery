## Plano: Perfis Psicológicos por Paciente + Aceitação de Linguagem Coloquial no Diagnóstico

### Objetivo
1. Cada um dos 24 pacientes em `public/cases.json` ganha um **perfil psicológico próprio** (modo operante) que guia o comportamento da IA durante a anamnese.
2. O sistema de avaliação aceita **respostas em linguagem coloquial porém corretas** como "parcialmente certas" (não mais como erradas).

---

### 1. Enriquecimento de `public/cases.json`

Adicionar 3 novos campos a cada um dos 24 casos:

- `patientPersonality`: arquétipo psicológico (string controlada)
- `personalityTraits`: descrição em 1-2 frases de como o paciente se comporta
- `colloquialDiagnosis`: array de sinônimos leigos/coloquiais aceitos (ex.: `["ataque cardíaco", "ataque do coração", "infarto"]` para IAM)

**Arquétipos disponíveis** (distribuídos pelos 24 casos):
- `ansioso` — fala rápido, interrompe, faz perguntas repetidas
- `negacionista` — minimiza sintomas, resiste a perguntas sobre hábitos
- `estoico` — subestima a dor, respostas curtas
- `tagarela` — divaga, conta histórias paralelas
- `confuso` — mistura datas e sintomas (idosos, quadros neuro)
- `desconfiado` — questiona o médico, pede justificativas
- `colaborativo` — responde de forma direta e organizada
- `medroso` — chora, pede para chamar a família
- `agitado/irritado` — impaciente, exige resultados
- `deprimido` — apático, fala monossilábica, baixa energia

Distribuição proposta (exemplos coerentes com o quadro clínico):
- 001 IAM (Carlos, 58a) → `negacionista` ("é só azia")
- 002 HSA (Maria, 42a) → `medroso`
- 004 ICC (Waldir, 68a) → `estoico`
- 005 Meningite (Lucas, 19a) → `confuso` (rebaixamento)
- 006 Cólica renal (Ricardo, 35a) → `agitado`
- demais 18 casos: distribuir os arquétipos restantes por idade/quadro

### 2. Tipagem (`src/data/clinicalCases.ts`)

Estender `ClinicalCase` com:
```ts
patientPersonality: 'ansioso' | 'negacionista' | 'estoico' | 'tagarela' 
                  | 'confuso' | 'desconfiado' | 'colaborativo' | 'medroso' 
                  | 'agitado' | 'deprimido';
personalityTraits?: string;
colloquialDiagnosis?: string[];
```

Atualizar `normalizeClinicalCase` para preservar os novos campos com defaults seguros.

### 3. Edge Function `supabase/functions/patient-chat/index.ts`

O system prompt já tem `Personalidade: ${caseContext.patientPersonality}` (Camada 1). Vamos:
- Passar `personalityTraits` no `caseContext` enviado pela função `sendMessage` (`src/hooks/useSimulation.ts`).
- Acrescentar ao prompt um **bloco de instruções específico por arquétipo** (mapeamento `ansioso → fale rápido, interrompa…`, `negacionista → minimize, resista…`, etc.) para que cada perfil tenha um modo operante distinto e reconhecível.
- Reforçar que o paciente NUNCA muda de personalidade durante a sessão.

### 4. Aceitação de linguagem coloquial (`src/lib/scoring.ts`)

Atualizar `diagnosisAccuracy`:
- Receber também `colloquialDiagnosis: string[]` do caso.
- Se o input do usuário (normalizado) bater com qualquer sinônimo coloquial → retornar `score: 18, match: 'partial'` (meio certo).
- Mantém o match exato quando coincide com `correctDiagnosis` técnico.
- Mantém o fallback por tokens.

Atualizar `calculateFinalScore` para repassar `c?.colloquialDiagnosis ?? []`.

Ajustar `buildAutoFeedback`: quando `match === 'partial'` por coloquialismo, mensagem dedicada — "Você identificou o problema corretamente, mas use a nomenclatura técnica formal (ex.: 'Infarto Agudo do Miocárdio' em vez de 'ataque cardíaco')."

### 5. Exibição na UI (`src/components/simulation/CasePanel.tsx`)

Mostrar discretamente o arquétipo ao estudante como dica de abordagem? **Não** — o perfil deve ser descoberto via interação. Mantemos invisível no painel; apenas a IA o usa.

### 6. Detalhes técnicos

- O JSON cresce ~3 campos × 24 casos; arquivo continua leve.
- Sem migrations de banco — tudo client-side + JSON estático + edge function.
- Sem mudança em `case_history` (Supabase).
- A função `sendMessage` em `useSimulation` já monta `caseContext`; basta incluir os campos novos.

### Arquivos alterados
- `public/cases.json` (perfis + sinônimos para os 24 casos)
- `src/data/clinicalCases.ts` (tipos + normalização)
- `src/hooks/useSimulation.ts` (passar campos no caseContext)
- `supabase/functions/patient-chat/index.ts` (mapeamento de arquétipos no prompt)
- `src/lib/scoring.ts` (aceitar coloquialismo como acerto parcial)