import { JSX } from 'react';
import { Text, RichText, Image, Field, ImageField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

interface CaseStudyFields {
  Heading: Field<string>;
  CompanyName: Field<string>;
  Quote: Field<string>;
  AuthorName: Field<string>;
  AuthorTitle: Field<string>;
  Metric1Value: Field<string>;
  Metric1Label: Field<string>;
  Metric2Value: Field<string>;
  Metric2Label: Field<string>;
  Metric3Value: Field<string>;
  Metric3Label: Field<string>;
  Logo: ImageField;
}

type CaseStudyProps = ComponentProps & {
  fields: CaseStudyFields;
};

export const Default = (props: CaseStudyProps): JSX.Element => {
  const { fields, params } = props;
  const id = params?.RenderingIdentifier;
  const styles = params?.styles || '';

  if (!fields) {
    return (
      <div className={`component case-study ${styles}`}>
        <div className="component-content">
          <span className="is-empty-hint">CaseStudy requires a datasource item assigned.</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`component case-study ${styles}`}
      id={id || undefined}
      style={{
        padding: '80px 24px',
        background: '#FFFFFF',
      }}
    >
      <div
        className="component-content"
        style={{ maxWidth: '1100px', margin: '0 auto' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div
            style={{
              display: 'inline-block',
              padding: '4px 12px',
              background: '#EFF6FF',
              color: '#2563EB',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '16px',
            }}
          >
            Case Study
          </div>
          <Text
            tag="h2"
            field={fields.Heading}
            style={{
              fontSize: '2.25rem',
              fontWeight: 700,
              color: '#0A1628',
              lineHeight: 1.2,
            }}
          />
        </div>
        <div
          style={{
            background: '#F9FAFB',
            borderRadius: '16px',
            padding: '48px',
            border: '1px solid #E5E7EB',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '24px',
            }}
          >
            {fields.Logo?.value?.src ? (
              <Image
                field={fields.Logo}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '8px',
                  objectFit: 'contain',
                }}
              />
            ) : (
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '8px',
                  background: '#0A1628',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                }}
              >
                {fields.CompanyName?.value?.charAt(0) || 'C'}
              </div>
            )}
            <div>
              <Text
                tag="div"
                field={fields.CompanyName}
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: '#0A1628',
                }}
              />
              <div style={{ fontSize: '0.85rem', color: '#6B7280' }}>
                Featured Customer
              </div>
            </div>
          </div>
          <div
            style={{
              borderLeft: '4px solid #2563EB',
              paddingLeft: '24px',
              marginBottom: '24px',
            }}
          >
            <RichText
              field={fields.Quote}
              style={{
                fontSize: '1.15rem',
                color: '#1E3A5F',
                lineHeight: 1.7,
                fontStyle: 'italic',
              }}
            />
          </div>
          <div style={{ marginBottom: '32px' }}>
            <Text
              tag="span"
              field={fields.AuthorName}
              style={{
                fontWeight: 600,
                color: '#0A1628',
                fontSize: '0.95rem',
              }}
            />
            {fields.AuthorTitle?.value && (
              <>
                <span style={{ color: '#9CA3AF', margin: '0 8px' }}>·</span>
                <Text
                  tag="span"
                  field={fields.AuthorTitle}
                  style={{
                    color: '#6B7280',
                    fontSize: '0.95rem',
                  }}
                />
              </>
            )}
          </div>
          <div
            style={{
              display: 'flex',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            {[
              { value: fields.Metric1Value, label: fields.Metric1Label },
              { value: fields.Metric2Value, label: fields.Metric2Label },
              { value: fields.Metric3Value, label: fields.Metric3Label },
            ].map((metric, i) => (
              <div
                key={i}
                style={{
                  flex: '1 1 160px',
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center',
                  border: '1px solid #E5E7EB',
                }}
              >
                <Text
                  tag="div"
                  field={metric.value}
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color: '#2563EB',
                    marginBottom: '4px',
                  }}
                />
                <Text
                  tag="div"
                  field={metric.label}
                  style={{
                    fontSize: '0.8rem',
                    color: '#6B7280',
                    fontWeight: 500,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
