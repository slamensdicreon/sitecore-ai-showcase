import { JSX } from 'react';
import { Text, RichText, Link, Field, LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

/**
 * Fields for the CTABanner datasource template
 */
interface CTABannerFields {
  Heading: Field<string>;
  Description: Field<string>;
  PrimaryButtonText: Field<string>;
  PrimaryButtonLink: LinkField;
  SecondaryButtonText: Field<string>;
  SecondaryButtonLink: LinkField;
}

type CTABannerProps = ComponentProps & {
  fields: CTABannerFields;
};

/**
 * CTABanner component — call-to-action section with heading, description, and two buttons.
 * Maps to the "CTABanner" JSON rendering in Sitecore.
 */
export const Default = (props: CTABannerProps): JSX.Element => {
  const { fields, params } = props;
  const id = params?.RenderingIdentifier;
  const styles = params?.styles || '';

  if (!fields) {
    return (
      <div className={`component cta-banner ${styles}`}>
        <div className="component-content">
          <span className="is-empty-hint">CTABanner requires a datasource item assigned.</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`component cta-banner ${styles}`}
      id={id || undefined}
      style={{
        background: '#061E40',
        padding: '64px 24px',
        textAlign: 'center',
        color: '#FFFFFF',
      }}
    >
      <div
        className="component-content"
        style={{ maxWidth: '720px', margin: '0 auto' }}
      >
        <Text
          tag="h2"
          field={fields.Heading}
          style={{
            fontSize: '2.25rem',
            fontWeight: 700,
            marginBottom: '16px',
            lineHeight: 1.2,
          }}
        />
        <RichText
          field={fields.Description}
          style={{
            fontSize: '1.1rem',
            marginBottom: '32px',
            opacity: 0.85,
            lineHeight: 1.6,
          }}
        />
        <div
          style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          {fields.PrimaryButtonLink?.value?.href && (
            <Link
              field={fields.PrimaryButtonLink}
              style={{
                display: 'inline-block',
                padding: '14px 32px',
                background: '#0076C0',
                color: '#FFFFFF',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              <Text field={fields.PrimaryButtonText} />
            </Link>
          )}
          {fields.SecondaryButtonLink?.value?.href && (
            <Link
              field={fields.SecondaryButtonLink}
              style={{
                display: 'inline-block',
                padding: '14px 32px',
                background: 'transparent',
                color: '#FFFFFF',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 600,
                border: '2px solid rgba(255,255,255,0.3)',
              }}
            >
              <Text field={fields.SecondaryButtonText} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
