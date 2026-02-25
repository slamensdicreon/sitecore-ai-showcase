import { JSX } from 'react';
import { Image, Link, Text, Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

/**
 * Fields for the SiteHeader datasource template
 */
interface SiteHeaderFields {
  Logo: ImageField;
  CTAText: Field<string>;
  CTALink: LinkField;
}

type SiteHeaderProps = ComponentProps & {
  fields: SiteHeaderFields;
};

/**
 * SiteHeader component — site logo and CTA button in a sticky header bar.
 * Maps to the "SiteHeader" JSON rendering in Sitecore.
 */
export const Default = (props: SiteHeaderProps): JSX.Element => {
  const { fields, params } = props;
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

  return (
    <div
      className={`component site-header ${styles}`}
      id={id || undefined}
      style={{
        background: '#0A1628',
        color: '#FFFFFF',
        padding: '0 24px',
      }}
    >
      <div
        className="component-content"
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {fields.Logo?.value?.src ? (
            <Image
              field={fields.Logo}
              style={{ height: '32px', width: 'auto' }}
            />
          ) : (
            <span
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
              }}
            >
              NovaTech
            </span>
          )}
        </div>

        {/* CTA */}
        {fields.CTALink?.value?.href && (
          <Link
            field={fields.CTALink}
            style={{
              display: 'inline-block',
              padding: '8px 20px',
              background: '#2563EB',
              color: '#FFFFFF',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 500,
              fontSize: '0.875rem',
            }}
          >
            <Text field={fields.CTAText} />
          </Link>
        )}
      </div>
    </div>
  );
};
