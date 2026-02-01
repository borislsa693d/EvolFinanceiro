import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import AnalisesPage from './components/Analises/AnalisesPage';
import Extrato from './components/Extrato/Extrato';
import PrevisaoPage from './components/Previsao/PrevisaoPage';
import ReceitasFixasPage from './components/Previsao/ReceitasFixasPage';
import DespesasFixasPage from './components/Previsao/DespesasFixasPage';
import PerfilPage from './components/Perfil/PerfilPage';
import MenuPage from './components/Menu/MenuPage';
import NewTransactionPage from './components/Transactions/NewTransactionPage';
import ConfiguracoesPage from './components/Configuracoes/ConfiguracoesPage';
import ContasPage from './components/Configuracoes/ContasPage';
import CartoesPage from './components/Configuracoes/CartoesPage';
import CategoriasPage from './components/Configuracoes/CategoriasPage';
import LandingPage from './components/Landing/LandingPage';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

function App() {
  const { user, loading } = useAuth();
  const [authView, setAuthView] = useState<'landing' | 'login' | 'register'>('landing');

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
    if (window.location.pathname !== '/') {
      window.location.replace('/');
      return null;
    }
    return (
      <>
        {authView === 'landing' && (
          <LandingPage
            onLogin={() => setAuthView('login')}
            onRegister={() => setAuthView('register')}
          />
        )}
        {authView === 'login' && (
          <Login onToggle={() => setAuthView('register')} />
        )}
        {authView === 'register' && (
          <Register onToggle={() => setAuthView('login')} />
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
          <Route path="/previsao/receitas-fixas" element={<ReceitasFixasPage />} />
          <Route path="/previsao/despesas-fixas" element={<DespesasFixasPage />} />
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
