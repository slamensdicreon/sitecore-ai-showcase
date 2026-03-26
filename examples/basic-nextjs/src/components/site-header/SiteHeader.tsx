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
  {
    id: 'solutions',
    title: 'Solutions',
    href: '/Solutions',
    external: false,
    children: [
      { id: 's1', title: 'Transportation', href: '/Solutions', external: false },
      { id: 's2', title: 'Industrial', href: '/Solutions', external: false },
      { id: 's3', title: 'Communications', href: '/Solutions', external: false },
    ],
  },
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

function TELogoSVG() {
  return (
    <svg viewBox="0 0 120 48" style={{ height: '40px', width: 'auto' }} aria-label="TE Connectivity">
      <rect x="0" y="0" width="48" height="48" rx="4" fill="#f28d00" />
      <text x="24" y="34" textAnchor="middle" fontFamily="Montserrat, Arial, sans-serif" fontWeight="800" fontStyle="italic" fontSize="28" fill="white">TE</text>
      <line x1="56" y1="14" x2="110" y2="14" stroke="#f28d00" strokeWidth="3" strokeLinecap="round" />
      <line x1="56" y1="24" x2="100" y2="24" stroke="#2e4957" strokeWidth="3" strokeLinecap="round" />
      <line x1="56" y1="34" x2="90" y2="34" stroke="#167a87" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
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
      data-testid="site-header"
      style={{ position: 'sticky', top: 0, zIndex: 1000 }}
    >
      <style>{`
        .te-header-utility {
          background: #2e4957;
          color: #FFFFFF;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .te-header-utility-inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 32px;
        }
        .te-header-main {
          background: #FFFFFF;
          border-bottom: 1px solid #e5e7eb;
        }
        .te-header-main-inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          height: 64px;
        }
        .te-header-logo-area {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          flex-shrink: 0;
        }
        .te-header-logo-text {
          display: none;
        }
        @media (min-width: 640px) {
          .te-header-logo-text {
            display: block;
          }
        }
        .te-header-search {
          display: none;
          flex: 1;
          max-width: 480px;
          position: relative;
        }
        @media (min-width: 768px) {
          .te-header-search {
            display: flex;
          }
        }
        .te-header-search input {
          width: 100%;
          height: 36px;
          padding: 0 16px 0 36px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          background: #f9fafb;
          font-size: 13px;
          color: #2e4957;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .te-header-search input:focus {
          border-color: #f28d00;
          box-shadow: 0 0 0 3px rgba(242,141,0,0.1);
        }
        .te-header-search input::placeholder {
          color: #9ca3af;
        }
        .te-header-search-icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          pointer-events: none;
        }
        .te-header-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
        }
        .te-header-action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 6px;
          background: none;
          border: none;
          color: #2e4957;
          cursor: pointer;
          transition: background 0.15s;
        }
        .te-header-action-btn:hover {
          background: #f3f4f6;
        }
        .te-header-nav {
          background: #FFFFFF;
          border-bottom: 1px solid #e5e7eb;
        }
        .te-header-nav-inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 16px;
          display: none;
          align-items: center;
          gap: 4px;
          height: 40px;
        }
        @media (min-width: 1024px) {
          .te-header-nav-inner {
            display: flex;
          }
        }
        .te-nav-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 500;
          font-family: 'Montserrat', system-ui, sans-serif;
          color: rgba(46,73,87,0.8);
          text-decoration: none;
          border-radius: 6px;
          transition: color 0.15s, background 0.15s;
          white-space: nowrap;
        }
        .te-nav-link:hover {
          color: #2e4957;
          background: rgba(0,0,0,0.04);
        }
        .te-nav-link.active {
          color: #f28d00;
          background: rgba(242,141,0,0.08);
        }
      `}</style>

      <div className="te-header-utility">
        <div className="te-header-utility-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ opacity: 0.9, fontFamily: 'Montserrat, system-ui, sans-serif', letterSpacing: '0.05em' }}>
              Engineering the connections that power our world
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ opacity: 0.8 }}>United States (English)</span>
          </div>
        </div>
      </div>

      <div className="te-header-main">
        <div className="te-header-main-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <Link href="/" className="te-header-logo-area" data-testid="link-home-logo">
              {fields.Logo?.value?.src ? (
                <Image field={fields.Logo} style={{ height: '40px', width: 'auto' }} />
              ) : (
                <TELogoSVG />
              )}
              <div className="te-header-logo-text">
                <div style={{ fontFamily: 'Montserrat, system-ui, sans-serif', fontWeight: 600, fontSize: '14px', lineHeight: 1.2, color: '#424241' }}>
                  connectivity
                </div>
              </div>
            </Link>
          </div>

          <div className="te-header-search">
            <div className="te-header-search-icon">
              <SearchIcon />
            </div>
            <input
              type="search"
              placeholder="Search by part number, keyword..."
              readOnly
              aria-label="Search products by part number or keyword"
              data-testid="input-search"
            />
          </div>

          <div className="te-header-actions">
            <button className="te-header-action-btn" aria-label="Account" data-testid="button-account">
              <UserIcon />
            </button>
            <DrawerNav links={nav} />
          </div>
        </div>
      </div>

      <div className="te-header-nav">
        <div className="te-header-nav-inner">
          {nav.map((item) => (
            item.external ? (
              <a
                key={item.id}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="te-nav-link"
                data-testid={`nav-${item.title.toLowerCase()}`}
              >
                {item.title}
              </a>
            ) : (
              <Link
                key={item.id}
                href={item.href}
                className="te-nav-link"
                data-testid={`nav-${item.title.toLowerCase()}`}
              >
                {item.title}
              </Link>
            )
          ))}
        </div>
      </div>

      <SubNav links={subNav} />
    </div>
  );
};
