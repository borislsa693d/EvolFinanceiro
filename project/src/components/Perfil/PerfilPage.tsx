import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../lib/api';
import Modal from '../Modal/Modal';
import './Perfil.css';

const PerfilPage: React.FC = () => {
  const { user, updateUser, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [telegram, setTelegram] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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
    setIsPasswordModalOpen(true);
  };
  const handleLogout = async () => {
    await signOut();
  };

  const closePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setPasswordLoading(false);
    setPasswordSaved(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const passwordChecks = {
    hasUpper: /[A-Z]/.test(newPassword),
    hasNumber: /\d/.test(newPassword),
    hasSpecial: /[^A-Za-z0-9]/.test(newPassword),
    matches: newPassword.length > 0 && newPassword === confirmPassword,
  };

  const canSavePassword =
    currentPassword.trim().length > 0 &&
    passwordChecks.hasUpper &&
    passwordChecks.hasNumber &&
    passwordChecks.hasSpecial &&
    passwordChecks.matches;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSavePassword) return;
    setPasswordLoading(true);

    try {
      await authAPI.changePassword(currentPassword, newPassword);
      setPasswordSaved(true);
      setTimeout(() => setPasswordSaved(false), 2500);
      closePasswordModal();
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      alert('Erro ao alterar senha. Verifique a senha atual.');
    } finally {
      setPasswordLoading(false);
    }
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
            type="button"
            className="button-secondary"
            onClick={handleLogout}
          >
            Sair
          </button>
          <button 
            type="submit" 
            className="button-primary"
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>

      <Modal
        isOpen={isPasswordModalOpen}
        onClose={closePasswordModal}
        title="Redefinir Senha"
      >
        <form className="modal-form" onSubmit={handleChangePassword}>
          <div className="form-field">
            <label>Senha Atual *</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-field">
            <label>Nova Senha *</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <div className="password-rules">
              <span className={`password-rule ${passwordChecks.hasUpper ? 'ok' : ''}`}>
                • 1 letra maiúscula
              </span>
              <span className={`password-rule ${passwordChecks.hasNumber ? 'ok' : ''}`}>
                • 1 número
              </span>
              <span className={`password-rule ${passwordChecks.hasSpecial ? 'ok' : ''}`}>
                • 1 caractere especial
              </span>
            </div>
          </div>
          <div className="form-field">
            <label>Confirmar Nova Senha *</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <div className="password-rules">
              <span className={`password-rule ${passwordChecks.matches ? 'ok' : ''}`}>
                • Senhas iguais
              </span>
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="button-secondary" onClick={closePasswordModal}>
              Cancelar
            </button>
            <button type="submit" className="button-primary" disabled={!canSavePassword || passwordLoading}>
              {passwordLoading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PerfilPage;
