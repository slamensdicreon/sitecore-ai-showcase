import { JSX } from 'react';
import Link from 'next/link';
import { Image, ImageField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import DrawerNav from './DrawerNav';
import SolutionsMenu from './SolutionsMenu';

interface SiteHeaderFields {
  Logo: ImageField;
}

type SiteHeaderProps = ComponentProps & {
  fields: SiteHeaderFields;
};

export interface NavLinkData {
  id: string;
  title: string;
  href: string;
  external: boolean;
  children?: NavLinkData[];
}

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
      { id: 's-transportation', title: 'Transportation', href: '/Solutions', external: false },
      { id: 's-industrial', title: 'Industrial', href: '/Solutions', external: false },
      { id: 's-communications', title: 'Communications', href: '/Solutions', external: false },
    ],
  },
  {
    id: 'applications',
    title: 'Applications',
    href: '/Solutions',
    external: false,
  },
  {
    id: 'products',
    title: 'All Products',
    href: '/Products',
    external: false,
  },
  {
    id: 'innovation',
    title: 'Innovation',
    href: '/Innovation',
    external: false,
  },
];

const SOLUTIONS_MEGA = [
  {
    slug: 'transportation',
    label: 'Transportation',
    description: 'EV powertrains, autonomous systems, and next-gen vehicle architectures',
    color: '#f28d00',
    iconPath: 'M7 2v11h3v9l7-12h-4l4-8H7',
  },
  {
    slug: 'industrial',
    label: 'Industrial',
    description: 'Factory automation, robotics, energy management, and harsh-environment connectivity',
    color: '#2e4957',
    iconPath: 'M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V2H4a2 2 0 0 0-2 2Z',
  },
  {
    slug: 'communications',
    label: 'Communications',
    description: 'Data center infrastructure, 5G networks, and high-speed signal integrity',
    color: '#167a87',
    iconPath: 'M22 12h-4l-3 9L9 3l-3 9H2',
  },
];

