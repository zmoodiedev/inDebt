// Supabase database type definitions
// These types match the database schema with snake_case column names

export type DebtCategory = 'credit-card' | 'loan' | 'mortgage' | 'other';
export type BillCategory = 'utilities' | 'subscription' | 'insurance' | 'housing' | 'harrison' | 'debt' | 'other';
export type BillFrequency = 'monthly' | 'quarterly' | 'annually';
export type SavingsCategory = 'emergency' | 'vacation' | 'purchase' | 'retirement' | 'other';
export type TransactionCategory =
  | 'groceries'
  | 'eating-out'
  | 'entertainment'
  | 'clothing'
  | 'transportation'
  | 'healthcare'
  | 'personal-care'
  | 'gifts'
  | 'education'
  | 'travel'
  | 'shopping'
  | 'other';
export type Currency = 'CAD' | 'USD';

// Database row types (snake_case)
export interface DbDebt {
  id: string;
  user_id: string;
  name: string;
  total_amount: number;
  current_balance: number;
  interest_rate: number;
  minimum_payment: number;
  due_date: number;
  category: DebtCategory;
  currency: Currency;
  created_at: string;
  updated_at: string;
}

export interface DbBill {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  due_date: number;
  category: BillCategory;
  is_recurring: boolean;
  frequency: BillFrequency;
  is_paid: boolean;
  is_auto_pay: boolean;
  last_paid_date: string | null;
  currency: Currency;
  created_at: string;
  updated_at: string;
}

export interface DbSavingsGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  category: SavingsCategory;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface DbIncome {
  id: string;
  user_id: string;
  amount: number;
  source: string;
  date: string;
  notes: string | null;
  currency: Currency;
  created_at: string;
  updated_at: string;
}

export interface DbTransaction {
  id: string;
  user_id: string;
  amount: number;
  category: TransactionCategory;
  description: string;
  date: string;
  currency: Currency;
  created_at: string;
  updated_at: string;
}

// Insert types (omit id, user_id, created_at, updated_at for inserts)
export type DbDebtInsert = Omit<DbDebt, 'id' | 'created_at' | 'updated_at'>;
export type DbBillInsert = Omit<DbBill, 'id' | 'created_at' | 'updated_at'>;
export type DbSavingsGoalInsert = Omit<DbSavingsGoal, 'id' | 'created_at' | 'updated_at'>;
export type DbIncomeInsert = Omit<DbIncome, 'id' | 'created_at' | 'updated_at'>;
export type DbTransactionInsert = Omit<DbTransaction, 'id' | 'created_at' | 'updated_at'>;

// Update types (partial, excluding user_id)
export type DbDebtUpdate = Partial<Omit<DbDebt, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
export type DbBillUpdate = Partial<Omit<DbBill, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
export type DbSavingsGoalUpdate = Partial<Omit<DbSavingsGoal, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
export type DbIncomeUpdate = Partial<Omit<DbIncome, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
export type DbTransactionUpdate = Partial<Omit<DbTransaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
