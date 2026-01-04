import React from 'react';
import CategoriasSection from './CategoriasSection';
import './SharedSettings.css';

const CategoriasPage: React.FC = () => {
  return (
    <div className="config-page-container">
      <h2 className="config-page-title">Categorias</h2>
      <CategoriasSection />
    </div>
  );
};

export default CategoriasPage;
