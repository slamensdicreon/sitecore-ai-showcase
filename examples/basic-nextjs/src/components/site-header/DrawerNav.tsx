'use client';

import { useState, useEffect, useCallback } from 'react';
import NextLink from 'next/link';

interface NavLinkData {
  id: string;
  title: string;
  href: string;
  external: boolean;
  children?: NavLinkData[];
}

interface MegaItem {
  slug: string;
  label: string;
  description: string;
  color: string;
  iconPath: string;
}

interface DrawerNavProps {
  links: NavLinkData[];
  megaItems?: MegaItem[];
}

const NAV_ICONS: Record<string, { path: string; color: string }> = {
  solutions: {
    color: '#167a87',
    path: 'M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.84Z M22 17.65l-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65 M22 12.65l-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65',
  },
  applications: {
    color: '#f28d00',
    path: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
  },
  products: {
    color: '#2e4957',
    path: 'M7.5 4.27l9 5.15 M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z M3.3 7l8.7 5 8.7-5 M12 22V12',
  },
  innovation: {
    color: '#167a87',
    path: 'M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5 M9 18h6 M10 22h4',
  },
};

function NavIcon({ id }: { id: string }) {
  const icon = NAV_ICONS[id];
  if (!icon) return null;
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={icon.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {icon.path.split(' M').map((segment, i) => (
        <path key={i} d={i === 0 ? segment : `M${segment}`} />
      ))}
    </svg>
  );
}

export default function DrawerNav({ links, megaItems }: DrawerNavProps) {
  const [open, setOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const closeMenu = useCallback(() => {
    setOpen(false);
    setExpandedId(null);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setExpandedId(null);
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMenu();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, closeMenu]);

  const solutionsItem = links.find((l) => l.id === 'solutions');
  const hasSolutionsMega = !!solutionsItem && !!megaItems && megaItems.length > 0;

  return (
    <>
      <button
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="te-hamburger"
        data-testid="button-mobile-menu"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2e4957" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18" /><path d="m6 6 12 12" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2e4957" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        )}
      </button>

      {open && (
        <div
          className="te-mobile-menu open"
          style={{
            position: 'fixed',
            top: 96,
            left: 0,
            right: 0,
            bottom: 0,
            background: '#FFFFFF',
            zIndex: 40,
            overflowY: 'auto',
            borderTop: '1px solid #e5e7eb',
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          data-testid="mobile-menu"
        >
          <div style={{ padding: '12px 16px' }}>
            <div style={{ position: 'relative', marginBottom: '12px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="search"
                placeholder="Search products..."
                readOnly
                aria-label="Search products"
                style={{
                  width: '100%',
                  height: '36px',
                  padding: '0 16px 0 36px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  background: '#FFFFFF',
                  fontSize: '14px',
                  outline: 'none',
                }}
                data-testid="input-search-mobile"
              />
            </div>

            {links.map((item) => {
              const hasChildren = hasSolutionsMega && item.id === 'solutions';
              const isExpanded = expandedId === item.id;

              if (hasChildren) {
                return (
                  <div key={item.id}>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="te-mobile-nav-item"
                      aria-expanded={isExpanded}
                      data-testid={`mobile-nav-${item.id}`}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <NavIcon id={item.id} />
                        {item.title}
                      </span>
                      <svg
                        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        style={{ transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </button>
                    {isExpanded && megaItems && (
                      <div className="te-mobile-sub">
                        {megaItems.map((mega) => (
                          <NextLink
                            key={mega.slug}
                            href={item.href}
                            onClick={closeMenu}
                            className="te-mobile-sub-link"
                            data-testid={`mobile-nav-solution-${mega.slug}`}
                          >
                            <div className="te-mobile-sub-icon" style={{ background: `${mega.color}18` }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={mega.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d={mega.iconPath} />
                              </svg>
                            </div>
                            <div>
                              <div className="te-mobile-sub-label">{mega.label}</div>
                              <div className="te-mobile-sub-desc">{mega.description}</div>
                            </div>
                          </NextLink>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              if (item.external) {
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={closeMenu}
                    className="te-mobile-nav-item"
                    data-testid={`mobile-nav-${item.id}`}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <NavIcon id={item.id} />
                      {item.title}
                    </span>
                  </a>
                );
              }

              return (
                <NextLink
                  key={item.id}
                  href={item.href}
                  onClick={closeMenu}
                  className="te-mobile-nav-item"
                  data-testid={`mobile-nav-${item.id}`}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <NavIcon id={item.id} />
                    {item.title}
                  </span>
                </NextLink>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
