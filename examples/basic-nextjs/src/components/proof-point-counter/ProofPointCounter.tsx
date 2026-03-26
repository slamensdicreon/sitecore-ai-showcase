import type { ComponentRendering, ComponentFields } from '@sitecore-content-sdk/nextjs';
import { getChildItems } from 'lib/field-utils';
import { fetchDatasourceChildren } from 'lib/edge-children';
import { ProofPointCounterClient } from './ProofPointCounterClient';

type ProofPointCounterProps = {
  rendering: ComponentRendering;
  fields: ComponentFields;
  params: Record<string, string>;
};

export const Default = async ({ fields, rendering, params }: ProofPointCounterProps) => {
  const language = params?.sc_lang || 'en';

  let items = getChildItems(rendering);
  if (items.length === 0 && rendering?.dataSource) {
    items = await fetchDatasourceChildren(rendering.dataSource, language);
  }

  return (
    <ProofPointCounterClient fields={fields} params={params} items={items} />
  );
};
