import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../lib/api';
import './Perfil.css';

const PerfilPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [telegram, setTelegram] = useState('');

  useEffect(() => {
    if (user) {
      // Preencher campos com dados do usuário
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setTelegram(user.telegram || '');
      
      // Se não tem first_name mas tem full_name, tentar separar
      if (!user.first_name && user.full_name) {
        const nameParts = user.full_name.split(' ');
        if (nameParts.length > 0) {
          setFirstName(nameParts[0]);
          if (nameParts.length > 1) {
            setLastName(nameParts.slice(1).join(' '));
          }
        }
      }
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    try {
      await authAPI.updateProfile({
        first_name: firstName.trim() || undefined,
        last_name: lastName.trim() || undefined,
        full_name: firstName.trim() && lastName.trim() 
          ? `${firstName.trim()} ${lastName.trim()}`.trim()
          : firstName.trim() || lastName.trim() || undefined,
        phone: phone.trim() || undefined,
        telegram: telegram.trim() || undefined,
      });

      // Atualizar dados do usuário no contexto
      await updateUser();
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      alert('Erro ao salvar alterações. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = () => {
    alert('Funcionalidade de redefinir senha em desenvolvimento');
  };

  if (!user) {
    return (
      <div className="perfil-container">
        <div className="loading">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="perfil-container">
      <h2 className="perfil-title">Meu Perfil</h2>
      
      {saved && (
        <div className="success-message" style={{
          padding: '1rem',
          background: '#10b981',
          color: 'white',
          borderRadius: '0.5rem',
          marginBottom: '1.5rem',
          textAlign: 'center'
        }}>
          ✅ Alterações salvas com sucesso!
        </div>
      )}

      <form className="perfil-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h3 className="section-title">Informações Pessoais</h3>
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="nome">Nome</label>
              <input 
                id="nome" 
                type="text" 
                placeholder="Seu nome" 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="form-field">
              <label htmlFor="sobrenome">Sobrenome</label>
              <input 
                id="sobrenome" 
                type="text" 
                placeholder="Seu sobrenome" 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="email">E-mail Cadastrado</label>
            <input 
              id="email" 
              type="email" 
              placeholder="seu-email@exemplo.com" 
              value={email}
              disabled
              style={{ 
                background: '#1a1a1a', 
                color: '#888',
                cursor: 'not-allowed' 
              }}
            />
            <small style={{ color: '#666', marginTop: '0.25rem', display: 'block' }}>
              O e-mail não pode ser alterado
            </small>
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">Integrações e Notificações</h3>
          <div className="form-field">
            <label htmlFor="celular">Número de Celular</label>
            <input 
              id="celular" 
              type="tel" 
              placeholder="(00) 00000-0000" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="telegram">@Username Telegram</label>
            <input 
              id="telegram" 
              type="text" 
              placeholder="@seu_usuario_telegram" 
              value={telegram}
              onChange={(e) => {
                let value = e.target.value;
                // Garantir que comece com @
                if (value && !value.startsWith('@')) {
                  value = '@' + value;
                }
                setTelegram(value);
              }}
            />
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">Segurança</h3>
          <div className="form-field">
            <label>Senha</label>
            <button 
              type="button" 
              className="button-secondary"
              onClick={handleResetPassword}
            >
              Redefinir Senha
            </button>
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="button-primary"
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PerfilPage;
