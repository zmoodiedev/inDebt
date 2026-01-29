'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Currency } from '@/types';
import { MonthSelector } from '@/components/ui';
import { isDemoMode, setDemoMode } from '@/lib/demo/demoState';
import { resetDemoStore } from '@/lib/demo/demoStore';

interface HeaderProps {
  currency: Currency;
  onCurrencyChange: (currency: Currency) => void;
}

export default function Header({ currency, onCurrencyChange }: HeaderProps) {
  const { data: session } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [demo, setDemo] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setDemo(isDemoMode());
  }, []);

  const handleExitDemo = () => {
    setDemoMode(false);
    resetDemoStore();
    window.location.href = '/login';
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        minHeight: '64px',
        background: '#FFFFFF',
        borderBottom: '1px solid #E5E7EB',
        padding: isMobile ? '12px 16px 12px 60px' : '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isMobile ? 'center' : 'space-between',
        gap: isMobile ? '12px' : '16px',
      }}
    >
      {/* Month selector - always visible */}
      <MonthSelector compact={isMobile} />

      {/* Right side actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px', flexShrink: 0 }}>
        {/* Currency toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: '#F8F9FC',
            borderRadius: '12px',
            padding: '4px',
            border: '1px solid #E5E7EB',
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => onCurrencyChange('CAD')}
            style={{
              padding: isMobile ? '6px 8px' : '6px 12px',
              fontSize: isMobile ? '12px' : '14px',
              fontWeight: 500,
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: currency === 'CAD' ? '#FFFFFF' : 'transparent',
              color: currency === 'CAD' ? '#1A1D2E' : '#9CA3AF',
              boxShadow: currency === 'CAD' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            CAD
          </button>
          <button
            onClick={() => onCurrencyChange('USD')}
            style={{
              padding: isMobile ? '6px 8px' : '6px 12px',
              fontSize: isMobile ? '12px' : '14px',
              fontWeight: 500,
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: currency === 'USD' ? '#FFFFFF' : 'transparent',
              color: currency === 'USD' ? '#1A1D2E' : '#9CA3AF',
              boxShadow: currency === 'USD' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            USD
          </button>
        </div>

        {/* Demo badge */}
        {demo && (
          <div style={{
            padding: isMobile ? '4px 8px' : '4px 12px',
            background: 'linear-gradient(135deg, #FF7B9C 0%, #FF6B9D 100%)',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 600,
            color: 'white',
            flexShrink: 0,
          }}>
            DEMO
          </div>
        )}

        {/* User menu */}
        {(session?.user || demo) && (
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px',
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
                background: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {!demo && session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt=""
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #FF7B9C 0%, #FF6B9D 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                >
                  {demo ? 'D' : (session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || '?')}
                </div>
              )}
              {!isMobile && (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#6B7280"
                  strokeWidth="2"
                  style={{
                    transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                  }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              )}
            </button>

            {/* Dropdown menu */}
            {showUserMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  background: 'white',
                  borderRadius: '12px',
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  minWidth: '200px',
                  overflow: 'hidden',
                  zIndex: 50,
                }}
              >
                <div
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #E5E7EB',
                  }}
                >
                  <p style={{ margin: 0, fontWeight: 600, color: '#1A1D2E', fontSize: '14px' }}>
                    {demo ? 'Demo User' : (session?.user?.name || 'User')}
                  </p>
                  <p style={{ margin: '4px 0 0', color: '#6B7280', fontSize: '12px' }}>
                    {demo ? 'demo@example.com' : session?.user?.email}
                  </p>
                </div>
                <button
                  onClick={demo ? handleExitDemo : () => signOut({ callbackUrl: '/login' })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: demo ? '#FF7B9C' : '#EF4444',
                    fontSize: '14px',
                    transition: 'background 0.2s',
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = demo ? '#FFF1F4' : '#FEE2E2'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  {demo ? 'Exit Demo' : 'Sign out'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
