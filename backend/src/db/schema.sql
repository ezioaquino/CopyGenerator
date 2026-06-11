-- Tabela para armazenar as copies geradas e informações relacionadas
CREATE TABLE IF NOT EXISTS copies (
    id TEXT PRIMARY KEY,
    product_name TEXT NOT NULL,
    product_description TEXT NOT NULL,
    target_audience TEXT NOT NULL,
    tone TEXT NOT NULL,
    framework TEXT NOT NULL,
    copy_type TEXT NOT NULL,
    generated_text TEXT NOT NULL,
    prompt_used TEXT NOT NULL,
    is_favorite INTEGER DEFAULT 0, -- 0 = falso, 1 = verdadeiro
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
);
