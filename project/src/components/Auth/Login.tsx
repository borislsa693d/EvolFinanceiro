import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/auth.css';

interface LoginProps {
  onToggle: () => void;
}

export default function Login({ onToggle }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
    } catch (err) {
      setError('Email ou senha inválidos');
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
        <h1>Controle total, decisões rápidas.</h1>
        <p className="auth-subcopy">
          Uma visão clara do seu dinheiro com projeções, categorias e metas em um painel único.
        </p>

        <div className="auth-badges">
          <span>Dashboard em tempo real</span>
          <span>Projeção mensal</span>
          <span>Fluxo por categoria</span>
        </div>

        <div className="auth-quote">
          <p>
            “Agora eu vejo exatamente para onde meu dinheiro está indo. O Impulso+ virou meu
            painel diário.”
          </p>
          <div className="auth-quote-author">
            <div className="avatar">MC</div>
            <div>
              <strong>Mariana Costa</strong>
              <span>Empreendedora</span>
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
        <h2>Entre na sua conta</h2>
        <p>Use seus dados para continuar.</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
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

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="auth-footer-note">
          Não tem uma conta? <button onClick={onToggle}>Criar agora</button>
        </div>
      </section>
    </div>
  );
}
