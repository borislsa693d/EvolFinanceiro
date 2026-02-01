import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { FaTachometerAlt, FaChartPie, FaList, FaCalendarAlt, FaCog, FaUser, FaAngleLeft, FaAngleRight, FaAngleDown, FaUniversity, FaCreditCard, FaTags, FaTable, FaArrowUp, FaArrowDown, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import './NavBoard.css';

interface NavBoardProps {
  isExpanded: boolean;
  onToggle: () => void;
}

const NavBoard: React.FC<NavBoardProps> = ({ isExpanded, onToggle }) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isForecastOpen, setIsForecastOpen] = useState(false);

  const isSettingsRoute =
    location.pathname === '/configuracoes' ||
    location.pathname === '/contas' ||
    location.pathname === '/cartoes' ||
    location.pathname === '/categorias';

  const isForecastRoute =
    location.pathname === '/previsao' ||
    location.pathname === '/previsao/receitas-fixas' ||
    location.pathname === '/previsao/despesas-fixas';

  useEffect(() => {
    setIsSettingsOpen(isSettingsRoute);
  }, [isSettingsRoute]);

  useEffect(() => {
    setIsForecastOpen(isForecastRoute);
  }, [isForecastRoute]);

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
            <span className="nav-title-full">
              Impulso<span className="brand-plus">+</span>
            </span>
            <span className="nav-title-short">
              I<span className="brand-plus">+</span>
            </span>
          </div>
          <button className="nav-toggle" onClick={onToggle} aria-label="Alternar menu">
            {isExpanded ? <FaAngleLeft /> : <FaAngleRight />}
          </button>
        </div>
        <nav>
          <ul>
            <li onClick={handleLinkClick}><NavLink to="/" end><FaTachometerAlt /><span className="nav-label">Dashboard</span></NavLink></li>
            <li onClick={handleLinkClick}><NavLink to="/extrato"><FaList /><span className="nav-label">Extrato</span></NavLink></li>
            <li onClick={handleLinkClick}><NavLink to="/analises"><FaChartPie /><span className="nav-label">Análises</span></NavLink></li>
            <li className={`nav-item-with-children ${isForecastOpen ? 'is-open' : ''}`}>
              <button
                type="button"
                onClick={() => setIsForecastOpen((prev) => !prev)}
                className={`nav-link-with-caret${isForecastOpen ? ' active' : ''}`}
              >
                <span className="nav-link-main">
                  <FaCalendarAlt />
                  <span className="nav-label">Previsão</span>
                </span>
                <FaAngleDown className="nav-caret" />
              </button>
              <ul className="nav-submenu">
                <li onClick={handleLinkClick}>
                  <NavLink to="/previsao">
                    <FaCalendarAlt />
                    <span className="nav-label">Projeção Mensal</span>
                  </NavLink>
                </li>
                <li onClick={handleLinkClick}>
                  <NavLink to="/previsao/receitas-fixas">
                    <FaArrowUp />
                    <span className="nav-label">Receitas Fixas</span>
                  </NavLink>
                </li>
                <li onClick={handleLinkClick}>
                  <NavLink to="/previsao/despesas-fixas">
                    <FaArrowDown />
                    <span className="nav-label">Despesas Fixas</span>
                  </NavLink>
                </li>
              </ul>
            </li>
            <li className={`nav-item-with-children ${isSettingsOpen ? 'is-open' : ''}`}>
              <button
                type="button"
                onClick={() => setIsSettingsOpen((prev) => !prev)}
                className={`nav-link-with-caret${isSettingsOpen ? ' active' : ''}`}
              >
                <span className="nav-link-main">
                  <FaCog />
                  <span className="nav-label">Configurações</span>
                </span>
                <FaAngleDown className="nav-caret" />
              </button>
              <ul className="nav-submenu">
                <li onClick={handleLinkClick}>
                  <NavLink to="/contas">
                    <FaUniversity />
                    <span className="nav-label">Contas Bancárias</span>
                  </NavLink>
                </li>
                <li onClick={handleLinkClick}>
                  <NavLink to="/cartoes">
                    <FaCreditCard />
                    <span className="nav-label">Cartões</span>
                  </NavLink>
                </li>
                <li onClick={handleLinkClick}>
                  <NavLink to="/categorias">
                    <FaTags />
                    <span className="nav-label">Categorias</span>
                  </NavLink>
                </li>
              </ul>
            </li>
          </ul>
        </nav>
      </div>
      <div className="nav-board-footer">
        <nav>
          <ul>
            <li onClick={handleLinkClick}><NavLink to="/perfil"><FaUser /><span className="nav-label">Meu Perfil</span></NavLink></li>
            <li>
              <button
                type="button"
                className="nav-logout-button"
                onClick={handleLogout}
              >
                <FaSignOutAlt />
                <span className="nav-label">Sair</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default NavBoard;
  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };
