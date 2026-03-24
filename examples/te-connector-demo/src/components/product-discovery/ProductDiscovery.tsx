'use client';

import {
  Text,
  useSitecoreContext,
} from '@sitecore-content-sdk/nextjs';
import type { ComponentRendering, ComponentFields } from '@sitecore-content-sdk/nextjs';
import { ArrowRight } from 'lucide-react';

type ProductDiscoveryProps = {
  rendering: ComponentRendering;
  fields: ComponentFields;
  params: Record<string, string>;
};

export default function ProductDiscovery({ fields, params }: ProductDiscoveryProps) {
  const { sitecoreContext } = useSitecoreContext();
  const isEditing = sitecoreContext?.pageEditing === true;
  const variant = params?.FieldNames || '';
  const isCarousel = variant === 'discovery--carousel';
  const isCompactList = variant === 'discovery--compact';

  return (
    <section className="py-16 md:py-24 bg-gray-50" data-testid="section-product-discovery">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-[#f28d00] font-heading font-semibold text-sm tracking-wider uppercase mb-3" data-testid="text-discovery-label">
            <Text field={fields?.['Section Label']} />
          </p>
          <h2 className="text-2xl md:text-3xl font-heading font-bold mb-3" data-testid="text-discovery-heading">
            <Text field={fields?.['Heading']} />
          </h2>
          <div className="text-gray-500 max-w-xl mx-auto">
            <Text field={fields?.['Description']} />
          </div>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center bg-white">
          <p className="text-gray-500 mb-2">Product data is loaded from OrderCloud at runtime.</p>
          <p className="text-gray-400 text-sm">
            Filters: Industry = {(fields?.['Industry Filter'] as any)?.value || 'all'} |
            Application = {(fields?.['Application Filter'] as any)?.value || 'all'} |
            Max = {(fields?.['Max Products'] as any)?.value || '6'}
          </p>
        </div>

        {fields?.['CTA Text']?.value && (
          <div className="text-center mt-8">
            <a href={fields?.['CTA Link']?.value?.href || '#'}>
              <button className="inline-flex items-center justify-center px-6 h-11 bg-[#f28d00] hover:bg-[#e07d00] text-white font-heading rounded-md transition-colors" data-testid="button-discovery-cta">
                <Text field={fields['CTA Text']} />
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
