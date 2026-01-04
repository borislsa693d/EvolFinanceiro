import React from 'react';
import CartoesSection from './CartoesSection';
import './SharedSettings.css';

const CartoesPage: React.FC = () => {
  return (
    <div className="config-page-container">
      <h2 className="config-page-title">Cartões de Crédito</h2>
      <CartoesSection />
    </div>
  );
};

export default CartoesPage;
