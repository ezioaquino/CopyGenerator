import React, { useMemo } from 'react';
import { FileText, Star, BarChart2, Mic } from 'lucide-react';

/**
 * StatsPanel — Painel de estatísticas calculadas a partir do histórico de copies.
 *
 * Props:
 *   copies (array) — lista completa de copies do estado global
 *
 * Exibe:
 *   - Total gerado e total de favoritos (cards de métricas)
 *   - Breakdown por framework (barra horizontal proporcional)
 *   - Breakdown por tom de voz (barra horizontal proporcional)
 */
export default function StatsPanel({ copies }) {
  // Todos os cálculos são memoizados para evitar reprocessamento desnecessário
  const stats = useMemo(() => {
    // Contagem geral
    const total = copies.length;
    const favorites = copies.filter((c) => c.is_favorite === 1).length;

    // Agrupa copies por framework e conta cada ocorrência
    const frameworkCount = copies.reduce((acc, c) => {
      acc[c.framework] = (acc[c.framework] || 0) + 1;
      return acc;
    }, {});

    // Agrupa copies por tom de voz e conta cada ocorrência
    // Usa apenas a primeira palavra do tom para exibição compacta
    const toneCount = copies.reduce((acc, c) => {
      const shortTone = c.tone.split(' ')[0]; // ex: "Persuasivo" de "Persuasivo e Vendedor"
      acc[shortTone] = (acc[shortTone] || 0) + 1;
      return acc;
    }, {});

    // Ordena os grupos por quantidade (do maior para o menor)
    const sortedFrameworks = Object.entries(frameworkCount).sort((a, b) => b[1] - a[1]);
    const sortedTones = Object.entries(toneCount).sort((a, b) => b[1] - a[1]);

    return { total, favorites, sortedFrameworks, sortedTones };
  }, [copies]);

  // Estado vazio — nenhuma copy gerada ainda
  if (stats.total === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '3rem 1rem',
          color: 'var(--text-muted)',
        }}
      >
        <BarChart2
          size={48}
          style={{ opacity: 0.4, marginBottom: '1rem', color: 'var(--color-primary)' }}
        />
        <p style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>
          Ainda sem dados para exibir
        </p>
        <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
          Gere sua primeira copy para ver as estatísticas aqui.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* --- Cards de métricas principais --- */}
      <div className="stats-grid">

        {/* Total de copies geradas */}
        <div className="stats-card">
          <div className="stats-icon">
            <FileText size={22} />
          </div>
          <div className="stats-info">
            <span className="stats-value">{stats.total}</span>
            <span className="stats-label">Copies Geradas</span>
          </div>
        </div>

        {/* Total de favoritos */}
        <div
          className="stats-card"
          style={{
            // Destaca o card de favoritos com cor âmbar quando há algum
            borderColor: stats.favorites > 0 ? 'rgba(245, 158, 11, 0.2)' : undefined,
          }}
        >
          <div
            className="stats-icon"
            style={{
              backgroundColor:
                stats.favorites > 0
                  ? 'rgba(245, 158, 11, 0.12)'
                  : undefined,
              color:
                stats.favorites > 0 ? 'var(--color-warning)' : undefined,
            }}
          >
            <Star size={22} />
          </div>
          <div className="stats-info">
            <span className="stats-value">{stats.favorites}</span>
            <span className="stats-label">Favoritos</span>
          </div>
        </div>

        {/* Framework mais usado */}
        <div className="stats-card">
          <div
            className="stats-icon"
            style={{
              backgroundColor: 'rgba(168, 85, 247, 0.12)',
              color: 'var(--color-secondary)',
            }}
          >
            <BarChart2 size={22} />
          </div>
          <div className="stats-info">
            <span className="stats-value" style={{ fontSize: '1.2rem' }}>
              {stats.sortedFrameworks[0]?.[0] ?? '—'}
            </span>
            <span className="stats-label">Framework Top</span>
          </div>
        </div>

        {/* Tom de voz mais usado */}
        <div className="stats-card">
          <div
            className="stats-icon"
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              color: 'var(--color-success)',
            }}
          >
            <Mic size={22} />
          </div>
          <div className="stats-info">
            <span className="stats-value" style={{ fontSize: '1.2rem' }}>
              {stats.sortedTones[0]?.[0] ?? '—'}
            </span>
            <span className="stats-label">Tom Predominante</span>
          </div>
        </div>
      </div>

      {/* --- Gráficos de barras horizontais --- */}
      <div className="stats-charts-row">

        {/* Breakdown por Framework */}
        <div>
          <h3
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: '0.25rem',
            }}
          >
            📐 Por Framework
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Distribuição dos frameworks utilizados
          </p>

          <div className="chart-list">
            {stats.sortedFrameworks.map(([framework, count]) => {
              // Porcentagem relativa ao total para a barra proporcional
              const pct = Math.round((count / stats.total) * 100);
              return (
                <div key={framework} className="chart-bar-item">
                  <div className="chart-bar-info">
                    <span>{framework}</span>
                    <span>
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="chart-bar-bg">
                    {/* Largura animada via transition no CSS */}
                    <div
                      className="chart-bar-fill"
                      style={{ width: `${pct}%` }}
                      role="progressbar"
                      aria-valuenow={pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${framework}: ${pct}%`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Breakdown por Tom de Voz */}
        <div>
          <h3
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: '0.25rem',
            }}
          >
            🎙️ Por Tom de Voz
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Qual estilo de escrita predomina
          </p>

          <div className="chart-list">
            {stats.sortedTones.map(([tone, count]) => {
              const pct = Math.round((count / stats.total) * 100);
              return (
                <div key={tone} className="chart-bar-item">
                  <div className="chart-bar-info">
                    <span>{tone}</span>
                    <span>
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="chart-bar-bg">
                    <div
                      className="chart-bar-fill"
                      // Cor alternativa para diferenciar visualmente do gráfico de frameworks
                      style={{
                        width: `${pct}%`,
                        background: 'linear-gradient(135deg, #06b6d4 0%, #6366f1 100%)',
                      }}
                      role="progressbar"
                      aria-valuenow={pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${tone}: ${pct}%`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
