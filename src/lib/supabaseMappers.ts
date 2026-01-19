import { Debt, Bill, SavingsGoal, Income, Transaction } from '@/types';
import {
  DbDebt,
  DbBill,
  DbSavingsGoal,
  DbIncome,
  DbTransaction,
  DbDebtInsert,
  DbBillInsert,
  DbSavingsGoalInsert,
  DbIncomeInsert,
  DbTransactionInsert,
} from '@/types/supabase';

// Debt mappers
export function mapDbDebtToDebt(db: DbDebt): Debt {
  return {
    id: db.id,
    name: db.name,
    totalAmount: db.total_amount,
    currentBalance: db.current_balance,
    interestRate: db.interest_rate,
    minimumPayment: db.minimum_payment,
    dueDate: db.due_date,
    category: db.category,
    currency: db.currency,
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at),
  };
}

export function mapDebtToDbDebt(debt: Debt, userId: string): DbDebtInsert {
  return {
    user_id: userId,
    name: debt.name,
    total_amount: debt.totalAmount,
    current_balance: debt.currentBalance,
    interest_rate: debt.interestRate,
    minimum_payment: debt.minimumPayment,
    due_date: debt.dueDate,
    category: debt.category,
    currency: debt.currency,
  };
}

// Bill mappers
export function mapDbBillToBill(db: DbBill): Bill {
  return {
    id: db.id,
    name: db.name,
    amount: db.amount,
    dueDate: db.due_date,
    category: db.category,
    isRecurring: db.is_recurring,
    frequency: db.frequency,
    isPaid: db.is_paid,
    isAutoPay: db.is_auto_pay,
    lastPaidDate: db.last_paid_date ? new Date(db.last_paid_date) : undefined,
    currency: db.currency,
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at),
  };
}

export function mapBillToDbBill(bill: Bill, userId: string): DbBillInsert {
  return {
    user_id: userId,
    name: bill.name,
    amount: bill.amount,
    due_date: bill.dueDate,
    category: bill.category,
    is_recurring: bill.isRecurring,
    frequency: bill.frequency,
    is_paid: bill.isPaid,
    is_auto_pay: bill.isAutoPay,
    last_paid_date: bill.lastPaidDate
      ? bill.lastPaidDate instanceof Date
        ? bill.lastPaidDate.toISOString()
        : bill.lastPaidDate
      : null,
    currency: bill.currency,
  };
}

// Savings Goal mappers
export function mapDbSavingsGoalToSavingsGoal(db: DbSavingsGoal): SavingsGoal {
  return {
    id: db.id,
    name: db.name,
    targetAmount: db.target_amount,
    currentAmount: db.current_amount,
    deadline: db.deadline ? new Date(db.deadline) : undefined,
    category: db.category,
    color: db.color,
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at),
  };
}

export function mapSavingsGoalToDbSavingsGoal(goal: SavingsGoal, userId: string): DbSavingsGoalInsert {
  return {
    user_id: userId,
    name: goal.name,
    target_amount: goal.targetAmount,
    current_amount: goal.currentAmount,
    deadline: goal.deadline
      ? goal.deadline instanceof Date
        ? goal.deadline.toISOString()
        : goal.deadline
      : null,
    category: goal.category,
    color: goal.color,
  };
}

// Income mappers
export function mapDbIncomeToIncome(db: DbIncome): Income {
  return {
    id: db.id,
    amount: db.amount,
    source: db.source,
    date: new Date(db.date),
    notes: db.notes ?? undefined,
    currency: db.currency,
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at),
  };
}

export function mapIncomeToDbIncome(income: Income, userId: string): DbIncomeInsert {
  return {
    user_id: userId,
    amount: income.amount,
    source: income.source,
    date: income.date instanceof Date ? income.date.toISOString() : income.date,
    notes: income.notes ?? null,
    currency: income.currency,
  };
}

// Transaction mappers
export function mapDbTransactionToTransaction(db: DbTransaction): Transaction {
  return {
    id: db.id,
    amount: db.amount,
    category: db.category,
    description: db.description,
    date: new Date(db.date),
    currency: db.currency,
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at),
  };
}

export function mapTransactionToDbTransaction(transaction: Transaction, userId: string): DbTransactionInsert {
  return {
    user_id: userId,
    amount: transaction.amount,
    category: transaction.category,
    description: transaction.description,
    date: transaction.date instanceof Date ? transaction.date.toISOString() : transaction.date,
    currency: transaction.currency,
  };
}
