import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define o caminho do banco de dados baseado no .env ou fallback
const dbPathInput = process.env.DATABASE_PATH || 'src/db/copy_generator.db';
// Garante que o caminho seja absoluto relativo à raiz do backend
const rootDir = path.resolve(__dirname, '../../');
const dbPath = path.isAbsolute(dbPathInput) ? dbPathInput : path.join(rootDir, dbPathInput);

// Garante que o diretório do banco exista
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

console.log(`[Database] Conectando ao banco de dados em: ${dbPath}`);

const db = new Database(dbPath, { verbose: console.log });
db.pragma('journal_mode = WAL');

// Inicializa o banco de dados rodando o schema.sql
try {
  const schemaPath = path.join(rootDir, 'src/db/schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schema);
    console.log('[Database] Tabelas inicializadas com sucesso.');
  } else {
    console.warn('[Database] Arquivo schema.sql não encontrado. Ignorando inicialização automática.');
  }
} catch (error) {
  console.error('[Database] Erro ao inicializar o banco de dados:', error);
}

export default db;
