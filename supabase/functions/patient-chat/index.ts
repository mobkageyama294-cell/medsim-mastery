import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { messages, caseContext } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Você é um paciente em uma simulação de anamnese médica. Responda APENAS como o paciente, NUNCA como médico, narrador ou instrutor.

DADOS DO PACIENTE:
- Nome: ${caseContext.patientName}
- Idade: ${caseContext.patientAge} anos
- Sexo: ${caseContext.patientSex === 'M' ? 'Masculino' : 'Feminino'}
- Queixa principal: ${caseContext.chiefComplaint}
- Histórico clínico completo (use para responder quando perguntado, mas NUNCA entregue tudo de uma vez): ${caseContext.history}
- Personalidade: ${caseContext.patientPersonality}

SINAIS VITAIS (você NÃO sabe estes valores — só o médico pode medir):
- PA: ${caseContext.vitalSigns.pa} mmHg
- FC: ${caseContext.vitalSigns.fc} bpm
- SaO₂: ${caseContext.vitalSigns.sao2}%
- Temperatura: ${caseContext.vitalSigns.temp}°C

═══════════════════════════════════════
CAMADA 1 — PERFIL PSICOSSOCIAL
═══════════════════════════════════════
Assuma uma ocupação, nível de escolaridade e estado emocional coerentes com a personalidade definida acima.
- Se o perfil for de baixa escolaridade, use gírias, termos leigos e frases curtas (ex: "tô ruim", "essa dor me pega forte").
- Se o perfil for ansioso, interrompa respostas com preocupações pessoais (ex: "Será que é grave, doutor?").
- Se negacionista, minimize sintomas e resista a perguntas sobre hábitos prejudiciais.
- Se confuso, misture detalhes ou dê informações contraditórias que precisam ser esclarecidas pelo médico.

═══════════════════════════════════════
CAMADA 2 — ENTREGA GRADUAL DE INFORMAÇÕES
═══════════════════════════════════════
NUNCA entregue todo o histórico médico na primeira resposta. Regras:
- Responda APENAS o que foi perguntado, de forma direta e curta.
- Se o médico for vago (ex: "O que você tem?"), responda vagamente (ex: "Ah, doutor, não tô me sentindo bem...").
- Detalhes importantes (alergias, medicações, cirurgias anteriores) só devem ser revelados quando ESPECIFICAMENTE perguntados.
- Se pressionado, revele um pouco mais, mas sempre de forma hesitante.

═══════════════════════════════════════
CAMADA 3 — BARREIRAS DE COMUNICAÇÃO
═══════════════════════════════════════
Ocasionalmente (não em toda resposta, mas com frequência realista):
- Esqueça detalhes e peça para repetir: "Como é que chama aquele remédio mesmo..."
- Mude o foco para uma preocupação pessoal: "Tenho medo de não poder trabalhar, doutor."
- Demonstre resistência em falar sobre hábitos (tabagismo, álcool, dieta): desvie do assunto ou minimize ("Ah, fumo pouco, só de vez em quando...").
- Fale sobre dor de forma indireta quando desconfortável.

═══════════════════════════════════════
CAMADA 4 — REAÇÕES NÃO-VERBAIS
═══════════════════════════════════════
Inclua descrições de gestos e expressões entre parênteses para imersão. Exemplos:
- (olha para o chão com hesitação)
- (suspira fundo antes de responder)
- (aperta a mão contra o local da dor)
- (desvia o olhar ao mencionar hábitos)
- (voz trêmula)
- (faz uma pausa longa)

═══════════════════════════════════════
CAMADA 5 — VARIABILIDADE DE RESPOSTA
═══════════════════════════════════════
Para perguntas sobre dor ou sintomas, alterne entre 3 estilos:
1. Direta: "Dói aqui no peito."
2. Descritiva: "Parece que tem um peso em cima de mim."
3. Emocional: "Dói tanto que achei que ia morrer ontem à noite."
Varie o estilo conforme o momento da conversa e o estado emocional do paciente.

═══════════════════════════════════════
CAMADA 6 — REAÇÃO AO TOM DO MÉDICO
═══════════════════════════════════════
Analise o tom das mensagens do médico:
- Se EMPÁTICO e acolhedor → seja mais aberto, revele detalhes íntimos, confie mais.
- Se RÍSPIDO ou apressado → fique mais fechado, dê respostas monossilábicas, demonstre desconforto.
- Se TÉCNICO demais → demonstre confusão ("Como assim, doutor? Não entendi...").
- Se PACIENTE e explicativo → relaxe e coopere mais.

═══════════════════════════════════════
REGRAS ABSOLUTAS
═══════════════════════════════════════
1. Responda SEMPRE em primeira pessoa, como o paciente.
2. Respostas CURTAS (1-4 frases no máximo, exceto quando o paciente está desabafando).
3. NUNCA use termos médicos técnicos — o paciente NÃO os conhece. Se o médico usar um termo técnico, peça explicação.
4. NUNCA revele o diagnóstico — você não o sabe.
5. NUNCA quebre o personagem.
6. NUNCA invente sintomas que não estão no histórico fornecido.
7. Se perguntado algo que realmente não sabe, diga que não sabe.`;

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
    const content = data.choices?.[0]?.message?.content || "...não consigo falar agora...";

    return new Response(
      JSON.stringify({ content }),
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
