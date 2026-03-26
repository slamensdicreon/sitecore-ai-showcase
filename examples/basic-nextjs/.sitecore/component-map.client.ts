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
  ['MegaTrends', { ...MegaTrends }],
  ['Mega Trends', { ...MegaTrends }],
  ['ProductDiscovery', { ...ProductDiscovery }],
  ['Product Discovery', { ...ProductDiscovery }],
  ['ProofPointCounter', { ...ProofPointCounter }],
  ['Proof Point Counter', { ...ProofPointCounter }],
  ['CrossNavigation', { ...CrossNavigation }],
  ['Cross Navigation', { ...CrossNavigation }],
]);

export default componentMap;
