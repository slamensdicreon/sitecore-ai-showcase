'use client';

import { BYOCClientWrapper, NextjsContentSdkComponent, FEaaSClientWrapper } from '@sitecore-content-sdk/nextjs';
import { Form } from '@sitecore-content-sdk/nextjs';

import * as ProductDiscovery from 'src/components/product-discovery/ProductDiscovery';

export const componentMap = new Map<string, NextjsContentSdkComponent>([
  ['BYOCWrapper', BYOCClientWrapper],
  ['FEaaSWrapper', FEaaSClientWrapper],
  ['Form', Form],
  ['ProductDiscovery', { ...ProductDiscovery }],
  ['Product Discovery', { ...ProductDiscovery }],
]);

export default componentMap;
