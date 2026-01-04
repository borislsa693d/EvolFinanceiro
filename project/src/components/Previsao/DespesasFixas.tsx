import { useState } from 'react';
import { DespesaFixa } from './PrevisaoPage';
import { Plus, Trash2 } from 'lucide-react';

interface DespesasFixasProps {
  despesas: DespesaFixa[];
  setDespesas: (despesas: DespesaFixa[]) => void;
}

export default function DespesasFixas({ despesas, setDespesas }: DespesasFixasProps) {
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

    const novaDespesa: DespesaFixa = {
      id: Date.now().toString(),
      dia,
      valor,
      descricao,
      conta: conta.trim() || undefined,
    };

    setDespesas([...despesas, novaDespesa]);
    setDia(1);
    setValor(0);
    setDescricao('');
    setConta('');
  };

  const handleDelete = (id: string) => {
    setDespesas(despesas.filter((d) => d.id !== id));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="previsao-card">
      <h3 className="previsao-card-title">Despesas Fixas</h3>
      
      <form onSubmit={handleSubmit} className="previsao-form">
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="despesa-dia">Dia</label>
            <input
              id="despesa-dia"
              type="number"
              min="1"
              max="31"
              value={dia}
              onChange={(e) => setDia(Number(e.target.value))}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="despesa-valor">Valor</label>
            <input
              id="despesa-valor"
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
          <label htmlFor="despesa-descricao">Descrição</label>
          <input
            id="despesa-descricao"
            type="text"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="despesa-conta">Conta (opcional)</label>
          <input
            id="despesa-conta"
            type="text"
            value={conta}
            onChange={(e) => setConta(e.target.value)}
          />
        </div>

        <button type="submit" className="previsao-button">
          <Plus size={16} />
          Adicionar Despesa
        </button>
      </form>

      {despesas.length > 0 && (
        <div className="previsao-list">
          <h4 className="previsao-list-title">Despesas Cadastradas</h4>
          <div className="previsao-items">
            {despesas.map((despesa) => (
              <div key={despesa.id} className="previsao-item">
                <div className="previsao-item-info">
                  <span className="previsao-item-dia">Dia {despesa.dia}</span>
                  <span className="previsao-item-descricao">{despesa.descricao}</span>
                  <span className="previsao-item-valor">{formatCurrency(despesa.valor)}</span>
                  {despesa.conta && (
                    <span className="previsao-item-conta">{despesa.conta}</span>
                  )}
                </div>
                <button
                  className="previsao-delete-button"
                  onClick={() => handleDelete(despesa.id)}
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

