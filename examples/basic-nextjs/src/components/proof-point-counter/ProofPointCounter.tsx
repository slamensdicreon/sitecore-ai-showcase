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
  let children = getChildItems(rendering);
  if (children.length === 0 && rendering?.dataSource) {
    children = await fetchDatasourceChildren(rendering.dataSource);
  }

  return (
    <ProofPointCounterClient fields={fields} params={params} children={children} />
  );
};
