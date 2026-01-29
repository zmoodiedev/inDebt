import { Debt, Bill, SavingsGoal, Income, Transaction } from '@/types';

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function monthsAgo(n: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d;
}

const now = new Date();

export function getSeedDebts(): Debt[] {
  return [
    {
      id: 'demo-debt-1',
      name: 'Visa Cashback Card',
      totalAmount: 8000,
      currentBalance: 3245.67,
      interestRate: 19.99,
      minimumPayment: 97,
      dueDate: 15,
      category: 'credit-card',
      currency: 'CAD',
      createdAt: monthsAgo(6),
      updatedAt: daysAgo(2),
    },
    {
      id: 'demo-debt-2',
      name: 'Student Loan',
      totalAmount: 25000,
      currentBalance: 18420.00,
      interestRate: 5.45,
      minimumPayment: 280,
      dueDate: 1,
      category: 'loan',
      currency: 'CAD',
      createdAt: monthsAgo(24),
      updatedAt: daysAgo(5),
    },
    {
      id: 'demo-debt-3',
      name: 'Car Loan',
      totalAmount: 22000,
      currentBalance: 14800.00,
      interestRate: 6.49,
      minimumPayment: 420,
      dueDate: 20,
      category: 'loan',
      currency: 'CAD',
      createdAt: monthsAgo(18),
      updatedAt: daysAgo(1),
    },
  ];
}

export function getSeedBills(): Bill[] {
  return [
    {
      id: 'demo-bill-1',
      name: 'Rent',
      amount: 1650,
      dueDate: 1,
      category: 'housing',
      isRecurring: true,
      frequency: 'monthly',
      isPaid: now.getDate() > 1,
      isAutoPay: true,
      currency: 'CAD',
      createdAt: monthsAgo(12),
      updatedAt: daysAgo(1),
    },
    {
      id: 'demo-bill-2',
      name: 'Hydro',
      amount: 85,
      dueDate: 12,
      category: 'utilities',
      isRecurring: true,
      frequency: 'monthly',
      isPaid: now.getDate() > 12,
      isAutoPay: false,
      currency: 'CAD',
      createdAt: monthsAgo(12),
      updatedAt: daysAgo(3),
    },
    {
      id: 'demo-bill-3',
      name: 'Internet',
      amount: 75,
      dueDate: 18,
      category: 'utilities',
      isRecurring: true,
      frequency: 'monthly',
      isPaid: now.getDate() > 18,
      isAutoPay: true,
      currency: 'CAD',
      createdAt: monthsAgo(8),
      updatedAt: daysAgo(4),
    },
    {
      id: 'demo-bill-4',
      name: 'Car Insurance',
      amount: 165,
      dueDate: 22,
      category: 'insurance',
      isRecurring: true,
      frequency: 'monthly',
      isPaid: now.getDate() > 22,
      isAutoPay: true,
      currency: 'CAD',
      createdAt: monthsAgo(18),
      updatedAt: daysAgo(2),
    },
    {
      id: 'demo-bill-5',
      name: 'Spotify',
      amount: 11.99,
      dueDate: 5,
      category: 'subscription',
      isRecurring: true,
      frequency: 'monthly',
      isPaid: now.getDate() > 5,
      isAutoPay: true,
      currency: 'CAD',
      createdAt: monthsAgo(24),
      updatedAt: daysAgo(1),
    },
  ];
}

export function getSeedSavings(): SavingsGoal[] {
  return [
    {
      id: 'demo-savings-1',
      name: 'Emergency Fund',
      targetAmount: 10000,
      currentAmount: 4250,
      category: 'emergency',
      color: '#22c55e',
      createdAt: monthsAgo(10),
      updatedAt: daysAgo(3),
    },
    {
      id: 'demo-savings-2',
      name: 'Japan Trip',
      targetAmount: 5000,
      currentAmount: 1800,
      deadline: new Date(now.getFullYear(), now.getMonth() + 6, 1),
      category: 'vacation',
      color: '#3b82f6',
      createdAt: monthsAgo(4),
      updatedAt: daysAgo(7),
    },
    {
      id: 'demo-savings-3',
      name: 'New Laptop',
      targetAmount: 2500,
      currentAmount: 2100,
      deadline: new Date(now.getFullYear(), now.getMonth() + 2, 15),
      category: 'purchase',
      color: '#8b5cf6',
      createdAt: monthsAgo(6),
      updatedAt: daysAgo(1),
    },
  ];
}

export function getSeedIncome(): Income[] {
  const items: Income[] = [];
  let id = 1;

  // 5 months of data (current month + 4 prior)
  for (let m = 4; m >= 0; m--) {
    const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const year = d.getFullYear();
    const month = d.getMonth();

    // Two bi-monthly paycheques
    items.push({
      id: `demo-income-${id++}`,
      amount: 3200,
      source: 'Full-Time Job',
      category: 'salary',
      date: new Date(year, month, 1),
      currency: 'CAD',
      createdAt: new Date(year, month, 1),
      updatedAt: new Date(year, month, 1),
    });
    items.push({
      id: `demo-income-${id++}`,
      amount: 3200,
      source: 'Full-Time Job',
      category: 'salary',
      date: new Date(year, month, 15),
      currency: 'CAD',
      createdAt: new Date(year, month, 15),
      updatedAt: new Date(year, month, 15),
    });

    // Occasional freelance (months 0, 2, 4 from current)
    if (m % 2 === 0) {
      items.push({
        id: `demo-income-${id++}`,
        amount: [750, 1200, 500][Math.floor(m / 2) % 3],
        source: ['Freelance Web Project', 'Logo Design', 'Consulting'][Math.floor(m / 2) % 3],
        category: 'freelance',
        date: new Date(year, month, 10),
        currency: 'USD',
        createdAt: new Date(year, month, 10),
        updatedAt: new Date(year, month, 10),
      });
    }

    // Occasional refund/gift (months 1, 3)
    if (m === 1) {
      items.push({
        id: `demo-income-${id++}`,
        amount: 89.99,
        source: 'Amazon Return',
        category: 'refund',
        date: new Date(year, month, 20),
        currency: 'CAD',
        createdAt: new Date(year, month, 20),
        updatedAt: new Date(year, month, 20),
      });
    }
    if (m === 3) {
      items.push({
        id: `demo-income-${id++}`,
        amount: 200,
        source: 'Birthday Gift',
        category: 'gift',
        date: new Date(year, month, 14),
        currency: 'CAD',
        createdAt: new Date(year, month, 14),
        updatedAt: new Date(year, month, 14),
      });
    }
  }

  return items;
}

