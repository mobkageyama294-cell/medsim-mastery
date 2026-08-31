# Migração completa para Python + hospedagem gratuita fora do Lovable

Objetivo: reescrever o MedSim em Python puro (backend e interface), rodando como site público, hospedado de graça, sem depender do Lovable.

## Aviso honesto antes de começar

O app atual (React + TypeScript) para de existir como site no Lovable no momento em que virar Python. Eu consigo escrever e editar todo o código Python aqui, mas o preview do Lovable **não executa Python** — você testa e publica no serviço externo. Este plano entrega um repositório Python completo e pronto para subir.

## Stack escolhida

- **Streamlit** (Python) para toda a interface — é o único caminho realista para reescrever uma UI inteira em Python sem HTML/JS manual.
- **SQLite** (arquivo local) ou **Supabase via API REST** para login/histórico.
- **Hospedagem gratuita: Streamlit Community Cloud** (grátis, ilimitado para apps públicos, deploy direto do GitHub). Alternativas grátis: Hugging Face Spaces, Render free tier.
- **IA do paciente**: chamada HTTP para um provedor de LLM usando chave sua (OpenAI, Groq grátis, ou Gemini free tier). O Lovable AI Gateway não acompanha o app na saída.

## Estrutura do novo projeto Python

```text
medsim-python/
  app.py                  # entrada Streamlit, roteamento por session_state
  pages/
    1_Casos.py            # galeria com filtros de dificuldade/busca
    2_Simulacao.py        # chat de anamnese + painel do paciente
    3_Perfil.py           # nível, conquistas, histórico
  medsim/
    cases.py              # carrega e normaliza cases.json (150 casos)
    patient_ai.py         # prompt de personalidade + chamada ao LLM
    scoring.py            # nota 0-100: empatia, acurácia, técnica, eficiência
    gamification.py       # níveis Interno→Mestre e conquistas
    db.py                 # usuários, case_history, progresso
    auth.py               # login/cadastro com hash de senha
  data/cases.json         # os mesmos 150 casos, copiados sem alteração
  requirements.txt
  .streamlit/config.toml  # tema (azul médico, dark/light)
```

## Etapas

1. **Portar os dados** — `public/cases.json` (150 casos, com personalidade, sinais vitais, diagnóstico e sinônimos coloquiais) vai inalterado para `data/cases.json`.
2. **Portar a lógica pura** — `scoring.ts` e `gamification.ts` viram `scoring.py` e `gamification.py`, mantendo os mesmos critérios e pesos.
3. **Portar a IA do paciente** — o system prompt da Edge Function `patient-chat` (camadas psicossociais + arquétipos) vira `patient_ai.py`, com a chave do LLM lida de `st.secrets`.
4. **Reconstruir a interface em Streamlit** — galeria de cards com filtros, ofuscação do diagnóstico (só queixa principal), chat de anamnese, exame físico, exames complementares e relatório final com barras de nota.
5. **Autenticação e persistência** — cadastro/login com senha em hash e tabelas de histórico/progresso em SQLite (opção: apontar para o mesmo banco atual via API REST, mantendo os dados existentes).
6. **Publicação gratuita** — subir o repositório no GitHub, conectar no Streamlit Community Cloud, cadastrar a chave do LLM em Secrets. App fica em `https://<seu-app>.streamlit.app`.

## O que muda para o usuário final

- Visual passa a ser o do Streamlit: mais simples, componentes padronizados, sem as animações e o layout SaaS atual.
- Dark/light e cores médicas continuam via tema do Streamlit, mas sem o mesmo nível de refinamento.
- Login social (Google) sai do escopo inicial — fica só e-mail/senha.

## Detalhes técnicos

- Streamlit re-executa o script inteiro a cada interação: o estado da simulação (mensagens, exames pedidos, empatia) fica em `st.session_state`, com cache de casos via `@st.cache_data`.
- Chamadas ao LLM ficam síncronas com `st.spinner`; streaming opcional com `st.write_stream`.
- Free tier do Streamlit Cloud dorme após inatividade e acorda no primeiro acesso (alguns segundos).
- Nenhum arquivo do projeto React é apagado — o novo código Python é criado em uma pasta separada, então o app atual segue funcionando até você decidir desligá-lo.

## Entregável

Repositório Python completo e testado por leitura de código, mais um passo a passo de deploy no Streamlit Cloud. O teste funcional final é feito por você no ambiente externo, já que o preview daqui não roda Python.
