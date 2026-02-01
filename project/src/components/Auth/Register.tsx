import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/auth.css';

interface RegisterProps {
  onToggle: () => void;
}

export default function Register({ onToggle }: RegisterProps) {
  const [fullName, setFullName] = useState('');
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
      await signUp(email, password, fullName.trim() || undefined);
      setSuccess(true);
      setFullName('');
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
    <div className="auth-page">
      <section className="auth-left">
        <a className="auth-brand" href="/">
          Impulso<span className="brand-plus">+</span>
        </a>
        <h1>Seu dinheiro, organizado em minutos.</h1>
        <p className="auth-subcopy">
          Crie sua conta e comece a acompanhar saldo, receitas e despesas com clareza diária.
        </p>

        <div className="auth-badges">
          <span>Sem planilhas</span>
          <span>Insights visuais</span>
          <span>Metas inteligentes</span>
        </div>

        <div className="auth-quote">
          <p>
            “A configuração foi rápida e já no primeiro dia eu entendi onde cortar gastos.”
          </p>
          <div className="auth-quote-author">
            <div className="avatar">RP</div>
            <div>
              <strong>Rafael Pereira</strong>
              <span>Analista Financeiro</span>
            </div>
          </div>
        </div>

        <div className="auth-orbit" aria-hidden="true">
          <span className="orbit-dot dot-1" />
          <span className="orbit-dot dot-2" />
          <span className="orbit-dot dot-3" />
        </div>
      </section>

      <section className="auth-right">
        <h2>Crie sua conta</h2>
        <p>Leva menos de um minuto.</p>

        {error && <div className="error-message">{error}</div>}
        {success && (
          <div className="success-message">
            Conta criada com sucesso! Você já pode fazer login.
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="form-label">
            Nome completo
            <input
              type="text"
              className="form-input"
              placeholder="Seu nome"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </label>

          <label className="form-label">
            Email
            <input
              type="email"
              className="form-input"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="form-label">
            Senha
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <label className="form-label">
            Confirmar senha
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </label>

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
            <span className={`password-rule ${passwordChecks.matches ? 'ok' : ''}`}>
              • Senhas iguais
            </span>
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Criando...' : 'Criar conta'}
          </button>
        </form>

        <div className="auth-footer-note">
          Já tem uma conta? <button onClick={onToggle}>Fazer login</button>
        </div>
      </section>
    </div>
  );
}
