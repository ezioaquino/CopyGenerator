import React, { useState, useEffect } from 'react';
import { Copy, Star, Trash2, Edit3, Save, Download, Sparkles, Check, X, FileText } from 'lucide-react';
import { jsPDF } from 'jspdf';

export default function CopyOutput({ copy, isLoading, onToggleFavorite, onUpdateText, onDelete, showToast }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [copied, setCopied] = useState(false);

  // Sincroniza o texto editado quando a copy selecionada mudar
  useEffect(() => {
    if (copy) {
      setEditedText(copy.generated_text);
    }
    setIsEditing(false);
    setCopied(false);
  }, [copy]);

  if (isLoading) {
    return (
      <div className="card" style={{ height: '100%', minHeight: '400px' }}>
        <div className="loader-wrapper">
          <div className="spinner"></div>
          <p className="pulse-text">Conectando ao cérebro artificial...</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Gerando argumentos persuasivos e ajustando o tom ideal...
          </p>
        </div>
      </div>
    );
  }

  if (!copy) {
    return (
      <div className="card" style={{ height: '100%', minHeight: '400px' }}>
        <div className="card-body" style={{ height: '100%' }}>
          <div className="output-placeholder">
            <Sparkles size={48} style={{ color: 'var(--color-primary)', opacity: 0.6 }} />
            <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>Nenhuma Copy Gerada</h3>
            <p style={{ maxWidth: '300px' }}>
              Preencha as informações do produto à esquerda e clique em **Gerar Copy** para iniciar a mágica.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleCopy = () => {
    const textToCopy = isEditing ? editedText : copy.generated_text;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    showToast('Copy copiada para a área de transferência!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = isEditing ? editedText : copy.generated_text;
    const element = document.createElement("a");
    const file = new Blob([text], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `Copy_${copy.product_name.replace(/\s+/g, '_')}_${copy.framework}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showToast('Arquivo TXT baixado com sucesso!');
  };

  const handleDownloadPDF = () => {
    const text = isEditing ? editedText : copy.generated_text;
    
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Margens e configurações iniciais
      const margin = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const contentWidth = pageWidth - (margin * 2);

      // Título do PDF
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('GERADOR DE COPY', margin, 20);

      // Metadados
      doc.setFontSize(9);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`Produto: ${copy.product_name}`, margin, 27);
      doc.text(`Framework: ${copy.framework} | Tom: ${copy.tone}`, margin, 32);
      
      // Linha separadora
      doc.setDrawColor(220, 220, 220);
      doc.line(margin, 35, pageWidth - margin, 35);

      // Conteúdo da Copy
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(10.5);
      
      // Limpa os marcadores de markdown antes de gerar o PDF
      const cleanText = text
        .replace(/\*\*/g, '') // remove negrito simples
        .replace(/#/g, '');   // remove tralhas de título

      const splitText = doc.splitTextToSize(cleanText, contentWidth);
      let y = 43;
      const pageHeight = doc.internal.pageSize.getHeight();
      
      splitText.forEach((line) => {
        // Se a linha vai ultrapassar o limite da página, cria nova página
        if (y > pageHeight - margin) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, margin, y);
        y += 5.5; // espaçamento de linha
      });

      doc.save(`Copy_${copy.product_name.replace(/\s+/g, '_')}_${copy.framework}.pdf`);
      showToast('Arquivo PDF baixado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      showToast('Erro ao exportar PDF, baixando TXT como fallback...');
      handleDownload();
    }
  };

  const handleSave = () => {
    if (!editedText.trim()) {
      // Substituído alert() por showToast para UX consistente (correção pendente auditoria)
      showToast('O texto da copy não pode estar vazio.');
      return;
    }
    onUpdateText(copy.id, editedText);
    setIsEditing(false);
    showToast('Copy editada e salva com sucesso!');
  };

  // Renderizador simples de Markdown para estilizar cabeçalhos e tags na visualização
  const renderFormattedText = (text) => {
    if (!text) return '';
    
    // Divide o texto em linhas e processa
    return text.split('\n').map((line, index) => {
      // Títulos principais (# Título ou ## Título)
      if (line.startsWith('#')) {
        const cleanLine = line.replace(/^#+\s*/, '');
        return <h3 key={index} style={{ margin: '1rem 0 0.5rem 0', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>{cleanLine}</h3>;
      }
      
      // Framework headers e Negritos estruturais (ex: **[ATENÇÃO]**)
      // Regex para encontrar blocos entre asteriscos duplos: **texto**
      const boldPattern = /\*\*(.*?)\*\*/g;
      if (boldPattern.test(line)) {
        const parts = line.split(boldPattern);
        return (
          <p key={index} style={{ marginBottom: '0.75rem' }}>
            {parts.map((part, i) => {
              // Partes ímpares na divisão por regex são as que combinam com o grupo de captura (ou seja, estavam entre **)
              if (i % 2 === 1) {
                // Se for um bloco delimitador (como [ATENÇÃO]), aplica estilo roxo
                const isHeaderTag = part.startsWith('[') && part.endsWith(']');
                return (
                  <strong 
                    key={i} 
                    style={{ 
                      color: isHeaderTag ? 'var(--color-secondary)' : 'var(--text-primary)', 
                      fontWeight: '700',
                      display: isHeaderTag ? 'block' : 'inline',
                      marginTop: isHeaderTag ? '0.75rem' : '0',
                      marginBottom: isHeaderTag ? '0.25rem' : '0',
                      fontSize: isHeaderTag ? '1.05rem' : 'inherit',
                      fontFamily: isHeaderTag ? 'var(--font-heading)' : 'inherit'
                    }}
                  >
                    {part}
                  </strong>
                );
              }
              return part;
            })}
          </p>
        );
      }

      // Linha em branco vira quebra de espaço
      if (line.trim() === '') {
        return <div key={index} style={{ height: '0.75rem' }}></div>;
      }

      // Linha comum
      return <p key={index} style={{ marginBottom: '0.75rem', color: 'var(--text-primary)' }}>{line}</p>;
    });
  };

  return (
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="card-header">
        <h2 className="card-title">
          <span>✨</span> Resultado Gerado
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span className="tag tag-framework">{copy.framework}</span>
          <span className="tag tag-tone">{copy.tone.split(' ')[0]}</span>
        </div>
      </div>
      
      <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {isEditing ? (
            <textarea
              className="form-textarea"
              style={{ flex: 1, minHeight: '300px', fontFamily: 'monospace', fontSize: '0.9rem', lineHeight: '1.5' }}
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
            />
          ) : (
            <div className="output-content">
              {renderFormattedText(copy.generated_text)}
            </div>
          )}
        </div>

        <div className="output-actions">
          {isEditing ? (
            <>
              <button 
                className="action-btn" 
                onClick={() => {
                  setEditedText(copy.generated_text);
                  setIsEditing(false);
                }} 
                title="Cancelar Edição"
              >
                <X size={18} />
              </button>
              <button 
                className="action-btn" 
                style={{ color: 'var(--color-success)', borderColor: 'rgba(16, 185, 129, 0.2)' }}
                onClick={handleSave} 
                title="Salvar Alterações"
              >
                <Save size={18} />
              </button>
            </>
          ) : (
            <>
              <button 
                className="action-btn" 
                onClick={() => setIsEditing(true)} 
                title="Editar Texto Manualmente"
              >
                <Edit3 size={18} />
              </button>
              <button 
                className="action-btn" 
                onClick={handleDownload} 
                title="Baixar como arquivo TXT"
              >
                <Download size={18} />
              </button>
              <button 
                className="action-btn" 
                onClick={handleDownloadPDF} 
                title="Baixar como arquivo PDF"
              >
                <FileText size={18} />
              </button>
              <button 
                className={`action-btn favorite ${copy.is_favorite === 1 ? 'active' : ''}`} 
                onClick={() => onToggleFavorite(copy.id)} 
                title={copy.is_favorite === 1 ? 'Remover dos Favoritos' : 'Marcar como Favorito'}
              >
                <Star size={18} fill={copy.is_favorite === 1 ? 'currentColor' : 'none'} />
              </button>
              <button 
                className="action-btn danger" 
                style={{ marginRight: 'auto' }} // Joga o deletar para a esquerda
                onClick={() => {
                  if (confirm('Deseja realmente deletar esta copy do histórico?')) {
                    onDelete(copy.id);
                  }
                }} 
                title="Deletar Copy"
              >
                <Trash2 size={18} />
              </button>
              <button 
                className={`btn btn-secondary`} 
                style={{ width: 'auto', display: 'inline-flex', gap: '0.5rem' }}
                onClick={handleCopy}
              >
                {copied ? <Check size={16} style={{ color: 'var(--color-success)' }} /> : <Copy size={16} />}
                {copied ? 'Copiado!' : 'Copiar Texto'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
