'use client';

import { BYOCClientWrapper, NextjsContentSdkComponent, FEaaSClientWrapper } from '@sitecore-content-sdk/nextjs';
import { Form } from '@sitecore-content-sdk/nextjs';

import * as MegaTrends from 'src/components/mega-trends/MegaTrends';
import * as ProductDiscovery from 'src/components/product-discovery/ProductDiscovery';
import * as ProofPointCounter from 'src/components/proof-point-counter/ProofPointCounter';
import * as CrossNavigation from 'src/components/cross-navigation/CrossNavigation';

export const componentMap = new Map<string, NextjsContentSdkComponent>([
  ['BYOCWrapper', BYOCClientWrapper],
  ['FEaaSWrapper', FEaaSClientWrapper],
  ['Form', Form],
  ['Mega Trends', { ...MegaTrends }],
  ['MegaTrends', { ...MegaTrends }],
  ['Product Discovery', { ...ProductDiscovery }],
  ['ProductDiscovery', { ...ProductDiscovery }],
  ['Proof Point Counter', { ...ProofPointCounter }],
  ['ProofPointCounter', { ...ProofPointCounter }],
  ['Cross Navigation', { ...CrossNavigation }],
  ['CrossNavigation', { ...CrossNavigation }],
]);

export default componentMap;
