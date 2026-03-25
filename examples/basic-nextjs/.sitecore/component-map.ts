// Below are built-in components that are available in the app, it's recommended to keep them as is

import { BYOCServerWrapper, NextjsContentSdkComponent, FEaaSServerWrapper } from '@sitecore-content-sdk/nextjs';
import { Form } from '@sitecore-content-sdk/nextjs';

// end of built-in components
import * as ValueProposition from 'src/components/value-proposition/ValueProposition';
import * as Testimonial from 'src/components/testimonial/Testimonial';
import * as Container from 'src/components/sxa/Container';
import * as ColumnSplitter from 'src/components/sxa/ColumnSplitter';
import * as SolutionCard from 'src/components/solution-card/SolutionCard';
import * as SiteHeader from 'src/components/site-header/SiteHeader';
import * as SiteFooter from 'src/components/site-footer/SiteFooter';
import * as ProductFeature from 'src/components/product-feature/ProductFeature';
import * as PricingTable from 'src/components/pricing-table/PricingTable';
import * as PartialDesignDynamicPlaceholder from 'src/components/partial-design-dynamic-placeholder/PartialDesignDynamicPlaceholder';
import * as Hero from 'src/components/hero/Hero';
import * as FeatureCard from 'src/components/feature-card/FeatureCard';
import * as CTABanner from 'src/components/cta-banner/CTABanner';
import * as ContentBlock from 'src/components/content-block/ContentBlock';
import * as ContainerFullWidth from 'src/components/container/container-full-width/ContainerFullWidth';
import * as ContainerFullBleed from 'src/components/container/container-full-bleed/ContainerFullBleed';
import * as Container70 from 'src/components/container/container-70/Container70';
import * as CaseStudy from 'src/components/case-study/CaseStudy';
import * as HeroBanner from 'src/components/hero-banner/HeroBanner';
import * as AuthorityStats from 'src/components/authority-stats/AuthorityStats';
import * as MegaTrends from 'src/components/mega-trends/MegaTrends';
import * as SolutionHero from 'src/components/solution-hero/SolutionHero';
import * as SolutionNarrative from 'src/components/solution-narrative/SolutionNarrative';
import * as SolutionPathways from 'src/components/solution-pathways/SolutionPathways';
import * as ProductDiscovery from 'src/components/product-discovery/ProductDiscovery';
import * as ProofPointCounter from 'src/components/proof-point-counter/ProofPointCounter';
import * as CrossNavigation from 'src/components/cross-navigation/CrossNavigation';
import * as RichTextBlock from 'src/components/rich-text-block/RichTextBlock';

export const componentMap = new Map<string, NextjsContentSdkComponent>([
  ['BYOCWrapper', BYOCServerWrapper],
  ['FEaaSWrapper', FEaaSServerWrapper],
  ['Form', { ...Form, componentType: 'client' }],
  ['ValueProposition', { ...ValueProposition }],
  ['Testimonial', { ...Testimonial }],
  ['Container', { ...Container }],
  ['ColumnSplitter', { ...ColumnSplitter }],
  ['SolutionCard', { ...SolutionCard }],
  ['SiteHeader', { ...SiteHeader }],
  ['SiteFooter', { ...SiteFooter }],
  ['ProductFeature', { ...ProductFeature }],
  ['PricingTable', { ...PricingTable }],
  ['PartialDesignDynamicPlaceholder', { ...PartialDesignDynamicPlaceholder }],
  ['Hero', { ...Hero }],
  ['FeatureCard', { ...FeatureCard }],
  ['CTABanner', { ...CTABanner }],
  ['ContentBlock', { ...ContentBlock }],
  ['ContainerFullWidth', { ...ContainerFullWidth }],
  ['ContainerFullBleed', { ...ContainerFullBleed }],
  ['Container70', { ...Container70 }],
  ['CaseStudy', { ...CaseStudy }],
  ['Hero Banner', { ...HeroBanner, componentType: 'client' }],
  ['HeroBanner', { ...HeroBanner, componentType: 'client' }],
  ['Authority Stats', { ...AuthorityStats, componentType: 'client' }],
  ['AuthorityStats', { ...AuthorityStats, componentType: 'client' }],
  ['Mega Trends', { ...MegaTrends, componentType: 'client' }],
  ['MegaTrends', { ...MegaTrends, componentType: 'client' }],
  ['Solution Hero', { ...SolutionHero }],
  ['SolutionHero', { ...SolutionHero }],
  ['Solution Narrative', { ...SolutionNarrative }],
  ['SolutionNarrative', { ...SolutionNarrative }],
  ['Solution Pathways', { ...SolutionPathways, componentType: 'client' }],
  ['SolutionPathways', { ...SolutionPathways, componentType: 'client' }],
  ['Product Discovery', { ...ProductDiscovery, componentType: 'client' }],
  ['ProductDiscovery', { ...ProductDiscovery, componentType: 'client' }],
  ['Proof Point Counter', { ...ProofPointCounter, componentType: 'client' }],
  ['ProofPointCounter', { ...ProofPointCounter, componentType: 'client' }],
  ['Cross Navigation', { ...CrossNavigation, componentType: 'client' }],
  ['CrossNavigation', { ...CrossNavigation, componentType: 'client' }],
  ['Rich Text Block', { ...RichTextBlock }],
  ['RichTextBlock', { ...RichTextBlock }],
]);

export default componentMap;
