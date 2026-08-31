# Manter TypeScript, deixar o código mais fácil de ler

Python não é suportado no app: o Lovable roda React 18 + Vite + TypeScript no frontend, e o backend (Lovable Cloud) usa Edge Functions em Deno/TypeScript. Não existe servidor Python neste ambiente.

Como a motivação é preferência de linguagem, a proposta é manter TypeScript e reduzir o atrito de leitura.

## O que farei

1. Comentários explicativos em português nos arquivos de lógica central:
   - `src/lib/scoring.ts` (cálculo da nota 0–100)
   - `src/lib/gamification.ts` (níveis e conquistas)
   - `src/hooks/useSimulation.ts` (estado da simulação)
2. Um guia curto `GUIA-CODIGO.md` na raiz, com equivalências Python → TypeScript usadas no projeto (dict/objeto, list comprehension/map-filter, def/function, f-string/template literal, async).
3. Nenhuma mudança de comportamento, UI ou banco de dados.

## Alternativa (se um dia precisar de Python de verdade)

Hospedar uma API Python fora do Lovable (Render, Railway, Fly.io) e chamá-la a partir de uma Edge Function. Isso só compensa para ML/análise pesada, não para a lógica atual.
