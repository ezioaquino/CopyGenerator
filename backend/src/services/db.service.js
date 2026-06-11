import db from '../config/db.js';
import crypto from 'crypto';

/**
 * Insere uma nova copy gerada no banco de dados
 */
export function createCopy({
  productName,
  productDescription,
  targetAudience,
  tone,
  framework,
  copyType,
  generatedText,
  promptUsed
}) {
  const id = crypto.randomUUID();
  const stmt = db.prepare(`
    INSERT INTO copies (
      id, product_name, product_description, target_audience, tone, framework, copy_type, generated_text, prompt_used
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    productName,
    productDescription,
    targetAudience,
    tone,
    framework,
    copyType,
    generatedText,
    promptUsed
  );

  return getCopyById(id);
}

/**
 * Busca todas as copies com filtros opcionais
 */
export function getAllCopies({ search, framework, tone, isFavorite } = {}) {
  let query = 'SELECT * FROM copies WHERE 1=1';
  const params = [];

  if (search) {
    query += ' AND (product_name LIKE ? OR generated_text LIKE ? OR target_audience LIKE ?)';
    const searchVal = `%${search}%`;
    params.push(searchVal, searchVal, searchVal);
  }

  if (framework) {
    query += ' AND framework = ?';
    params.push(framework);
  }

  if (tone) {
    query += ' AND tone = ?';
    params.push(tone);
  }

  if (isFavorite !== undefined) {
    query += ' AND is_favorite = ?';
    params.push(isFavorite ? 1 : 0);
  }

  // Ordena pelas mais recentes
  query += ' ORDER BY created_at DESC';

  const stmt = db.prepare(query);
  return stmt.all(...params);
}

/**
 * Busca uma copy específica por ID
 */
export function getCopyById(id) {
  const stmt = db.prepare('SELECT * FROM copies WHERE id = ?');
  return stmt.get(id);
}

/**
 * Alterna o status de favorita de uma copy
 */
export function toggleFavorite(id) {
  const copy = getCopyById(id);
  if (!copy) {
    throw new Error('Cópia não encontrada.');
  }

  const newFavoriteStatus = copy.is_favorite === 1 ? 0 : 1;
  const stmt = db.prepare('UPDATE copies SET is_favorite = ? WHERE id = ?');
  stmt.run(newFavoriteStatus, id);

  return { id, is_favorite: newFavoriteStatus };
}

/**
 * Atualiza o texto gerado da copy (edição manual)
 */
export function updateCopyText(id, generatedText) {
  const stmt = db.prepare('UPDATE copies SET generated_text = ? WHERE id = ?');
  const result = stmt.run(generatedText, id);

  if (result.changes === 0) {
    throw new Error('Cópia não encontrada ou não alterada.');
  }

  return getCopyById(id);
}

/**
 * Exclui uma copy do banco
 */
export function deleteCopy(id) {
  const stmt = db.prepare('DELETE FROM copies WHERE id = ?');
  const result = stmt.run(id);

  if (result.changes === 0) {
    throw new Error('Cópia não encontrada.');
  }

  return { success: true, id };
}

/**
 * Retorna estatísticas agregadas das copies
 */
export function getStats() {
  const totalStmt = db.prepare('SELECT COUNT(*) as count FROM copies');
  const total = totalStmt.get().count;

  const favoriteStmt = db.prepare('SELECT COUNT(*) as count FROM copies WHERE is_favorite = 1');
  const favorites = favoriteStmt.get().count;

  const frameworkStmt = db.prepare(`
    SELECT framework, COUNT(*) as count 
    FROM copies 
    GROUP BY framework 
    ORDER BY count DESC
  `);
  const frameworks = frameworkStmt.all();

  const toneStmt = db.prepare(`
    SELECT tone, COUNT(*) as count 
    FROM copies 
    GROUP BY tone 
    ORDER BY count DESC
  `);
  const tones = toneStmt.all();

  return {
    totalCopies: total,
    totalFavorites: favorites,
    frameworkDistribution: frameworks,
    toneDistribution: tones
  };
}
