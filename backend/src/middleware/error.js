/**
 * Middleware global para interceptar e formatar erros no Express.
 */
export default function errorHandler(err, req, res, next) {
  console.error('[Global Error Handler]', err);

  const status = err.status || 500;
  const message = err.message || 'Ocorreu um erro interno no servidor.';
  
  const errorResponse = {
    error: true,
    message,
    status
  };

  // Adiciona a pilha de erros (stack trace) em ambiente de desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  res.status(status).json(errorResponse);
}
