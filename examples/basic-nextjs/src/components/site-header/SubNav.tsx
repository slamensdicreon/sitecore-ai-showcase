'use client';

import NextLink from 'next/link';
import type { NavLinkData } from './SiteHeader';

interface SubNavProps {
  links: NavLinkData[];
}

export default function SubNav({ links }: SubNavProps) {
  if (!links || links.length === 0) return null;

  return (
    <div
      style={{
        background: '#0A2A52',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '0 24px',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: '0',
          height: '38px',
          overflowX: 'auto',
        }}
      >
        {links.map((link, i) => {
          const isLast = i === links.length - 1;
          const linkEl = link.external ? (
            <a
              key={link.id}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'rgba(255,255,255,0.75)',
                textDecoration: 'none',
                fontSize: '0.8rem',
                fontWeight: 400,
                padding: '0 14px',
                whiteSpace: 'nowrap',
                transition: 'color 0.2s',
                lineHeight: '38px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#FFFFFF'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; }}
            >
              {link.title}
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" style={{ opacity: 0.6 }}>
                <path d="M3.5 1.5H10.5V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10.5 1.5L1.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          ) : (
            <NextLink
              key={link.id}
              href={link.href}
              style={{
                color: 'rgba(255,255,255,0.75)',
                textDecoration: 'none',
                fontSize: '0.8rem',
                fontWeight: 400,
                padding: '0 14px',
                whiteSpace: 'nowrap',
                transition: 'color 0.2s',
                lineHeight: '38px',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#FFFFFF'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; }}
            >
              {link.title}
            </NextLink>
          );

          return (
            <span key={link.id} style={{ display: 'inline-flex', alignItems: 'center' }}>
              {linkEl}
              {!isLast && (
                <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem', userSelect: 'none' }}>|</span>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}
