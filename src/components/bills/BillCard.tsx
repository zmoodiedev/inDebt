'use client';

import { Bill } from '@/types';
import { formatCurrency } from '@/lib/currency';

interface BillCardProps {
  bill: Bill;
  onEdit: (bill: Bill) => void;
  onDelete: (id: string) => void;
  onTogglePaid: (bill: Bill) => void;
}

const categoryIcons: Record<string, string> = {
  utilities: '⚡',
  subscription: '📺',
  insurance: '🛡️',
  housing: '🏠',
  harrison: '👤',
  debt: '💳',
  other: '📄',
};

export default function BillCard({ bill, onEdit, onDelete, onTogglePaid }: BillCardProps) {
  // Display in native currency without conversion
  const billCurrency = bill.currency || 'CAD';

  const formatAmount = (amount: number) => {
    return formatCurrency(amount, billCurrency);
  };

  const getDueDateSuffix = (day: number) => {
    if (day === 1 || day === 21 || day === 31) return 'st';
    if (day === 2 || day === 22) return 'nd';
    if (day === 3 || day === 23) return 'rd';
    return 'th';
  };

  const getDueStatus = () => {
    const today = new Date().getDate();
    let daysUntil = bill.dueDate - today;
    if (daysUntil < 0) daysUntil += 30;

    if (bill.isPaid) return { text: 'Paid', className: '' };
    if (daysUntil === 0) return { text: 'Due today', className: 'overdue' };
    if (daysUntil < 0) return { text: 'Overdue', className: 'overdue' };
    if (daysUntil <= 3) return { text: `Due in ${daysUntil} days`, className: 'soon' };
    return { text: `Due on ${bill.dueDate}${getDueDateSuffix(bill.dueDate)}`, className: '' };
  };

  const dueStatus = getDueStatus();

  return (
    <div className={`bill-card ${bill.isPaid ? 'paid' : ''}`}>
      <div className="bill-card-left">
        <div className={`bill-card-icon ${bill.category}`}>
          {categoryIcons[bill.category] || categoryIcons.other}
        </div>
        <div className="bill-card-info">
          <h3 className="bill-card-name">
            {bill.name}
            {bill.isAutoPay && <span className="bill-card-autopay-badge">Auto-Pay</span>}
          </h3>
          <div className="bill-card-details">
            <span className={`bill-card-due ${dueStatus.className}`}>
              {dueStatus.text}
            </span>
            <span className="bill-card-frequency">
              {bill.frequency}
            </span>
          </div>
        </div>
      </div>

      <div className="bill-card-right">
        <div className="bill-card-amount">{formatAmount(bill.amount)}</div>
        <div className={`bill-card-status ${bill.isPaid ? 'paid' : 'unpaid'}`}>
          {bill.isPaid ? 'Paid' : 'Unpaid'}
        </div>
        <div className="bill-card-actions">
          <button
            className={`bill-card-action-btn ${bill.isPaid ? '' : 'pay'}`}
            onClick={() => onTogglePaid(bill)}
            title={bill.isPaid ? 'Mark as unpaid' : 'Mark as paid'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {bill.isPaid ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <polyline points="20 6 9 17 4 12" />
              )}
            </svg>
          </button>
          <button
            className="bill-card-action-btn"
            onClick={() => onEdit(bill)}
            title="Edit bill"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            className="bill-card-action-btn delete"
            onClick={() => onDelete(bill.id)}
            title="Delete bill"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
