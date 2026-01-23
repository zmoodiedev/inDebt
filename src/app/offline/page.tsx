'use client';

export default function OfflinePage() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem',
      textAlign: 'center',
      backgroundColor: '#F8F9FA',
    }}>
      <div style={{
        fontSize: '4rem',
        marginBottom: '1rem',
      }}>
        📡
      </div>
      <h1 style={{
        fontSize: '1.5rem',
        fontWeight: 600,
        color: '#1A1D2E',
        marginBottom: '0.5rem',
      }}>
        You&apos;re Offline
      </h1>
      <p style={{
        color: '#6B7280',
        maxWidth: '300px',
      }}>
        Please check your internet connection and try again.
      </p>
      <button
        onClick={() => window.location.reload()}
        style={{
          marginTop: '1.5rem',
          padding: '0.75rem 1.5rem',
          backgroundColor: '#FF7B9C',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1rem',
          fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        Try Again
      </button>
    </div>
  );
}
