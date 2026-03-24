export default function NotFound() {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'Inter, sans-serif' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#2e4957', marginBottom: '0.5rem' }}>404</h1>
          <p style={{ color: '#666' }}>Page not found</p>
        </div>
      </body>
    </html>
  );
}
