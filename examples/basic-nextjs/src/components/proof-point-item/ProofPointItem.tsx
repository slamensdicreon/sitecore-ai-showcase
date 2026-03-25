'use client';

import { Text } from '@sitecore-content-sdk/nextjs';
import type { ComponentRendering, ComponentFields } from '@sitecore-content-sdk/nextjs';
import { getFieldValue } from 'src/lib/field-utils';

type ProofPointItemProps = {
  rendering: ComponentRendering;
  fields: ComponentFields;
  params: Record<string, string>;
};

export default function ProofPointItem({ fields }: ProofPointItemProps) {
  const descriptionValue = getFieldValue(fields, 'Description', '');

  return (
    <div className="text-center" data-testid="proof-point-item">
      <div className="text-3xl md:text-4xl font-heading font-bold text-[#f28d00] mb-2">
        <Text field={fields?.['Value']} />
      </div>
      <div className="text-sm font-medium text-white/80 mb-1">
        <Text field={fields?.['Label']} />
      </div>
      {descriptionValue && (
        <p className="text-xs text-white/50">
          <Text field={fields?.['Description']} />
        </p>
      )}
    </div>
  );
}
