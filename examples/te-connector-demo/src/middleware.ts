import { type NextRequest, type NextFetchEvent } from 'next/server';
import {
  defineMiddleware,
  AppRouterMultisiteMiddleware,
  RedirectsMiddleware,
  LocaleMiddleware,
} from '@sitecore-content-sdk/nextjs/middleware';
import sites from '.sitecore/sites.json';
import scConfig from 'sitecore.config';

const locale = new LocaleMiddleware({
  sites,
  locales: ['en'],
  skip: () => false,
});

const multisite = new AppRouterMultisiteMiddleware({
  sites,
  ...scConfig.api.edge,
  ...scConfig.multisite,
  skip: () => false,
});

const redirects = new RedirectsMiddleware({
  sites,
  ...scConfig.api.edge,
  ...scConfig.redirects,
  ...scConfig.api.local,
  skip: () => false,
});

export function middleware(req: NextRequest, ev: NextFetchEvent) {
  return defineMiddleware(locale, multisite, redirects).exec(req, ev);
}

export const config = {
  matcher: [
    '/',
    '/((?!api/|sitemap|robots|_next/|healthz|sitecore/api/|-/|favicon.ico).*)',
  ],
};
