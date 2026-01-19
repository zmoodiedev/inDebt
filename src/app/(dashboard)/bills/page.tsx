'use client';

import { useState, useEffect } from 'react';
import { Bill } from '@/types';
import { fetchBills, saveBillsToSheet } from '@/lib/storage';
import { formatCurrency } from '@/lib/currency';
import { BillCard, BillForm } from '@/components/bills';
import '@/components/bills/Bills.css';

export default function BillsPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);

  useEffect(() => {
    const loadBills = async () => {
      const storedBills = await fetchBills();

      // Process auto-pay bills: mark as paid if due date has passed
      const today = new Date();
      const currentDay = today.getDate();
      let needsUpdate = false;

      const processedBills = storedBills.map(bill => {
        // Check if bill has auto-pay enabled, is not already paid, and due date has passed
        if (bill.isAutoPay && !bill.isPaid && currentDay > bill.dueDate) {
          needsUpdate = true;
          return {
            ...bill,
            isPaid: true,
            lastPaidDate: new Date(),
            updatedAt: new Date(),
          };
        }
        return bill;
      });

      setBills(processedBills);

      // Save updated bills if any were auto-paid
      if (needsUpdate) {
        await saveBillsToSheet(processedBills);
      }

      setIsLoading(false);
    };
    loadBills();
  }, []);

  const handleSaveBill = async (bill: Bill) => {
    let updatedBills: Bill[];

    if (editingBill) {
      updatedBills = bills.map(b => b.id === bill.id ? bill : b);
    } else {
      updatedBills = [...bills, bill];
    }

    setBills(updatedBills);
    await saveBillsToSheet(updatedBills);
    setShowForm(false);
    setEditingBill(null);
  };

  const handleEditBill = (bill: Bill) => {
    setEditingBill(bill);
    setShowForm(true);
  };

  const handleDeleteBill = async (id: string) => {
    if (confirm('Are you sure you want to delete this bill?')) {
      const updatedBills = bills.filter(b => b.id !== id);
      setBills(updatedBills);
      await saveBillsToSheet(updatedBills);
    }
  };

  const handleTogglePaid = async (bill: Bill) => {
    const updatedBill = {
      ...bill,
      isPaid: !bill.isPaid,
      lastPaidDate: !bill.isPaid ? new Date() : bill.lastPaidDate,
      updatedAt: new Date(),
    };
    const updatedBills = bills.map(b => b.id === bill.id ? updatedBill : b);
    setBills(updatedBills);
    await saveBillsToSheet(updatedBills);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingBill(null);
  };

  // Split bills by currency
  const cadBills = bills.filter(b => (b.currency || 'CAD') === 'CAD');
  const usdBills = bills.filter(b => b.currency === 'USD');

  // Calculate summary metrics for each currency
  const cadTotal = cadBills.reduce((sum, b) => sum + b.amount, 0);
  const usdTotal = usdBills.reduce((sum, b) => sum + b.amount, 0);

  const cadUnpaid = cadBills.filter(b => !b.isPaid);
  const usdUnpaid = usdBills.filter(b => !b.isPaid);

  const cadUnpaidTotal = cadUnpaid.reduce((sum, b) => sum + b.amount, 0);
  const usdUnpaidTotal = usdUnpaid.reduce((sum, b) => sum + b.amount, 0);

  // Sort bills: unpaid first (by due date), then paid
  const sortBills = (billList: Bill[]) => [...billList].sort((a, b) => {
    if (a.isPaid !== b.isPaid) return a.isPaid ? 1 : -1;
    return a.dueDate - b.dueDate;
  });

  const sortedCadBills = sortBills(cadBills);
  const sortedUsdBills = sortBills(usdBills);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '256px' }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '2px solid #FF7B9C',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  return (
    <div>
      <div className="bills-header">
        <div>
          <h1 className="bills-title">Bill Management</h1>
          <p className="bills-subtitle">Track and manage your recurring bills</p>
        </div>
        <button className="bills-add-btn" onClick={() => setShowForm(true)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Bill
        </button>
      </div>

      {/* Two column layout */}
      <div className="bills-columns">
        {/* CAD Bills Column */}
        <div className="bills-column">
          <div className="bills-column-header">
            <h2 className="bills-column-title">🇨🇦 Canadian Bills</h2>
          </div>

          {/* CAD Summary */}
          <div className="bills-column-summary">
            <div className="bills-summary-item">
              <span className="bills-summary-label">Total</span>
              <span className="bills-summary-value">{formatCurrency(cadTotal, 'CAD')}</span>
            </div>
            <div className="bills-summary-item">
              <span className="bills-summary-label">Unpaid</span>
              <span className="bills-summary-value warning">{formatCurrency(cadUnpaidTotal, 'CAD')}</span>
            </div>
            <div className="bills-summary-item">
              <span className="bills-summary-label">Bills</span>
              <span className="bills-summary-value">{cadBills.length}</span>
            </div>
          </div>

          {/* CAD Bills List */}
          <div className="bills-list">
            {sortedCadBills.length === 0 ? (
              <div className="bills-empty-small">
                <p>No Canadian bills yet</p>
              </div>
            ) : (
              sortedCadBills.map(bill => (
                <BillCard
                  key={bill.id}
                  bill={bill}
                  onEdit={handleEditBill}
                  onDelete={handleDeleteBill}
                  onTogglePaid={handleTogglePaid}
                />
              ))
            )}
          </div>
        </div>

        {/* USD Bills Column */}
        <div className="bills-column">
          <div className="bills-column-header">
            <h2 className="bills-column-title">🇺🇸 US Bills</h2>
          </div>

          {/* USD Summary */}
          <div className="bills-column-summary">
            <div className="bills-summary-item">
              <span className="bills-summary-label">Total</span>
              <span className="bills-summary-value">{formatCurrency(usdTotal, 'USD')}</span>
            </div>
            <div className="bills-summary-item">
              <span className="bills-summary-label">Unpaid</span>
              <span className="bills-summary-value warning">{formatCurrency(usdUnpaidTotal, 'USD')}</span>
            </div>
            <div className="bills-summary-item">
              <span className="bills-summary-label">Bills</span>
              <span className="bills-summary-value">{usdBills.length}</span>
            </div>
          </div>

          {/* USD Bills List */}
          <div className="bills-list">
            {sortedUsdBills.length === 0 ? (
              <div className="bills-empty-small">
                <p>No US bills yet</p>
              </div>
            ) : (
              sortedUsdBills.map(bill => (
                <BillCard
                  key={bill.id}
                  bill={bill}
                  onEdit={handleEditBill}
                  onDelete={handleDeleteBill}
                  onTogglePaid={handleTogglePaid}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <BillForm
          bill={editingBill}
          onSave={handleSaveBill}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}
