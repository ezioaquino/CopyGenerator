/**
 * Middleware de validação para a geração de copy.
 * Inclui sanitização contra HTML Injection (XSS) e limites de tamanho para segurança.
 */
export function validateGenerateCopy(req, res, next) {
  const { productName, productDescription, targetAudience, tone, framework, copyType } = req.body;

  const missingFields = [];
  if (!productName || typeof productName !== 'string' || !productName.trim()) missingFields.push('productName');
  if (!productDescription || typeof productDescription !== 'string' || !productDescription.trim()) missingFields.push('productDescription');
  if (!targetAudience || typeof targetAudience !== 'string' || !targetAudience.trim()) missingFields.push('targetAudience');
  if (!tone || typeof tone !== 'string' || !tone.trim()) missingFields.push('tone');
  if (!framework || typeof framework !== 'string' || !framework.trim()) missingFields.push('framework');
  if (!copyType || typeof copyType !== 'string' || !copyType.trim()) missingFields.push('copyType');

  if (missingFields.length > 0) {
    const error = new Error(`Campos obrigatórios ausentes ou inválidos: ${missingFields.join(', ')}`);
    error.status = 400;
    return next(error);
  }

  // --- Validações de Segurança (Limites de Tamanho) ---
  if (productName.length > 100) {
    const error = new Error('O nome do produto não deve exceder 100 caracteres.');
    error.status = 400;
    return next(error);
  }

  if (productDescription.length > 2000) {
    const error = new Error('A descrição do produto não deve exceder 2000 caracteres.');
    error.status = 400;
    return next(error);
  }

  if (targetAudience.length > 300) {
    const error = new Error('O público-alvo não deve exceder 300 caracteres.');
    error.status = 400;
    return next(error);
  }

  // --- Sanitização de Inputs contra Injeção de Scripts (XSS Armazenado) ---
  // Remove qualquer tag HTML do input antes de salvar no banco e enviar à API do Gemini
  req.body.productName = productName.replace(/<[^>]*>/g, '').trim();
  req.body.productDescription = productDescription.replace(/<[^>]*>/g, '').trim();
  req.body.targetAudience = targetAudience.replace(/<[^>]*>/g, '').trim();
  req.body.tone = tone.replace(/<[^>]*>/g, '').trim();
  req.body.framework = framework.replace(/<[^>]*>/g, '').trim();
  req.body.copyType = copyType.replace(/<[^>]*>/g, '').trim();

  next();
}

/**
 * Middleware de validação para a edição/atualização de uma copy.
 */
export function validateUpdateCopy(req, res, next) {
  const { generatedText } = req.body;

  if (generatedText === undefined || typeof generatedText !== 'string' || !generatedText.trim()) {
    const error = new Error('O campo "generatedText" é obrigatório e deve ser uma string não vazia.');
    error.status = 400;
    return next(error);
  }

  // Limite máximo razoável para o tamanho da copy editada (10.000 caracteres)
  if (generatedText.length > 10000) {
    const error = new Error('O texto da copy não deve exceder 10.000 caracteres.');
    error.status = 400;
    return next(error);
  }

  // Sanitiza contra QUALQUER tag HTML inserida manualmente (cobertura completa anti-XSS)
  req.body.generatedText = generatedText.replace(/<[^>]*>/g, '');

  next();
}
