import { NextjsContentSdkComponent } from '@sitecore-content-sdk/nextjs';
import componentMap from '.sitecore/component-map';

const spacedAliases: [string, string][] = [
  ['PartialDesign Dynamic Placeholder', 'PartialDesignDynamicPlaceholder'],
  ['Site Header', 'SiteHeader'],
  ['Site Footer', 'SiteFooter'],
];

for (const [spacedName, pascalName] of spacedAliases) {
  const existing = componentMap.get(pascalName);
  if (existing && !componentMap.has(spacedName)) {
    componentMap.set(spacedName, existing);
  }
}

export { componentMap };
export default componentMap;
