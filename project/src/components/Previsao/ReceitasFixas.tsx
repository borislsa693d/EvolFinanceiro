import { useState } from 'react';
import { ReceitaFixa } from './PrevisaoPage';
import { Plus, Trash2 } from 'lucide-react';

interface ReceitasFixasProps {
  receitas: ReceitaFixa[];
  setReceitas: (receitas: ReceitaFixa[]) => void;
}

export default function ReceitasFixas({ receitas, setReceitas }: ReceitasFixasProps) {
  const [dia, setDia] = useState<number>(1);
  const [valor, setValor] = useState<number>(0);
  const [descricao, setDescricao] = useState<string>('');
  const [conta, setConta] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (dia < 1 || dia > 31) {
      alert('Dia deve estar entre 1 e 31');
      return;
    }

    if (valor <= 0) {
      alert('Valor deve ser maior que zero');
      return;
    }

    if (!descricao.trim()) {
      alert('Descrição é obrigatória');
      return;
    }

    const novaReceita: ReceitaFixa = {
      id: Date.now().toString(),
      dia,
      valor,
      descricao,
      conta: conta.trim() || undefined,
    };

    setReceitas([...receitas, novaReceita]);
    setDia(1);
    setValor(0);
    setDescricao('');
    setConta('');
  };

  const handleDelete = (id: string) => {
    setReceitas(receitas.filter((r) => r.id !== id));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="previsao-card">
      <h3 className="previsao-card-title">Receitas Fixas</h3>
      
      <form onSubmit={handleSubmit} className="previsao-form">
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="receita-dia">Dia</label>
            <input
              id="receita-dia"
              type="number"
              min="1"
              max="31"
              value={dia}
              onChange={(e) => setDia(Number(e.target.value))}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="receita-valor">Valor</label>
            <input
              id="receita-valor"
              type="number"
              step="0.01"
              min="0.01"
              value={valor}
              onChange={(e) => setValor(Number(e.target.value))}
              required
            />
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="receita-descricao">Descrição</label>
          <input
            id="receita-descricao"
            type="text"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="receita-conta">Conta (opcional)</label>
          <input
            id="receita-conta"
            type="text"
            value={conta}
            onChange={(e) => setConta(e.target.value)}
          />
        </div>

        <button type="submit" className="previsao-button">
          <Plus size={16} />
          Adicionar Receita
        </button>
      </form>

      {receitas.length > 0 && (
        <div className="previsao-list">
          <h4 className="previsao-list-title">Receitas Cadastradas</h4>
          <div className="previsao-items">
            {receitas.map((receita) => (
              <div key={receita.id} className="previsao-item">
                <div className="previsao-item-info">
                  <span className="previsao-item-dia">Dia {receita.dia}</span>
                  <span className="previsao-item-descricao">{receita.descricao}</span>
                  <span className="previsao-item-valor">{formatCurrency(receita.valor)}</span>
                  {receita.conta && (
                    <span className="previsao-item-conta">{receita.conta}</span>
                  )}
                </div>
                <button
                  className="previsao-delete-button"
                  onClick={() => handleDelete(receita.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

