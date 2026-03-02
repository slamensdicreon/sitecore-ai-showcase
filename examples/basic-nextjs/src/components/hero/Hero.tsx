import { JSX } from 'react';
import { Text, RichText, Image, Link, Field, ImageField, LinkField, FileField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

interface HeroFields {
  Heading: Field<string>;
  Subheading: Field<string>;
  VideoUrl: FileField;
  BackgroundImage: ImageField;
  CTAText: Field<string>;
  CTALink: LinkField;
  SecondaryCtaText: Field<string>;
  SecondaryCtaLink: LinkField;
  Badge: Field<string>;
}

type HeroProps = ComponentProps & {
  fields: HeroFields;
};

const EmptyHint = ({ variant, styles }: { variant: string; styles: string }): JSX.Element => (
  <div className={`component hero hero-${variant} ${styles}`}>
    <div className="component-content">
      <span className="is-empty-hint">Hero ({variant}) requires a datasource item assigned.</span>
    </div>
  </div>
);

export const Impact = (props: HeroProps): JSX.Element => {
  const { fields, params } = props;
  const id = params?.RenderingIdentifier;
  const styles = params?.styles || '';

  if (!fields) return <EmptyHint variant="impact" styles={styles} />;

  const videoSrc = fields.VideoUrl?.value?.src;
  const hasVideo = !!videoSrc;
  const hasSecondary = !!fields.SecondaryCtaLink?.value?.href;

  return (
    <div
      className={`component hero hero-impact ${styles}`}
      id={id || undefined}
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        background: '#061E40',
        color: '#FFFFFF',
      }}
    >
      {hasVideo ? (
        <video
          aria-hidden="true"
          autoPlay
          muted
          loop
          playsInline
          poster={typeof fields.BackgroundImage?.value?.src === 'string' ? fields.BackgroundImage.value.src : undefined}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      ) : fields.BackgroundImage?.value?.src ? (
        <div style={{ position: 'absolute', inset: 0 }}>
          <Image
            field={fields.BackgroundImage}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      ) : null}

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(6,30,64,0.92) 0%, rgba(6,30,64,0.6) 40%, rgba(6,30,64,0.15) 70%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to right, rgba(6,30,64,0.7) 0%, rgba(6,30,64,0.3) 40%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          zIndex: 2,
          padding: 'clamp(32px, 6vw, 80px)',
          maxWidth: '680px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <Text
          tag="h1"
          field={fields.Heading}
          style={{
            fontSize: 'clamp(2rem, 5vw, 3.75rem)',
            fontWeight: 800,
            lineHeight: 1.05,
            margin: 0,
            letterSpacing: '-0.02em',
          }}
        />

        <RichText
          field={fields.Subheading}
          style={{
            fontSize: 'clamp(1rem, 1.8vw, 1.25rem)',
            lineHeight: 1.6,
            opacity: 0.85,
            margin: 0,
            maxWidth: '540px',
          }}
        />

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            marginTop: '8px',
          }}
        >
          {fields.CTALink?.value?.href && (
            <Link
              field={fields.CTALink}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '14px 36px',
                background: '#0076C0',
                color: '#FFFFFF',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '1rem',
                border: 'none',
              }}
            >
              <Text field={fields.CTAText} />
            </Link>
          )}

          {hasSecondary && (
            <Link
              field={fields.SecondaryCtaLink}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '14px 36px',
                background: 'rgba(255,255,255,0.1)',
                color: '#FFFFFF',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                border: '1px solid rgba(255,255,255,0.35)',
                backdropFilter: 'blur(4px)',
              }}
            >
              <Text field={fields.SecondaryCtaText} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export const Minimal = (props: HeroProps): JSX.Element => {
  const { fields, params } = props;
  const id = params?.RenderingIdentifier;
  const styles = params?.styles || '';

  if (!fields) return <EmptyHint variant="minimal" styles={styles} />;

  const hasBadge = !!fields.Badge?.value;

  return (
    <div
      className={`component hero hero-minimal ${styles}`}
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
          background: 'linear-gradient(135deg, #061E40 0%, #0D3B7A 100%)',
          color: '#FFFFFF',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '30%',
            right: '-5%',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,118,192,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '10%',
            left: '-5%',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,118,192,0.08) 0%, transparent 70%)',
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
          {hasBadge && (
            <div
              style={{
                display: 'inline-block',
                padding: '6px 16px',
                background: 'rgba(0,118,192,0.2)',
                borderRadius: '20px',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#93C5FD',
                marginBottom: '24px',
                border: '1px solid rgba(0,118,192,0.3)',
              }}
            >
              <Text field={fields.Badge} />
            </div>
          )}
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
            field={fields.Subheading}
            style={{
              fontSize: '1.2rem',
              marginBottom: '36px',
              opacity: 0.85,
              lineHeight: 1.6,
            }}
          />
          {fields.CTALink?.value?.href && (
            <Link
              field={fields.CTALink}
              style={{
                display: 'inline-block',
                padding: '14px 36px',
                background: '#0076C0',
                color: '#FFFFFF',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '1rem',
              }}
            >
              <Text field={fields.CTAText} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export const Product = (props: HeroProps): JSX.Element => {
  const { fields, params } = props;
  const id = params?.RenderingIdentifier;
  const styles = params?.styles || '';

  if (!fields) return <EmptyHint variant="product" styles={styles} />;

  const hasBadge = !!fields.Badge?.value;

  return (
    <div
      className={`component hero hero-product ${styles}`}
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
          background: 'linear-gradient(135deg, #061E40 0%, #0D3B7A 100%)',
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
            background: 'radial-gradient(circle, rgba(0,118,192,0.15) 0%, transparent 70%)',
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
          {hasBadge && (
            <div
              style={{
                display: 'inline-block',
                padding: '6px 16px',
                background: 'rgba(0,118,192,0.2)',
                borderRadius: '20px',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#93C5FD',
                marginBottom: '24px',
                border: '1px solid rgba(0,118,192,0.3)',
              }}
            >
              <Text field={fields.Badge} />
            </div>
          )}
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
            field={fields.Subheading}
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
            {fields.CTALink?.value?.href && (
              <Link
                field={fields.CTALink}
                style={{
                  display: 'inline-block',
                  padding: '14px 36px',
                  background: '#0076C0',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  transition: 'background 0.2s',
                }}
              >
                <Text field={fields.CTAText} />
              </Link>
            )}
            {fields.SecondaryCtaLink?.value?.href && (
              <Link
                field={fields.SecondaryCtaLink}
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
                <Text field={fields.SecondaryCtaText} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const Default = (props: HeroProps): JSX.Element => {
  const variant = props.params?.FieldNames;
  if (variant === 'Impact') return <Impact {...props} />;
  if (variant === 'Product') return <Product {...props} />;
  if (variant === 'Minimal') return <Minimal {...props} />;

  const hasVideo = !!props.fields?.VideoUrl?.value?.src;
  const hasBadge = !!props.fields?.Badge?.value;
  const hasSecondary = !!props.fields?.SecondaryCtaLink?.value?.href;

  if (hasVideo) return <Impact {...props} />;
  if (hasBadge && hasSecondary) return <Product {...props} />;
  if (hasBadge) return <Minimal {...props} />;

  return <Impact {...props} />;
};
