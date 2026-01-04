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
  const [isNavOpen, setIsNavOpen] = useState(false);
  const { user } = useAuth();
  const isMobile = useIsMobile();

  const toggleNav = () => {
    if (!isMobile) { // Only allow sidebar toggle on desktop
      setIsNavOpen(!isNavOpen);
    }
  };

  return (
    <div className="layout">
      {!isMobile && <NavBoard isOpen={isNavOpen} onClose={toggleNav} />}
      
      <main className="main-content" style={{ paddingBottom: isMobile ? '80px' : '0' }}>
        {!isMobile && (
          <button className="mobile-nav-toggle" onClick={toggleNav}>
            <FaBars />
          </button>
        )}
        {children}
      </main>

      {isMobile && <BottomNavBar />}

      {isNavOpen && !isMobile && <div className="overlay" onClick={toggleNav}></div>}

    </div>
  );
};

export default Layout;

