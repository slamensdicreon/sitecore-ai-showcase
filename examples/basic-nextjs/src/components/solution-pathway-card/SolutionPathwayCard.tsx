'use client';

import { Text } from '@sitecore-content-sdk/nextjs';
import type { ComponentRendering, ComponentFields } from '@sitecore-content-sdk/nextjs';
import { ChevronRight } from 'lucide-react';

type SolutionPathwayCardProps = {
  rendering: ComponentRendering;
  fields: ComponentFields;
  params: Record<string, string>;
};

export default function SolutionPathwayCard({ fields }: SolutionPathwayCardProps) {
  const href = fields?.['Link']?.value?.href || '#';

  return (
    <a href={href} className="block">
      <div className="group cursor-pointer rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 p-6 transition-all duration-300" data-testid="card-solution-pathway">
        <div className="flex items-start justify-between mb-3">
          <span className="inline-block px-2 py-0.5 rounded text-[10px] bg-[#f28d00]/20 text-[#f28d00] border border-[#f28d00]/30">
            <Text field={fields?.['Industry Label']} />
          </span>
          <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-[#f28d00] group-hover:translate-x-1 transition-all" />
        </div>
        <h3 className="text-lg font-heading font-semibold mb-2 group-hover:text-[#f28d00] transition-colors">
          &ldquo;<Text field={fields?.['Question']} />&rdquo;
        </h3>
        <p className="text-sm leading-relaxed text-white/70">
          <Text field={fields?.['Context']} />
        </p>
      </div>
    </a>
  );
}
