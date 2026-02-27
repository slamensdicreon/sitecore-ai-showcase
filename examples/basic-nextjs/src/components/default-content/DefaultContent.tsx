import { JSX } from 'react';
import { Default as HeroDefault } from 'src/components/hero/Hero';
import { Default as SiteHeaderDefault } from 'src/components/site-header/SiteHeader';
import { Default as SiteFooterDefault } from 'src/components/site-footer/SiteFooter';
import { Default as FeatureCardDefault } from 'src/components/feature-card/FeatureCard';
import { Default as CTABannerDefault } from 'src/components/cta-banner/CTABanner';
import { Default as TestimonialDefault } from 'src/components/testimonial/Testimonial';
import { Default as ContentBlockDefault } from 'src/components/content-block/ContentBlock';
import defaultContent from 'src/lib/default-content';

const componentRegistry: Record<string, React.ComponentType<any>> = {
  Hero: HeroDefault,
  SiteHeader: SiteHeaderDefault,
  SiteFooter: SiteFooterDefault,
  FeatureCard: FeatureCardDefault,
  CTABanner: CTABannerDefault,
  Testimonial: TestimonialDefault,
  ContentBlock: ContentBlockDefault,
};

interface DefaultPlaceholderProps {
  name: string;
}

export const DefaultPlaceholder = ({ name }: DefaultPlaceholderProps): JSX.Element | null => {
  const items = defaultContent[name as keyof typeof defaultContent];
  if (!items || items.length === 0) return null;

  if (name === 'headless-main') {
    return <DefaultMainContent />;
  }

  return (
    <>
      {items.map((item, index) => {
        const Component = componentRegistry[item.componentName];
        if (!Component) return null;
        return (
          <Component
            key={`${item.componentName}-${index}`}
            fields={item.fields}
            params={{}}
            rendering={{ componentName: item.componentName }}
          />
        );
      })}
    </>
  );
};

const DefaultMainContent = (): JSX.Element => {
  const mainItems = defaultContent['headless-main'];
  const hero = mainItems.find((item) => item.componentName === 'Hero');
  const featureCards = mainItems.filter((item) => item.componentName === 'FeatureCard');
  const contentBlock = mainItems.find((item) => item.componentName === 'ContentBlock');
  const testimonial = mainItems.find((item) => item.componentName === 'Testimonial');
  const ctaBanner = mainItems.find((item) => item.componentName === 'CTABanner');

  return (
    <>
      {hero && (
        <HeroDefault
          fields={hero.fields as any}
          params={{}}
          rendering={{ componentName: 'Hero' }}
        />
      )}

      {featureCards.length > 0 && (
        <div style={{ padding: '64px 24px', background: '#F9FAFB' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2
              style={{
                fontSize: '2rem',
                fontWeight: 700,
                color: '#0A1628',
                textAlign: 'center',
                marginBottom: '48px',
              }}
            >
              What We Do
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px',
              }}
            >
              {featureCards.map((item, index) => (
                <FeatureCardDefault
                  key={`feature-${index}`}
                  fields={item.fields as any}
                  params={{}}
                  rendering={{ componentName: 'FeatureCard' }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {contentBlock && (
        <ContentBlockDefault
          fields={contentBlock.fields as any}
          params={{}}
          rendering={{ componentName: 'ContentBlock' }}
        />
      )}

      {testimonial && (
        <div style={{ background: '#FFFFFF', padding: '16px 0' }}>
          <TestimonialDefault
            fields={testimonial.fields as any}
            params={{}}
            rendering={{ componentName: 'Testimonial' }}
          />
        </div>
      )}

      {ctaBanner && (
        <CTABannerDefault
          fields={ctaBanner.fields as any}
          params={{}}
          rendering={{ componentName: 'CTABanner' }}
        />
      )}
    </>
  );
};

export const DefaultFeatureCards = (): JSX.Element => {
  const mainItems = defaultContent['headless-main'];
  const featureCards = mainItems.filter((item) => item.componentName === 'FeatureCard');

  return (
    <div style={{ padding: '64px 24px', background: '#F9FAFB' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2
          style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: '#0A1628',
            textAlign: 'center',
            marginBottom: '48px',
          }}
        >
          What We Do
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
          }}
        >
          {featureCards.map((item, index) => (
            <FeatureCardDefault
              key={`feature-${index}`}
              fields={item.fields as any}
              params={{}}
              rendering={{ componentName: 'FeatureCard' }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DefaultPlaceholder;
