import type { ComponentRendering, ComponentFields } from '@sitecore-content-sdk/nextjs';
import { getChildItems } from 'lib/field-utils';
import { ProofPointCounterClient } from './ProofPointCounterClient';

type ProofPointCounterProps = {
  rendering: ComponentRendering;
  fields: ComponentFields;
  params: Record<string, string>;
};

export const Default = ({ fields, rendering, params }: ProofPointCounterProps) => {
  const items = getChildItems(rendering);

  return (
    <ProofPointCounterClient fields={fields} params={params} items={items} />
  );
};
