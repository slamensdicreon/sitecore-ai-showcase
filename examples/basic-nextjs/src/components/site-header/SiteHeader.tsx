import { JSX } from 'react';
import Link from 'next/link';
import { Image, ImageField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import DrawerNav from './DrawerNav';
import SubNav from './SubNav';

interface SiteHeaderFields {
  Logo: ImageField;
}

type SiteHeaderProps = ComponentProps & {
  fields: SiteHeaderFields;
};

interface EdgeField {
  name: string;
  jsonValue: { value: string } | { value: { href?: string; text?: string; linktype?: string; target?: string } };
}

interface EdgeChildResult {
  id: string;
  name: string;
  fields: EdgeField[];
  children?: {
    results?: EdgeChildResult[];
  };
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

export interface NavLinkData {
  id: string;
  title: string;
  href: string;
  external: boolean;
  children?: NavLinkData[];
}

const EDGE_URL = 'https://edge-platform.sitecorecloud.io/v1/content/api/graphql/v1';

const TOP_LEVEL_QUERY = `
query TopNav($datasource: String!, $language: String!) {
  item(path: $datasource, language: $language) {
    children(hasLayout: false, first: 20) {
      results {
        id
        name
        fields {
          name
          jsonValue
        }
      }
    }
  }
}`;

const CHILDREN_QUERY = `
query ChildNav($parentId: String!, $language: String!) {
  item(path: $parentId, language: $language) {
    children(hasLayout: false, first: 15) {
      results {
        id
        name
        fields {
          name
          jsonValue
        }
      }
    }
  }
}`;

const FALLBACK_NAV: NavLinkData[] = [
  { id: 'home', title: 'Home', href: '/', external: false },
  {
    id: 'products',
    title: 'Products',
    href: '/Products',
    external: false,
    children: [
      { id: 'p1', title: 'Connectors', href: '/Products', external: false },
      { id: 'p2', title: 'Sensors', href: '/Products', external: false },
      { id: 'p3', title: 'Relays & Contactors', href: '/Products', external: false },
      { id: 'p4', title: 'Wire & Cable', href: '/Products', external: false },
      { id: 'p5', title: 'Circuit Protection', href: '/Products', external: false },
      { id: 'p6', title: 'Antennas', href: '/Products', external: false },
    ],
  },
  {
    id: 'solutions',
    title: 'Solutions',
    href: '/Solutions',
    external: false,
    children: [
      { id: 's1', title: 'Automotive', href: '/Solutions', external: false },
      { id: 's2', title: 'Industrial', href: '/Solutions', external: false },
      { id: 's3', title: 'Data Communications', href: '/Solutions', external: false },
      { id: 's4', title: 'Aerospace & Defense', href: '/Solutions', external: false },
      { id: 's5', title: 'Medical', href: '/Solutions', external: false },
      { id: 's6', title: 'Energy', href: '/Solutions', external: false },
    ],
  },
  {
    id: 'innovation',
    title: 'Innovation',
    href: '/Innovation',
    external: false,
  },
];

const FALLBACK_SUBNAV: NavLinkData[] = [
  { id: 'sub1', title: 'About TE', href: '/About', external: false },
  { id: 'sub2', title: 'Industries', href: '/Solutions', external: false },
  { id: 'sub3', title: 'Resources', href: '/Innovation', external: false },
  { id: 'sub4', title: 'Support', href: '/Support', external: false },
  { id: 'sub5', title: 'Contact', href: '/Contact', external: false },
];

function parseLink(child: EdgeChildResult): NavLinkData {
  const fieldMap: Record<string, EdgeField['jsonValue']> = {};
  for (const f of child.fields) {
    fieldMap[f.name] = f.jsonValue;
  }

  const titleField = fieldMap.Title as { value: string } | undefined;
  const linkField = fieldMap.Link as { value: { href?: string; text?: string; linktype?: string; target?: string } } | undefined;
  const title = (typeof titleField?.value === 'string' ? titleField.value : linkField?.value?.text) || child.name || '';
  const href = linkField?.value?.href || '/';
  const linktype = linkField?.value?.linktype || '';
  const external = linktype === 'external' || href.startsWith('http');

  return { id: child.id, title, href, external };
}

async function edgeFetch(query: string, variables: Record<string, string>, contextId: string): Promise<EdgeQueryResponse | null> {
  try {
    const res = await fetch(`${EDGE_URL}?sitecoreContextId=${contextId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function fetchChildren(parentId: string, contextId: string): Promise<NavLinkData[]> {
  const json = await edgeFetch(CHILDREN_QUERY, { parentId, language: 'en' }, contextId);
  const results = json?.data?.item?.children?.results;
  if (!Array.isArray(results) || results.length === 0) return [];
  return results.map(parseLink);
}

async function fetchNavData(datasourceId: string): Promise<{ nav: NavLinkData[]; subNav: NavLinkData[] }> {
  const contextId = process.env.SITECORE_EDGE_CONTEXT_ID || process.env.NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID;
  if (!datasourceId || !contextId) return { nav: FALLBACK_NAV, subNav: FALLBACK_SUBNAV };

  const cleanId = datasourceId.replace(/[{}]/g, '');

  const topJson = await edgeFetch(TOP_LEVEL_QUERY, { datasource: cleanId, language: 'en' }, contextId);
  const results = topJson?.data?.item?.children?.results;
  if (!Array.isArray(results) || results.length === 0) return { nav: FALLBACK_NAV, subNav: FALLBACK_SUBNAV };

  const navItems: EdgeChildResult[] = [];
  let subNavItem: EdgeChildResult | null = null;

  for (const child of results) {
    if (child.name === 'SubNavigation') {
      subNavItem = child;
    } else {
      navItems.push(child);
    }
  }

  const childFetches = navItems.map((item) => {
    const link = parseLink(item);
    if (link.href === '/') return Promise.resolve(link);
    return fetchChildren(item.id, contextId).then((children) => {
      if (children.length > 0) link.children = children;
      return link;
    });
  });

  const subNavFetch = subNavItem
    ? fetchChildren(subNavItem.id, contextId)
    : Promise.resolve([] as NavLinkData[]);

  const [nav, subNavFromCms] = await Promise.all([
    Promise.all(childFetches),
    subNavFetch,
  ]);

  const finalNav = nav.length > 0 ? nav.map((link) => {
    if (!link.children || link.children.length === 0) {
      const fallback = FALLBACK_NAV.find((f) => f.href === link.href);
      if (fallback?.children) link.children = fallback.children;
    }
    return link;
  }) : FALLBACK_NAV;

  const finalSubNav = subNavFromCms.length > 0 ? subNavFromCms : FALLBACK_SUBNAV;

  return { nav: finalNav, subNav: finalSubNav };
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

  const { nav, subNav } = await fetchNavData(rendering?.dataSource || '');

  return (
    <div
      className={`component site-header ${styles}`}
      id={id || undefined}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: '#061E40',
          color: '#FFFFFF',
          padding: '0 24px',
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
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            {fields.Logo?.value?.src ? (
              <Image field={fields.Logo} style={{ height: '40px', width: 'auto', filter: 'brightness(0) invert(1)' }} />
            ) : (
              <span style={{ color: '#FFFFFF', fontSize: '20px', fontWeight: 700, letterSpacing: '-0.5px', fontFamily: 'var(--font-heading, sans-serif)' }}>
                TE Connectivity
              </span>
            )}
          </Link>

          <DrawerNav links={nav} />
        </div>
      </div>

      <SubNav links={subNav} />
    </div>
  );
};
