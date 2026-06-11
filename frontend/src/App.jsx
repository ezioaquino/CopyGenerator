import React, { useState, useEffect } from 'react';
import { Sparkles, BarChart3, HelpCircle } from 'lucide-react';
import CopyForm from './components/CopyForm';
import CopyOutput from './components/CopyOutput';
import HistoryList from './components/HistoryList';
import StatsPanel from './components/StatsPanel';

export default function App() {
  const [copies, setCopies] = useState([]);
  const [activeCopy, setActiveCopy] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('builder'); // 'builder' ou 'stats'
  const [toast, setToast] = useState({ show: false, message: '' });

  // Busca o histórico de copies ao iniciar a aplicação
  useEffect(() => {
    fetchCopies();
  }, []);

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 3000);
  };

  const fetchCopies = async () => {
    try {
      const response = await fetch('/api/copies');
      if (!response.ok) throw new Error('Falha ao buscar histórico.');
      const data = await response.json();
      setCopies(data);
      if (data.length > 0 && !activeCopy) {
        setActiveCopy(data[0]); // Seleciona a mais recente por padrão
      }
    } catch (error) {
      console.error(error);
      showToast('Erro ao carregar o histórico de copies.');
    }
  };

  const handleGenerate = async (formData) => {
    setIsLoading(true);
    setActiveTab('builder');
    try {
      const response = await fetch('/api/copies/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro na geração de copy.');
      }

      setCopies((prev) => [data, ...prev]);
      setActiveCopy(data);
      showToast('Copy gerada e salva com sucesso!');
    } catch (error) {
      console.error(error);
      // Substituído alert() por showToast para manter UX consistente (Fix #2)
      showToast(`Erro: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = async (id) => {
    try {
      const response = await fetch(`/api/copies/${id}/favorite`, {
        method: 'PATCH'
      });
      if (!response.ok) throw new Error('Erro ao favoritar.');
      const updated = await response.json();

      // Atualiza o estado local
      setCopies((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_favorite: updated.is_favorite } : c))
      );

      if (activeCopy && activeCopy.id === id) {
        setActiveCopy((prev) => ({ ...prev, is_favorite: updated.is_favorite }));
      }

      showToast(updated.is_favorite === 1 ? 'Adicionado aos favoritos!' : 'Removido dos favoritos.');
    } catch (error) {
      console.error(error);
      showToast('Erro ao atualizar favorito.');
    }
  };

  const handleUpdateText = async (id, newText) => {
    try {
      const response = await fetch(`/api/copies/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ generatedText: newText })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Erro ao atualizar texto.');
      }

      const updated = await response.json();

      setCopies((prev) => prev.map((c) => (c.id === id ? updated : c)));
      setActiveCopy(updated);
    } catch (error) {
      console.error(error);
      alert(`Erro ao salvar edição: ${error.message}`);
    }
  };

  const handleDelete = async (id) => {
    try {
      // Calcula o substituto ANTES de atualizar o estado, evitando race condition (Fix #5)
      const remaining = copies.filter((c) => c.id !== id);

      const response = await fetch(`/api/copies/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Erro ao deletar copy.');

      setCopies(remaining);

      if (activeCopy && activeCopy.id === id) {
        setActiveCopy(remaining.length > 0 ? remaining[0] : null);
      }

      showToast('Copy deletada permanentemente.');
    } catch (error) {
      console.error(error);
      showToast('Erro ao deletar copy.');
    }
  };

  return (
    <div className="app-container">
      <div className="bg-glow"></div>
      
      {/* Navbar principal */}
      <header className="navbar">
        <div className="logo-section">
          <div className="logo-icon">C</div>
          <span className="logo-text">CopyGenerator.ai</span>
        </div>
        
        <nav className="nav-links">
          <button
            className={`nav-button ${activeTab === 'builder' ? 'active' : ''}`}
            onClick={() => setActiveTab('builder')}
          >
            <Sparkles size={16} />
            Gerar & Editar
          </button>
          <button
            className={`nav-button ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            <BarChart3 size={16} />
            Estatísticas
          </button>
        </nav>
      </header>

      {/* Área principal de Conteúdo */}
      <main className="main-content">
        
        {activeTab === 'builder' ? (
          <div className="dashboard-grid">
            
            {/* Coluna Esquerda: Formulário de Entrada */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <CopyForm onSubmit={handleGenerate} isLoading={isLoading} />
              
              {/* No celular ou telas médias, o histórico renderiza abaixo do formulário */}
              <HistoryList
                copies={copies}
                activeCopyId={activeCopy?.id}
                onSelectCopy={setActiveCopy}
                onToggleFavorite={handleToggleFavorite}
                onDelete={handleDelete}
              />
            </div>

            {/* Coluna Direita: Exibição do Resultado */}
            <div>
              <CopyOutput
                copy={activeCopy}
                isLoading={isLoading}
                onToggleFavorite={handleToggleFavorite}
                onUpdateText={handleUpdateText}
                onDelete={handleDelete}
                showToast={showToast}
              />
            </div>

          </div>
        ) : (
          <div>
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">
                  <span>📊</span> Dashboard de Desempenho
                </h2>
                <span className="tag tag-tone">Métricas em tempo real</span>
              </div>
              <div className="card-body">
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Acompanhe a distribuição de frameworks, tons de voz e o volume total de textos criados para o seu portfólio.
                </p>
                <StatsPanel copies={copies} />
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Rodapé institucional */}
      <footer style={{ 
        textAlign: 'center', 
        padding: '1.5rem', 
        fontSize: '0.8rem', 
        color: 'var(--text-muted)', 
        borderTop: '1px solid var(--border-color)',
        marginTop: '3rem',
        backgroundColor: 'rgba(18, 18, 26, 0.4)',
        zIndex: 1
      }}>
        <p>&copy; 2026 CopyGenerator.ai. Projeto Portfólio Premium — Desenvolvido com Node.js, SQLite e Gemini API.</p>
      </footer>

      {/* Toast Alert Flutuante */}
      {toast.show && (
        <div className="toast">
          <span>✔️</span>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
