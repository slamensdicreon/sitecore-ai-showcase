'use client';

import {
  Text,
  RichText,
  useSitecoreContext,
} from '@sitecore-content-sdk/nextjs';
import type { ComponentRendering, ComponentFields } from '@sitecore-content-sdk/nextjs';

type SolutionNarrativeProps = {
  rendering: ComponentRendering;
  fields: ComponentFields;
  params: Record<string, string>;
};

export default function SolutionNarrative({ fields, params }: SolutionNarrativeProps) {
  const variant = params?.FieldNames || '';
  const isTwoCol = variant === 'narrative--two-col';
  const isAccentLeft = variant === 'narrative--accent-left';

  return (
    <section className="py-16 md:py-24 bg-white" data-testid="section-solution-narrative">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className={isAccentLeft ? 'border-l-4 border-[#f28d00] pl-8' : ''}>
          <p className="text-[#f28d00] font-heading font-semibold text-sm tracking-wider uppercase mb-3" data-testid="text-narrative-label">
            <Text field={fields?.['Section Label']} />
          </p>
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6" data-testid="text-narrative-heading">
            <Text field={fields?.['Heading']} />
          </h2>
        </div>
        <div className={isTwoCol ? 'grid grid-cols-1 md:grid-cols-2 gap-8 mt-8' : 'mt-8 max-w-3xl'}>
          <div className="text-lg text-gray-500 leading-relaxed" data-testid="text-narrative-lead">
            <Text field={fields?.['Lead Text']} />
          </div>
          <div className="prose prose-sm max-w-none" data-testid="text-narrative-body">
            <RichText field={fields?.['Body']} />
          </div>
        </div>
      </div>
    </section>
  );
}
