// Server-side import map for Design Library rendering
// This variant excludes client-only hooks (useEffect) and browser APIs (pageView)
import { combineImportEntries, defaultImportEntries } from '@sitecore-content-sdk/nextjs/codegen';

import React from 'react';
import { Text, RichText, Image, Link, AppPlaceholder, useSitecore, CdpHelper } from '@sitecore-content-sdk/nextjs';
import componentMap from '.sitecore/component-map';
import client from 'src/lib/sitecore-client';
import config from 'sitecore.config';

const importMap = [
  {
    module: 'react',
    exports: [
      { name: 'default', value: React },
    ]
  },
  {
    module: '@sitecore-content-sdk/nextjs',
    exports: [
      { name: 'Text', value: Text },
      { name: 'RichText', value: RichText },
      { name: 'Image', value: Image },
      { name: 'Link', value: Link },
      { name: 'AppPlaceholder', value: AppPlaceholder },
      { name: 'useSitecore', value: useSitecore },
      { name: 'CdpHelper', value: CdpHelper },
    ]
  },
  {
    module: '.sitecore/component-map',
    exports: [
      { name: 'default', value: componentMap },
    ]
  },
  {
    module: 'src/lib/sitecore-client',
    exports: [
      { name: 'default', value: client },
    ]
  },
  {
    module: 'sitecore.config',
    exports: [
      { name: 'default', value: config },
    ]
  }
];

export default combineImportEntries(defaultImportEntries, importMap);
