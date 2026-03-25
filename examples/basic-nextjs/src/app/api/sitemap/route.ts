import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * API route for generating sitemap.xml
 *
 * This Next.js API route handler dynamically generates and serves the sitemap XML for your site.
 * The sitemap configuration can be managed within XM Cloud.
 */

export async function GET(request: NextRequest) {
  try {
    const { createSitemapRouteHandler } = await import(
      '@sitecore-content-sdk/nextjs/route-handler'
    );
    const sites = (await import('.sitecore/sites.json')).default;
    const client = (await import('lib/sitecore-client')).default;

    if (!client) {
      throw new Error('SitecoreClient not configured');
    }

    const handler = createSitemapRouteHandler({ client, sites });
    return handler.GET(request);
  } catch {
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>',
      {
        status: 200,
        headers: { 'Content-Type': 'application/xml' },
      }
    );
  }
}
