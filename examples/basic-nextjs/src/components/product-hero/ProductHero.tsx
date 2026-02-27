import { JSX } from 'react';
import { Text, RichText, Link, Field, LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

interface ProductHeroFields {
  Heading: Field<string>;
  Tagline: Field<string>;
  PrimaryButtonText: Field<string>;
  PrimaryButtonLink: LinkField;
  SecondaryButtonText: Field<string>;
  SecondaryButtonLink: LinkField;
}

type ProductHeroProps = ComponentProps & {
  fields: ProductHeroFields;
};

export const Default = (props: ProductHeroProps): JSX.Element => {
  const { fields, params } = props;
  const id = params?.RenderingIdentifier;
  const styles = params?.styles || '';

  if (!fields) {
    return (
      <div className={`component product-hero ${styles}`}>
        <div className="component-content">
          <span className="is-empty-hint">ProductHero requires a datasource item assigned.</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`component product-hero ${styles}`}
      id={id || undefined}
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      <div
        style={{
          position: 'relative',
          minHeight: '420px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0A1628 0%, #1E3A5F 100%)',
          color: '#FFFFFF',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            textAlign: 'center',
            maxWidth: '800px',
            padding: '64px 24px',
          }}
        >
          <div
            style={{
              display: 'inline-block',
              padding: '6px 16px',
              background: 'rgba(37,99,235,0.2)',
              borderRadius: '20px',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#93C5FD',
              marginBottom: '24px',
              border: '1px solid rgba(37,99,235,0.3)',
            }}
          >
            Product
          </div>
          <Text
            tag="h1"
            field={fields.Heading}
            style={{
              fontSize: '3.25rem',
              fontWeight: 800,
              marginBottom: '20px',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          />
          <RichText
            field={fields.Tagline}
            style={{
              fontSize: '1.2rem',
              marginBottom: '36px',
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
                  padding: '14px 36px',
                  background: '#2563EB',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  transition: 'background 0.2s',
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
                  padding: '14px 36px',
                  background: 'transparent',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  border: '2px solid rgba(255,255,255,0.3)',
                }}
              >
                <Text field={fields.SecondaryButtonText} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
