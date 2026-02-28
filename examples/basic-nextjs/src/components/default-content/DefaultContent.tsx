/* eslint-disable @typescript-eslint/no-explicit-any */
import { JSX } from 'react';
import { Default as HeroDefault } from 'src/components/hero/Hero';
import { Default as SiteHeaderDefault } from 'src/components/site-header/SiteHeader';
import { Default as SiteFooterDefault } from 'src/components/site-footer/SiteFooter';
import { Default as FeatureCardDefault } from 'src/components/feature-card/FeatureCard';
import { Default as CTABannerDefault } from 'src/components/cta-banner/CTABanner';
import { Default as TestimonialDefault } from 'src/components/testimonial/Testimonial';
import { Default as ContentBlockDefault } from 'src/components/content-block/ContentBlock';
import { Default as ProductHeroDefault } from 'src/components/product-hero/ProductHero';
import { Default as ProductFeatureDefault } from 'src/components/product-feature/ProductFeature';
import { Default as PricingTableDefault } from 'src/components/pricing-table/PricingTable';
import { Default as SolutionsHeroDefault } from 'src/components/solutions-hero/SolutionsHero';
import { Default as SolutionCardDefault } from 'src/components/solution-card/SolutionCard';
import { Default as ValuePropositionDefault } from 'src/components/value-proposition/ValueProposition';
import { Default as CaseStudyDefault } from 'src/components/case-study/CaseStudy';
import defaultContent, { getDefaultContent } from 'src/lib/default-content';

const componentRegistry: Record<string, React.ComponentType<any>> = {
  Hero: HeroDefault,
  SiteHeader: SiteHeaderDefault,
  SiteFooter: SiteFooterDefault,
  FeatureCard: FeatureCardDefault,
  CTABanner: CTABannerDefault,
  Testimonial: TestimonialDefault,
  ContentBlock: ContentBlockDefault,
  ProductHero: ProductHeroDefault,
  ProductFeature: ProductFeatureDefault,
  PricingTable: PricingTableDefault,
  SolutionsHero: SolutionsHeroDefault,
  SolutionCard: SolutionCardDefault,
  ValueProposition: ValuePropositionDefault,
  CaseStudy: CaseStudyDefault,
};

interface DefaultPlaceholderProps {
  name: string;
  routePath?: string;
}

export const DefaultPlaceholder = ({ name, routePath }: DefaultPlaceholderProps): JSX.Element | null => {
  const content = routePath ? getDefaultContent(routePath) : defaultContent;
  const items = content[name as keyof typeof content];
  if (!items || items.length === 0) return null;

  if (name === 'headless-main' && (!routePath || routePath === '/')) {
    return <DefaultMainContent />;
  }

  if (name === 'headless-main' && routePath?.toLowerCase()?.endsWith('/products')) {
    return <DefaultProductsContent />;
  }

  if (name === 'headless-main' && routePath?.toLowerCase()?.endsWith('/solutions')) {
    return <DefaultSolutionsContent />;
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

const DefaultProductsContent = (): JSX.Element => {
  const content = getDefaultContent('/products');
  const mainItems = content['headless-main'];
  const productHero = mainItems.find((item) => item.componentName === 'ProductHero');
  const productFeatures = mainItems.filter((item) => item.componentName === 'ProductFeature');
  const pricingTable = mainItems.find((item) => item.componentName === 'PricingTable');
  const ctaBanner = mainItems.find((item) => item.componentName === 'CTABanner');

  return (
    <>
      {productHero && (
        <ProductHeroDefault
          fields={productHero.fields as any}
          params={{}}
          rendering={{ componentName: 'ProductHero' }}
        />
      )}

      {productFeatures.map((item, index) => (
        <ProductFeatureDefault
          key={`product-feature-${index}`}
          fields={item.fields as any}
          params={{}}
          rendering={{ componentName: 'ProductFeature' }}
        />
      ))}

      {pricingTable && (
        <PricingTableDefault
          fields={pricingTable.fields as any}
          params={{}}
          rendering={{ componentName: 'PricingTable' }}
        />
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

const DefaultSolutionsContent = (): JSX.Element => {
  const content = getDefaultContent('/solutions');
  const mainItems = content['headless-main'];
  const solutionsHero = mainItems.find((item) => item.componentName === 'SolutionsHero');
  const solutionCards = mainItems.filter((item) => item.componentName === 'SolutionCard');
  const valueProposition = mainItems.find((item) => item.componentName === 'ValueProposition');
  const caseStudy = mainItems.find((item) => item.componentName === 'CaseStudy');
  const ctaBanner = mainItems.find((item) => item.componentName === 'CTABanner');

  return (
    <>
      {solutionsHero && (
        <SolutionsHeroDefault
          fields={solutionsHero.fields as any}
          params={{}}
          rendering={{ componentName: 'SolutionsHero' }}
        />
      )}

      {solutionCards.length > 0 && (
        <div style={{ padding: '80px 24px', background: '#F9FAFB' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '24px',
                justifyContent: 'center',
              }}
            >
              {solutionCards.map((item, index) => (
                <SolutionCardDefault
                  key={`solution-card-${index}`}
                  fields={item.fields as any}
                  params={{}}
                  rendering={{ componentName: 'SolutionCard' }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {valueProposition && (
        <ValuePropositionDefault
          fields={valueProposition.fields as any}
          params={{}}
          rendering={{ componentName: 'ValueProposition' }}
        />
      )}

      {caseStudy && (
        <CaseStudyDefault
          fields={caseStudy.fields as any}
          params={{}}
          rendering={{ componentName: 'CaseStudy' }}
        />
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