function parseLink(child: EdgeChildResult): NavLinkData {
  const fieldMap: Record<string, EdgeField['jsonValue']> = {};
  for (const f of child.fields) {
    fieldMap[f.name] = f.jsonValue;
  }

  const titleField = fieldMap.Title as { value: string } | undefined;
  const linkField = fieldMap.Link as { value: { href?: string; text?: string; linktype?: string } } | undefined;
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

async function fetchNavData(datasourceId: string): Promise<NavLinkData[]> {
  const contextId = process.env.SITECORE_EDGE_CONTEXT_ID || process.env.NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID;
  if (!datasourceId || !contextId) return FALLBACK_NAV;

  const cleanId = datasourceId.replace(/[{}]/g, '');

  const topJson = await edgeFetch(TOP_LEVEL_QUERY, { datasource: cleanId, language: 'en' }, contextId);
  const results = topJson?.data?.item?.children?.results;
  if (!Array.isArray(results) || results.length === 0) return FALLBACK_NAV;

  const childFetches = results.map((item) => {
    const link = parseLink(item);
    if (link.href === '/') return Promise.resolve(link);
    return fetchChildren(item.id, contextId).then((children) => {
      if (children.length > 0) link.children = children;
      return link;
    });
  });

  const nav = await Promise.all(childFetches);
  return nav.length > 0 ? nav : FALLBACK_NAV;
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

  const nav = await fetchNavData(rendering?.dataSource || '');

  return (
    <div
      className={`component site-header ${styles}`}
      id={id || undefined}
      data-testid="site-header"
      style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid #e5e7eb', background: '#FFFFFF' }}
    >
      <style>{`
        /* === Row 1: Utility Bar === */
        .te-utility {
          background: #2e4957;
          color: #FFFFFF;
        }
        .te-utility-inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          height: 32px;
          font-size: 12px;
        }
        .te-utility-tagline {
          display: none;
          opacity: 0.9;
          font-family: 'Montserrat', system-ui, sans-serif;
          letter-spacing: 0.05em;
          font-size: 10px;
          text-transform: uppercase;
        }
        @media (min-width: 640px) {
          .te-utility-tagline { display: inline; }
        }
        .te-utility-sep {
          opacity: 0.4;
        }
        .te-utility-locale {
          display: flex;
          align-items: center;
          gap: 4px;
          opacity: 0.8;
          font-size: 12px;
          cursor: default;
        }
        .te-utility-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .te-utility-link {
          color: #FFFFFF;
          text-decoration: none;
          opacity: 0.8;
          transition: opacity 0.15s;
          font-size: 12px;
        }
        .te-utility-link:hover { opacity: 1; }

        /* === Row 2: Main Bar === */
        .te-main {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 16px;
        }
        .te-main-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          height: 64px;
        }
        .te-logo-area {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          flex-shrink: 0;
        }
        .te-logo-text {
          display: none;
        }
        @media (min-width: 640px) {
          .te-logo-text { display: block; }
        }
        .te-logo-title {
          font-family: 'Montserrat', system-ui, sans-serif;
          font-weight: 600;
          font-size: 14px;
          line-height: 1.2;
          color: #424241;
        }
        .te-logo-sub {
          font-size: 10px;
          color: #9ca3af;
          line-height: 1.2;
        }

        /* Search */
        .te-search {
          display: none;
          flex: 1;
          max-width: 448px;
        }
        @media (min-width: 768px) {
          .te-search { display: flex; }
        }
        .te-search-wrap {
          position: relative;
          width: 100%;
        }
        .te-search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          pointer-events: none;
        }
        .te-search input {
          width: 100%;
          height: 36px;
          padding: 0 16px 0 36px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          background: #FFFFFF;
          font-size: 14px;
          color: #2e4957;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .te-search input:focus {
          border-color: #f28d00;
          box-shadow: 0 0 0 2px rgba(242,141,0,0.15);
        }
        .te-search input::placeholder { color: #9ca3af; }

        /* Actions */
        .te-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
        }
        .te-action-btn {
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
        .te-action-btn:hover { background: #f3f4f6; }
        .te-hamburger {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: 36px;
          height: 36px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          border-radius: 6px;
          transition: background 0.15s;
          gap: 5px;
        }
        .te-hamburger:hover { background: #f3f4f6; }
        @media (min-width: 1024px) {
          .te-hamburger { display: none; }
        }

        /* === Row 3: Desktop Nav === */
        .te-nav {
          display: none;
          align-items: center;
          gap: 4px;
          padding-bottom: 8px;
          margin-top: -4px;
          position: relative;
        }
        @media (min-width: 1024px) {
          .te-nav { display: flex; }
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
          cursor: pointer;
          border: none;
          background: none;
        }
        .te-nav-link:hover {
          color: #2e4957;
          background: rgba(0,0,0,0.04);
        }

        /* === Mega Menu === */
        .te-mega {
          position: absolute;
          left: 0;
          right: 0;
          top: 100%;
          z-index: 50;
          border-bottom: 1px solid #e5e7eb;
          background: #FFFFFF;
          box-shadow: 0 4px 24px rgba(0,0,0,0.08);
          animation: te-mega-in 0.2s ease-out;
        }
        @keyframes te-mega-in {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .te-mega-inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 24px 16px;
        }
        .te-mega-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .te-mega-card {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 16px;
          border-radius: 8px;
          text-decoration: none;
          color: inherit;
          transition: background 0.15s;
          cursor: pointer;
        }
        .te-mega-card:hover {
          background: rgba(0,0,0,0.03);
        }
        .te-mega-icon {
          width: 44px;
          height: 44px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform 0.15s;
        }
        .te-mega-card:hover .te-mega-icon {
          transform: scale(1.1);
        }
        .te-mega-label {
          font-family: 'Montserrat', system-ui, sans-serif;
          font-weight: 600;
          font-size: 14px;
          color: #2e4957;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .te-mega-chevron {
          opacity: 0;
          transform: translateX(-4px);
          transition: opacity 0.15s, transform 0.15s;
        }
        .te-mega-card:hover .te-mega-chevron {
          opacity: 1;
          transform: translateX(0);
        }
        .te-mega-desc {
          font-size: 12px;
          color: #9ca3af;
          margin-top: 4px;
          line-height: 1.5;
        }
        .te-mega-footer {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid rgba(0,0,0,0.06);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .te-mega-footer-text {
          font-size: 12px;
          color: #9ca3af;
        }
        .te-mega-footer-link {
          font-size: 12px;
          font-family: 'Montserrat', system-ui, sans-serif;
          font-weight: 500;
          color: #167a87;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: opacity 0.15s;
        }
        .te-mega-footer-link:hover { opacity: 0.8; }

        /* === Mobile Menu === */
        .te-mobile-menu {
          display: none;
          border-top: 1px solid #e5e7eb;
          background: #FFFFFF;
          overflow: hidden;
          animation: te-mobile-in 0.25s ease-in-out;
        }
        .te-mobile-menu.open { display: block; }
        @media (min-width: 1024px) {
          .te-mobile-menu.open { display: none; }
        }
        @keyframes te-mobile-in {
          from { max-height: 0; opacity: 0; }
          to { max-height: 500px; opacity: 1; }
        }
        .te-mobile-inner {
          padding: 12px 16px;
        }
        .te-mobile-nav-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 10px 12px;
          font-size: 14px;
          font-family: 'Montserrat', system-ui, sans-serif;
          font-weight: 500;
          color: #2e4957;
          text-decoration: none;
          border-radius: 6px;
          transition: background 0.15s;
          border: none;
          background: none;
          cursor: pointer;
          text-align: left;
        }
        .te-mobile-nav-item:hover { background: rgba(0,0,0,0.04); }
        .te-mobile-sub {
          padding-left: 24px;
          padding-bottom: 8px;
        }
        .te-mobile-sub-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          border-radius: 6px;
          text-decoration: none;
          color: #2e4957;
          font-size: 14px;
          transition: background 0.15s;
        }
        .te-mobile-sub-link:hover { background: rgba(0,0,0,0.04); }
        .te-mobile-sub-icon {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .te-mobile-sub-label { font-weight: 500; }
        .te-mobile-sub-desc {
          font-size: 11px;
          color: #9ca3af;
        }
      `}</style>

      {/* Row 1: Utility Bar */}
      <div className="te-utility">
        <div className="te-utility-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span className="te-utility-tagline">
              Engineering the connections that power our world
            </span>
            <span className="te-utility-sep">|</span>
            <span className="te-utility-locale">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                <path d="M2 12h20" />
              </svg>
              <span>EN / USD</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </span>
          </div>
          <div className="te-utility-right">
            <Link href="/" className="te-utility-link" data-testid="link-login-top">
              Sign In / Register
            </Link>
          </div>
        </div>
      </div>

      {/* Row 2: Main Bar */}
      <div className="te-main">
        <div className="te-main-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <DrawerNav links={nav} megaItems={SOLUTIONS_MEGA} />
            <Link href="/" className="te-logo-area" data-testid="link-home-logo">
              {fields.Logo?.value?.src ? (
                <Image field={fields.Logo} style={{ height: '40px', width: 'auto' }} />
              ) : (
                <TELogoSVG />
              )}
              <div className="te-logo-text">
                <div className="te-logo-title">connectivity</div>
                <div className="te-logo-sub">Sitecore XM Cloud Demo</div>
              </div>
            </Link>
          </div>

          <div className="te-search">
            <div className="te-search-wrap">
              <div className="te-search-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </div>
              <input
                type="search"
                placeholder="Search by part number, keyword..."
                readOnly
                aria-label="Search products by part number or keyword"
                data-testid="input-search"
              />
            </div>
          </div>

          <div className="te-actions">
            <button className="te-action-btn" aria-label="Account" data-testid="button-account">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Row 3: Desktop Nav — driven by CMS data with fallback */}
        <nav className="te-nav" data-testid="desktop-nav">
          {nav.map((item) => {
            if (item.id === 'solutions' || item.title.toLowerCase() === 'solutions') {
              return <SolutionsMenu key={item.id} items={SOLUTIONS_MEGA} label={item.title} href={item.href} />;
            }

            return item.external ? (
              <a
                key={item.id}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="te-nav-link"
                data-testid={`nav-${item.id}`}
              >
                {item.title}
              </a>
            ) : (
              <Link
                key={item.id}
                href={item.href}
                className="te-nav-link"
                data-testid={`nav-${item.id}`}
              >
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
