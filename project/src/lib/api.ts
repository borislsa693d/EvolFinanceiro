// Cliente API para comunicação com o backend Python
// Detectar automaticamente o hostname para funcionar na rede local
const getAPIUrl = () => {
  // Se houver variável de ambiente, usar ela
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Detectar se está acessando pela rede local ou localhost
  const hostname = window.location.hostname;
  // Caso contrário, usar localhost (desenvolvimento local)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8000';
  }

  // Produção
  return 'https://apihostimpulso.superglok-app.top';
};

const API_URL = getAPIUrl();

// Helper para obter token do localStorage
const getToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Helper para fazer requisições autenticadas
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Adicionar cache busting apenas para métodos GET
  const method = options.method?.toUpperCase() || 'GET';
  let url = `${API_URL}${endpoint}`;
  
  if (method === 'GET') {
    // Cache busting apenas para GET
    headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    headers['Pragma'] = 'no-cache';
    headers['Expires'] = '0';
    const cacheBuster = `_t=${Date.now()}`;
    const separator = endpoint.includes('?') ? '&' : '?';
    url = `${url}${separator}${cacheBuster}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    cache: method === 'GET' ? 'no-store' : 'default',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  // Para DELETE que retorna 204 No Content
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// ============= Auth API =============
export const authAPI = {
  async register(email: string, password: string, full_name?: string) {
    return fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name }),
    });
  },

  async login(email: string, password: string) {
    const data = await fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    // Salvar token
    if (data.access_token) {
      localStorage.setItem('auth_token', data.access_token);
    }
    return data;
  },

  async getMe() {
    return fetchAPI('/auth/me');
  },

  async updateProfile(data: {
    first_name?: string;
    last_name?: string;
    full_name?: string;
    phone?: string;
    telegram?: string;
  }) {
    return fetchAPI('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async changePassword(current_password: string, new_password: string) {
    return fetchAPI('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ current_password, new_password }),
    });
  },

  logout() {
    localStorage.removeItem('auth_token');
  },
};

// ============= Transactions API =============
export const transactionsAPI = {
  async getAll(filters?: {
    type?: string;
    category_id?: string;
    account_id?: string;
    credit_card_id?: string;
    start_date?: string;
    end_date?: string;
  }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchAPI(`/transactions${query}`);
  },

  async getById(id: string) {
    return fetchAPI(`/transactions/${id}`);
  },

  async create(data: {
    type: string;
    description?: string;
    amount: number;
    date: string;
    category_id?: string;
    account_id?: string;
    credit_card_id?: string;
  }) {
    return fetchAPI('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: Partial<{
    type: string;
    description: string;
    amount: number;
    date: string;
    category_id: string;
    account_id: string;
    credit_card_id: string;
  }>) {
    return fetchAPI(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string) {
    return fetchAPI(`/transactions/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============= Categories API =============
export const categoriesAPI = {
  async getAll() {
    return fetchAPI('/categories');
  },

  async getById(id: string) {
    return fetchAPI(`/categories/${id}`);
  },

  async create(data: { name: string; color?: string; type: 'income' | 'expense' }) {
    return fetchAPI('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: Partial<{ name: string; color: string; type: 'income' | 'expense' }>) {
    return fetchAPI(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string) {
    return fetchAPI(`/categories/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============= Accounts API =============
export const accountsAPI = {
  async getAll() {
    return fetchAPI('/accounts');
  },

  async getById(id: string) {
    return fetchAPI(`/accounts/${id}`);
  },

  async create(data: { name: string; type?: string; initial_balance?: number }) {
    return fetchAPI('/accounts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: Partial<{ name: string; type: string; initial_balance: number }>) {
    return fetchAPI(`/accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string) {
    return fetchAPI(`/accounts/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============= Credit Cards API =============
export const creditCardsAPI = {
  async getAll() {
    return fetchAPI('/credit-cards');
  },

  async getById(id: string) {
    return fetchAPI(`/credit-cards/${id}`);
  },

  async create(data: {
    name: string;
    limit_total?: number;
    limit_available?: number;
    closing_day?: number;
    due_day?: number;
  }) {
    return fetchAPI('/credit-cards', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: Partial<{
    name: string;
    limit_total: number;
    limit_available: number;
    closing_day: number;
    due_day: number;
  }>) {
    return fetchAPI(`/credit-cards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string) {
    return fetchAPI(`/credit-cards/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============= Fixed Transactions API =============
export const fixedTransactionsAPI = {
  async getAll(type?: 'income' | 'expense') {
    const url = type ? `/fixed-transactions?type=${type}` : '/fixed-transactions';
    return fetchAPI(url);
  },

  async getById(id: string) {
    return fetchAPI(`/fixed-transactions/${id}`);
  },

  async create(data: {
    type: 'income' | 'expense';
    description: string;
    amount: number;
    day_of_month: number;
    start_date?: string | null;
    end_date?: string | null;
    category_id?: string;
    account_id?: string;
    credit_card_id?: string;
  }) {
    return fetchAPI('/fixed-transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: Partial<{
    type: 'income' | 'expense';
    description: string;
    amount: number;
    day_of_month: number;
    start_date?: string | null;
    end_date?: string | null;
    category_id?: string;
    account_id?: string;
    credit_card_id?: string;
  }>) {
    return fetchAPI(`/fixed-transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string) {
    return fetchAPI(`/fixed-transactions/${id}`, {
      method: 'DELETE',
    });
  },
};

// Types (mantendo compatibilidade com código existente)
export type Transaction = {
  id: string;
  user_id: string;
  category_id: string | null;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
  created_at: string;
  account_id?: string | null;
  credit_card_id?: string | null;
};

export type Category = {
  id: string;
  user_id: string;
  name: string;
  color: string;
  type: 'income' | 'expense';
  created_at: string;
};

export type CreditCard = {
  id: string;
  user_id: string;
  name: string;
  limit_total: number;
  limit_available: number;
  created_at: string;
  closing_day?: number;
  due_day?: number;
};

export type Account = {
  id: string;
  user_id: string;
  name: string;
  type: string;
  initial_balance: number;
  created_at: string;
};

export type FixedTransaction = {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  day_of_month: number;
  start_date?: string | null;
  end_date?: string | null;
  category_id?: string | null;
  account_id?: string | null;
  credit_card_id?: string | null;
  created_at: string;
};

