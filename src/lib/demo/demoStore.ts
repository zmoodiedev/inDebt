import { Debt, Bill, SavingsGoal, Income, Transaction } from '@/types';
import {
  getSeedDebts,
  getSeedBills,
  getSeedSavings,
  getSeedIncome,
  getSeedTransactions,
} from './demoData';
import { generateId } from '@/lib/storage';

let debts: Debt[] | null = null;
let bills: Bill[] | null = null;
let savings: SavingsGoal[] | null = null;
let income: Income[] | null = null;
let transactions: Transaction[] | null = null;

function ensureInitialized() {
  if (debts === null) debts = getSeedDebts();
  if (bills === null) bills = getSeedBills();
  if (savings === null) savings = getSeedSavings();
  if (income === null) income = getSeedIncome();
  if (transactions === null) transactions = getSeedTransactions();
}

export function resetDemoStore() {
  debts = null;
  bills = null;
  savings = null;
  income = null;
  transactions = null;
}

// Debts
export async function fetchDebts(): Promise<Debt[]> {
  ensureInitialized();
  return [...debts!];
}

export async function saveDebtsToExcel(newDebts: Debt[]): Promise<boolean> {
  ensureInitialized();
  debts = [...newDebts];
  return true;
}

// Bills
export async function fetchBills(): Promise<Bill[]> {
  ensureInitialized();
  return [...bills!];
}

export async function createBill(bill: Bill): Promise<Bill | null> {
  ensureInitialized();
  const newBill = { ...bill, id: bill.id || generateId() };
  bills!.push(newBill);
  return newBill;
}

export async function updateBill(id: string, updates: Partial<Bill>): Promise<boolean> {
  ensureInitialized();
  const idx = bills!.findIndex((b) => b.id === id);
  if (idx === -1) return false;
  bills![idx] = { ...bills![idx], ...updates };
  return true;
}

export async function deleteBill(id: string): Promise<boolean> {
  ensureInitialized();
  const idx = bills!.findIndex((b) => b.id === id);
  if (idx === -1) return false;
  bills!.splice(idx, 1);
  return true;
}

// Savings
export async function fetchSavings(): Promise<SavingsGoal[]> {
  ensureInitialized();
  return [...savings!];
}

export async function saveSavingsToSheet(newSavings: SavingsGoal[]): Promise<boolean> {
  ensureInitialized();
  savings = [...newSavings];
  return true;
}

// Income
export async function fetchIncome(): Promise<Income[]> {
  ensureInitialized();
  return [...income!];
}

export async function saveIncomeToSheet(newIncome: Income[]): Promise<boolean> {
  ensureInitialized();
  income = [...newIncome];
  return true;
}

// Transactions
export async function fetchTransactions(): Promise<Transaction[]> {
  ensureInitialized();
  return [...transactions!];
}

export async function saveTransactionsToSheet(newTransactions: Transaction[]): Promise<boolean> {
  ensureInitialized();
  transactions = [...newTransactions];
  return true;
}
