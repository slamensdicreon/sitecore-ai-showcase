import { JSX } from 'react';
import { Text, RichText, Field } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

interface ValuePropositionFields {
  Heading: Field<string>;
  Description: Field<string>;
  Stat1Value: Field<string>;
  Stat1Label: Field<string>;
  Stat2Value: Field<string>;
  Stat2Label: Field<string>;
  Stat3Value: Field<string>;
  Stat3Label: Field<string>;
}

type ValuePropositionProps = ComponentProps & {
  fields: ValuePropositionFields;
};

interface StatItemProps {
  value: Field<string>;
  label: Field<string>;
}

const StatItem = ({ value, label }: StatItemProps): JSX.Element => (
  <div
    style={{
      flex: '1 1 200px',
      textAlign: 'center',
      padding: '32px 16px',
    }}
  >
    <Text
      tag="div"
      field={value}
      style={{
        fontSize: '3rem',
        fontWeight: 800,
        color: '#0076C0',
        lineHeight: 1,
        marginBottom: '8px',
        letterSpacing: '-0.02em',
      }}
    />
    <Text
      tag="div"
      field={label}
      style={{
        fontSize: '1rem',
        color: '#4B5563',
        fontWeight: 500,
      }}
    />
  </div>
);

export const Default = (props: ValuePropositionProps): JSX.Element => {
  const { fields, params } = props;
  const id = params?.RenderingIdentifier;
  const styles = params?.styles || '';

  if (!fields) {
    return (
      <div className={`component value-proposition ${styles}`}>
        <div className="component-content">
          <span className="is-empty-hint">ValueProposition requires a datasource item assigned.</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`component value-proposition ${styles}`}
      id={id || undefined}
      style={{
        padding: '80px 24px',
        background: '#F9FAFB',
      }}
    >
      <div
        className="component-content"
        style={{ maxWidth: '1100px', margin: '0 auto' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <Text
            tag="h2"
            field={fields.Heading}
            style={{
              fontSize: '2.25rem',
              fontWeight: 700,
              color: '#061E40',
              marginBottom: '16px',
              lineHeight: 1.2,
            }}
          />
          <RichText
            field={fields.Description}
            style={{
              fontSize: '1.1rem',
              color: '#6B7280',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          />
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '24px',
            flexWrap: 'wrap',
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '16px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}
        >
          <StatItem value={fields.Stat1Value} label={fields.Stat1Label} />
          <div
            style={{
              width: '1px',
              background: '#E5E7EB',
              alignSelf: 'stretch',
              margin: '16px 0',
            }}
          />
          <StatItem value={fields.Stat2Value} label={fields.Stat2Label} />
          <div
            style={{
              width: '1px',
              background: '#E5E7EB',
              alignSelf: 'stretch',
              margin: '16px 0',
            }}
          />
          <StatItem value={fields.Stat3Value} label={fields.Stat3Label} />
        </div>
      </div>
    </div>
  );
};
