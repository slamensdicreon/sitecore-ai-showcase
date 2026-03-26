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
  ['Site Header', { ...SiteHeader }],
  ['SiteFooter', { ...SiteFooter }],
  ['Site Footer', { ...SiteFooter }],
  ['PartialDesignDynamicPlaceholder', { ...PartialDesignDynamicPlaceholder }],
  ['PartialDesign Dynamic Placeholder', { ...PartialDesignDynamicPlaceholder }],
  ['ContainerFullWidth', { ...ContainerFullWidth }],
  ['ContainerFullBleed', { ...ContainerFullBleed }],
  ['Container70', { ...Container70 }],
  ['HeroBanner', { ...HeroBanner }],
  ['Hero Banner', { ...HeroBanner }],
  ['AuthorityStats', { ...AuthorityStats }],
  ['Authority Stats', { ...AuthorityStats }],
  ['MegaTrends', { ...MegaTrends, componentType: 'client' }],
  ['Mega Trends', { ...MegaTrends, componentType: 'client' }],
  ['SolutionHero', { ...SolutionHero }],
  ['Solution Hero', { ...SolutionHero }],
  ['SolutionNarrative', { ...SolutionNarrative }],
  ['Solution Narrative', { ...SolutionNarrative }],
  ['SolutionPathways', { ...SolutionPathways }],
  ['Solution Pathways', { ...SolutionPathways }],
  ['ProductDiscovery', { ...ProductDiscovery, componentType: 'client' }],
  ['Product Discovery', { ...ProductDiscovery, componentType: 'client' }],
  ['ProofPointCounter', { ...ProofPointCounter, componentType: 'client' }],
  ['Proof Point Counter', { ...ProofPointCounter, componentType: 'client' }],
  ['CrossNavigation', { ...CrossNavigation, componentType: 'client' }],
  ['Cross Navigation', { ...CrossNavigation, componentType: 'client' }],
  ['RichTextBlock', { ...RichTextBlock }],
  ['Rich Text Block', { ...RichTextBlock }],
]);

export default componentMap;
