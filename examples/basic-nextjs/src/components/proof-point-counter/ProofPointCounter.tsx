'use client';

import {
  Text,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import type { ComponentRendering, ComponentFields } from '@sitecore-content-sdk/nextjs';
import { getChildItems, getChildFieldValue, type ChildItem } from 'src/lib/field-utils';

type ProofPointCounterProps = {
  rendering: ComponentRendering;
  fields: ComponentFields;
  params: Record<string, string>;
};

export default function ProofPointCounter({ fields, rendering }: ProofPointCounterProps) {
  const { page: { mode } } = useSitecore();
  const isEditing = mode?.isEditing === true;

  const children = getChildItems(rendering as Record<string, unknown>);

  return (
    <section className="py-16 md:py-24 bg-[#2e4957] text-white" data-testid="section-proof-points">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-[#f28d00] font-heading font-semibold text-sm tracking-wider uppercase mb-3">
            <Text field={fields?.['Section Label']} />
          </p>
          <h2 className="text-3xl md:text-4xl font-heading font-bold">
            <Text field={fields?.['Heading']} />
          </h2>
        </div>

        {children.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {children.map((item: ChildItem, i: number) => (
              <div key={item.id || i} className="text-center">
                <div className="text-3xl md:text-4xl font-heading font-bold text-[#f28d00] mb-2">
                  {getChildFieldValue(item, 'Value')}
                </div>
                <div className="text-sm font-medium text-white/80 mb-1">
                  {getChildFieldValue(item, 'Label')}
                </div>
                {getChildFieldValue(item, 'Description') && (
                  <p className="text-xs text-white/50">
                    {getChildFieldValue(item, 'Description')}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {isEditing && children.length === 0 && (
          <div className="border-2 border-dashed border-white/20 rounded-lg p-12 text-center">
            <p className="text-white/40">Add Proof Point Item children to this datasource</p>
          </div>
        )}
      </div>
    </section>
  );
}
