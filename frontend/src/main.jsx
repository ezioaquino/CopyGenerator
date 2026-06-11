// Entry point da aplicação React
// Usa ReactDOM.createRoot (API moderna do React 18+) para renderização concurrent
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Estilos globais — deve ser importado antes do App para garantir a cascata correta
import './styles/global.css';

// Componente raiz da aplicação
import App from './App.jsx';

// Monta a aplicação no elemento #root definido no index.html
// StrictMode ativa verificações adicionais em desenvolvimento (sem impacto em produção)
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
