import type { ComponentRendering, ComponentFields } from '@sitecore-content-sdk/nextjs';
import { getChildItems, type ChildItem } from 'lib/field-utils';
import { fetchDatasourceChildren } from 'lib/edge-children';
import { AuthorityStatsClient } from './AuthorityStatsClient';

type AuthorityStatsProps = {
  rendering: ComponentRendering;
  fields: ComponentFields;
  params: Record<string, string>;
};

export const Default = async ({ fields, rendering, params }: AuthorityStatsProps) => {
  const language = params?.sc_lang || 'en';

  let children = getChildItems(rendering);
  if (children.length === 0 && rendering?.dataSource) {
    children = await fetchDatasourceChildren(rendering.dataSource, language);
  }

  return (
    <AuthorityStatsClient fields={fields} params={params} children={children} />
  );
};
