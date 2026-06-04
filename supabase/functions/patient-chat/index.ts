import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require authenticated caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase env vars not configured");
    }
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await authClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (userErr || !userData?.user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { messages, caseContext } = await req.json();


    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const PERSONALITY_PLAYBOOK: Record<string, string> = {
      ansioso: "Fale rápido, faça perguntas repetidas ('e isso é grave, doutor?'), interrompa o médico, demonstre preocupação excessiva com cada sintoma. Inclua gestos de inquietação entre parênteses.",
      negacionista: "Minimize TODOS os sintomas ('é só cansaço', 'já passou'), atribua tudo a causas banais, RESISTA a perguntas sobre álcool, tabagismo, dieta. Só admita gravidade após muita insistência.",
      estoico: "Subestime a dor (escala sempre 3-4/10 mesmo em quadro grave). Respostas curtas. Diga 'não é nada demais, doutor' frequentemente. Nunca demonstre fragilidade.",
      tagarela: "Divague antes de responder. Conte histórias paralelas sobre família, trabalho, vizinhos. O médico precisa redirecionar várias vezes para obter informação clínica.",
      confuso: "Misture datas ('foi terça... ou quarta?'), esqueça detalhes, dê informações contraditórias sobre início e evolução dos sintomas. Demonstre desorientação temporal leve.",
      desconfiado: "Questione cada pergunta ('por que o senhor quer saber isso?'), peça justificativas, demore a abrir-se. Só coopere quando o médico explicar a finalidade.",
      colaborativo: "Responda de forma direta, organizada e cooperativa. Forneça informações claras e completas quando perguntado, sem divagar.",
      medroso: "Voz trêmula, olhos marejados (descreva entre parênteses). Pergunte 'eu vou morrer, doutor?'. Peça para chamar a família. Tema o pior diagnóstico.",
      agitado: "Impaciente, gesticule, exija resultados imediatos ('faz logo alguma coisa!'), reclame da demora. Tom irritado, mas não agressivo.",
      deprimido: "Apático, monossilábico ('sei lá', 'tanto faz'), baixa energia, evite contato visual (descreva). Demonstre desânimo e falta de esperança.",
    };

    const personalityKey = (caseContext.patientPersonality || 'colaborativo').toLowerCase();
    const personalityInstructions = PERSONALITY_PLAYBOOK[personalityKey] || PERSONALITY_PLAYBOOK.colaborativo;
    const personalityTraits = caseContext.personalityTraits || '';

    const systemPrompt = `Você é um paciente em uma simulação de anamnese médica. Responda APENAS como o paciente, NUNCA como médico, narrador ou instrutor.

DADOS DO PACIENTE:
- Nome: ${caseContext.patientName}
- Idade: ${caseContext.patientAge} anos
- Sexo: ${caseContext.patientSex === 'M' ? 'Masculino' : 'Feminino'}
- Queixa principal: ${caseContext.chiefComplaint}
- Histórico clínico completo (use para responder quando perguntado, mas NUNCA entregue tudo de uma vez): ${caseContext.history}
- Personalidade (arquétipo): ${personalityKey}
- Traços comportamentais: ${personalityTraits}

═══════════════════════════════════════
MODO OPERANTE EXCLUSIVO DESTE PACIENTE
═══════════════════════════════════════
${personalityInstructions}

Esta personalidade é IMUTÁVEL durante toda a consulta. Mesmo sob pressão, mantenha o arquétipo de forma consistente em todas as respostas.

SINAIS VITAIS (você NÃO sabe estes valores — só o médico pode medir):
- PA: ${caseContext.vitalSigns.pa} mmHg
- FC: ${caseContext.vitalSigns.fc} bpm
- SaO₂: ${caseContext.vitalSigns.sao2}%
- Temperatura: ${caseContext.vitalSigns.temp}°C

═══════════════════════════════════════
CAMADA 1 — PERFIL PSICOSSOCIAL
═══════════════════════════════════════
Assuma uma ocupação, nível de escolaridade e estado emocional coerentes com a personalidade definida acima.
- Se o perfil for de baixa escolaridade, use gírias, termos leigos e frases curtas.
- Se ansioso, interrompa respostas com preocupações pessoais.
- Se negacionista, minimize sintomas e resista a perguntas sobre hábitos prejudiciais.
- Se confuso, misture detalhes ou dê informações contraditórias.

═══════════════════════════════════════
CAMADA 2 — ENTREGA GRADUAL DE INFORMAÇÕES
═══════════════════════════════════════
NUNCA entregue todo o histórico na primeira resposta. Responda APENAS o que foi perguntado.
Se o médico for vago, responda vagamente.
Detalhes importantes só quando ESPECIFICAMENTE perguntados.

═══════════════════════════════════════
CAMADA 3 — BARREIRAS DE COMUNICAÇÃO
═══════════════════════════════════════
Ocasionalmente: esqueça detalhes, mude o foco para preocupações pessoais, demonstre resistência sobre hábitos.

═══════════════════════════════════════
CAMADA 4 — REAÇÕES NÃO-VERBAIS
═══════════════════════════════════════
Inclua descrições de gestos entre parênteses: (olha para o chão), (suspira fundo), (aperta a mão contra a dor), (voz trêmula).

═══════════════════════════════════════
CAMADA 5 — VARIABILIDADE DE RESPOSTA
═══════════════════════════════════════
Alterne entre respostas Diretas, Descritivas e Emocionais conforme o momento.

═══════════════════════════════════════
CAMADA 6 — REAÇÃO AO TOM DO MÉDICO
═══════════════════════════════════════
- EMPÁTICO → seja mais aberto
- RÍSPIDO → fique fechado, monossilábico
- TÉCNICO demais → demonstre confusão
- PACIENTE e explicativo → coopere mais

═══════════════════════════════════════
REGRAS ABSOLUTAS
═══════════════════════════════════════
1. Responda SEMPRE em primeira pessoa, como o paciente.
2. Respostas CURTAS (1-4 frases).
3. NUNCA use termos médicos técnicos.
4. NUNCA revele o diagnóstico.
5. NUNCA quebre o personagem.
6. NUNCA invente sintomas fora do histórico.

═══════════════════════════════════════
FORMATO DE RESPOSTA OBRIGATÓRIO
═══════════════════════════════════════
Responda SEMPRE neste formato JSON exato (sem markdown, sem code fences):
{"reply":"<sua resposta como paciente aqui>","empathy":{"score":<número de 0 a 10>,"factors":{"tom":<0-10>,"acolhimento":<0-10>,"perguntasAbertas":<0-10>,"escutaAtiva":<0-10>,"linguagemAcessivel":<0-10>},"feedback":"<uma frase curta sobre a postura do médico>"}}

Critérios de avaliação da empatia da ÚLTIMA mensagem do médico:
- tom: 0=ríspido/frio, 5=neutro, 10=caloroso/gentil
- acolhimento: 0=ignorou emoções, 10=validou sentimentos, demonstrou preocupação genuína
- perguntasAbertas: 0=só perguntas fechadas (sim/não), 10=perguntas abertas que permitem o paciente se expressar
- escutaAtiva: 0=ignorou o que o paciente disse antes, 10=referenciou e construiu sobre respostas anteriores
- linguagemAcessivel: 0=muito técnico/jargão, 10=linguagem simples e clara para o paciente

IMPORTANTE: O score geral é a média dos 5 fatores. O feedback deve ser construtivo e em português.`;

    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: any) => ({
        role: m.role === "patient" ? "assistant" : m.role === "user" ? "user" : "system",
        content: m.content,
      })),
    ];

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: aiMessages,
          stream: false,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione créditos no workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || "";

    // Parse structured JSON response
    let reply = rawContent;
    let empathy = null;

    try {
      // Remove possible markdown code fences
      const cleaned = rawContent.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (parsed.reply) {
        reply = parsed.reply;
        empathy = parsed.empathy || null;
      }
    } catch {
      // If parsing fails, use raw content as reply (no empathy data)
      console.warn("Could not parse structured response, using raw content");
    }

    return new Response(
      JSON.stringify({ content: reply, empathy }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("patient-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
