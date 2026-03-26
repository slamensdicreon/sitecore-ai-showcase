'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import NextLink from 'next/link';

interface MegaItem {
  slug: string;
  label: string;
  description: string;
  color: string;
  iconPath: string;
}

interface SolutionsMenuProps {
  items: MegaItem[];
  label?: string;
  href?: string;
}

export default function SolutionsMenu({ items, label = 'Solutions', href = '/Solutions' }: SolutionsMenuProps) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleEnter = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  }, []);

  const handleLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => setOpen(false), 200);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative' }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        onClick={() => setOpen(!open)}
        className="te-nav-link"
        data-testid="nav-solutions"
        aria-expanded={open}
        aria-haspopup="true"
        style={{
          background: open ? 'rgba(242,141,0,0.08)' : undefined,
          color: open ? '#f28d00' : undefined,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '2px' }}>
          <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.84Z" />
          <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
          <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
        </svg>
        {label}
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          className="te-mega"
          data-testid="megamenu-solutions"
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
        >
          <div className="te-mega-inner">
            <div className="te-mega-grid">
              {items.map((item) => (
                <NextLink
                  key={item.slug}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="te-mega-card"
                  data-testid={`megamenu-${item.slug}`}
                >
                  <div className="te-mega-icon" style={{ background: `${item.color}12` }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={item.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={item.iconPath} />
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="te-mega-label">
                      <span>{item.label}</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="te-mega-chevron">
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </div>
                    <p className="te-mega-desc">{item.description}</p>
                  </div>
                </NextLink>
              ))}
            </div>
            <div className="te-mega-footer">
              <p className="te-mega-footer-text">
                Discover how TE solves challenges across industries
              </p>
              <NextLink
                href={href}
                onClick={() => setOpen(false)}
                className="te-mega-footer-link"
              >
                View All Applications
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </NextLink>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
