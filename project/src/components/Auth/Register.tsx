import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/auth.css';

interface RegisterProps {
  onToggle: () => void;
}

export default function Register({ onToggle }: RegisterProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const passwordChecks = {
    hasUpper: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
    matches: password.length > 0 && password === confirmPassword,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (!passwordChecks.hasUpper || !passwordChecks.hasNumber || !passwordChecks.hasSpecial) {
      setError('A senha deve conter letra maiúscula, número e caractere especial');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password);
      setSuccess(true);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError('Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <header className="auth-header">
        <div className="auth-header-brand">
          Impulso<span className="brand-plus">+</span>
        </div>
        <button className="auth-header-link" onClick={onToggle}>
          Fazer login
        </button>
      </header>
      <div className="auth-card">
        <h1 className="auth-logo">
          Impulso<span className="brand-plus">+</span>
        </h1>
        <p className="auth-subtitle">Crie sua conta</p>

        {error && <div className="error-message">{error}</div>}
        {success && (
          <div className="success-message">
            Conta criada com sucesso! Você já pode fazer login.
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Senha
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirmar Senha
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="form-input"
              placeholder="••••••••"
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

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Criando...' : 'Criar Conta'}
          </button>
        </form>

        <div className="auth-divider">ou</div>

        <div className="auth-link">
          Já tem uma conta?
          <button onClick={onToggle}>Fazer login</button>
        </div>
      </div>
      <footer className="auth-footer">
        <span>© 2026 Impulso+</span>
        <span>Controle simples. Decisões inteligentes.</span>
      </footer>
    </div>
  );
}
