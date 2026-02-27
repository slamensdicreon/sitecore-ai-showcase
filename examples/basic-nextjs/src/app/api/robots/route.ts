import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * API route for serving robots.txt
 *
 * This Next.js API route handler generates and returns the robots.txt content dynamically
 * based on the resolved site name. It is commonly
 * used by search engine crawlers to determine crawl and indexing rules.
 */

export async function GET(request: NextRequest) {
  try {
    const { createRobotsRouteHandler } = await import(
      '@sitecore-content-sdk/nextjs/route-handler'
    );
    const sites = (await import('.sitecore/sites.json')).default;
    const client = (await import('lib/sitecore-client')).default;

    if (!client) {
      throw new Error('SitecoreClient not configured');
    }

    const handler = createRobotsRouteHandler({ client, sites });
    return handler.GET(request);
  } catch {
    return new NextResponse('User-agent: *\nDisallow:\n', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}
