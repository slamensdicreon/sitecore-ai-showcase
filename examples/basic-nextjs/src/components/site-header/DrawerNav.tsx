'use client';

import { useState, useEffect } from 'react';
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

export default function DrawerNav({ links, megaItems }: DrawerNavProps) {
  const [open, setOpen] = useState(false);
  const [solutionsExpanded, setSolutionsExpanded] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setSolutionsExpanded(false);
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      {/* Hamburger - visible only below lg */}
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

      {/* Mobile menu panel */}
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
          data-testid="mobile-menu"
        >
          <div style={{ padding: '12px 16px' }}>
            {/* Mobile search */}
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

            {/* Solutions (expandable) */}
            <button
              onClick={() => setSolutionsExpanded(!solutionsExpanded)}
              className="te-mobile-nav-item"
              data-testid="mobile-nav-solutions"
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#167a87" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.84Z" />
                  <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
                  <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
                </svg>
                Solutions
              </span>
              <svg
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ transition: 'transform 0.2s', transform: solutionsExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {solutionsExpanded && megaItems && (
              <div className="te-mobile-sub">
                {megaItems.map((item) => (
                  <NextLink
                    key={item.slug}
                    href="/Solutions"
                    onClick={() => setOpen(false)}
                    className="te-mobile-sub-link"
                    data-testid={`mobile-nav-solution-${item.slug}`}
                  >
                    <div className="te-mobile-sub-icon" style={{ background: `${item.color}18` }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={item.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d={item.iconPath} />
                      </svg>
                    </div>
                    <div>
                      <div className="te-mobile-sub-label">{item.label}</div>
                      <div className="te-mobile-sub-desc">{item.description}</div>
                    </div>
                  </NextLink>
                ))}
              </div>
            )}

            {/* Applications */}
            <NextLink
              href="/Solutions"
              onClick={() => setOpen(false)}
              className="te-mobile-nav-item"
              data-testid="mobile-nav-applications"
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f28d00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="7" height="7" x="3" y="3" rx="1" />
                  <rect width="7" height="7" x="14" y="3" rx="1" />
                  <rect width="7" height="7" x="14" y="14" rx="1" />
                  <rect width="7" height="7" x="3" y="14" rx="1" />
                </svg>
                Applications
              </span>
            </NextLink>

            {/* All Products */}
            <NextLink
              href="/Products"
              onClick={() => setOpen(false)}
              className="te-mobile-nav-item"
              data-testid="mobile-nav-products"
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2e4957" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m7.5 4.27 9 5.15" />
                  <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                  <path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
                </svg>
                All Products
              </span>
            </NextLink>

            {/* Innovation */}
            <NextLink
              href="/Innovation"
              onClick={() => setOpen(false)}
              className="te-mobile-nav-item"
              data-testid="mobile-nav-innovation"
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#167a87" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
                  <path d="M9 18h6" /><path d="M10 22h4" />
                </svg>
                Innovation
              </span>
            </NextLink>
          </div>
        </div>
      )}
    </>
  );
}
