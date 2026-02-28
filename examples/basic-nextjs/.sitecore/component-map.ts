// Below are built-in components that are available in the app, it's recommended to keep them as is

import { BYOCServerWrapper, NextjsContentSdkComponent, FEaaSServerWrapper } from '@sitecore-content-sdk/nextjs';
import { Form } from '@sitecore-content-sdk/nextjs';

// end of built-in components
import * as Testimonial from 'src/components/testimonial/Testimonial';
import * as Container from 'src/components/sxa/Container';
import * as ColumnSplitter from 'src/components/sxa/ColumnSplitter';
import * as SiteHeader from 'src/components/site-header/SiteHeader';
import * as SiteFooter from 'src/components/site-footer/SiteFooter';
import * as PartialDesignDynamicPlaceholder from 'src/components/partial-design-dynamic-placeholder/PartialDesignDynamicPlaceholder';
import * as Hero from 'src/components/hero/Hero';
import * as FeatureCard from 'src/components/feature-card/FeatureCard';
import * as CTABanner from 'src/components/cta-banner/CTABanner';
import * as ContentBlock from 'src/components/content-block/ContentBlock';
import * as ContainerFullWidth from 'src/components/container/container-full-width/ContainerFullWidth';
import * as ContainerFullBleed from 'src/components/container/container-full-bleed/ContainerFullBleed';
import * as Container70 from 'src/components/container/container-70/Container70';
import * as ProductHero from 'src/components/product-hero/ProductHero';
import * as ProductFeature from 'src/components/product-feature/ProductFeature';
import * as PricingTable from 'src/components/pricing-table/PricingTable';

export const componentMap = new Map<string, NextjsContentSdkComponent>([
  ['BYOCWrapper', BYOCServerWrapper],
  ['FEaaSWrapper', FEaaSServerWrapper],
  ['Form', { ...Form, componentType: 'client' }],
  ['Testimonial', { ...Testimonial }],
  ['Container', { ...Container }],
  ['ColumnSplitter', { ...ColumnSplitter }],
  ['SiteHeader', { ...SiteHeader }],
  ['SiteFooter', { ...SiteFooter }],
  ['PartialDesignDynamicPlaceholder', { ...PartialDesignDynamicPlaceholder }],
  ['Hero', { ...Hero }],
  ['FeatureCard', { ...FeatureCard }],
  ['CTABanner', { ...CTABanner }],
  ['ContentBlock', { ...ContentBlock }],
  ['ContainerFullWidth', { ...ContainerFullWidth }],
  ['ContainerFullBleed', { ...ContainerFullBleed }],
  ['Container70', { ...Container70 }],
  ['ProductHero', { ...ProductHero }],
  ['ProductFeature', { ...ProductFeature }],
  ['PricingTable', { ...PricingTable }],
]);

export default componentMap;
