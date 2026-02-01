import React from 'react';
import { FaChartLine, FaListAlt, FaWallet, FaShieldAlt } from 'react-icons/fa';
import './LandingPage.css';

interface LandingPageProps {
  onLogin: () => void;
  onRegister: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onRegister }) => {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="landing-brand">
          Impulso<span className="brand-plus">+</span>
        </div>
        <div className="landing-header-actions">
          <button className="landing-secondary" onClick={onLogin}>
            Entrar
          </button>
          <button className="landing-primary" onClick={onRegister}>
            Criar conta
          </button>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-content">
          <span className="landing-badge">
            Impulso<span className="brand-plus">+</span>
          </span>
          <h1>Controle total do seu dinheiro, sem planilhas</h1>
          <p>
            Organize receitas e despesas, acompanhe projeções mensais e tome decisões
            com clareza. Tudo em um painel simples, rápido e bonito.
          </p>
          <div className="landing-actions">
            <button className="landing-primary" onClick={onRegister}>
              Criar conta grátis
            </button>
            <button className="landing-secondary" onClick={onLogin}>
              Já tenho conta
            </button>
          </div>
        </div>
        <div className="landing-hero-card">
          <div className="hero-card-header">
            <span>Visão Geral</span>
            <span className="hero-card-pill">Hoje</span>
          </div>
          <div className="hero-card-metrics">
            <div>
              <p>Receitas</p>
              <strong>R$ 8.240,00</strong>
            </div>
            <div>
              <p>Despesas</p>
              <strong>R$ 5.610,00</strong>
            </div>
            <div>
              <p>Saldo</p>
              <strong>R$ 2.630,00</strong>
            </div>
          </div>
          <div className="hero-card-chart">
            <span className="bar bar-high" />
            <span className="bar bar-mid" />
            <span className="bar bar-low" />
            <span className="bar bar-mid" />
            <span className="bar bar-high" />
          </div>
        </div>
      </section>

      <section className="landing-features">
        <div className="feature-card">
          <FaChartLine />
          <h3>Projeção Mensal</h3>
          <p>Visualize seu fluxo de caixa por dia e antecipe decisões importantes.</p>
        </div>
        <div className="feature-card">
          <FaListAlt />
          <h3>Extrato Inteligente</h3>
          <p>Encontre, edite e exporte transações com rapidez.</p>
        </div>
        <div className="feature-card">
          <FaWallet />
          <h3>Cartões e Contas</h3>
          <p>Centralize limites, saldos e despesas fixas em um só lugar.</p>
        </div>
        <div className="feature-card">
          <FaShieldAlt />
          <h3>Seguro e simples</h3>
          <p>Seu histórico protegido, com autenticação e dados sempre atualizados.</p>
        </div>
      </section>

      <section className="landing-cta">
        <div>
          <h2>Pronto para começar?</h2>
          <p>Crie sua conta em minutos e assuma o controle das finanças.</p>
        </div>
        <button className="landing-primary" onClick={onRegister}>
          Criar conta
        </button>
      </section>

      <footer className="landing-footer">
        <span>© 2026 Impulso+</span>
        <span>Organize sua vida financeira com clareza.</span>
      </footer>
    </div>
  );
};

export default LandingPage;
