import {
  Text,
} from '@sitecore-content-sdk/nextjs';
import type { ComponentRendering, ComponentFields } from '@sitecore-content-sdk/nextjs';
import { ChevronRight } from 'lucide-react';
import { tf, getChildItems, getChildFieldValue, getChildLinkHref, type ChildItem } from 'lib/field-utils';

type SolutionPathwaysProps = {
  rendering: ComponentRendering;
  fields: ComponentFields;
  params: Record<string, string>;
};

export const Default = ({ fields, rendering, params }: SolutionPathwaysProps) => {
  const variant = params?.FieldNames || '';
  const isLight = variant === 'pathways--light';

  const children = getChildItems(rendering);

  return (
    <section
      className={`${isLight ? 'bg-white' : 'bg-[#2e4957] text-white'} py-20 md:py-24 relative overflow-hidden`}
      data-testid="section-solution-pathways"
    >
      {!isLight && (
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-[#f28d00]/5 blur-3xl" />
      )}
      <div className="max-w-[1400px] mx-auto px-4 relative">
        <div className="text-center mb-14">
          <p className="text-[#f28d00] font-heading font-semibold text-sm tracking-wider uppercase mb-3" data-testid="text-pathways-label">
            <Text field={tf(fields, 'Section Label')} />
          </p>
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4" data-testid="text-pathways-title">
            <Text field={tf(fields, 'Heading')} />
          </h2>
          <div className={isLight ? 'text-gray-500' : 'text-white/75'}>
            <Text field={tf(fields, 'Description')} />
          </div>
        </div>

        {children.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 max-w-4xl mx-auto">
            {children.map((card: ChildItem, i: number) => {
              const href = getChildLinkHref(card, 'Link');
              return (
                <a key={card.id || i} href={href} className="block">
                  <div className={`group cursor-pointer rounded-lg border p-6 transition-all duration-300 ${
                    isLight
                      ? 'border-gray-200 bg-gray-50/50 hover:bg-gray-100/60'
                      : 'border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/20'
                  }`} data-testid={`card-pathway-${i}`}>
                    <div className="flex items-start justify-between mb-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] bg-[#f28d00]/20 text-[#f28d00] border border-[#f28d00]/30">
                        {getChildFieldValue(card, 'Industry Label')}
                      </span>
                      <ChevronRight className={`h-4 w-4 group-hover:translate-x-1 transition-all ${
                        isLight ? 'text-gray-400 group-hover:text-[#f28d00]' : 'text-white/30 group-hover:text-[#f28d00]'
                      }`} />
                    </div>
                    <h3 className="text-lg font-heading font-semibold mb-2 group-hover:text-[#f28d00] transition-colors">
                      &ldquo;{getChildFieldValue(card, 'Question')}&rdquo;
                    </h3>
                    <p className={`text-sm leading-relaxed ${isLight ? 'text-gray-500' : 'text-white/70'}`}>
                      {getChildFieldValue(card, 'Context')}
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
