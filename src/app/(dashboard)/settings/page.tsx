'use client';

import { useState, useEffect } from 'react';
import { isDemoMode } from '@/lib/demo/demoState';
import './Settings.css';

interface HouseholdMember {
  id: string;
  email: string;
  role: 'owner' | 'member';
  userId: string;
  joinedAt: string;
}

interface Household {
  id: string;
  name: string;
}

interface HouseholdData {
  household: Household;
  members: HouseholdMember[];
}

export default function SettingsPage() {
  const [householdData, setHouseholdData] = useState<HouseholdData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [householdName, setHouseholdName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);

  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  const loadHousehold = async () => {
    if (isDemoMode()) {
      const demoData: HouseholdData = {
        household: { id: 'demo', name: 'Demo Household' },
        members: [{ id: 'demo-member-1', email: 'demo@example.com', role: 'owner', userId: 'demo', joinedAt: new Date().toISOString() }],
      };
      setHouseholdData(demoData);
      setHouseholdName(demoData.household.name);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/household');
      if (!response.ok) {
        throw new Error('Failed to fetch household');
      }
      const data = await response.json();
      setHouseholdData(data);
      setHouseholdName(data.household.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load household');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHousehold();
  }, []);

  const handleSaveName = async () => {
    if (!householdName.trim()) return;

    setIsSavingName(true);
    if (isDemoMode()) {
      setHouseholdData(prev => prev ? { ...prev, household: { ...prev.household, name: householdName.trim() } } : prev);
      setIsEditingName(false);
      setIsSavingName(false);
      return;
    }

    try {
      const response = await fetch('/api/household', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: householdName.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to update household name');
      }

      setIsEditingName(false);
      await loadHousehold();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSavingName(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setIsInviting(true);
    setInviteError(null);
    setInviteSuccess(null);

    if (isDemoMode()) {
      const email = inviteEmail.trim();
      setHouseholdData(prev => prev ? {
        ...prev,
        members: [...prev.members, { id: `demo-member-${Date.now()}`, email, role: 'member' as const, userId: `pending:${email}`, joinedAt: new Date().toISOString() }],
      } : prev);
      setInviteSuccess(`Invitation sent to ${email}`);
      setInviteEmail('');
      setIsInviting(false);
      return;
    }

    try {
      const response = await fetch('/api/household/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to invite member');
      }

      setInviteSuccess(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
      await loadHousehold();
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : 'Failed to invite');
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async (email: string) => {
    if (!confirm(`Remove ${email} from the household?`)) return;

    if (isDemoMode()) {
      setHouseholdData(prev => prev ? { ...prev, members: prev.members.filter(m => m.email !== email) } : prev);
      return;
    }

    try {
      const response = await fetch('/api/household/invite', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove member');
      }

      await loadHousehold();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member');
    }
  };

  if (isLoading) {
    return (
      <div className="settings-loading">
        <div className="settings-spinner" />
      </div>
    );
  }

  if (error && !householdData) {
    return (
      <div className="settings-error">
        <p>{error}</p>
        <button onClick={() => { setError(null); setIsLoading(true); loadHousehold(); }}>
          Retry
        </button>
      </div>
    );
  }

  const isPending = (member: HouseholdMember) => member.userId.startsWith('pending:');
  const currentUserIsOwner = householdData?.members.some(
    m => m.role === 'owner' && !isPending(m)
  );

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1 className="settings-title">Settings</h1>
        <p className="settings-subtitle">Manage your household and members</p>
      </div>

      {error && (
        <div className="settings-alert error">
          {error}
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {/* Household Name Section */}
      <section className="settings-section">
        <h2 className="settings-section-title">Household Name</h2>
        <div className="settings-card">
          {isEditingName ? (
            <div className="settings-name-edit">
              <input
                type="text"
                value={householdName}
                onChange={(e) => setHouseholdName(e.target.value)}
                className="settings-input"
                placeholder="Household name"
                autoFocus
              />
              <div className="settings-name-actions">
                <button
                  className="settings-btn secondary"
                  onClick={() => {
                    setIsEditingName(false);
                    setHouseholdName(householdData?.household.name || '');
                  }}
                  disabled={isSavingName}
                >
                  Cancel
                </button>
                <button
                  className="settings-btn primary"
                  onClick={handleSaveName}
                  disabled={isSavingName || !householdName.trim()}
                >
                  {isSavingName ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <div className="settings-name-display">
              <span className="settings-name-value">{householdData?.household.name}</span>
              <button
                className="settings-btn secondary"
                onClick={() => setIsEditingName(true)}
              >
                Edit
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Members Section */}
      <section className="settings-section">
        <h2 className="settings-section-title">Household Members</h2>
        <div className="settings-card">
          <div className="settings-members-list">
            {householdData?.members.map((member) => (
              <div key={member.id} className="settings-member">
                <div className="settings-member-info">
                  <div className="settings-member-avatar">
                    {member.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="settings-member-details">
                    <span className="settings-member-email">{member.email}</span>
                    <span className="settings-member-role">
                      {isPending(member) ? 'Pending invitation' : member.role}
                    </span>
                  </div>
                </div>
                {currentUserIsOwner && member.role !== 'owner' && (
                  <button
                    className="settings-btn danger small"
                    onClick={() => handleRemoveMember(member.email)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Invite Section */}
      <section className="settings-section">
        <h2 className="settings-section-title">Invite Member</h2>
        <div className="settings-card">
          <p className="settings-invite-note">
            Invite someone to share your household&apos;s financial data. They must be in the allowed emails list.
          </p>

          {inviteSuccess && (
            <div className="settings-alert success">
              {inviteSuccess}
              <button onClick={() => setInviteSuccess(null)}>Dismiss</button>
            </div>
          )}

          {inviteError && (
            <div className="settings-alert error">
              {inviteError}
              <button onClick={() => setInviteError(null)}>Dismiss</button>
            </div>
          )}

          <form onSubmit={handleInvite} className="settings-invite-form">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="settings-input"
              placeholder="email@example.com"
              required
            />
            <button
              type="submit"
              className="settings-btn primary"
              disabled={isInviting || !inviteEmail.trim()}
            >
              {isInviting ? 'Inviting...' : 'Send Invite'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
