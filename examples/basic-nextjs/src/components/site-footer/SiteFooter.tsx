import { JSX } from 'react';
import { Text, Image, Field, ImageField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

interface SiteFooterFields {
  Logo: ImageField;
  Copyright: Field<string>;
}

type SiteFooterProps = ComponentProps & {
  fields: SiteFooterFields;
};

function TELogoFooter() {
  return (
    <svg viewBox="0 0 120 48" style={{ height: '40px', width: 'auto' }} aria-label="TE Connectivity">
      <rect x="0" y="0" width="48" height="48" rx="4" fill="#f28d00" />
      <text x="24" y="34" textAnchor="middle" fontFamily="Montserrat, Arial, sans-serif" fontWeight="800" fontStyle="italic" fontSize="28" fill="white">TE</text>
      <line x1="56" y1="14" x2="110" y2="14" stroke="#f28d00" strokeWidth="3" strokeLinecap="round" />
      <line x1="56" y1="24" x2="100" y2="24" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <line x1="56" y1="34" x2="90" y2="34" stroke="#167a87" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0, marginLeft: '-16px', transition: 'all 0.2s' }}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

const footerLinks = {
  products: [
    { label: 'Connectors', href: '/Products' },
    { label: 'Sensors', href: '/Products' },
    { label: 'Relays & Contactors', href: '/Products' },
    { label: 'Wire & Cable', href: '/Products' },
    { label: 'Circuit Protection', href: '/Products' },
    { label: 'Terminal Blocks', href: '/Products' },
  ],
  solutions: [
    { label: 'Transportation', href: '/Solutions' },
    { label: 'Industrial', href: '/Solutions' },
    { label: 'Communications', href: '/Solutions' },
    { label: 'Applications', href: '/Solutions' },
  ],
  resources: [
    { label: 'Innovation', href: '/Innovation' },
    { label: 'Technical Resources', href: '/Products' },
    { label: 'Sample & Buy', href: '/Products' },
    { label: 'All Products', href: '/Products' },
  ],
  account: [
    { label: 'My Orders', href: '/' },
    { label: 'Parts Lists', href: '/' },
    { label: 'Sign In', href: '/' },
    { label: 'Shopping Cart', href: '/' },
  ],
};

export const Default = (props: SiteFooterProps): JSX.Element => {
  const { fields, params } = props;
  const id = params?.RenderingIdentifier;
  const styles = params?.styles || '';

  if (!fields) {
    return (
      <div className={`component site-footer ${styles}`}>
        <div className="component-content">
          <span className="is-empty-hint">SiteFooter requires a datasource item assigned.</span>
        </div>
      </div>
    );
  }

  const copyrightField = fields.Copyright?.value
    ? fields.Copyright
    : { value: `© ${new Date().getFullYear()} TE Connectivity. All Rights Reserved.` };

  return (
    <div
      className={`component site-footer ${styles}`}
      id={id || undefined}
      data-testid="site-footer"
    >
      <style>{`
        .te-footer {
          background: #04215d;
          color: #FFFFFF;
        }
        .te-footer-inner {
          max-width: 1440px;
          margin: 0 auto;
          padding: 0 24px;
        }
        @media (min-width: 1024px) {
          .te-footer-inner {
            padding: 0 40px;
          }
        }
        .te-footer-grid {
          padding: 48px 0;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 32px;
        }
        @media (min-width: 768px) {
          .te-footer-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .te-footer-grid {
            grid-template-columns: 1.2fr 1fr 1fr 1fr 1fr;
            gap: 48px;
          }
        }
        .te-footer-brand {
          grid-column: span 2;
        }
        @media (min-width: 768px) {
          .te-footer-brand {
            grid-column: span 4;
          }
        }
        @media (min-width: 1024px) {
          .te-footer-brand {
            grid-column: span 1;
          }
        }
        .te-footer-tagline {
          margin-top: 16px;
          font-size: 14px;
          color: rgba(255,255,255,0.7);
          line-height: 1.6;
          font-family: 'Inter', system-ui, sans-serif;
          max-width: 280px;
        }
        .te-footer-contact {
          margin-top: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          font-size: 14px;
          color: rgba(255,255,255,0.6);
        }
        .te-footer-contact-link {
          display: flex;
          align-items: center;
          gap: 8px;
          color: rgba(255,255,255,0.6);
          text-decoration: none;
          transition: color 0.2s;
        }
        .te-footer-contact-link:hover {
          color: #f28d00;
        }
        .te-footer-col-title {
          font-family: 'Montserrat', system-ui, sans-serif;
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 16px;
          color: rgba(255,255,255,0.9);
        }
        .te-footer-link-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .te-footer-link {
          font-size: 14px;
          color: rgba(255,255,255,0.6);
          text-decoration: none;
          transition: color 0.2s;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .te-footer-link:hover {
          color: #f28d00;
        }
        .te-footer-link:hover svg {
          opacity: 1;
          margin-left: 0;
        }
        .te-footer-bottom {
          border-top: 1px solid rgba(255,255,255,0.1);
          padding: 24px 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        @media (min-width: 768px) {
          .te-footer-bottom {
            flex-direction: row;
            justify-content: space-between;
          }
        }
        .te-footer-region {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: rgba(255,255,255,0.4);
        }
        .te-footer-legal {
          display: flex;
          align-items: center;
          gap: 16px;
          font-size: 12px;
        }
        .te-footer-legal a {
          color: rgba(255,255,255,0.4);
          text-decoration: none;
          transition: color 0.15s;
        }
        .te-footer-legal a:hover {
          color: rgba(255,255,255,0.7);
        }
      `}</style>

      <div className="te-footer">
        <div className="te-footer-inner">
          <div className="te-footer-grid">
            <div className="te-footer-brand">
              {fields.Logo?.value?.src ? (
                <Image field={fields.Logo} style={{ height: '40px', width: 'auto' }} />
              ) : (
                <TELogoFooter />
              )}
              <p className="te-footer-tagline">EVERY CONNECTION COUNTS</p>
              <div className="te-footer-contact">
                <a href="tel:1-800-522-6752" className="te-footer-contact-link" data-testid="footer-phone">
                  <PhoneIcon />
                  <span>1-800-522-6752</span>
                </a>
                <a href="mailto:customer.care@te.com" className="te-footer-contact-link" data-testid="footer-email">
                  <MailIcon />
                  <span>customer.care@te.com</span>
                </a>
                <a href="#" className="te-footer-contact-link" data-testid="footer-locations">
                  <MapPinIcon />
                  <span>Find Locations</span>
                </a>
              </div>
            </div>

            <div>
              <h3 className="te-footer-col-title" data-testid="footer-heading-products">Products</h3>
              <ul className="te-footer-link-list">
                {footerLinks.products.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="te-footer-link" data-testid={`footer-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}>
                      <ChevronRightIcon />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="te-footer-col-title" data-testid="footer-heading-solutions">Solutions</h3>
              <ul className="te-footer-link-list">
                {footerLinks.solutions.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="te-footer-link" data-testid={`footer-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}>
                      <ChevronRightIcon />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="te-footer-col-title" data-testid="footer-heading-resources">Resources</h3>
              <ul className="te-footer-link-list">
                {footerLinks.resources.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="te-footer-link" data-testid={`footer-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}>
                      <ChevronRightIcon />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="te-footer-col-title" data-testid="footer-heading-account">My Account</h3>
              <ul className="te-footer-link-list">
                {footerLinks.account.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="te-footer-link" data-testid={`footer-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}>
                      <ChevronRightIcon />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="te-footer-bottom">
            <div className="te-footer-region" data-testid="footer-region">
              <GlobeIcon />
              <span>United States (English)</span>
            </div>
            <Text
              tag="p"
              field={copyrightField}
              style={{
                fontSize: '12px',
                color: 'rgba(255,255,255,0.4)',
                margin: 0,
              }}
              data-testid="footer-copyright"
            />
            <div className="te-footer-legal">
              <a href="#" data-testid="footer-link-privacy">Privacy Policy</a>
              <a href="#" data-testid="footer-link-terms">Terms of Use</a>
              <a href="#" data-testid="footer-link-cookies">Cookie Settings</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
