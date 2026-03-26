import { JSX } from 'react';

function ComponentErrorFallback({ componentName }: { componentName: string }) {
  return (
    <div
      style={{
        padding: '16px',
        margin: '8px 0',
        background: '#FEF2F2',
        border: '1px solid #FCA5A5',
        borderRadius: '6px',
        fontFamily: 'system-ui, sans-serif',
      }}
      data-testid={`error-fallback-${componentName}`}
    >
      <p style={{ color: '#991B1B', margin: 0, fontSize: '14px' }}>
        <strong>{componentName}</strong> failed to render.
      </p>
    </div>
  );
}

export function wrapSafe(
  componentName: string,
  mod: Record<string, any>
): Record<string, any> {
  const wrapped: Record<string, any> = { ...mod };

  for (const exportName of Object.keys(mod)) {
    const Original = mod[exportName];
    if (typeof Original !== 'function') continue;

    wrapped[exportName] = async (props: any): Promise<JSX.Element> => {
      try {
        const result = Original(props);
        if (result && typeof result.then === 'function') {
          return await result;
        }
        return result;
      } catch (err) {
        console.error(`[NovaTech] ${componentName}.${exportName} render error:`, err);
        return <ComponentErrorFallback componentName={componentName} />;
      }
    };
  }

  return wrapped;
}
