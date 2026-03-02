import { JSX } from 'react';
import { RichText, Text, Image, Field, ImageField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

interface TestimonialFields {
  Quote: Field<string>;
  AuthorName: Field<string>;
  AuthorTitle: Field<string>;
  AuthorPhoto: ImageField;
}

type TestimonialProps = ComponentProps & {
  fields: TestimonialFields;
};

export const Default = (props: TestimonialProps): JSX.Element => {
  const { fields, params } = props;
  const id = params?.RenderingIdentifier;
  const styles = params?.styles || '';

  if (!fields) {
    return (
      <div className={`component testimonial ${styles}`}>
        <div className="component-content">
          <span className="is-empty-hint">Testimonial requires a datasource item assigned.</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`component testimonial ${styles}`}
      id={id || undefined}
      style={{
        background: '#FFFFFF',
        padding: '64px 24px',
      }}
    >
      <div
        className="component-content"
        style={{
          maxWidth: '720px',
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <blockquote
          style={{
            fontSize: '1.3rem',
            fontStyle: 'italic',
            color: '#1F2937',
            lineHeight: 1.7,
            marginBottom: '24px',
            position: 'relative',
            padding: '0 24px',
          }}
        >
          <span
            style={{
              fontSize: '3rem',
              color: '#0076C0',
              lineHeight: 0,
              verticalAlign: 'middle',
              marginRight: '4px',
            }}
            aria-hidden="true"
          >
            &ldquo;
          </span>
          <RichText field={fields.Quote} />
        </blockquote>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
          }}
        >
          {fields.AuthorPhoto?.value?.src && (
            <Image
              field={fields.AuthorPhoto}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                objectFit: 'cover',
              }}
            />
          )}
          <div style={{ textAlign: 'left' }}>
            <Text
              tag="p"
              field={fields.AuthorName}
              style={{
                fontWeight: 600,
                color: '#061E40',
                margin: 0,
              }}
            />
            <Text
              tag="p"
              field={fields.AuthorTitle}
              style={{
                fontSize: '0.875rem',
                color: '#6B7280',
                margin: 0,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
