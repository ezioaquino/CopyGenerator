import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.5-flash';

if (!GEMINI_API_KEY) {
  console.warn('[AI Service] ALERTA: GEMINI_API_KEY não configurada no arquivo .env.');
}

/**
 * Constrói o prompt estruturado com base nas variáveis recebidas
 */
function buildPrompt({ productName, productDescription, targetAudience, tone, framework, copyType }) {
  let frameworkInstructions = '';

  switch (framework.toUpperCase()) {
    case 'AIDA':
      frameworkInstructions = `
Use o framework AIDA. Divida a resposta claramente com cabeçalhos em Markdown:
- **[ATENÇÃO]**: Um gancho inicial irresistível focado em prender o leitor nos primeiros 3 segundos.
- **[INTERESSE]**: Apresente dados, fatos ou conecte-se com um problema do público para fazê-los querer ler mais.
- **[DESEJO]**: Mostre como o produto transforma a realidade deles, focando nos benefícios emocionais e práticos.
- **[AÇÃO]**: Uma chamada para ação (CTA) extremamente clara e imperativa.`;
      break;

    case 'PAS':
      frameworkInstructions = `
Use o framework PAS. Divida a resposta claramente com cabeçalhos em Markdown:
- **[PROBLEMA]**: Identifique a dor, frustração ou desafio exato que o público-alvo enfrenta hoje.
- **[AGITAÇÃO]**: Explore o impacto emocional desse problema se ele não for resolvido. Faça o leitor sentir a dor de forma urgente.
- **[SOLUÇÃO]**: Apresente o produto de forma triunfal como a solução definitiva, rápida e segura para o problema agitado.`;
      break;

    case 'BAB':
      frameworkInstructions = `
Use o framework BAB. Divida a resposta claramente com cabeçalhos em Markdown:
- **[ANTES]**: Descreva o cenário atual (frustrante, ineficiente ou doloroso) em que o público se encontra.
- **[DEPOIS]**: Descreva o cenário dos sonhos após a transformação (alívio, sucesso, produtividade).
- **[PONTE]**: Apresente o produto como o único veículo (a ponte) que torna essa transformação possível.`;
      break;

    case 'FAB':
      frameworkInstructions = `
Use o framework FAB. Divida a resposta claramente com cabeçalhos em Markdown:
- **[CARACTERÍSTICAS]**: O que o produto é ou tem (especificações físicas/técnicas importantes).
- **[VANTAGENS]**: O que essas características fazem de melhor em comparação com métodos comuns.
- **[BENEFÍCIOS]**: O valor real que o cliente ganha (ex: economizar tempo, ganhar mais dinheiro, status).`;
      break;

    case 'VSL':
      frameworkInstructions = `
Crie um ROTEIRO VSL (Vídeo de Vendas Sensorial) estruturado de 30 a 60 segundos para plataformas como TikTok, Reels ou Shorts.
Estruture o roteiro em formato de tabela ou blocos de tempo com:
- **Tempo** (ex: [0:00-0:05])
- **Visual** (Diretiva detalhada para a IA de vídeo ou câmera, focando em texturas, vapor, movimentos lentos - macro-shots. IMPORTANTE: Evite rostos humanos falando ou textos na tela, foque em ações físicas, ingredientes ou objetos reais).
- **Áudio/Locução** (O que o locutor fala de forma persuasiva).

Siga um fluxo de 5 partes: Gancho Sensorial -> Conexão/Curiosidade -> Quebra de Objeção -> Apresentação do Produto -> Oferta/Chamada para Ação.`;
      break;

    default:
      frameworkInstructions = 'Escreva um texto altamente persuasivo de copywriting focado em conversão e vendas.';
  }

  const systemInstructions = `
Você é um Copywriter profissional sênior com foco em marketing digital de alta conversão, persuasão, semiótica e gatilhos mentais.
Sua missão é criar um texto publicitário/copywriting com base nas informações fornecidas.

REGRAS OBRIGATÓRIAS:
1. Responda em Português do Brasil (pt-BR) com tom profissional, sem clichês de IA (evite palavras como "revolucionário", "divisor de águas", "jornada", "certamente", "primeiramente").
2. O tom da voz deve ser estritamente: ${tone}.
3. O formato/veículo da copy deve ser otimizado para: ${copyType} (ex: e-mail de vendas, anúncio de Facebook, página de vendas, etc.).
4. Use formatação Markdown elegante (negritos, listas, espaçamentos) para facilitar a leitura.
5. Se for um Roteiro VSL, siga à risca a formatação estruturada de Visual vs. Áudio.
`;

  return `${systemInstructions}

---
DADOS DO PRODUTO:
- Nome do Produto: ${productName}
- Descrição/O que faz: ${productDescription}
- Público-Alvo: ${targetAudience}

INSTRUÇÕES DO FRAMEWORK:
${frameworkInstructions}
`;
}

/**
 * Envia o prompt para a API do Gemini e obtém o texto gerado
 */
export async function generateCopy({ productName, productDescription, targetAudience, tone, framework, copyType }) {
  if (!GEMINI_API_KEY) {
    throw new Error('Chave de API do Gemini não configurada. Por favor, adicione GEMINI_API_KEY no arquivo .env.');
  }

  const prompt = buildPrompt({ productName, productDescription, targetAudience, tone, framework, copyType });
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  try {
    const response = await axios.post(url, {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 2500
      }
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Extrai o texto gerado da estrutura de resposta do Gemini
    const candidate = response.data?.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('Formato de resposta inválido recebido da API do Gemini.');
    }

    return {
      text: text.trim(),
      promptUsed: prompt
    };
  } catch (error) {
    console.error('[AI Service] Erro ao chamar a API do Gemini:', error.response?.data || error.message);
    const apiError = error.response?.data?.error?.message || error.message;
    throw new Error(`Erro na API do Gemini: ${apiError}`);
  }
}
