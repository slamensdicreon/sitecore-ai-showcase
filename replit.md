# Sitecore XM Cloud Front End Starter Kits

## Project Overview
This is the official Sitecore XM Cloud Front End Starter Kits repository. It contains multiple Next.js starter applications for building headless front-end apps powered by Sitecore XM Cloud.

## Active Application
The configured workflow runs the **basic-nextjs** example (`examples/basic-nextjs`), which is a Next.js 15 App Router application using the Sitecore Content SDK.

## Repository Structure
- `/examples/basic-nextjs` - Next.js App Router starter (active, runs on port 5000)
- `/examples/basic-nextjs-pages-router` - Next.js Pages Router starter
- `/examples/basic-spa` - SPA starter with Node proxy
- `/examples/kit-nextjs-article-starter` - Article site kit
- `/examples/kit-nextjs-location-finder` - Location finder kit
- `/examples/kit-nextjs-product-listing` - Product listing kit
- `/examples/kit-nextjs-skate-park` - Skate park demo kit
- `/authoring` - Sitecore content item definitions (.NET/C# project)
- `/local-containers` - Docker configuration for local dev

## Tech Stack
- **Runtime**: Node.js 20
- **Framework**: Next.js 15.5 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **CMS**: Sitecore XM Cloud (requires external credentials)
- **i18n**: next-intl

## Running the App
```
cd examples/basic-nextjs && npm run next:dev -- -p 5000 -H 0.0.0.0
```

## Sitecore XM Cloud Configuration
The app requires Sitecore XM Cloud credentials to serve real content. Without them, it starts up but returns 500 errors on page load (GraphQL calls to Sitecore fail).

Configure credentials in `examples/basic-nextjs/.env.local`:
```
SITECORE_EDGE_CONTEXT_ID=<your-context-id>
NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID=<your-context-id>
NEXT_PUBLIC_DEFAULT_SITE_NAME=<your-site-name>
```

## Key Configuration Changes Made
- `examples/basic-nextjs/next.config.ts`: Added `allowedDevOrigins` for Replit proxy compatibility
- `examples/basic-nextjs/sitecore.config.ts`: Uses graceful fallback (`not-configured`) when no Sitecore credentials are set

## Deployment
- Target: Autoscale
- Build: `cd examples/basic-nextjs && npm run next:build`
- Run: `cd examples/basic-nextjs && npm run next:start -- -p 5000 -H 0.0.0.0`
