import { createClient } from '@supabase/supabase-js';

// Obter variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validar se as variáveis estão configuradas corretamente
const isConfigured = supabaseUrl && 
                    supabaseAnonKey && 
                    typeof supabaseUrl === 'string' &&
                    typeof supabaseAnonKey === 'string' &&
                    supabaseUrl !== 'your_supabase_project_url' &&
                    supabaseAnonKey !== 'your_supabase_anon_key' &&
                    supabaseUrl.startsWith('http');

if (!isConfigured) {
  console.warn('⚠️ Supabase não configurado!');
  console.warn('Configure as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env');
  console.warn('Você pode obter essas credenciais em: https://app.supabase.com/project/[seu-projeto]/settings/api');
}

// Usar valores padrão válidos se não estiver configurado (para evitar erro de inicialização)
const url = isConfigured ? supabaseUrl : 'https://placeholder.supabase.co';
const key = isConfigured ? supabaseAnonKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTIwMDAsImV4cCI6MTk2MDc2ODAwMH0.placeholder';

export const supabase = createClient(url, key);

export type Transaction = {
  id: string;
  user_id: string;
  category_id: string | null;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
  created_at: string;
};

export type Category = {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
};

export type CreditCard = {
  id: string;
  user_id: string;
  name: string;
  limit_total: number;
  limit_available: number;
  created_at: string;
};
