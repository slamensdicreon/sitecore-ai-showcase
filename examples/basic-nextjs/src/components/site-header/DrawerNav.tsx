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

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  );
}

export default function DrawerNav({ links }: DrawerNavProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const submenuTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const submenuRef = useRef<HTMLDivElement>(null);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setActiveSubmenu(null);
    hamburgerRef.current?.focus();
  }, []);

  const openSubmenu = useCallback((itemId: string) => {
    setActiveSubmenu(itemId);
    requestAnimationFrame(() => {
      if (submenuRef.current) {
        const firstLink = submenuRef.current.querySelector<HTMLElement>('a, button');
        firstLink?.focus();
      }
    });
  }, []);

  const closeSubmenu = useCallback(() => {
    setActiveSubmenu(null);
  }, []);

  const _toggleSubmenu = useCallback((itemId: string, hasChildren: boolean) => {
    if (hasChildren) {
      setActiveSubmenu((prev) => {
        if (prev === itemId) return null;
        requestAnimationFrame(() => {
          if (submenuRef.current) {
            const firstLink = submenuRef.current.querySelector<HTMLElement>('a, button');
            firstLink?.focus();
          }
        });
        return itemId;
      });
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
    if (drawerOpen) {
      requestAnimationFrame(() => {
        if (drawerRef.current) {
          const firstLink = drawerRef.current.querySelector<HTMLElement>('a[role="menuitem"]');
          firstLink?.focus();
        }
      });
    }
  }, [drawerOpen]);

  useEffect(() => {
    if (!drawerOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeSubmenu) {
          setActiveSubmenu(null);
          const activeItemEl = drawerRef.current?.querySelector<HTMLElement>(`[data-submenu-id="${activeSubmenu}"]`);
          activeItemEl?.focus();
        } else {
          closeDrawer();
        }
        return;
      }

      if (e.key === 'Tab') {
        const activePanel = activeSubmenu && submenuRef.current ? submenuRef.current : drawerRef.current;
        if (!activePanel) return;

        const focusable = getFocusableElements(activePanel);
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
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
      <style>{`
        .eaa-drawer {
          position: fixed; top: 0; right: 0;
          width: 100vw; height: 100vh;
          background: #061E40; color: #FFFFFF;
          z-index: 1060; transition: transform 0.3s ease;
          display: flex; flex-direction: column;
          padding-top: 70px;
        }
        .eaa-submenu-panel {
          position: fixed; top: 0; left: 0;
          width: 100vw; height: 100vh;
          background: #0076C0; color: #FFFFFF;
          z-index: 1065;
          display: flex; flex-direction: column;
          padding-top: 70px;
          box-shadow: none;
        }
        .eaa-submenu-back { display: flex; }
        @media (min-width: 640px) {
          .eaa-drawer {
            width: 320px; max-width: 80vw;
            padding-top: 80px;
          }
          .eaa-submenu-panel {
            right: 320px; left: auto;
            width: 280px;
            z-index: 1055;
            padding-top: 80px;
            box-shadow: -4px 0 24px rgba(0,0,0,0.2);
          }
          .eaa-submenu-back { display: none; }
        }
      `}</style>
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
        <div
          ref={submenuRef}
          role="dialog"
          aria-modal="true"
          aria-label={`${activeItem?.title} submenu`}
          className="eaa-submenu-panel"
          onMouseEnter={handleSubmenuEnter}
          onMouseLeave={handleSubmenuLeave}
        >
          <div style={{ padding: '0 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.15)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => {
                closeSubmenu();
                const activeItemEl = drawerRef.current?.querySelector<HTMLElement>(`[data-submenu-id="${activeSubmenu}"]`);
                activeItemEl?.focus();
              }}
              aria-label="Back to main menu"
              className="eaa-submenu-back"
              style={{
                background: 'none',
                border: 'none',
                color: '#FFFFFF',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
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
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowLeft') {
                        e.preventDefault();
                        closeSubmenu();
                        const activeItemEl = drawerRef.current?.querySelector<HTMLElement>(`[data-submenu-id="${activeSubmenu}"]`);
                        activeItemEl?.focus();
                      }
                    }}
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
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowLeft') {
                        e.preventDefault();
                        closeSubmenu();
                        const activeItemEl = drawerRef.current?.querySelector<HTMLElement>(`[data-submenu-id="${activeSubmenu}"]`);
                        activeItemEl?.focus();
                      }
                    }}
                  >
                    <span style={{ flex: 1 }}>{child.title}</span>
                  </NextLink>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div
        id="main-nav-drawer"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Main navigation"
        className="eaa-drawer"
        style={{
          transform: drawerOpen ? 'translateX(0)' : 'translateX(100%)',
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

            const isHovered = hoveredItem === item.id;
            const bgColor = isActive
              ? 'rgba(0,118,192,0.2)'
              : isHovered
                ? 'rgba(255,255,255,0.08)'
                : 'transparent';

            const itemProps = {
              'data-submenu-id': hasChildren ? item.id : undefined,
              style: {
                ...linkStyle,
                background: bgColor,
              } as React.CSSProperties,
              onMouseEnter: () => {
                setHoveredItem(item.id);
                handleItemHover(item.id, hasChildren);
              },
              onMouseLeave: () => {
                setHoveredItem(null);
                handleItemLeave();
              },
              onFocus: () => {
                setHoveredItem(item.id);
              },
              onBlur: () => {
                setHoveredItem(null);
              },
              onKeyDown: (e: React.KeyboardEvent) => {
                if (hasChildren && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight')) {
                  e.preventDefault();
                  openSubmenu(item.id);
                }
                if (e.key === 'ArrowLeft' && isActive) {
                  closeSubmenu();
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
                        openSubmenu(item.id);
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
      </div>
    </>
  );
}
