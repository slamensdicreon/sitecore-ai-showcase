import { isDesignLibraryPreviewData } from "@sitecore-content-sdk/nextjs/editing";
import { notFound } from "next/navigation";
import { draftMode } from "next/headers";
import { SiteInfo, type Page as SitecorePage } from "@sitecore-content-sdk/nextjs";
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

export default async function Page({ params, searchParams }: PageProps) {
  const { site, locale, path } = await params;
  const draft = await draftMode();

  setRequestLocale(`${site}_${locale}`);

  let page;
  if (draft.isEnabled) {
    const editingParams = await searchParams;
    if (isDesignLibraryPreviewData(editingParams)) {
      page = await client.getDesignLibraryData(editingParams);
    } else {
      page = await client.getPreview(editingParams);
    }
  } else {
    page = await client.getPage(path ?? [], { site, locale });
  }

  if (!page) {
    notFound();
  }

  const routePath = path ? `/${path.join('/')}` : '/';

  const componentProps = page.layout?.sitecore?.route
    ? await client.getComponentData(page.layout, {}, components)
    : {};

  return (
    <NextIntlClientProvider>
      <Providers page={page} componentProps={componentProps}>
        <Layout page={page} routePath={routePath} />
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
          page?.layout?.sitecore?.route?.fields as RouteFields
        )?.Title?.value?.toString() || "Page",
    };
  } catch {
    return { title: "Page" };
  }
};
