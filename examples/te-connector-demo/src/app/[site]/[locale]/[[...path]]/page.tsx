import { isDesignLibraryPreviewData } from '@sitecore-content-sdk/nextjs/editing';
import { notFound } from 'next/navigation';
import { draftMode } from 'next/headers';
import client from 'src/lib/sitecore-client';
import Layout, { RouteFields } from 'src/Layout';
import componentMap from '.sitecore/component-map';
import Providers from 'src/Providers';

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

  const componentProps = await client.getComponentData(page.layout, {}, componentMap);

  return (
    <Providers page={page} componentProps={componentProps}>
      <Layout page={page} />
    </Providers>
  );
}

export const generateMetadata = async ({ params }: PageProps) => {
  const { path, site, locale } = await params;

  const page = await client.getPage(path ?? [], { site, locale });
  const routeFields = (page?.layout.sitecore.route?.fields ?? {}) as RouteFields;

  const title = routeFields?.pageTitle?.value?.toString() ||
    routeFields?.Title?.value?.toString() ||
    page?.layout.sitecore.route?.displayName || 'Page';

  const description = routeFields?.metadataDescription?.value?.toString() ||
    routeFields?.Description?.value?.toString() ||
    'TE Connectivity B2B e-commerce demo powered by Sitecore XM Cloud';

  return {
    title: `${title} | NXP - Sitecore AI Showcase`,
    description,
  };
};
