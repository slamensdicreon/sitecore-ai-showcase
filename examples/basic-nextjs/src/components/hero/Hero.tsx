import { JSX } from 'react';
import { Text, RichText, Image, Link, Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

/**
 * Fields for the Hero datasource template
 */
interface HeroFields {
  Heading: Field<string>;
  Subheading: Field<string>;
  BackgroundImage: ImageField;
  CTAText: Field<string>;
  CTALink: LinkField;
}

type HeroProps = ComponentProps & {
  fields: HeroFields;
};

/**
 * Hero component — full-width banner with heading, subheading, background image, and CTA.
 * Maps to the "Hero" JSON rendering in Sitecore.
 */
export const Default = (props: HeroProps): JSX.Element => {
  const { fields, params } = props;
  const id = params?.RenderingIdentifier;
  const styles = params?.styles || '';

  if (!fields) {
    return (
      <div className={`component hero ${styles}`}>
        <div className="component-content">
          <span className="is-empty-hint">Hero requires a datasource item assigned.</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`component hero ${styles}`}
      id={id || undefined}
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      <div
        style={{
          position: 'relative',
          minHeight: '480px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0A1628',
          color: '#FFFFFF',
        }}
      >
        {/* Background Image */}
        {fields.BackgroundImage?.value?.src && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.4,
            }}
          >
            <Image
              field={fields.BackgroundImage}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        {/* Content */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            textAlign: 'center',
            maxWidth: '800px',
            padding: '48px 24px',
          }}
        >
          <Text
            tag="h1"
            field={fields.Heading}
            style={{
              fontSize: '3rem',
              fontWeight: 700,
              marginBottom: '16px',
              lineHeight: 1.1,
            }}
          />
          <RichText
            field={fields.Subheading}
            style={{
              fontSize: '1.25rem',
              marginBottom: '32px',
              opacity: 0.9,
            }}
          />
          {fields.CTALink?.value?.href && (
            <Link
              field={fields.CTALink}
              style={{
                display: 'inline-block',
                padding: '14px 32px',
                background: '#2563EB',
                color: '#FFFFFF',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '1rem',
              }}
            >
              <Text field={fields.CTAText} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
