'use client';

import { useState, useEffect } from 'react';
import { Bill, Currency } from '@/types';
import { generateId } from '@/lib/storage';
import '@/components/debts/Debts.css'; // Reuse modal/form styles

interface BillFormProps {
  bill?: Bill | null;
  onSave: (bill: Bill) => void;
  onClose: () => void;
}

export default function BillForm({ bill, onSave, onClose }: BillFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    dueDate: '',
    category: 'utilities' as Bill['category'],
    isRecurring: true,
    frequency: 'monthly' as Bill['frequency'],
    currency: 'CAD' as Currency,
    isAutoPay: false,
  });

  useEffect(() => {
    if (bill) {
      setFormData({
        name: bill.name,
        amount: bill.amount.toString(),
        dueDate: bill.dueDate.toString(),
        category: bill.category,
        isRecurring: bill.isRecurring,
        frequency: bill.frequency,
        currency: bill.currency || 'CAD',
        isAutoPay: bill.isAutoPay || false,
      });
    }
  }, [bill]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const now = new Date();
    const newBill: Bill = {
      id: bill?.id || generateId(),
      name: formData.name,
      amount: parseFloat(formData.amount) || 0,
      dueDate: parseInt(formData.dueDate) || 1,
      category: formData.category,
      isRecurring: formData.isRecurring,
      frequency: formData.frequency,
      isPaid: bill?.isPaid || false,
      isAutoPay: formData.isAutoPay,
      lastPaidDate: bill?.lastPaidDate,
      currency: formData.currency,
      createdAt: bill?.createdAt || now,
      updatedAt: now,
    };

    onSave(newBill);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{bill ? 'Edit Bill' : 'Add New Bill'}</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form className="modal-body" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Bill Name</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              placeholder="e.g., Electricity, Netflix, Rent"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="amount">Amount</label>
              <input
                type="number"
                id="amount"
                name="amount"
                className="form-input"
                placeholder="0.00"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="currency">Currency</label>
              <select
                id="currency"
                name="currency"
                className="form-select"
                value={formData.currency}
                onChange={handleChange}
              >
                <option value="CAD">CAD ($)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="dueDate">Due Date (day of month)</label>
            <input
              type="number"
              id="dueDate"
              name="dueDate"
              className="form-input"
              placeholder="15"
              min="1"
              max="31"
              value={formData.dueDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              className="form-select"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="utilities">Utilities</option>
              <option value="subscription">Subscription</option>
              <option value="insurance">Insurance</option>
              <option value="housing">Housing</option>
              <option value="harrison">Harrison</option>
              <option value="debt">Debt</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="frequency">Frequency</label>
            <select
              id="frequency"
              name="frequency"
              className="form-select"
              value={formData.frequency}
              onChange={handleChange}
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annually">Annually</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-checkbox-label">
              <input
                type="checkbox"
                name="isAutoPay"
                checked={formData.isAutoPay}
                onChange={handleChange}
                className="form-checkbox"
              />
              <span className="form-checkbox-text">Auto-Pay Enabled</span>
            </label>
            <p className="form-hint">Bill will automatically be marked as paid when the due date passes</p>
          </div>

          <div className="form-actions">
            <button type="button" className="form-btn form-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="form-btn form-btn-primary">
              {bill ? 'Save Changes' : 'Add Bill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
