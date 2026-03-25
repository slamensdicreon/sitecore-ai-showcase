import {
  Text,
} from '@sitecore-content-sdk/nextjs';
import type { ComponentRendering, ComponentFields } from '@sitecore-content-sdk/nextjs';
import { tf, getFieldValue } from 'lib/field-utils';

type SolutionHeroProps = {
  rendering: ComponentRendering;
  fields: ComponentFields;
  params: Record<string, string>;
};

export default function SolutionHero({ fields, params }: SolutionHeroProps) {
  const variant = params?.FieldNames || '';
  const isMinimal = variant === 'solution-hero--minimal';
  const accentColor = getFieldValue(fields, 'Accent Color', '#f28d00');

  return (
    <section
      className={`relative ${isMinimal ? 'py-16' : 'min-h-[60vh] flex items-center'} text-white overflow-hidden`}
      data-testid="section-solution-hero"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#04215d]/90 via-[#2e4957]/85 to-[#167a87]/70 z-10" />
      <div className="absolute inset-0 bg-[#2e4957]" />

      <div className="relative z-20 max-w-[1400px] mx-auto px-4 py-16 md:py-24 w-full">
        <div className="max-w-3xl">
          <span
            className="inline-block mb-4 px-3 py-1 rounded-full border border-white/20 bg-white/10 font-heading text-xs tracking-wider uppercase"
            style={{ color: accentColor }}
            data-testid="badge-solution-industry"
          >
            <Text field={tf(fields, 'Industry Label')} />
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold leading-[1.08] mb-6" data-testid="text-solution-title">
            <Text field={tf(fields, 'Title')} />
          </h1>
          <div className="text-lg md:text-xl text-white/70 max-w-2xl leading-relaxed" data-testid="text-solution-subtitle">
            <Text field={tf(fields, 'Subtitle')} />
          </div>
          <div className="mt-8">
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
        </div>
      </div>
    </section>
  );
}
