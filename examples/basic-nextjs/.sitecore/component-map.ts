// Below are built-in components that are available in the app, it's recommended to keep them as is

import { BYOCServerWrapper, NextjsContentSdkComponent, FEaaSServerWrapper } from '@sitecore-content-sdk/nextjs';
import { Form } from '@sitecore-content-sdk/nextjs';

// end of built-in components
import * as Testimonial from 'src/components/testimonial/Testimonial';
import * as SiteHeader from 'src/components/site-header/SiteHeader';
import * as SiteFooter from 'src/components/site-footer/SiteFooter';
import * as PartialDesignDynamicPlaceholder from 'src/components/partial-design-dynamic-placeholder/PartialDesignDynamicPlaceholder';
import * as Hero from 'src/components/hero/Hero';
import * as FeatureCard from 'src/components/feature-card/FeatureCard';
import * as CTABanner from 'src/components/cta-banner/CTABanner';
import * as ContentBlock from 'src/components/content-block/ContentBlock';

export const componentMap = new Map<string, NextjsContentSdkComponent>([
  ['BYOCWrapper', BYOCServerWrapper],
  ['FEaaSWrapper', FEaaSServerWrapper],
  ['Form', { ...Form, componentType: 'client' }],
  ['Testimonial', { ...Testimonial }],
  ['SiteHeader', { ...SiteHeader }],
  ['SiteFooter', { ...SiteFooter }],
  ['PartialDesignDynamicPlaceholder', { ...PartialDesignDynamicPlaceholder }],
  ['Hero', { ...Hero }],
  ['FeatureCard', { ...FeatureCard }],
  ['CTABanner', { ...CTABanner }],
  ['ContentBlock', { ...ContentBlock }],
]);

export default componentMap;
