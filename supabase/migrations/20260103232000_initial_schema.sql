-- Create Categories Table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT
);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for authenticated users only" ON categories FOR ALL
  USING (auth.uid() = user_id);

-- Create Accounts Table
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT,
  initial_balance NUMERIC(10, 2)
);
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for authenticated users only" ON accounts FOR ALL
  USING (auth.uid() = user_id);


-- Create Credit Cards Table
CREATE TABLE credit_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  limit_total NUMERIC(10, 2),
  limit_available NUMERIC(10, 2),
  closing_day INTEGER,
  due_day INTEGER
);
ALTER TABLE credit_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for authenticated users only" ON credit_cards FOR ALL
  USING (auth.uid() = user_id);


-- Create Transactions Table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'income' or 'expense'
  description TEXT,
  amount NUMERIC(10, 2) NOT NULL,
  date DATE NOT NULL,
  category_id UUID REFERENCES categories(id),
  account_id UUID REFERENCES accounts(id),
  credit_card_id UUID REFERENCES credit_cards(id)
);
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for authenticated users only" ON transactions FOR ALL
  USING (auth.uid() = user_id);

-- Add a CHECK constraint to ensure either account_id or credit_card_id is present for an expense
ALTER TABLE transactions 
ADD CONSTRAINT check_expense_source 
CHECK (type = 'income' OR (type = 'expense' AND (account_id IS NOT NULL OR credit_card_id IS NOT NULL)));
