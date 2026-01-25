import { NavLink } from 'react-router-dom';
import { FaTachometerAlt, FaChartPie, FaList, FaCalendarAlt, FaCog, FaUser, FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import './NavBoard.css';

interface NavBoardProps {
  isExpanded: boolean;
  onToggle: () => void;
}

const NavBoard: React.FC<NavBoardProps> = ({ isExpanded, onToggle }) => {
  const handleLinkClick = () => {
    // Close the navboard on mobile after a link is clicked
    if (window.innerWidth <= 768) {
      onToggle();
    }
  };

  return (
    <div className={`nav-board ${isExpanded ? 'is-expanded' : 'is-collapsed'}`}>
      <div>
        <div className="nav-board-header">
          <div className="nav-title">
            <span className="nav-title-full">EvolFinanceiro</span>
            <span className="nav-title-short">EF</span>
          </div>
          <button className="nav-toggle" onClick={onToggle} aria-label="Alternar menu">
            {isExpanded ? <FaAngleLeft /> : <FaAngleRight />}
          </button>
        </div>
        <nav>
          <ul>
            <li onClick={handleLinkClick}><NavLink to="/" end><FaTachometerAlt /><span className="nav-label">Dashboard</span></NavLink></li>
            <li onClick={handleLinkClick}><NavLink to="/analises"><FaChartPie /><span className="nav-label">Análises</span></NavLink></li>
            <li onClick={handleLinkClick}><NavLink to="/extrato"><FaList /><span className="nav-label">Extrato</span></NavLink></li>
            <li onClick={handleLinkClick}><NavLink to="/previsao"><FaCalendarAlt /><span className="nav-label">Previsão</span></NavLink></li>
            <li onClick={handleLinkClick}><NavLink to="/configuracoes"><FaCog /><span className="nav-label">Configurações</span></NavLink></li>
          </ul>
        </nav>
      </div>
      <div className="nav-board-footer">
        <nav>
          <ul>
            <li onClick={handleLinkClick}><NavLink to="/perfil"><FaUser /><span className="nav-label">Meu Perfil</span></NavLink></li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default NavBoard;
