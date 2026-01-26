'use client';

import { useState, useEffect } from 'react';
import { Debt, Bill, SavingsGoal, Income, Transaction, ExpenseCategory } from '@/types';
import { fetchDebts, fetchBills, fetchSavings, fetchIncome, fetchTransactions } from '@/lib/storage';
import { startOfMonth, endOfMonth, isWithinInterval, subMonths, format } from 'date-fns';
import { useMonth } from '@/lib/context/MonthContext';
import { expenseCategoryColors, expenseCategoryLabels } from '@/lib/categories';

export function useDashboardData() {
  const { monthStart, monthEnd, selectedDate } = useMonth();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [savings, setSavings] = useState<SavingsGoal[]>([]);
  const [income, setIncome] = useState<Income[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [debtsData, billsData, savingsData, incomeData, transactionsData] = await Promise.all([
        fetchDebts(),
        fetchBills(),
        fetchSavings(),
        fetchIncome(),
        fetchTransactions(),
      ]);

      setDebts(debtsData);
      setBills(billsData);
      setSavings(savingsData);
      setIncome(incomeData);
      setTransactions(transactionsData);
      setIsLoading(false);
    };

    loadData();
  }, []);

  // Calculate metrics
  const totalDebt = debts.reduce((sum, d) => sum + d.currentBalance, 0);

  // Normalize bills to monthly amounts based on frequency
  const totalBillsAmount = bills.reduce((sum, b) => {
    switch (b.frequency) {
      case 'quarterly':
        return sum + b.amount / 3;
      case 'annually':
        return sum + b.amount / 12;
      case 'monthly':
      default:
        return sum + b.amount;
    }
  }, 0);
  const totalSavings = savings.reduce((sum, s) => sum + s.currentAmount, 0);
  const savingsTarget = savings.reduce((sum, s) => sum + s.targetAmount, 0);

  const unpaidBills = bills.filter((b) => !b.isPaid);
  const paidBills = bills.filter((b) => b.isPaid);

  // Calculate debt payoff progress
  const totalOriginalDebt = debts.reduce((sum, d) => sum + d.totalAmount, 0);
  const debtPayoffPercent = totalOriginalDebt > 0
    ? Math.round(((totalOriginalDebt - totalDebt) / totalOriginalDebt) * 100)
    : 0;

  // Calculate savings progress
  const savingsProgress = savingsTarget > 0
    ? Math.round((totalSavings / savingsTarget) * 100)
    : 0;

  // Calculate income metrics for selected month
  const thisMonthIncome = income.filter(i => {
    const incomeDate = typeof i.date === 'string' ? new Date(i.date) : i.date;
    return isWithinInterval(incomeDate, { start: monthStart, end: monthEnd });
  });

  const totalMonthlyIncome = thisMonthIncome.reduce((sum, i) => sum + i.amount, 0);

  // Calculate minimum debt payments (sum of all minimum payments)
  const totalMinDebtPayments = debts.reduce((sum, d) => sum + d.minimumPayment, 0);

  // Calculate money left after bills and minimum debt payments
  const moneyLeftAfterBills = totalMonthlyIncome - totalBillsAmount - totalMinDebtPayments;

  // Generate monthly income vs expenses data for the last 6 months from selected month
  const monthlySpending = [];
  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(selectedDate, i);
    const mStart = startOfMonth(monthDate);
    const mEnd = endOfMonth(monthDate);

    const monthIncome = income
      .filter(inc => {
        const incDate = typeof inc.date === 'string' ? new Date(inc.date) : inc.date;
        return isWithinInterval(incDate, { start: mStart, end: mEnd });
      })
      .reduce((sum, inc) => sum + inc.amount, 0);

    // For expenses, use total bills amount (assuming monthly bills)
    // In a more sophisticated system, we'd track actual expenses per month
    const monthExpenses = totalBillsAmount + totalMinDebtPayments;

    monthlySpending.push({
      month: format(monthDate, 'MMM'),
      income: monthIncome,
      expenses: monthExpenses,
    });
  }

  // Generate budget breakdown from bills by category
  const billsByCategory = bills.reduce((acc, bill) => {
    const category = bill.category;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += bill.amount;
    return acc;
  }, {} as Record<string, number>);

  const budgetBreakdown = Object.entries(billsByCategory).map(([category, value]) => ({
    name: expenseCategoryLabels[category as ExpenseCategory] || category,
    value,
    color: expenseCategoryColors[category as ExpenseCategory] || '#6B7280',
  }));

  // Calculate spending by category from transactions (this month)
  const thisMonthTransactions = transactions.filter(t => {
    const transactionDate = typeof t.date === 'string' ? new Date(t.date) : t.date;
    return isWithinInterval(transactionDate, { start: monthStart, end: monthEnd });
  });

  const spendingByCategory = thisMonthTransactions.reduce((acc, t) => {
    const category = t.category;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += t.amount;
    return acc;
  }, {} as Record<string, number>);

  const spendingBreakdown = Object.entries(spendingByCategory)
    .map(([category, value]) => ({
      name: expenseCategoryLabels[category as ExpenseCategory] || category,
      value,
      color: expenseCategoryColors[category as ExpenseCategory] || '#6B7280',
    }))
    .sort((a, b) => b.value - a.value);

  const totalMonthlyTransactions = thisMonthTransactions.reduce((sum, t) => sum + t.amount, 0);

  return {
    debts,
    bills,
    savings,
    income,
    transactions,
    isLoading,
    metrics: {
      totalDebt,
      totalBillsAmount,
      totalSavings,
      savingsTarget,
      debtPayoffPercent,
      savingsProgress,
      unpaidBillsCount: unpaidBills.length,
      paidBillsCount: paidBills.length,
      totalMonthlyIncome,
      moneyLeftAfterBills,
      totalMinDebtPayments,
      totalMonthlyTransactions,
    },
    unpaidBills,
    monthlySpending,
    budgetBreakdown,
    spendingBreakdown,
  };
}
