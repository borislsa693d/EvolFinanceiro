import { NavLink } from 'react-router-dom';
import { FaTachometerAlt, FaChartPie, FaList, FaCalendarAlt, FaCog, FaUser } from 'react-icons/fa';
import './NavBoard.css';

interface NavBoardProps {
  isOpen: boolean;
  onClose: () => void;
}

const NavBoard: React.FC<NavBoardProps> = ({ isOpen, onClose }) => {
  const handleLinkClick = () => {
    // Close the navboard on mobile after a link is clicked
    if (window.innerWidth <= 768) {
      onClose();
    }
  };

  return (
    <div className={`nav-board ${isOpen ? 'is-open' : ''}`}>
      <div>
        <h1 className="text-2xl font-bold mb-10 text-white">EvolFinanceiro</h1>
        <nav>
          <ul>
            <li onClick={handleLinkClick}><NavLink to="/" end><FaTachometerAlt /> Dashboard</NavLink></li>
            <li onClick={handleLinkClick}><NavLink to="/analises"><FaChartPie /> Análises</NavLink></li>
            <li onClick={handleLinkClick}><NavLink to="/extrato"><FaList /> Extrato</NavLink></li>
            <li onClick={handleLinkClick}><NavLink to="/previsao"><FaCalendarAlt /> Previsão</NavLink></li>
            <li onClick={handleLinkClick}><NavLink to="/configuracoes"><FaCog /> Configurações</NavLink></li>
          </ul>
        </nav>
      </div>
      <div className="nav-board-footer">
        <nav>
          <ul>
            <li onClick={handleLinkClick}><NavLink to="/perfil"><FaUser /> Meu Perfil</NavLink></li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default NavBoard;
