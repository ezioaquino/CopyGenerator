import rateLimit from 'express-rate-limit';

// Limitador estrito para geração de copies com IA (máximo de 15 por hora por IP)
// Isso evita cobranças excessivas de API e abuso do servidor
export const generateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 15,
  message: {
    error: true,
    message: 'Limite de geração de copy atingido para o seu IP. Por favor, tente novamente em uma hora.'
  },
  standardHeaders: true, // Retorna informações de limite nos cabeçalhos RateLimit-*
  legacyHeaders: false, // Desabilita os cabeçalhos legados X-RateLimit-*
});

// Limitador geral para operações comuns (listagem, exclusão, etc.): máximo 200 requisições a cada 15 minutos
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200,
  message: {
    error: true,
    message: 'Muitas requisições detectadas deste IP. Por favor, aguarde alguns minutos antes de tentar novamente.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
