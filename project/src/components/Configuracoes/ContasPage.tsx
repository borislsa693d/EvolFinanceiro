import React from 'react';
import ContasSection from './ContasSection';
import './SharedSettings.css';

const ContasPage: React.FC = () => {
  return (
    <div className="config-page-container">
      <h2 className="config-page-title">Contas Bancárias</h2>
      <ContasSection />
    </div>
  );
};

export default ContasPage;
