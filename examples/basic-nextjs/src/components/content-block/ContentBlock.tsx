import { JSX } from 'react';
import { Text, RichText, Image, Field, ImageField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

/**
 * Fields for the ContentBlock datasource template
 */
interface ContentBlockFields {
  Heading: Field<string>;
  Body: Field<string>;
  Image: ImageField;
  ImagePosition: Field<string>;
}

type ContentBlockProps = ComponentProps & {
  fields: ContentBlockFields;
};

/**
 * ContentBlock component — heading, rich text body, and optional image with position control.
 * Maps to the "ContentBlock" JSON rendering in Sitecore.
 */
export const Default = (props: ContentBlockProps): JSX.Element => {
  const { fields, params } = props;
  const id = params?.RenderingIdentifier;
  const styles = params?.styles || '';

  if (!fields) {
    return (
      <div className={`component content-block ${styles}`}>
        <div className="component-content">
          <span className="is-empty-hint">ContentBlock requires a datasource item assigned.</span>
        </div>
      </div>
    );
  }

  const imagePosition = fields.ImagePosition?.value || 'right';
  const isImageLeft = imagePosition === 'left';

  return (
    <div
      className={`component content-block ${styles}`}
      id={id || undefined}
      style={{
        padding: '64px 24px',
        maxWidth: '1200px',
        margin: '0 auto',
      }}
    >
      <div
        className="component-content"
        style={{
          display: 'flex',
          flexDirection: isImageLeft ? 'row-reverse' : 'row',
          gap: '48px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        {/* Text Content */}
        <div style={{ flex: '1 1 400px' }}>
          <Text
            tag="h2"
            field={fields.Heading}
            style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: '#0A1628',
              marginBottom: '16px',
              lineHeight: 1.2,
            }}
          />
          <RichText
            field={fields.Body}
            style={{
              fontSize: '1.05rem',
              color: '#4B5563',
              lineHeight: 1.7,
            }}
          />
        </div>

        {/* Image */}
        {fields.Image?.value?.src && (
          <div style={{ flex: '1 1 400px' }}>
            <Image
              field={fields.Image}
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '12px',
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
