import {
  Text,
  Image as JssImage,
} from '@sitecore-content-sdk/nextjs';
import type { ComponentRendering, ComponentFields, ImageField } from '@sitecore-content-sdk/nextjs';
import { ArrowRight } from 'lucide-react';
import { tf, getFieldValue, getLinkHref, getChildItems, getChildFieldValue } from 'lib/field-utils';

type ProductDiscoveryProps = {
  rendering: ComponentRendering;
  fields: ComponentFields;
  params: Record<string, string>;
};

export const Default = ({ rendering, fields, params }: ProductDiscoveryProps) => {
  const variant = params?.FieldNames || '';
  const isCarousel = variant === 'discovery--carousel';
  const isCompactList = variant === 'discovery--compact';

  const items = getChildItems(rendering);

  return (
    <section className="py-16 md:py-24 bg-gray-50" data-testid="section-product-discovery">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-[#f28d00] font-heading font-semibold text-sm tracking-wider uppercase mb-3" data-testid="text-discovery-label">
            <Text field={tf(fields, 'Section Label')} />
          </p>
          <h2 className="text-2xl md:text-3xl font-heading font-bold mb-3" data-testid="text-discovery-heading">
            <Text field={tf(fields, 'Heading')} />
          </h2>
          <div className="text-gray-500 max-w-xl mx-auto">
            <Text field={tf(fields, 'Description')} />
          </div>
        </div>

        {items.length > 0 ? (
          <div className={
            isCarousel
              ? 'flex gap-4 overflow-x-auto pb-4'
              : isCompactList
              ? 'space-y-3'
              : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
          }>
            {items.map((item, idx) => {
              const name = getChildFieldValue(item, 'Name');
              const sku = getChildFieldValue(item, 'SKU');
              const description = getChildFieldValue(item, 'Description');
              const price = getChildFieldValue(item, 'Price');
              const category = getChildFieldValue(item, 'Category');
              const image = item.fields?.['Image'] as ImageField | undefined;
              const hasImage = !!(image?.value?.src);

              return (
                <div
                  key={item.id || idx}
                  className={`hover-elevate cursor-pointer h-full rounded-lg border border-gray-200 bg-white ${isCarousel ? 'min-w-[300px]' : ''}`}
                  data-testid={`card-product-${sku || idx}`}
                >
                  <div className={isCompactList ? 'p-4 flex items-center gap-4' : 'p-5'}>
                    {!isCompactList && hasImage && (
                      <div className="h-32 flex items-center justify-center mb-3 bg-gray-50 rounded-lg">
                        <JssImage
                          field={image}
                          className="h-24 w-auto object-contain"
                          data-testid={`img-product-${sku || idx}`}
                        />
                      </div>
                    )}
                    <div>
                      <h3 className="font-heading font-semibold text-sm mb-1" data-testid={`text-product-name-${idx}`}>{name}</h3>
                      <p className="text-xs text-gray-400 mb-2" data-testid={`text-product-sku-${idx}`}>{sku}</p>
                      <p className="text-sm text-gray-500 line-clamp-2">{description}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-[#2e4957] font-heading font-bold" data-testid={`text-product-price-${idx}`}>{price}</span>
                        {category && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-[#167a87]/10 text-[#167a87]">
                            {category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center bg-white">
            <p className="text-gray-500 mb-2" data-testid="text-no-products">
              No product cards assigned. Use the Multilist field to select products.
            </p>
            <p className="text-gray-400 text-sm">
              Add Product Card items to this component using the Items field in the content editor.
            </p>
          </div>
        )}

        {getFieldValue(fields, 'CTA Text', '') && (
          <div className="text-center mt-8">
            <a href={getLinkHref(fields, 'CTA Link')}>
              <button className="inline-flex items-center justify-center px-6 h-11 bg-[#f28d00] hover:bg-[#e07d00] text-white font-heading rounded-md transition-colors" data-testid="button-discovery-cta">
                <Text field={tf(fields, 'CTA Text')} />
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </a>
          </div>
        )}
      </div>
    </section>
  );
};
