import { createEditingConfigRouteHandler } from '@sitecore-content-sdk/nextjs/route-handler';

export const { GET } = createEditingConfigRouteHandler({
  components: async () => {
    const { componentMap } = await import('../../../../../.sitecore/component-map');
    return new Map(Object.entries(componentMap));
  },
});