export function getSeedTransactions(): Transaction[] {
  const items: Transaction[] = [];
  let id = 1;

  // Per-month transaction templates with some variation
  const monthlyTemplates: {
    amount: number;
    category: Transaction['category'];
    description: string;
    day: number;
    currency: Transaction['currency'];
  }[][] = [
    // Recurring every month
    [
      { amount: 127.43, category: 'groceries', description: 'Costco Weekly Shop', day: 3, currency: 'CAD' },
      { amount: 95.00, category: 'groceries', description: 'No Frills', day: 10, currency: 'CAD' },
      { amount: 82.15, category: 'groceries', description: 'Walmart Grocery', day: 17, currency: 'CAD' },
      { amount: 62.50, category: 'transportation', description: 'Gas Fill-up', day: 7, currency: 'CAD' },
      { amount: 15.49, category: 'entertainment', description: 'Netflix', day: 1, currency: 'USD' },
    ],
  ];

  // Extra transactions that vary by month offset (0 = 4 months ago, 4 = current)
  const extrasPerMonth: {
    amount: number;
    category: Transaction['category'];
    description: string;
    day: number;
    currency: Transaction['currency'];
  }[][] = [
    // 4 months ago
    [
      { amount: 200.00, category: 'clothing', description: 'Winter Jacket', day: 8, currency: 'CAD' },
      { amount: 38.50, category: 'eating-out', description: 'Thai Express', day: 14, currency: 'CAD' },
      { amount: 120.00, category: 'healthcare', description: 'Dentist Co-pay', day: 22, currency: 'CAD' },
    ],
    // 3 months ago
    [
      { amount: 55.00, category: 'eating-out', description: 'Brunch with Friends', day: 6, currency: 'CAD' },
      { amount: 89.99, category: 'shopping', description: 'Amazon Order', day: 12, currency: 'CAD' },
      { amount: 45.00, category: 'personal-care', description: 'Haircut', day: 19, currency: 'CAD' },
      { amount: 74.99, category: 'entertainment', description: 'Concert Tickets', day: 25, currency: 'CAD' },
    ],
    // 2 months ago
    [
      { amount: 42.80, category: 'eating-out', description: 'Dinner at Moxies', day: 5, currency: 'CAD' },
      { amount: 150.00, category: 'travel', description: 'Weekend Bus Tickets', day: 13, currency: 'CAD' },
      { amount: 34.20, category: 'personal-care', description: 'Haircut', day: 20, currency: 'CAD' },
      { amount: 65.00, category: 'gifts', description: 'Birthday Present', day: 24, currency: 'CAD' },
    ],
    // 1 month ago
    [
      { amount: 142.30, category: 'groceries', description: 'Costco Extra Run', day: 4, currency: 'CAD' },
      { amount: 55.00, category: 'eating-out', description: 'Brunch', day: 12, currency: 'CAD' },
      { amount: 200.00, category: 'clothing', description: 'New Shoes', day: 18, currency: 'CAD' },
      { amount: 29.99, category: 'subscription', description: 'Adobe Creative Cloud', day: 21, currency: 'USD' },
    ],
    // Current month
    [
      { amount: 45.80, category: 'eating-out', description: 'Dinner at Moxies', day: 5, currency: 'CAD' },
      { amount: 89.99, category: 'shopping', description: 'Amazon Order', day: 9, currency: 'CAD' },
      { amount: 34.20, category: 'personal-care', description: 'Haircut', day: 11, currency: 'CAD' },
      { amount: 58.00, category: 'transportation', description: 'Oil Change', day: 14, currency: 'CAD' },
      { amount: 112.50, category: 'education', description: 'Udemy Courses', day: 16, currency: 'USD' },
    ],
  ];

  for (let m = 4; m >= 0; m--) {
    const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const year = d.getFullYear();
    const month = d.getMonth();

    // Add recurring transactions
    for (const t of monthlyTemplates[0]) {
      // Slight amount variation per month so charts aren't flat
      const variance = 1 + (((4 - m) * 7 + t.day) % 11 - 5) / 100;
      items.push({
        id: `demo-txn-${id++}`,
        amount: Math.round(t.amount * variance * 100) / 100,
        category: t.category,
        description: t.description,
        date: new Date(year, month, t.day),
        currency: t.currency,
        createdAt: new Date(year, month, t.day),
        updatedAt: new Date(year, month, t.day),
      });
    }

    // Add month-specific extras
    const extras = extrasPerMonth[4 - m];
    for (const t of extras) {
      items.push({
        id: `demo-txn-${id++}`,
        amount: t.amount,
        category: t.category,
        description: t.description,
        date: new Date(year, month, t.day),
        currency: t.currency,
        createdAt: new Date(year, month, t.day),
        updatedAt: new Date(year, month, t.day),
      });
    }
  }

  return items;
}
