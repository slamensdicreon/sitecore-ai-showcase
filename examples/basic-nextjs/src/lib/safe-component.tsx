import { JSX } from 'react';
import type { ComponentRendering, ComponentFields } from '@sitecore-content-sdk/nextjs';

interface SitecoreComponentProps {
  rendering: ComponentRendering;
  fields: ComponentFields;
  params: Record<string, string>;
}

type SitecoreComponent = (props: SitecoreComponentProps) => JSX.Element | Promise<JSX.Element>;

interface ComponentModule {
  Default?: SitecoreComponent;
  [key: string]: unknown;
}

function ComponentErrorFallback({ componentName }: { componentName: string }): JSX.Element {
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

const RENDER_EXPORT_NAMES = new Set(['Default']);

export function wrapSafe(
  componentName: string,
  mod: ComponentModule
): ComponentModule {
  const wrapped: ComponentModule = {};

  for (const key of Object.keys(mod)) {
    const value = mod[key];

    if (RENDER_EXPORT_NAMES.has(key) && typeof value === 'function') {
      const OriginalComponent = value as SitecoreComponent;

      const SafeComponent = async (props: SitecoreComponentProps): Promise<JSX.Element> => {
        try {
          const result = OriginalComponent(props);
          if (result && typeof (result as Promise<JSX.Element>).then === 'function') {
            return await (result as Promise<JSX.Element>);
          }
          return result as JSX.Element;
        } catch (err) {
          console.error(
            `[NovaTech] ${componentName}.${key} render error:`,
            err instanceof Error ? err.message : err
          );
          return <ComponentErrorFallback componentName={componentName} />;
        }
      };

      wrapped[key] = SafeComponent;
    } else {
      wrapped[key] = value;
    }
  }

  return wrapped;
}
