'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'Inter, sans-serif' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#2e4957', marginBottom: '0.5rem' }}>Something went wrong</h1>
          <p style={{ color: '#666', marginBottom: '1rem' }}>{error.message}</p>
          <button
            onClick={() => reset()}
            style={{ padding: '0.5rem 1rem', backgroundColor: '#f28d00', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
