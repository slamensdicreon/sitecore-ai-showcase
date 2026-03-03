'use client';

import { useState, useCallback, useRef } from 'react';
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
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.6, flexShrink: 0 }}>
      <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ opacity: 0.5, flexShrink: 0 }}>
      <path d="M3.5 1.5H10.5V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10.5 1.5L1.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function DrawerNav({ links }: DrawerNavProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const submenuTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setActiveSubmenu(null);
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

  const activeItem = links.find((l) => l.id === activeSubmenu);
  const hasSubmenu = !!activeItem?.children?.length;

  return (
    <>
      <button
        aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
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
              <li key={child.id}>
                {child.external ? (
                  <a
                    href={child.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={subLinkStyle}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span style={{ flex: 1 }}>{child.title}</span>
                    <ExternalIcon />
                  </a>
                ) : (
                  <NextLink
                    href={child.href}
                    onClick={closeDrawer}
                    style={subLinkStyle}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
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
        }}
      >
        <ul
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

            return (
              <li
                key={item.id}
                onMouseEnter={() => handleItemHover(item.id, hasChildren)}
                onMouseLeave={handleItemLeave}
              >
                {item.external ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      ...linkStyle,
                      background: isActive ? 'rgba(0,118,192,0.2)' : 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <span>{item.title}</span>
                    {hasChildren && <ChevronRight />}
                  </a>
                ) : (
                  <NextLink
                    href={item.href}
                    onClick={hasChildren ? undefined : closeDrawer}
                    style={{
                      ...linkStyle,
                      background: isActive ? 'rgba(0,118,192,0.2)' : 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.background = 'transparent';
                    }}
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
