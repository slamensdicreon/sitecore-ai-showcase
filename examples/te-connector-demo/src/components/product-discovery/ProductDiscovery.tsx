'use client';

import { useEffect, useState } from 'react';
import {
  Text,
  useSitecoreContext,
} from '@sitecore-content-sdk/nextjs';
import type { ComponentRendering, ComponentFields } from '@sitecore-content-sdk/nextjs';
import { ArrowRight } from 'lucide-react';
import { getFieldValue, getLinkHref } from 'src/lib/field-utils';

type Product = {
  id: number;
  name: string;
  sku: string;
  description: string;
  price: string;
  imageUrl: string | null;
  category: string | null;
  industry: string | null;
  application: string | null;
};

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

  const industryFilter = getFieldValue(fields, 'Industry Filter', '');
  const applicationFilter = getFieldValue(fields, 'Application Filter', '');
  const maxProducts = parseInt(getFieldValue(fields, 'Max Products', '6'), 10);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const apiBaseUrl = typeof window !== 'undefined'
    ? process.env.NEXT_PUBLIC_ORDERCLOUD_API_URL || ''
    : process.env.NEXT_PUBLIC_ORDERCLOUD_API_URL || '';

  useEffect(() => {
    if (!apiBaseUrl || isEditing) {
      setLoading(false);
      return;
    }

    const queryParams = new URLSearchParams();
    if (industryFilter) queryParams.set('industry', industryFilter);
    if (applicationFilter) queryParams.set('application', applicationFilter);
    queryParams.set('limit', String(maxProducts));

    fetch(`${apiBaseUrl}/api/products?${queryParams.toString()}`)
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [apiBaseUrl, industryFilter, applicationFilter, maxProducts, isEditing]);

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

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className={
            isCarousel
              ? 'flex gap-4 overflow-x-auto pb-4'
              : isCompactList
              ? 'space-y-3'
              : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
          }>
            {products.map((product) => (
              <div
                key={product.id}
                className={`hover-elevate cursor-pointer h-full rounded-lg border border-gray-200 bg-white ${isCarousel ? 'min-w-[300px]' : ''}`}
                data-testid={`card-product-${product.sku}`}
              >
                <div className={isCompactList ? 'p-4 flex items-center gap-4' : 'p-5'}>
                  {!isCompactList && product.imageUrl && (
                    <div className="h-32 flex items-center justify-center mb-3 bg-gray-50 rounded-lg">
                      <img src={product.imageUrl} alt={product.name} className="h-24 w-auto object-contain" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-heading font-semibold text-sm mb-1">{product.name}</h3>
                    <p className="text-xs text-gray-400 mb-2">{product.sku}</p>
                    <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[#2e4957] font-heading font-bold">${product.price}</span>
                      {product.category && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#167a87]/10 text-[#167a87]">
                          {product.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center bg-white">
            <p className="text-gray-500 mb-2">
              {isEditing
                ? 'Product data will be loaded from OrderCloud at runtime.'
                : 'No products found matching the current filters.'
              }
            </p>
            <p className="text-gray-400 text-sm">
              Filters: Industry = {industryFilter || 'all'} |
              Application = {applicationFilter || 'all'} |
              Max = {maxProducts}
            </p>
          </div>
        )}

        {getFieldValue(fields, 'CTA Text', '') && (
          <div className="text-center mt-8">
            <a href={getLinkHref(fields, 'CTA Link')}>
              <button className="inline-flex items-center justify-center px-6 h-11 bg-[#f28d00] hover:bg-[#e07d00] text-white font-heading rounded-md transition-colors" data-testid="button-discovery-cta">
                <Text field={fields?.['CTA Text']} />
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
