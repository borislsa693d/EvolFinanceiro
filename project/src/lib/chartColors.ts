// Paleta de cores otimizada para apps financeiros (Dark Mode)
// Cores distintas, saturação média, boa leitura em fundo escuro

// Paleta geral de fallback
export const COLOR_PALETTE = [
  '#EF4444', // Vermelho
  '#F97316', // Laranja
  '#22C55E', // Verde
  '#3B82F6', // Azul
  '#84CC16', // Verde-limão
  '#A855F7', // Roxo
  '#6366F1', // Índigo
  '#14B8A6', // Teal
  '#EC4899', // Rosa
  '#94A3B8', // Cinza claro
];

// Mapeamento de cores por nome de categoria (gastos essenciais e variáveis)
const CATEGORY_COLOR_MAP: { [key: string]: string } = {
  // Gastos essenciais
  'Moradia': '#EF4444', // Vermelho suave
  'Contas': '#F97316', // Laranja
  'Água': '#F97316',
  'Luz': '#F97316',
  'Internet': '#F97316',
  'Energia': '#F97316',
  'Alimentação': '#22C55E', // Verde
  'Transporte': '#3B82F6', // Azul
  
  // Gastos variáveis
  'Compras': '#84CC16', // Verde-limão
  'Lazer': '#A855F7', // Roxo
  'Assinaturas': '#6366F1', // Índigo
  'Educação': '#14B8A6', // Teal
  
  // Outros
  'Saúde': '#EC4899', // Rosa
  'Outros': '#94A3B8', // Cinza claro
  'Outras Saídas': '#94A3B8',
  
  // Categorias de entrada (receitas)
  'Salário': '#10B981',
  'Freelance': '#10B981',
  'Vendas': '#10B981',
  'Investimentos': '#06B6D4',
  'Aluguel Recebido': '#06B6D4',
  'Cashback': '#10B981',
  'Reembolso': '#10B981',
  'Prêmios': '#10B981',
  'Transferência Recebida': '#06B6D4',
  'Outras Entradas': '#94A3B8',
  
  // Categorias específicas
  'Fatura Cartão': '#F97316',
  'Fatura': '#F97316',
};

/**
 * Obtém a cor para uma categoria seguindo as melhores práticas para apps financeiros
 * 1. Se a categoria tem cor definida no banco (e não for preto/branco), usa ela
 * 2. Se existe mapeamento específico por nome, usa ele
 * 3. Caso contrário, usa hash do ID para consistência
 */
export function getCategoryColor(
  categoryId: string, 
  categoryColor?: string | null, 
  categoryName?: string | null,
  index?: number
): string {
  // 1. Prioridade: cor definida no banco de dados (se válida)
  if (categoryColor && categoryColor !== '#000000' && categoryColor !== '#ffffff' && categoryColor !== '#000') {
    return categoryColor;
  }
  
  // 2. Verificar se existe mapeamento por nome (case-insensitive)
  if (categoryName) {
    const normalizedName = categoryName.trim();
    const mappedColor = CATEGORY_COLOR_MAP[normalizedName] || 
                        CATEGORY_COLOR_MAP[normalizedName.toLowerCase()];
    if (mappedColor) {
      return mappedColor;
    }
  }
  
  // 3. Fallback: usar hash do ID para consistência
  let hash = 0;
  for (let i = 0; i < categoryId.length; i++) {
    hash = categoryId.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colorIndex = Math.abs(hash) % COLOR_PALETTE.length;
  return COLOR_PALETTE[colorIndex];
}

