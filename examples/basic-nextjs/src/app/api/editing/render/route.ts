import { createEditingRenderRouteHandlers } from '@sitecore-content-sdk/nextjs/route-handler';
import { type NextRequest } from 'next/server';

const handlers = createEditingRenderRouteHandlers({
  resolvePageUrl: (route: string) => {
    console.log('[NovaTech][Render] resolvePageUrl called with route:', route);
    if (route.startsWith('http://') || route.startsWith('https://')) {
      console.log('[NovaTech][Render] Route is already absolute, returning as-is');
      return route;
    }
    const base = process.env.SITECORE
      ? 'http://localhost:3000'
      : `http://localhost:${process.env.PORT || '3000'}`;
    const resolved = `${base}${route}`;
    console.log('[NovaTech][Render] Resolved page URL:', resolved);
    return resolved;
  },
});

export const GET = handlers.GET;
export const OPTIONS = handlers.OPTIONS;

export async function POST(request: NextRequest) {
  console.log('[NovaTech][Render] POST received. URL:', request.url);
  console.log('[NovaTech][Render] Content-Type:', request.headers.get('content-type'));
  try {
    const response = await handlers.POST(request);
    console.log('[NovaTech][Render] POST response status:', response.status);
    return response;
  } catch (err) {
    console.error('[NovaTech][Render] POST handler error:', err);
    throw err;
  }
}
