import { JSX } from 'react';
import { Text, RichText, Image, Link, Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

interface SolutionCardFields {
  Title: Field<string>;
  Description: Field<string>;
  Metrics: Field<string>;
  Icon: ImageField;
  Link: LinkField;
  LinkText: Field<string>;
}

type SolutionCardProps = ComponentProps & {
  fields: SolutionCardFields;
};

export const Default = (props: SolutionCardProps): JSX.Element => {
  const { fields, params } = props;
  const id = params?.RenderingIdentifier;
  const styles = params?.styles || '';

  if (!fields) {
    return (
      <div className={`component solution-card ${styles}`}>
        <div className="component-content">
          <span className="is-empty-hint">SolutionCard requires a datasource item assigned.</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`component solution-card ${styles}`}
      id={id || undefined}
      style={{
        flex: '1 1 280px',
        maxWidth: '540px',
      }}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid #E5E7EB',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}
      >
        <div
          style={{
            height: '4px',
            background: 'linear-gradient(90deg, #2563EB 0%, #3B82F6 100%)',
          }}
        />
        <div
          style={{
            padding: '32px 28px',
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '10px',
              background: '#EFF6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
            }}
          >
            {fields.Icon?.value?.src ? (
              <Image
                field={fields.Icon}
                style={{ width: '28px', height: '28px' }}
              />
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#2563EB"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            )}
          </div>
          <Text
            tag="h3"
            field={fields.Title}
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#0A1628',
              marginBottom: '12px',
              lineHeight: 1.3,
            }}
          />
          <RichText
            field={fields.Description}
            style={{
              fontSize: '0.95rem',
              color: '#4B5563',
              lineHeight: 1.7,
              marginBottom: '16px',
              flex: 1,
            }}
          />
          {fields.Metrics?.value && (
            <div
              style={{
                padding: '12px 16px',
                background: '#F8FAFC',
                borderRadius: '8px',
                marginBottom: '20px',
                borderLeft: '3px solid #2563EB',
              }}
            >
              <RichText
                field={fields.Metrics}
                style={{
                  fontSize: '0.85rem',
                  color: '#1E3A5F',
                  fontWeight: 500,
                  lineHeight: 1.5,
                }}
              />
            </div>
          )}
          {fields.Link?.value?.href && (
            <Link
              field={fields.Link}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#2563EB',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            >
              <Text field={fields.LinkText} />
              <span aria-hidden="true">&rarr;</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
