import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

// Opções dos campos de seleção — definidas fora do componente para evitar
// recriação a cada render (otimização de referência estável)
const TONE_OPTIONS = [
  { value: 'Persuasivo e Vendedor',    label: '⚡ Persuasivo' },
  { value: 'Profissional e Técnico',   label: '👔 Profissional' },
  { value: 'Urgente e Escasso',        label: '⏳ Urgente (Escassez)' },
  { value: 'Emocional e Narrativo',    label: '❤️ Emocional / Storytelling' },
  { value: 'Amigável e Descontraído',  label: '💬 Amigável' },
];

const FRAMEWORK_OPTIONS = [
  { value: 'AIDA', label: 'AIDA (Atenção, Interesse, Desejo, Ação)' },
  { value: 'PAS',  label: 'PAS (Problema, Agitação, Solução)' },
  { value: 'BAB',  label: 'BAB (Antes, Depois, Ponte)' },
  { value: 'FAB',  label: 'FAB (Features, Advantages, Benefits)' },
  { value: 'VSL',  label: '🎬 Roteiro VSL (Vídeo Sensorial)' },
];

const COPY_TYPE_OPTIONS = [
  { value: 'Anúncio de Rede Social (Instagram/Facebook)', label: 'Anúncio de Rede Social (Instagram/Facebook)' },
  { value: 'Anúncio de Pesquisa do Google',              label: 'Anúncio de Pesquisa do Google' },
  { value: 'E-mail de Vendas de Alta Conversão',         label: 'E-mail de Vendas de Alta Conversão' },
  { value: 'Headline e Subtítulo para Landing Page',     label: 'Headline para Landing Page' },
  { value: 'Legenda para Post Orgânico',                 label: 'Legenda para Post Orgânico' },
  { value: 'Roteiro de Vídeo de Vendas (VSL)',           label: 'Roteiro de Vídeo de Vendas (VSL)' },
];

// Estado inicial isolado em constante para facilitar reset do formulário
const INITIAL_FORM_STATE = {
  productName: '',
  productDescription: '',
  targetAudience: '',
  tone: 'Persuasivo e Vendedor',
  framework: 'AIDA',
  copyType: 'Anúncio de Rede Social (Instagram/Facebook)',
};

/**
 * CopyForm — Formulário principal de configuração da copy.
 *
 * Props:
 *   onSubmit   (função) — chamada com os dados do formulário ao submeter
 *   isLoading  (boolean) — desabilita todos os campos durante a geração
 */
export default function CopyForm({ onSubmit, isLoading }) {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  // Atualiza o campo alterado e aplica lógica de dependência entre campos
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Quando o usuário escolhe VSL como framework, o tipo de copy
      // é forçado para roteiro VSL (único veículo compatível)
      if (name === 'framework' && value === 'VSL') {
        updated.copyType = 'Roteiro de Vídeo de Vendas (VSL)';
      }

      // Quando sai do VSL, reseta o tipo de copy para o padrão
      if (name === 'framework' && value !== 'VSL' && prev.framework === 'VSL') {
        updated.copyType = INITIAL_FORM_STATE.copyType;
      }

      return updated;
    });
  };

  // Validação leve no cliente antes de enviar ao backend
  const handleSubmit = (e) => {
    e.preventDefault();

    // Todos os campos marcados com * são obrigatórios
    if (
      !formData.productName.trim() ||
      !formData.productDescription.trim() ||
      !formData.targetAudience.trim()
    ) {
      // Sem alert() — a validação HTML5 (required) já cuida do feedback visual
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="card">
      {/* Cabeçalho do card */}
      <div className="card-header">
        <h2 className="card-title">
          <span>✍️</span> Parâmetros da Copy
        </h2>
      </div>

      <div className="card-body">
        <form onSubmit={handleSubmit} noValidate>

          {/* Campo: Nome do Produto */}
          <div className="form-group">
            <label className="form-label" htmlFor="productName">
              Nome do Produto / Marca <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <input
              type="text"
              id="productName"
              name="productName"
              className="form-input"
              placeholder="Ex: Curso de Tráfego Pago, Sabores da América Latina"
              value={formData.productName}
              onChange={handleChange}
              disabled={isLoading}
              required
              maxLength={100}
            />
          </div>

          {/* Campo: Descrição / Benefícios do Produto */}
          <div className="form-group">
            <label className="form-label" htmlFor="productDescription">
              O que o produto faz? (Benefícios/Diferenciais){' '}
              <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <textarea
              id="productDescription"
              name="productDescription"
              className="form-textarea"
              placeholder="Ex: Livro digital com 50 receitas tradicionais da culinária latina explicadas passo a passo, incluindo bônus com guia de temperos e substitutos comuns do supermercado."
              value={formData.productDescription}
              onChange={handleChange}
              disabled={isLoading}
              required
              rows={4}
            />
          </div>

          {/* Campo: Público-Alvo */}
          <div className="form-group">
            <label className="form-label" htmlFor="targetAudience">
              Público-Alvo <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <input
              type="text"
              id="targetAudience"
              name="targetAudience"
              className="form-input"
              placeholder="Ex: Entusiastas de culinária, pessoas que gostam de cozinhar em casa para amigos"
              value={formData.targetAudience}
              onChange={handleChange}
              disabled={isLoading}
              required
              maxLength={200}
            />
          </div>

          {/* Linha dupla: Tom de Voz + Framework (dois selects lado a lado) */}
          <div className="form-row">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="tone">
                Tom de Voz
              </label>
              <select
                id="tone"
                name="tone"
                className="form-select"
                value={formData.tone}
                onChange={handleChange}
                disabled={isLoading}
              >
                {TONE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="framework">
                Framework de Copy
              </label>
              <select
                id="framework"
                name="framework"
                className="form-select"
                value={formData.framework}
                onChange={handleChange}
                disabled={isLoading}
              >
                {FRAMEWORK_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Campo: Veículo / Tipo de Texto — bloqueado quando VSL está selecionado */}
          <div className="form-group" style={{ marginTop: '1.25rem' }}>
            <label className="form-label" htmlFor="copyType">
              Veículo / Tipo de Texto
              {formData.framework === 'VSL' && (
                <span
                  style={{
                    marginLeft: '0.5rem',
                    fontSize: '0.75rem',
                    color: 'var(--color-secondary)',
                    textTransform: 'none',
                    fontWeight: 400,
                  }}
                >
                  (fixo para VSL)
                </span>
              )}
            </label>
            <select
              id="copyType"
              name="copyType"
              className="form-select"
              value={formData.copyType}
              onChange={handleChange}
              // Bloqueia a seleção quando o framework VSL está ativo
              disabled={isLoading || formData.framework === 'VSL'}
            >
              {COPY_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Botão de Submit — exibe spinner durante o carregamento */}
          <button
            type="submit"
            id="btn-generate-copy"
            className="btn btn-primary"
            disabled={isLoading}
            style={{ marginTop: '1rem' }}
          >
            {isLoading ? (
              <>
                <Loader2
                  size={18}
                  style={{ animation: 'spin 1s linear infinite' }}
                />
                Gerando copy incrível...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Gerar Copy com IA
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
}
