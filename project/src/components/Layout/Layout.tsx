import React, { useState, useEffect } from 'react';
import NavBoard from './NavBoard';
import BottomNavBar from './BottomNavBar'; // Import the new component
import { FaBars } from 'react-icons/fa';
import './Layout.css';
import './BottomNavBar.css'; // Import new CSS
import { useAuth } from '../../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const useIsMobile = (breakpoint = 1024) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= breakpoint);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= breakpoint);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
};

const Layout = ({ children }: LayoutProps) => {
  const [isNavExpanded, setIsNavExpanded] = useState(true);
  const { user } = useAuth();
  const isMobile = useIsMobile();

  const toggleNav = () => {
    if (!isMobile) {
      setIsNavExpanded(!isNavExpanded);
    }
  };

  return (
    <div className="layout">
      {!isMobile && <NavBoard isExpanded={isNavExpanded} onToggle={toggleNav} />}
      
      <main className="main-content" style={{ paddingBottom: isMobile ? '80px' : '0' }}>
        {!isMobile && (
          <button className="mobile-nav-toggle" onClick={toggleNav}>
            <FaBars />
          </button>
        )}
        {children}
      </main>

      {isMobile && <BottomNavBar />}

    </div>
  );
};

export default Layout;

