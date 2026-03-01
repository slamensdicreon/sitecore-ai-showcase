import { isDesignLibraryPreviewData } from "@sitecore-content-sdk/nextjs/editing";
import { notFound } from "next/navigation";
import { draftMode } from "next/headers";
import { SiteInfo } from "@sitecore-content-sdk/nextjs";
import sites from ".sitecore/sites.json";
import { routing } from "src/i18n/routing";
import scConfig from "sitecore.config";
import client from "src/lib/sitecore-client";
import Layout, { RouteFields } from "src/Layout";
import components from ".sitecore/component-map";
import Providers from "src/Providers";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{
    site: string;
    locale: string;
    path?: string[];
    [key: string]: string | string[] | undefined;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

function EditingErrorFallback({ error }: { error: string }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '8px', padding: '24px' }}>
          <h2 style={{ color: '#991B1B', margin: '0 0 12px 0' }}>Editing Preview Error</h2>
          <p style={{ color: '#7F1D1D', margin: '0 0 16px 0' }}>{error}</p>
          <div style={{ background: '#FFF', borderRadius: '4px', padding: '16px', fontSize: '14px', color: '#374151' }}>
            <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>Troubleshooting steps:</p>
            <ol style={{ margin: 0, paddingLeft: '20px' }}>
              <li>Open Content Editor in Sitecore</li>
              <li>Select the Home item and all child pages</li>
              <li>Publish &gt; Publish Item (including subitems) to Experience Edge</li>
              <li>Wait 2-3 minutes for Edge propagation</li>
              <li>Reload this page in Pages Editor</li>
            </ol>
          </div>
        </div>
      </body>
    </html>
  );
}

export default async function Page({ params, searchParams }: PageProps) {
  const { site, locale, path } = await params;
  const draft = await draftMode();

  setRequestLocale(`${site}_${locale}`);

  let page;
  if (draft.isEnabled) {
    const editingParams = await searchParams;
    try {
      if (isDesignLibraryPreviewData(editingParams)) {
        page = await client.getDesignLibraryData(editingParams);
      } else {
        page = await client.getPreview(editingParams);
      }
    } catch (err) {
      console.error('[NovaTech] Editing preview failed:', err);
      return (
        <EditingErrorFallback
          error="The Preview Edge endpoint returned empty layout data. This usually means the content has not been published to Experience Edge yet."
        />
      );
    }

    if (page && (!page.layout?.sitecore?.context)) {
      console.error('[NovaTech] Editing preview returned malformed layout data — missing sitecore.context');
      return (
        <EditingErrorFallback
          error="The editing data returned from Experience Edge is incomplete (missing layout context). Please republish all content to Experience Edge from the Content Editor."
        />
      );
    }
  } else {
    page = await client.getPage(path ?? [], { site, locale });
  }

  if (!page) {
    notFound();
  }

  const componentProps = await client.getComponentData(
    page.layout,
    {},
    components
  );

  return (
    <NextIntlClientProvider>
      <Providers page={page} componentProps={componentProps}>
        <Layout page={page} />
      </Providers>
    </NextIntlClientProvider>
  );
}

export const generateStaticParams = async () => {
  try {
    if (process.env.NODE_ENV !== "development" && scConfig.generateStaticPaths) {
      const defaultSite = scConfig.defaultSite;
      const allowedSites = defaultSite
        ? sites
            .filter((site: SiteInfo) => site.name === defaultSite)
            .map((site: SiteInfo) => site.name)
        : sites.map((site: SiteInfo) => site.name);
      return await client.getAppRouterStaticParams(
        allowedSites,
        routing.locales.slice()
      );
    }
  } catch {
  }
  return [];
};

export const generateMetadata = async ({ params }: PageProps) => {
  try {
    const { path, site, locale } = await params;

    const page = await client.getPage(path ?? [], { site, locale });
    return {
      title:
        (
          page?.layout.sitecore.route?.fields as RouteFields
        )?.Title?.value?.toString() || "Page",
    };
  } catch {
    return { title: "Page" };
  }
};
