import { ReceitaFixa, DespesaFixa } from './PrevisaoPage';

interface TabelaPrevisaoProps {
  receitasFixas: ReceitaFixa[];
  despesasFixas: DespesaFixa[];
  saldoInicial: number;
}

export default function TabelaPrevisao({
  receitasFixas,
  despesasFixas,
  saldoInicial,
}: TabelaPrevisaoProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Gerar dados para todos os dias do mês atual
  const getDaysInMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return daysInMonth;
  };

  const daysInMonth = getDaysInMonth();
  const dias = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Calcular previsão de saldo para cada dia
  const calcularPrevisao = () => {
    let saldoAtual = saldoInicial;
    const previsoes = dias.map((dia) => {
      const receitasDoDia = receitasFixas
        .filter((r) => r.dia === dia)
        .reduce((sum, r) => sum + r.valor, 0);

      const despesasDoDia = despesasFixas
        .filter((d) => d.dia === dia)
        .reduce((sum, d) => sum + d.valor, 0);

      saldoAtual = saldoAtual + receitasDoDia - despesasDoDia;

      return {
        dia,
        entrada: receitasDoDia,
        saida: despesasDoDia,
        saldo: saldoAtual,
      };
    });

    return previsoes;
  };

  const previsoes = calcularPrevisao();

  return (
    <div className="previsao-card tabela-previsao-card">
      <h3 className="previsao-card-title">Previsão de Saldo</h3>
      
      <div className="tabela-previsao-container">
        <table className="tabela-previsao">
          <thead>
            <tr>
              <th>Dia</th>
              <th>Entrada</th>
              <th>Saída</th>
              <th>Saldo</th>
            </tr>
          </thead>
          <tbody>
            {previsoes.map((previsao) => (
              <tr key={previsao.dia}>
                <td className="tabela-dia">
                  {previsao.dia.toString().padStart(2, '0')}
                </td>
                <td className="tabela-entrada">
                  {previsao.entrada > 0 ? formatCurrency(previsao.entrada) : '—'}
                </td>
                <td className="tabela-saida">
                  {previsao.saida > 0 ? formatCurrency(previsao.saida) : '—'}
                </td>
                <td className={`tabela-saldo ${previsao.saldo >= 0 ? 'positive' : 'negative'}`}>
                  {formatCurrency(previsao.saldo)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

