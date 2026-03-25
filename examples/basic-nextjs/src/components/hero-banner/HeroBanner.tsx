import {
  Text,
} from '@sitecore-content-sdk/nextjs';
import type { ComponentRendering, ComponentFields } from '@sitecore-content-sdk/nextjs';
import { ArrowRight } from 'lucide-react';
import { tf, getFieldValue, getLinkHref } from 'lib/field-utils';

type HeroBannerProps = {
  rendering: ComponentRendering;
  fields: ComponentFields;
  params: Record<string, string>;
};

export const Default = ({ fields, params }: HeroBannerProps) => {
  const variant = params?.FieldNames || '';
  const isCompact = variant === 'hero--compact';

  return (
    <section
      className={`relative ${isCompact ? 'min-h-[50vh]' : 'min-h-[85vh]'} flex items-center text-white overflow-hidden`}
      data-testid="section-hero-banner"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#04215d]/90 via-[#2e4957]/85 to-[#167a87]/70 z-10" />
      <div className="absolute inset-0 bg-[#2e4957]" />

      <div className="relative z-20 max-w-[1400px] mx-auto px-4 py-20 md:py-32 w-full">
        <div className="max-w-3xl">
          {getFieldValue(fields, 'Badge Text', '') && (
            <div className="mb-6">
              <span className="inline-block px-3 py-1 rounded-full bg-[#f28d00]/20 text-[#f28d00] border border-[#f28d00]/30 backdrop-blur-sm font-heading text-xs tracking-wider uppercase" data-testid="badge-hero">
                <Text field={tf(fields, 'Badge Text')} />
              </span>
            </div>
          )}

          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold leading-[1.05] mb-6 tracking-tight"
            data-testid="text-hero-title"
          >
            <Text field={tf(fields, 'Title')} />
            {getFieldValue(fields, 'Title Accent', '') && (
              <>
                <br />
                <span className="text-[#f28d00]">
                  <Text field={tf(fields, 'Title Accent')} />
                </span>
              </>
            )}
          </h1>

          <div className="text-lg md:text-xl text-white/70 mb-10 leading-relaxed max-w-2xl" data-testid="text-hero-subtitle">
            <Text field={tf(fields, 'Subtitle')} />
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            {getFieldValue(fields, 'Primary CTA Text', '') && (
              <a href={getLinkHref(fields, 'Primary CTA Link')}>
                <button className="inline-flex items-center justify-center px-8 h-12 bg-[#f28d00] hover:bg-[#e07d00] text-white font-heading text-base rounded-md transition-colors" data-testid="button-hero-primary">
                  <Text field={tf(fields, 'Primary CTA Text')} />
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </a>
            )}
            {getFieldValue(fields, 'Secondary CTA Text', '') && (
              <a href={getLinkHref(fields, 'Secondary CTA Link')}>
                <button className="inline-flex items-center justify-center px-8 h-12 bg-white/5 border border-white/20 text-white hover:bg-white/10 font-heading text-base rounded-md backdrop-blur-sm transition-colors" data-testid="button-hero-secondary">
                  <Text field={tf(fields, 'Secondary CTA Text')} />
                </button>
              </a>
            )}
          </div>

          {getFieldValue<string>(fields, 'Show Connectivity Motif', '') === '1' && (
            <div className="mt-12 pt-8 border-t border-white/10">
              <svg className="w-48 h-6 text-white/20" viewBox="0 0 200 24">
                <circle cx="4" cy="12" r="3" fill="currentColor" />
                <line x1="7" y1="12" x2="40" y2="12" stroke="currentColor" strokeWidth="1" />
                <circle cx="43" cy="12" r="3" fill="currentColor" />
                <line x1="46" y1="12" x2="80" y2="6" stroke="currentColor" strokeWidth="1" />
                <circle cx="83" cy="6" r="3" fill="currentColor" />
                <line x1="86" y1="6" x2="120" y2="12" stroke="currentColor" strokeWidth="1" />
                <circle cx="123" cy="12" r="3" fill="currentColor" />
                <line x1="126" y1="12" x2="160" y2="18" stroke="currentColor" strokeWidth="1" />
                <circle cx="163" cy="18" r="3" fill="currentColor" />
                <line x1="166" y1="18" x2="196" y2="12" stroke="currentColor" strokeWidth="1" />
                <circle cx="199" cy="12" r="2" fill="currentColor" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
