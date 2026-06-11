import * as aiService from '../services/ai.service.js';
import * as dbService from '../services/db.service.js';

/**
 * Controladora para geração de novas copies usando a API do Gemini
 */
export async function generate(req, res, next) {
  try {
    const { productName, productDescription, targetAudience, tone, framework, copyType } = req.body;

    console.log(`[Controller] Iniciando geração para produto: ${productName} (Framework: ${framework})`);

    // Chama o serviço de IA para gerar o texto da copy
    const aiResult = await aiService.generateCopy({
      productName,
      productDescription,
      targetAudience,
      tone,
      framework,
      copyType
    });

    // Salva o resultado gerado no banco de dados SQLite
    const savedCopy = dbService.createCopy({
      productName,
      productDescription,
      targetAudience,
      tone,
      framework,
      copyType,
      generatedText: aiResult.text,
      promptUsed: aiResult.promptUsed
    });

    console.log(`[Controller] Copy gerada e salva com ID: ${savedCopy.id}`);

    res.status(201).json(savedCopy);
  } catch (error) {
    next(error);
  }
}

/**
 * Controladora para buscar e filtrar o histórico de copies
 */
export async function list(req, res, next) {
  try {
    const { search, framework, tone, isFavorite } = req.query;
    
    // Converte o parâmetro de favorito para booleano caso venha na query
    const favoriteFilter = isFavorite !== undefined 
      ? isFavorite === 'true' || isFavorite === '1' 
      : undefined;

    const copies = dbService.getAllCopies({
      search,
      framework,
      tone,
      isFavorite: favoriteFilter
    });

    res.json(copies);
  } catch (error) {
    next(error);
  }
}

/**
 * Controladora para alternar o status de favorito de uma copy
 */
export async function toggleFavorite(req, res, next) {
  try {
    const { id } = req.params;
    const result = dbService.toggleFavorite(id);
    res.json(result);
  } catch (error) {
    // Adiciona status 404 para erro de ID não encontrado
    if (error.message.includes('não encontrada')) {
      error.status = 404;
    }
    next(error);
  }
}

/**
 * Controladora para atualizar o texto de uma copy (edição manual)
 */
export async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { generatedText } = req.body;

    const updatedCopy = dbService.updateCopyText(id, generatedText);
    res.json(updatedCopy);
  } catch (error) {
    if (error.message.includes('não encontrada')) {
      error.status = 404;
    }
    next(error);
  }
}

/**
 * Controladora para deletar uma copy do histórico
 */
export async function deleteCopy(req, res, next) {
  try {
    const { id } = req.params;
    const result = dbService.deleteCopy(id);
    res.json(result);
  } catch (error) {
    if (error.message.includes('não encontrada')) {
      error.status = 404;
    }
    next(error);
  }
}

/**
 * Controladora para buscar estatísticas do painel
 */
export async function getStats(req, res, next) {
  try {
    const stats = dbService.getStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
}
