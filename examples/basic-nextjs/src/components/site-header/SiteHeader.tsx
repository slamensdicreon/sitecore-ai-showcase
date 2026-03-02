import { JSX } from 'react';
import { Image, ImageField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import DrawerNav from './DrawerNav';

interface SiteHeaderFields {
  Logo: ImageField;
}

type SiteHeaderProps = ComponentProps & {
  fields: SiteHeaderFields;
};

interface EdgeField {
  name: string;
  jsonValue: { value: string } | { value: { href?: string; text?: string } };
}

interface EdgeChildResult {
  id: string;
  fields: EdgeField[];
}

interface EdgeQueryResponse {
  data?: {
    item?: {
      children?: {
        results?: EdgeChildResult[];
      };
    };
  };
}

const EDGE_URL = 'https://edge-platform.sitecorecloud.io/v1/content/api/graphql/v1';

const NAV_QUERY = `
query NavLinks($datasource: String!, $language: String!) {
  item(path: $datasource, language: $language) {
    children(hasLayout: false, first: 20) {
      results {
        id
        fields {
          name
          jsonValue
        }
      }
    }
  }
}`;

const FALLBACK_LINKS = [
  { id: 'home', title: 'Home', href: '/' },
  { id: 'products', title: 'Products', href: '/Products' },
  { id: 'solutions', title: 'Solutions', href: '/Solutions' },
];

async function fetchNavLinks(datasourceId: string): Promise<{ id: string; title: string; href: string }[]> {
  const contextId = process.env.SITECORE_EDGE_CONTEXT_ID || process.env.NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID;
  if (!datasourceId || !contextId) return FALLBACK_LINKS;

  const cleanId = datasourceId.replace(/[{}]/g, '');

  try {
    const url = `${EDGE_URL}?sitecoreContextId=${contextId}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: NAV_QUERY,
        variables: { datasource: cleanId, language: 'en' },
      }),
      next: { revalidate: 300 },
    });

    if (!res.ok) return FALLBACK_LINKS;

    const json: EdgeQueryResponse = await res.json();
    const results = json?.data?.item?.children?.results;
    if (!Array.isArray(results) || results.length === 0) return FALLBACK_LINKS;

    return results.map((child) => {
      const fieldMap: Record<string, { value: string } | { value: { href?: string; text?: string } }> = {};
      for (const f of child.fields) {
        fieldMap[f.name] = f.jsonValue;
      }

      const titleField = fieldMap.Title as { value: string } | undefined;
      const linkField = fieldMap.Link as { value: { href?: string; text?: string } } | undefined;
      const title = (typeof titleField?.value === 'string' ? titleField.value : linkField?.value?.text) || '';
      const href = linkField?.value?.href || '/';

      return { id: child.id, title, href };
    });
  } catch {
    return FALLBACK_LINKS;
  }
}

export const Default = async (props: SiteHeaderProps): Promise<JSX.Element> => {
  const { fields, params, rendering } = props;
  const id = params?.RenderingIdentifier;
  const styles = params?.styles || '';

  if (!fields) {
    return (
      <div className={`component site-header ${styles}`}>
        <div className="component-content">
          <span className="is-empty-hint">SiteHeader requires a datasource item assigned.</span>
        </div>
      </div>
    );
  }

  const navLinks = await fetchNavLinks(rendering?.dataSource || '');

  return (
    <div
      className={`component site-header ${styles}`}
      id={id || undefined}
      style={{
        background: '#061E40',
        color: '#FFFFFF',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }}
    >
      <div
        className="component-content"
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {fields.Logo?.value?.src ? (
            <Image field={fields.Logo} style={{ height: '32px', width: 'auto' }} />
          ) : (
            <span
              style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                color: '#FFFFFF',
              }}
            >
              EAA
            </span>
          )}
        </div>

        <DrawerNav links={navLinks} />
      </div>
    </div>
  );
};
