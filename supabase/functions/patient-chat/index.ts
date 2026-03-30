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

    const systemPrompt = `Você é um paciente em uma simulação clínica médica. Responda APENAS como o paciente, NUNCA como médico ou narrador.

DADOS DO PACIENTE:
- Nome: ${caseContext.patientName}
- Idade: ${caseContext.patientAge} anos
- Sexo: ${caseContext.patientSex === 'M' ? 'Masculino' : 'Feminino'}
- Queixa principal: ${caseContext.chiefComplaint}
- Histórico: ${caseContext.history}
- Personalidade: ${caseContext.patientPersonality}

SINAIS VITAIS ATUAIS:
- PA: ${caseContext.vitalSigns.pa} mmHg
- FC: ${caseContext.vitalSigns.fc} bpm
- SaO₂: ${caseContext.vitalSigns.sao2}%
- Temperatura: ${caseContext.vitalSigns.temp}°C

REGRAS RIGOROSAS:
1. Responda SEMPRE em primeira pessoa, como o paciente.
2. Use linguagem coloquial e simples, como um paciente real falaria.
3. Respostas CURTAS (1-3 frases no máximo).
4. Demonstre emoções realistas: medo, dor, ansiedade, confusão.
5. NÃO use termos médicos técnicos — o paciente não os conhece.
6. Se perguntado algo que não sabe, diga que não sabe.
7. Se a dor for intensa, gema ou demonstre desconforto nas respostas.
8. Responda APENAS à pergunta feita, não ofereça informações extras espontaneamente.
9. Se o médico for empático, responda de forma mais colaborativa.
10. Nunca quebre o personagem.`;

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
