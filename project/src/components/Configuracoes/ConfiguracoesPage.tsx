import { useNavigate } from 'react-router-dom';
import './SharedSettings.css';

const ConfiguracoesPage = () => {
  const navigate = useNavigate();

  return (
    <div className="config-page-container">
      <h2 className="config-page-title">Configurações</h2>
      
      <div className="config-options-grid">
        <div 
          className="config-option-card"
          onClick={() => navigate('/contas')}
        >
          <h3>Contas Bancárias</h3>
          <p>Gerencie suas contas bancárias</p>
        </div>

        <div 
          className="config-option-card"
          onClick={() => navigate('/cartoes')}
        >
          <h3>Cartões de Crédito</h3>
          <p>Gerencie seus cartões de crédito</p>
        </div>

        <div 
          className="config-option-card"
          onClick={() => navigate('/categorias')}
        >
          <h3>Categorias</h3>
          <p>Gerencie categorias de transações</p>
        </div>
      </div>
    </div>
  );
};

export default ConfiguracoesPage;


