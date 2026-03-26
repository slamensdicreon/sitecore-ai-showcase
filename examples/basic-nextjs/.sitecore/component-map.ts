// Below are built-in components that are available in the app, it's recommended to keep them as is

import { BYOCServerWrapper, NextjsContentSdkComponent, FEaaSServerWrapper } from '@sitecore-content-sdk/nextjs';
import { Form } from '@sitecore-content-sdk/nextjs';

// end of built-in components
import { wrapSafe } from 'src/lib/safe-component';
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
  ['Container', wrapSafe('Container', Container)],
  ['ColumnSplitter', wrapSafe('ColumnSplitter', ColumnSplitter)],
  ['Column Splitter', wrapSafe('ColumnSplitter', ColumnSplitter)],
  ['SiteHeader', wrapSafe('SiteHeader', SiteHeader)],
  ['Site Header', wrapSafe('SiteHeader', SiteHeader)],
  ['SiteFooter', wrapSafe('SiteFooter', SiteFooter)],
  ['Site Footer', wrapSafe('SiteFooter', SiteFooter)],
  ['PartialDesignDynamicPlaceholder', wrapSafe('PartialDesignDynamicPlaceholder', PartialDesignDynamicPlaceholder)],
  ['Partial Design Dynamic Placeholder', wrapSafe('PartialDesignDynamicPlaceholder', PartialDesignDynamicPlaceholder)],
  ['PartialDesign Dynamic Placeholder', wrapSafe('PartialDesignDynamicPlaceholder', PartialDesignDynamicPlaceholder)],
  ['ContainerFullWidth', wrapSafe('ContainerFullWidth', ContainerFullWidth)],
  ['Container Full Width', wrapSafe('ContainerFullWidth', ContainerFullWidth)],
  ['ContainerFullBleed', wrapSafe('ContainerFullBleed', ContainerFullBleed)],
  ['Container Full Bleed', wrapSafe('ContainerFullBleed', ContainerFullBleed)],
  ['Container70', wrapSafe('Container70', Container70)],
  ['HeroBanner', wrapSafe('HeroBanner', HeroBanner)],
  ['Hero Banner', wrapSafe('HeroBanner', HeroBanner)],
  ['AuthorityStats', wrapSafe('AuthorityStats', AuthorityStats)],
  ['Authority Stats', wrapSafe('AuthorityStats', AuthorityStats)],
  ['MegaTrends', wrapSafe('MegaTrends', MegaTrends)],
  ['Mega Trends', wrapSafe('MegaTrends', MegaTrends)],
  ['SolutionHero', wrapSafe('SolutionHero', SolutionHero)],
  ['Solution Hero', wrapSafe('SolutionHero', SolutionHero)],
  ['SolutionNarrative', wrapSafe('SolutionNarrative', SolutionNarrative)],
  ['Solution Narrative', wrapSafe('SolutionNarrative', SolutionNarrative)],
  ['SolutionPathways', wrapSafe('SolutionPathways', SolutionPathways)],
  ['Solution Pathways', wrapSafe('SolutionPathways', SolutionPathways)],
  ['ProductDiscovery', { ...wrapSafe('ProductDiscovery', ProductDiscovery), componentType: 'client' }],
  ['Product Discovery', { ...wrapSafe('ProductDiscovery', ProductDiscovery), componentType: 'client' }],
  ['ProofPointCounter', wrapSafe('ProofPointCounter', ProofPointCounter)],
  ['Proof Point Counter', wrapSafe('ProofPointCounter', ProofPointCounter)],
  ['CrossNavigation', wrapSafe('CrossNavigation', CrossNavigation)],
  ['Cross Navigation', wrapSafe('CrossNavigation', CrossNavigation)],
  ['RichTextBlock', wrapSafe('RichTextBlock', RichTextBlock)],
  ['Rich Text Block', wrapSafe('RichTextBlock', RichTextBlock)],
]);

export default componentMap;
