import { JSX } from 'react';
import { Text, RichText, Image, Field, ImageField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

interface ProductFeatureFields {
  Title: Field<string>;
  Description: Field<string>;
  Image: ImageField;
  ImagePosition: Field<string>;
  Badge: Field<string>;
}

type ProductFeatureProps = ComponentProps & {
  fields: ProductFeatureFields;
};

export const Default = (props: ProductFeatureProps): JSX.Element => {
  const { fields, params } = props;
  const id = params?.RenderingIdentifier;
  const styles = params?.styles || '';

  if (!fields) {
    return (
      <div className={`component product-feature ${styles}`}>
        <div className="component-content">
          <span className="is-empty-hint">ProductFeature requires a datasource item assigned.</span>
        </div>
      </div>
    );
  }

  const imagePosition = fields.ImagePosition?.value || 'right';
  const isImageLeft = imagePosition === 'left';

  return (
    <div
      className={`component product-feature ${styles}`}
      id={id || undefined}
      style={{
        padding: '80px 24px',
        background: '#FFFFFF',
      }}
    >
      <div
        className="component-content"
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: isImageLeft ? 'row-reverse' : 'row',
          gap: '64px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: '1 1 400px' }}>
          {fields.Badge?.value && (
            <div
              style={{
                display: 'inline-block',
                padding: '4px 12px',
                background: '#EFF6FF',
                color: '#0076C0',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '16px',
              }}
            >
              <Text field={fields.Badge} />
            </div>
          )}
          <Text
            tag="h2"
            field={fields.Title}
            style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: '#061E40',
              marginBottom: '16px',
              lineHeight: 1.2,
            }}
          />
          <RichText
            field={fields.Description}
            style={{
              fontSize: '1.05rem',
              color: '#4B5563',
              lineHeight: 1.7,
            }}
          />
        </div>

        <div
          style={{
            flex: '1 1 400px',
            background: '#F1F5F9',
            borderRadius: '16px',
            minHeight: '280px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {fields.Image?.value?.src ? (
            <Image
              field={fields.Image}
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '16px',
              }}
            />
          ) : (
            <div
              style={{
                padding: '40px',
                textAlign: 'center',
                color: '#94A3B8',
              }}
            >
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                style={{ margin: '0 auto 12px' }}
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
              <div style={{ fontSize: '0.875rem' }}>Feature Preview</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
