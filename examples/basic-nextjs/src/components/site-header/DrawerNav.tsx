'use client';

import { useState, useCallback } from 'react';
import NextLink from 'next/link';

interface NavLinkData {
  id: string;
  title: string;
  href: string;
}

interface DrawerNavProps {
  links: NavLinkData[];
}

const linkStyle: React.CSSProperties = {
  display: 'block',
  padding: '14px 16px',
  color: '#FFFFFF',
  textDecoration: 'none',
  fontSize: '1.05rem',
  fontWeight: 500,
  borderRadius: '8px',
  transition: 'background 0.2s ease',
};

export default function DrawerNav({ links }: DrawerNavProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const handleHover = useCallback((e: React.MouseEvent<HTMLAnchorElement>, enter: boolean) => {
    (e.currentTarget as HTMLElement).style.background = enter
      ? 'rgba(255,255,255,0.08)'
      : 'transparent';
  }, []);

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

      <nav
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '300px',
          maxWidth: '80vw',
          height: '100vh',
          background: '#0A1628',
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
          {links.map((item) => (
            <li key={item.id}>
              <NextLink
                href={item.href}
                onClick={closeDrawer}
                style={linkStyle}
                onMouseEnter={(e) => handleHover(e, true)}
                onMouseLeave={(e) => handleHover(e, false)}
              >
                {item.title}
              </NextLink>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
