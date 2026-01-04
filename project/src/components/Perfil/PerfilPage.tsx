import React from 'react';
import './Perfil.css';

const PerfilPage: React.FC = () => {
  return (
    <div className="perfil-container">
      <h2 className="perfil-title">Meu Perfil</h2>
      
      <form className="perfil-form">
        <div className="form-section">
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="nome">Nome</label>
              <input id="nome" type="text" placeholder="Seu nome" />
            </div>
            <div className="form-field">
              <label htmlFor="sobrenome">Sobrenome</label>
              <input id="sobrenome" type="text" placeholder="Seu sobrenome" />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="email">E-mail Cadastrado</label>
            <input id="email" type="email" placeholder="seu-email@exemplo.com" disabled />
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">Integrações e Notificações</h3>
          <div className="form-field">
            <label htmlFor="celular">Número de Celular</label>
            <input id="celular" type="tel" placeholder="(00) 00000-0000" />
          </div>
          <div className="form-field">
            <label htmlFor="telegram">@Username Telegram</label>
            <input id="telegram" type="text" placeholder="@seu_usuario_telegram" />
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">Segurança</h3>
          <div className="form-field">
            <label>Senha</label>
            <button type="button" className="button-secondary">Redefinir Senha</button>
          </div>
        </div>
        
        <div className="form-actions">
          <button type="submit" className="button-primary">Salvar Alterações</button>
        </div>
      </form>
    </div>
  );
};

export default PerfilPage;
