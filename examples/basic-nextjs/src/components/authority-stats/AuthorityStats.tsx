import type { ComponentRendering, ComponentFields } from '@sitecore-content-sdk/nextjs';
import { getChildItems } from 'lib/field-utils';
import { AuthorityStatsClient } from './AuthorityStatsClient';

type AuthorityStatsProps = {
  rendering: ComponentRendering;
  fields: ComponentFields;
  params: Record<string, string>;
};

export const Default = ({ fields, rendering, params }: AuthorityStatsProps) => {
  const items = getChildItems(rendering);

  return (
    <AuthorityStatsClient fields={fields} params={params} items={items} />
  );
};
