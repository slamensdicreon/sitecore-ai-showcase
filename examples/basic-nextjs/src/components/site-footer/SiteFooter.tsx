import { JSX } from 'react';
import { Image, Text, Field, ImageField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

/**
 * Fields for the SiteFooter datasource template
 */
interface SiteFooterFields {
  Logo: ImageField;
  Copyright: Field<string>;
}

type SiteFooterProps = ComponentProps & {
  fields: SiteFooterFields;
};

/**
 * SiteFooter component — site logo and copyright text.
 * Maps to the "SiteFooter" JSON rendering in Sitecore.
 */
export const Default = (props: SiteFooterProps): JSX.Element => {
  const { fields, params } = props;
  const id = params?.RenderingIdentifier;
  const styles = params?.styles || '';

  if (!fields) {
    return (
      <div className={`component site-footer ${styles}`}>
        <div className="component-content">
          <span className="is-empty-hint">SiteFooter requires a datasource item assigned.</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`component site-footer ${styles}`}
      id={id || undefined}
      style={{
        background: '#061E40',
        color: '#FFFFFF',
        padding: '32px 24px',
      }}
    >
      <div
        className="component-content"
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {fields.Logo?.value?.src ? (
            <Image
              field={fields.Logo}
              style={{ height: '28px', width: 'auto', opacity: 0.7, filter: 'brightness(0) invert(1)' }}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/eaa-logo.svg"
              alt="EAA"
              style={{ height: '28px', width: 'auto', opacity: 0.7 }}
            />
          )}
        </div>

        {/* Copyright */}
        <Text
          tag="p"
          field={fields.Copyright}
          style={{
            fontSize: '0.875rem',
            opacity: 0.6,
            margin: 0,
          }}
        />
      </div>
    </div>
  );
};
