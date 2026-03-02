import { JSX } from 'react';
import { Text, RichText, Image, Link, Field, ImageField, LinkField, FileField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

interface HeroImpactFields {
  Heading: Field<string>;
  Subheading: Field<string>;
  VideoUrl: FileField;
  BackgroundImage: ImageField;
  CTAText: Field<string>;
  CTALink: LinkField;
  SecondaryCtaText: Field<string>;
  SecondaryCtaLink: LinkField;
}

type HeroImpactProps = ComponentProps & {
  fields: HeroImpactFields;
};

export const Default = (props: HeroImpactProps): JSX.Element => {
  const { fields, params } = props;
  const id = params?.RenderingIdentifier;
  const styles = params?.styles || '';

  if (!fields) {
    return (
      <div className={`component hero-impact ${styles}`}>
        <div className="component-content">
          <span className="is-empty-hint">HeroImpact requires a datasource item assigned.</span>
        </div>
      </div>
    );
  }

  const videoSrc = fields.VideoUrl?.value?.src;
  const hasVideo = !!videoSrc;
  const hasSecondary = !!fields.SecondaryCtaLink?.value?.href;

  return (
    <div
      className={`component hero-impact ${styles}`}
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
