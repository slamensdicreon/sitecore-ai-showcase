import { createEditingRenderRouteHandlers } from '@sitecore-content-sdk/nextjs/route-handler';
import components from '.sitecore/component-map';
import clientComponents from '.sitecore/component-map.client';

export const { GET, POST, OPTIONS } = createEditingRenderRouteHandlers({
  components,
  clientComponents,
});
