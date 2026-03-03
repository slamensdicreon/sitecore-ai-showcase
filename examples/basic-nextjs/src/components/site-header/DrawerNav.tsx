'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import NextLink from 'next/link';
import type { NavLinkData } from './SiteHeader';

interface DrawerNavProps {
  links: NavLinkData[];
}

const linkStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '14px 16px',
  color: '#FFFFFF',
  textDecoration: 'none',
  fontSize: '1.05rem',
  fontWeight: 500,
  borderRadius: '8px',
  transition: 'background 0.2s ease',
  cursor: 'pointer',
};

const subLinkStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '11px 20px',
  color: '#FFFFFF',
  textDecoration: 'none',
  fontSize: '0.95rem',
  fontWeight: 400,
  borderRadius: '6px',
  transition: 'background 0.15s ease',
};

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ opacity: 0.6, flexShrink: 0 }}>
      <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" style={{ opacity: 0.5, flexShrink: 0 }}>
      <path d="M3.5 1.5H10.5V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10.5 1.5L1.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function DrawerNav({ links }: DrawerNavProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const submenuTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setActiveSubmenu(null);
    hamburgerRef.current?.focus();
  }, []);

  const toggleSubmenu = useCallback((itemId: string, hasChildren: boolean) => {
    if (hasChildren) {
      setActiveSubmenu((prev) => (prev === itemId ? null : itemId));
    } else {
      setActiveSubmenu(null);
    }
  }, []);

  const handleItemHover = useCallback((itemId: string, hasChildren: boolean) => {
    if (submenuTimeout.current) clearTimeout(submenuTimeout.current);
    if (hasChildren) {
      setActiveSubmenu(itemId);
    } else {
      setActiveSubmenu(null);
    }
  }, []);

  const handleItemLeave = useCallback(() => {
    submenuTimeout.current = setTimeout(() => {
      setActiveSubmenu(null);
    }, 200);
  }, []);

  const handleSubmenuEnter = useCallback(() => {
    if (submenuTimeout.current) clearTimeout(submenuTimeout.current);
  }, []);

  const handleSubmenuLeave = useCallback(() => {
    submenuTimeout.current = setTimeout(() => {
      setActiveSubmenu(null);
    }, 200);
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeSubmenu) {
          setActiveSubmenu(null);
        } else {
          closeDrawer();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [drawerOpen, activeSubmenu, closeDrawer]);

  const activeItem = links.find((l) => l.id === activeSubmenu);
  const hasSubmenu = !!activeItem?.children?.length;

  return (
    <>
      <button
        ref={hamburgerRef}
        aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={drawerOpen}
        aria-controls="main-nav-drawer"
        onClick={() => setDrawerOpen((prev) => !prev)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '8px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: '36px',
          height: '36px',
          position: 'relative',
          zIndex: 1100,
        }}
      >
        <span
          aria-hidden="true"
          style={{
            display: 'block',
            width: '22px',
            height: '2px',
            background: '#FFFFFF',
            borderRadius: '1px',
            transition: 'transform 0.3s ease, opacity 0.3s ease',
            position: 'absolute',
            ...(drawerOpen
              ? { transform: 'rotate(45deg)' }
              : { transform: 'translateY(-6px)' }),
          }}
        />
        <span
          aria-hidden="true"
          style={{
            display: 'block',
            width: '22px',
            height: '2px',
            background: '#FFFFFF',
            borderRadius: '1px',
            transition: 'opacity 0.3s ease',
            position: 'absolute',
            opacity: drawerOpen ? 0 : 1,
          }}
        />
        <span
          aria-hidden="true"
          style={{
            display: 'block',
            width: '22px',
            height: '2px',
            background: '#FFFFFF',
            borderRadius: '1px',
            transition: 'transform 0.3s ease, opacity 0.3s ease',
            position: 'absolute',
            ...(drawerOpen
              ? { transform: 'rotate(-45deg)' }
              : { transform: 'translateY(6px)' }),
          }}
        />
      </button>

      {drawerOpen && (
        <div
          onClick={closeDrawer}
          role="presentation"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1050,
            transition: 'opacity 0.3s ease',
          }}
        />
      )}

      {drawerOpen && hasSubmenu && (
        <nav
          aria-label={`${activeItem?.title} submenu`}
          onMouseEnter={handleSubmenuEnter}
          onMouseLeave={handleSubmenuLeave}
          style={{
            position: 'fixed',
            top: 0,
            right: '300px',
            width: '280px',
            height: '100vh',
            background: '#0076C0',
            color: '#FFFFFF',
            zIndex: 1055,
            transform: 'translateX(0)',
            transition: 'opacity 0.25s ease, transform 0.25s ease',
            display: 'flex',
            flexDirection: 'column',
            paddingTop: '80px',
            boxShadow: '-4px 0 24px rgba(0,0,0,0.2)',
          }}
        >
          <div style={{ padding: '0 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.15)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.7 }}>
              {activeItem?.title}
            </span>
          </div>
          <ul
            role="menu"
            style={{
              listStyle: 'none',
              margin: 0,
              padding: '0 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              overflowY: 'auto',
              flex: 1,
            }}
          >
            {activeItem?.children?.map((child) => (
              <li key={child.id} role="none">
                {child.external ? (
                  <a
                    href={child.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    role="menuitem"
                    style={subLinkStyle}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    onFocus={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
                    onBlur={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span style={{ flex: 1 }}>{child.title}</span>
                    <ExternalIcon />
                  </a>
                ) : (
                  <NextLink
                    href={child.href}
                    onClick={closeDrawer}
                    role="menuitem"
                    style={subLinkStyle}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    onFocus={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
                    onBlur={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span style={{ flex: 1 }}>{child.title}</span>
                  </NextLink>
                )}
              </li>
            ))}
          </ul>
        </nav>
      )}

      <nav
        id="main-nav-drawer"
        ref={drawerRef}
        aria-label="Main navigation"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '300px',
          maxWidth: '80vw',
          height: '100vh',
          background: '#061E40',
          color: '#FFFFFF',
          zIndex: 1060,
          transform: drawerOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          paddingTop: '80px',
          boxShadow: drawerOpen ? '-4px 0 24px rgba(0,0,0,0.3)' : 'none',
          visibility: drawerOpen ? 'visible' : 'hidden',
        }}
      >
        <ul
          role="menu"
          style={{
            listStyle: 'none',
            margin: 0,
            padding: '0 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          {links.map((item) => {
            const hasChildren = !!item.children?.length;
            const isActive = activeSubmenu === item.id;

            const itemProps = {
              style: {
                ...linkStyle,
                background: isActive ? 'rgba(0,118,192,0.2)' : 'transparent',
              } as React.CSSProperties,
              onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
                handleItemHover(item.id, hasChildren);
                if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              },
              onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
                handleItemLeave();
                if (!isActive) e.currentTarget.style.background = 'transparent';
              },
              onFocus: (e: React.FocusEvent<HTMLElement>) => {
                if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              },
              onBlur: (e: React.FocusEvent<HTMLElement>) => {
                if (!isActive) e.currentTarget.style.background = 'transparent';
              },
              onKeyDown: (e: React.KeyboardEvent) => {
                if (hasChildren && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight')) {
                  e.preventDefault();
                  toggleSubmenu(item.id, true);
                }
                if (e.key === 'ArrowLeft' && isActive) {
                  setActiveSubmenu(null);
                }
              },
            };

            return (
              <li
                key={item.id}
                role="none"
                onMouseEnter={() => handleItemHover(item.id, hasChildren)}
                onMouseLeave={handleItemLeave}
              >
                {item.external ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    role="menuitem"
                    aria-haspopup={hasChildren ? 'true' : undefined}
                    aria-expanded={hasChildren ? isActive : undefined}
                    {...itemProps}
                  >
                    <span>{item.title}</span>
                    {hasChildren && <ChevronRight />}
                  </a>
                ) : (
                  <NextLink
                    href={item.href}
                    onClick={(e) => {
                      if (hasChildren) {
                        e.preventDefault();
                        toggleSubmenu(item.id, true);
                      } else {
                        closeDrawer();
                      }
                    }}
                    role="menuitem"
                    aria-haspopup={hasChildren ? 'true' : undefined}
                    aria-expanded={hasChildren ? isActive : undefined}
                    {...itemProps}
                  >
                    <span>{item.title}</span>
                    {hasChildren && <ChevronRight />}
                  </NextLink>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
