'use client';

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      style={{
        fontFamily: 'system-ui, sans-serif',
        padding: '40px',
        maxWidth: '800px',
        margin: '0 auto',
      }}
    >
      <div
        style={{
          background: '#FEF2F2',
          border: '1px solid #FCA5A5',
          borderRadius: '8px',
          padding: '24px',
        }}
      >
        <h2 style={{ color: '#991B1B', margin: '0 0 12px 0' }}>
          Component Rendering Error
        </h2>
        <p style={{ color: '#7F1D1D', margin: '0 0 16px 0' }}>
          {error.message || 'An unexpected error occurred while rendering this page.'}
        </p>
        <button
          onClick={reset}
          style={{
            padding: '8px 16px',
            background: '#f28d00',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Retry
        </button>
      </div>
    </div>
  );
}
