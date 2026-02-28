import { JSX } from 'react';
import { Text, RichText, Link, Field, LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

interface PricingTableFields {
  Heading: Field<string>;
  Description: Field<string>;
  Tier1Name: Field<string>;
  Tier1Price: Field<string>;
  Tier1Features: Field<string>;
  Tier1ButtonText: Field<string>;
  Tier1ButtonLink: LinkField;
  Tier2Name: Field<string>;
  Tier2Price: Field<string>;
  Tier2Features: Field<string>;
  Tier2ButtonText: Field<string>;
  Tier2ButtonLink: LinkField;
  Tier3Name: Field<string>;
  Tier3Price: Field<string>;
  Tier3Features: Field<string>;
  Tier3ButtonText: Field<string>;
  Tier3ButtonLink: LinkField;
}

type PricingTableProps = ComponentProps & {
  fields: PricingTableFields;
};

interface TierProps {
  name: Field<string>;
  price: Field<string>;
  features: Field<string>;
  buttonText: Field<string>;
  buttonLink: LinkField;
  highlighted?: boolean;
}

const TierCard = ({ name, price, features, buttonText, buttonLink, highlighted }: TierProps): JSX.Element => {
  return (
    <div
      style={{
        background: highlighted ? '#0A1628' : '#FFFFFF',
        color: highlighted ? '#FFFFFF' : '#0A1628',
        borderRadius: '16px',
        padding: '40px 32px',
        border: highlighted ? '2px solid #2563EB' : '1px solid #E5E7EB',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        flex: '1 1 300px',
        maxWidth: '400px',
      }}
    >
      {highlighted && (
        <div
          style={{
            position: 'absolute',
            top: '-12px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '4px 16px',
            background: '#2563EB',
            color: '#FFFFFF',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Most Popular
        </div>
      )}
      <Text
        tag="h3"
        field={name}
        style={{
          fontSize: '1.25rem',
          fontWeight: 600,
          marginBottom: '8px',
        }}
      />
      <div style={{ marginBottom: '24px' }}>
        <Text
          tag="span"
          field={price}
          style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            lineHeight: 1,
          }}
        />
      </div>
      <div
        style={{
          marginBottom: '32px',
          flex: 1,
          color: highlighted ? 'rgba(255,255,255,0.75)' : '#6B7280',
          fontSize: '0.95rem',
          lineHeight: 1.8,
        }}
      >
        <RichText field={features} />
      </div>
      {buttonLink?.value?.href && (
        <Link
          field={buttonLink}
          style={{
            display: 'block',
            textAlign: 'center',
            padding: '12px 24px',
            background: highlighted ? '#2563EB' : 'transparent',
            color: highlighted ? '#FFFFFF' : '#2563EB',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 600,
            border: highlighted ? 'none' : '2px solid #2563EB',
          }}
        >
          <Text field={buttonText} />
        </Link>
      )}
    </div>
  );
};

export const Default = (props: PricingTableProps): JSX.Element => {
  const { fields, params } = props;
  const id = params?.RenderingIdentifier;
  const styles = params?.styles || '';

  if (!fields) {
    return (
      <div className={`component pricing-table ${styles}`}>
        <div className="component-content">
          <span className="is-empty-hint">PricingTable requires a datasource item assigned.</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`component pricing-table ${styles}`}
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
              color: '#0A1628',
              marginBottom: '16px',
            }}
          />
          <RichText
            field={fields.Description}
            style={{
              fontSize: '1.1rem',
              color: '#6B7280',
              maxWidth: '600px',
              margin: '0 auto',
            }}
          />
        </div>
        <div
          style={{
            display: 'flex',
            gap: '24px',
            justifyContent: 'center',
            alignItems: 'stretch',
            flexWrap: 'wrap',
          }}
        >
          <TierCard
            name={fields.Tier1Name}
            price={fields.Tier1Price}
            features={fields.Tier1Features}
            buttonText={fields.Tier1ButtonText}
            buttonLink={fields.Tier1ButtonLink}
          />
          <TierCard
            name={fields.Tier2Name}
            price={fields.Tier2Price}
            features={fields.Tier2Features}
            buttonText={fields.Tier2ButtonText}
            buttonLink={fields.Tier2ButtonLink}
            highlighted
          />
          <TierCard
            name={fields.Tier3Name}
            price={fields.Tier3Price}
            features={fields.Tier3Features}
            buttonText={fields.Tier3ButtonText}
            buttonLink={fields.Tier3ButtonLink}
          />
        </div>
      </div>
    </div>
  );
};
