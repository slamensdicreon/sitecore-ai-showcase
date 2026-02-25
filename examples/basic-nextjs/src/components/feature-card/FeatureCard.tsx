import { JSX } from 'react';
import { Text, RichText, Image, Link, Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

/**
 * Fields for the FeatureCard datasource template
 */
interface FeatureCardFields {
  Icon: ImageField;
  Title: Field<string>;
  Description: Field<string>;
  Link: LinkField;
}

type FeatureCardProps = ComponentProps & {
  fields: FeatureCardFields;
};

/**
 * FeatureCard component — displays an icon, title, description, and optional link.
 * Maps to the "FeatureCard" JSON rendering in Sitecore.
 */
export const Default = (props: FeatureCardProps): JSX.Element => {
  const { fields, params } = props;
  const id = params?.RenderingIdentifier;
  const styles = params?.styles || '';

  if (!fields) {
    return (
      <div className={`component feature-card ${styles}`}>
        <div className="component-content">
          <span className="is-empty-hint">FeatureCard requires a datasource item assigned.</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`component feature-card ${styles}`}
      id={id || undefined}
      style={{
        background: '#FFFFFF',
        borderRadius: '12px',
        padding: '32px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        transition: 'box-shadow 0.2s ease',
      }}
    >
      <div className="component-content">
        {fields.Icon?.value?.src && (
          <div style={{ marginBottom: '16px' }}>
            <Image
              field={fields.Icon}
              style={{ width: '48px', height: '48px', objectFit: 'contain' }}
            />
          </div>
        )}
        <Text
          tag="h3"
          field={fields.Title}
          style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            color: '#0A1628',
            marginBottom: '12px',
          }}
        />
        <RichText
          field={fields.Description}
          style={{
            fontSize: '1rem',
            color: '#6B7280',
            lineHeight: 1.6,
            marginBottom: '16px',
          }}
        />
        {fields.Link?.value?.href && (
          <Link
            field={fields.Link}
            style={{
              color: '#2563EB',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          />
        )}
      </div>
    </div>
  );
};
