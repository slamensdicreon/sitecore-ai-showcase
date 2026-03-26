// Below are built-in components that are available in the app, it's recommended to keep them as is

import { BYOCServerWrapper, NextjsContentSdkComponent, FEaaSServerWrapper } from '@sitecore-content-sdk/nextjs';
import { Form } from '@sitecore-content-sdk/nextjs';

// end of built-in components
import * as Container from 'src/components/sxa/Container';
import * as ColumnSplitter from 'src/components/sxa/ColumnSplitter';
import * as SiteHeader from 'src/components/site-header/SiteHeader';
import * as SiteFooter from 'src/components/site-footer/SiteFooter';
import * as PartialDesignDynamicPlaceholder from 'src/components/partial-design-dynamic-placeholder/PartialDesignDynamicPlaceholder';
import * as ContainerFullWidth from 'src/components/container/container-full-width/ContainerFullWidth';
import * as ContainerFullBleed from 'src/components/container/container-full-bleed/ContainerFullBleed';
import * as Container70 from 'src/components/container/container-70/Container70';
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
  ['Container', { ...Container }],
  ['ColumnSplitter', { ...ColumnSplitter }],
  ['SiteHeader', { ...SiteHeader }],
  ['SiteFooter', { ...SiteFooter }],
  ['PartialDesignDynamicPlaceholder', { ...PartialDesignDynamicPlaceholder }],
  ['ContainerFullWidth', { ...ContainerFullWidth }],
  ['ContainerFullBleed', { ...ContainerFullBleed }],
  ['Container70', { ...Container70 }],
  ['HeroBanner', { ...HeroBanner }],
  ['AuthorityStats', { ...AuthorityStats }],
  ['MegaTrends', { ...MegaTrends, componentType: 'client' }],
  ['SolutionHero', { ...SolutionHero }],
  ['SolutionNarrative', { ...SolutionNarrative }],
  ['SolutionPathways', { ...SolutionPathways }],
  ['ProductDiscovery', { ...ProductDiscovery, componentType: 'client' }],
  ['ProofPointCounter', { ...ProofPointCounter, componentType: 'client' }],
  ['CrossNavigation', { ...CrossNavigation, componentType: 'client' }],
  ['RichTextBlock', { ...RichTextBlock }],
]);

export default componentMap;
