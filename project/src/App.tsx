import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import AnalisesPage from './components/Analises/AnalisesPage';
import Extrato from './components/Extrato/Extrato';
import PrevisaoPage from './components/Previsao/PrevisaoPage';
import PerfilPage from './components/Perfil/PerfilPage';
import MenuPage from './components/Menu/MenuPage';
import NewTransactionPage from './components/Transactions/NewTransactionPage';
import ContasPage from './components/Configuracoes/ContasPage';
import CartoesPage from './components/Configuracoes/CartoesPage';
import CategoriasPage from './components/Configuracoes/CategoriasPage';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analises" element={<AnalisesPage />} />
          <Route path="/extrato" element={<Extrato />} />
          <Route path="/previsao" element={<PrevisaoPage />} />
          <Route path="/contas" element={<ContasPage />} />
          <Route path="/cartoes" element={<CartoesPage />} />
          <Route path="/categorias" element={<CategoriasPage />} />
          <Route path="/perfil" element={<PerfilPage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/new-transaction" element={<NewTransactionPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
