import { type ReactNode } from 'react';
import {
  FaBriefcase,
  FaBolt,
  FaBus,
  FaChartLine,
  FaEllipsisH,
  FaExchangeAlt,
  FaFilm,
  FaGift,
  FaHeartbeat,
  FaHome,
  FaLightbulb,
  FaMoneyBillWave,
  FaReceipt,
  FaShoppingCart,
  FaUndo,
  FaWifi,
} from 'react-icons/fa';

export type CategoryPreset = {
  name: string;
  color: string;
  icon: ReactNode;
  type: 'income' | 'expense';
};

const normalizeCategoryName = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const INCOME_PRESETS: CategoryPreset[] = [
  { name: 'Salário', color: '#666666', icon: <FaMoneyBillWave />, type: 'income' },
  { name: 'Freelance', color: '#10B981', icon: <FaBriefcase />, type: 'income' },
  { name: 'Vendas', color: '#10B981', icon: <FaShoppingCart />, type: 'income' },
  { name: 'Investimentos', color: '#3B82F6', icon: <FaChartLine />, type: 'income' },
  { name: 'Dividendo', color: '#3B82F6', icon: <FaChartLine />, type: 'income' },
  { name: 'Dividendos', color: '#3B82F6', icon: <FaChartLine />, type: 'income' },
  { name: 'Aluguel Recebido', color: '#06B6D4', icon: <FaHome />, type: 'income' },
  { name: 'Cashback', color: '#10B981', icon: <FaUndo />, type: 'income' },
  { name: 'Reembolso', color: '#10B981', icon: <FaReceipt />, type: 'income' },
  { name: 'Prêmios', color: '#10B981', icon: <FaGift />, type: 'income' },
  { name: 'Transferência Recebida', color: '#06B6D4', icon: <FaExchangeAlt />, type: 'income' },
  { name: 'Outras Entradas', color: '#94A3B8', icon: <FaEllipsisH />, type: 'income' },
];

const EXPENSE_PRESETS: CategoryPreset[] = [
  { name: 'Moradia', color: '#EF4444', icon: <FaHome />, type: 'expense' },
  { name: 'Contas', color: '#F97316', icon: <FaReceipt />, type: 'expense' },
  { name: 'Água', color: '#F97316', icon: <FaReceipt />, type: 'expense' },
  { name: 'Luz', color: '#F97316', icon: <FaLightbulb />, type: 'expense' },
  { name: 'Internet', color: '#F97316', icon: <FaWifi />, type: 'expense' },
  { name: 'Energia', color: '#F97316', icon: <FaBolt />, type: 'expense' },
  { name: 'Alimentação', color: '#22C55E', icon: <FaShoppingCart />, type: 'expense' },
  { name: 'Transporte', color: '#3B82F6', icon: <FaBus />, type: 'expense' },
  { name: 'Compras', color: '#84CC16', icon: <FaShoppingCart />, type: 'expense' },
  { name: 'Lazer', color: '#A855F7', icon: <FaFilm />, type: 'expense' },
  { name: 'Assinaturas', color: '#6366F1', icon: <FaReceipt />, type: 'expense' },
  { name: 'Educação', color: '#14B8A6', icon: <FaChartLine />, type: 'expense' },
  { name: 'Saúde', color: '#EC4899', icon: <FaHeartbeat />, type: 'expense' },
  { name: 'Outros', color: '#94A3B8', icon: <FaEllipsisH />, type: 'expense' },
  { name: 'Outras Saídas', color: '#94A3B8', icon: <FaEllipsisH />, type: 'expense' },
  { name: 'Fatura Cartão', color: '#F97316', icon: <FaReceipt />, type: 'expense' },
  { name: 'Fatura', color: '#F97316', icon: <FaReceipt />, type: 'expense' },
];

const INCOME_PRESET_MAP = INCOME_PRESETS.reduce<Record<string, CategoryPreset>>((acc, preset) => {
  acc[normalizeCategoryName(preset.name)] = preset;
  return acc;
}, {});

const EXPENSE_PRESET_MAP = EXPENSE_PRESETS.reduce<Record<string, CategoryPreset>>((acc, preset) => {
  acc[normalizeCategoryName(preset.name)] = preset;
  return acc;
}, {});

export const getIncomePresetByName = (name?: string | null) => {
  if (!name) return null;
  return INCOME_PRESET_MAP[normalizeCategoryName(name)] || null;
};

export const getExpensePresetByName = (name?: string | null) => {
  if (!name) return null;
  return EXPENSE_PRESET_MAP[normalizeCategoryName(name)] || null;
};

export { INCOME_PRESETS, EXPENSE_PRESETS };
