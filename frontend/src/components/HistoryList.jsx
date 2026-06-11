import React, { useState, useMemo } from 'react';
import { Star, Trash2, Search, Clock, Filter } from 'lucide-react';

/**
 * HistoryList — Lista lateral de copies geradas com busca, filtro e ações inline.
 *
 * Props:
 *   copies          (array)    — lista completa de copies do estado global
 *   activeCopyId    (number)   — id da copy atualmente selecionada no output
 *   onSelectCopy    (função)   — callback ao clicar num item da lista
 *   onToggleFavorite(função)   — callback para favoritar/desfavoritar por id
 *   onDelete        (função)   — callback para deletar por id
 */
export default function HistoryList({
  copies,
  activeCopyId,
  onSelectCopy,
  onToggleFavorite,
  onDelete,
}) {
  // Controles de busca e filtro — estado local (não sobe para o App)
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFavorites, setFilterFavorites] = useState(false);

  // Lista filtrada e buscada — recalculada apenas quando as dependências mudam
  const filteredCopies = useMemo(() => {
    let result = copies;

    // Filtro por favoritos
    if (filterFavorites) {
      result = result.filter((c) => c.is_favorite === 1);
    }

    // Busca por nome do produto ou texto gerado (case-insensitive)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.product_name.toLowerCase().includes(query) ||
          c.generated_text.toLowerCase().includes(query)
      );
    }

    return result;
  }, [copies, searchQuery, filterFavorites]);

  // Formata a data de criação de forma legível (ex: "11 jun, 19:04")
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    }) + ', ' + date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Impede que o clique nos botões de ação propague para o card (que seleciona a copy)
  const stopPropagation = (e) => e.stopPropagation();

  // Handler de delete com confirmação nativa — único caso permitido pelo projeto
  const handleDelete = (e, id) => {
    stopPropagation(e);
    if (window.confirm('Deseja realmente deletar esta copy do histórico?')) {
      onDelete(id);
    }
  };

  return (
    <div className="card">
      {/* Cabeçalho com contador de resultados */}
      <div className="card-header">
        <h2 className="card-title">
          <span>📋</span> Histórico
        </h2>
        <span className="tag">
          {filteredCopies.length} de {copies.length}
        </span>
      </div>

      <div className="card-body" style={{ paddingBottom: '0.75rem' }}>

        {/* Barra de busca e botão de filtro por favoritos */}
        <div className="history-search-bar">
          <div style={{ position: 'relative', flex: 1 }}>
            {/* Ícone de busca sobreposto ao input */}
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                pointerEvents: 'none',
              }}
            />
            <input
              id="history-search"
              type="text"
              className="form-input"
              placeholder="Buscar por produto ou texto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.2rem', fontSize: '0.875rem' }}
            />
          </div>

          {/* Botão de filtro por favoritos — ativo quando ligado */}
          <button
            id="btn-filter-favorites"
            title={filterFavorites ? 'Mostrar todas' : 'Apenas favoritos'}
            onClick={() => setFilterFavorites((prev) => !prev)}
            style={{
              background: filterFavorites
                ? 'rgba(245, 158, 11, 0.12)'
                : 'var(--bg-surface)',
              border: `1px solid ${filterFavorites ? 'rgba(245, 158, 11, 0.3)' : 'var(--border-color)'}`,
              color: filterFavorites ? 'var(--color-warning)' : 'var(--text-muted)',
              borderRadius: 'var(--radius-md)',
              width: '42px',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'var(--transition-fast)',
              flexShrink: 0,
            }}
          >
            <Filter size={15} />
          </button>
        </div>

        {/* Lista de cards do histórico */}
        <div className="history-list">

          {/* Estado vazio — nenhuma copy gerada ainda */}
          {copies.length === 0 && (
            <div className="history-empty">
              <p>✨ Nenhuma copy gerada ainda.</p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                Preencha o formulário ao lado para começar.
              </p>
            </div>
          )}

          {/* Estado vazio após filtro/busca */}
          {copies.length > 0 && filteredCopies.length === 0 && (
            <div className="history-empty">
              <p>🔍 Nenhum resultado encontrado.</p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                Tente outro termo ou remova o filtro de favoritos.
              </p>
            </div>
          )}

          {/* Renderiza cada copy como um card clicável */}
          {filteredCopies.map((copy) => (
            <div
              key={copy.id}
              id={`history-card-${copy.id}`}
              className={`history-card ${activeCopyId === copy.id ? 'active' : ''}`}
              onClick={() => onSelectCopy(copy)}
              role="button"
              tabIndex={0}
              // Acessibilidade: permite seleção via teclado (Enter/Space)
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectCopy(copy);
                }
              }}
              aria-pressed={activeCopyId === copy.id}
              aria-label={`Selecionar copy: ${copy.product_name}`}
            >
              {/* Linha superior: título + botões de ação */}
              <div className="history-card-header">
                <span className="history-card-title">{copy.product_name}</span>

                <div className="history-card-actions" onClick={stopPropagation}>
                  {/* Botão favoritar */}
                  <button
                    id={`btn-favorite-${copy.id}`}
                    className={`history-action-btn favorite ${copy.is_favorite === 1 ? 'active' : ''}`}
                    title={copy.is_favorite === 1 ? 'Remover dos favoritos' : 'Favoritar'}
                    onClick={(e) => {
                      stopPropagation(e);
                      onToggleFavorite(copy.id);
                    }}
                    aria-label={copy.is_favorite === 1 ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                  >
                    <Star
                      size={15}
                      fill={copy.is_favorite === 1 ? 'currentColor' : 'none'}
                    />
                  </button>

                  {/* Botão deletar */}
                  <button
                    id={`btn-delete-${copy.id}`}
                    className="history-action-btn delete"
                    title="Deletar copy"
                    onClick={(e) => handleDelete(e, copy.id)}
                    aria-label="Deletar esta copy"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Tags de metadados: framework e tom de voz */}
              <div className="history-card-tags">
                <span className="tag tag-framework">{copy.framework}</span>
                <span className="tag tag-tone">{copy.tone.split(' ')[0]}</span>
                {copy.is_favorite === 1 && (
                  <span className="tag tag-favorite">⭐ Favorito</span>
                )}
              </div>

              {/* Preview de 2 linhas do texto gerado */}
              <p className="history-card-preview">
                {copy.generated_text}
              </p>

              {/* Rodapé: data de criação com ícone de relógio */}
              <div className="history-card-meta">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Clock size={12} />
                  {formatDate(copy.created_at)}
                </span>
                <span style={{ color: 'var(--color-primary)', fontSize: '0.75rem' }}>
                  {activeCopyId === copy.id ? '● Selecionado' : 'Ver copy →'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
