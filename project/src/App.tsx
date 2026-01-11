import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import AnalisesPage from './components/Analises/AnalisesPage';
import Extrato from './components/Extrato/Extrato';
import PrevisaoPage from './components/Previsao/PrevisaoPage';
import PerfilPage from './components/Perfil/PerfilPage';
import MenuPage from './components/Menu/MenuPage';
import NewTransactionPage from './components/Transactions/NewTransactionPage';
import ConfiguracoesPage from './components/Configuracoes/ConfiguracoesPage';
import ContasPage from './components/Configuracoes/ContasPage';
import CartoesPage from './components/Configuracoes/CartoesPage';
import CategoriasPage from './components/Configuracoes/CategoriasPage';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

function App() {
  const { user, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(true);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.5rem'
      }}>
        Carregando...
      </div>
    );
  }

  if (!user) {
    return (
      <>
        {showLogin ? (
          <Login onToggle={() => setShowLogin(false)} />
        ) : (
          <Register onToggle={() => setShowLogin(true)} />
        )}
      </>
    );
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analises" element={<AnalisesPage />} />
          <Route path="/extrato" element={<Extrato />} />
          <Route path="/previsao" element={<PrevisaoPage />} />
          <Route path="/configuracoes" element={<ConfiguracoesPage />} />
          <Route path="/contas" element={<ContasPage />} />
          <Route path="/cartoes" element={<CartoesPage />} />
          <Route path="/categorias" element={<CategoriasPage />} />
          <Route path="/perfil" element={<PerfilPage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/new-transaction" element={<NewTransactionPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
