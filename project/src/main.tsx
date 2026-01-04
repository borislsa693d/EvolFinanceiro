import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './contexts/AuthContext';
import App from './App.tsx';
import './index.css';
import './components/Layout/NavBoard.css';
import './components/Layout/Layout.css';
import './components/Extrato/Extrato.css';
import './components/Previsao/Previsao.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);
