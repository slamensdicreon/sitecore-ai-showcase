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

function HeroBadge({ fields }: { fields: ComponentFields }) {
  if (!getFieldValue(fields, 'Badge Text', '')) return null;
  return (
    <div className="mb-6">
      <span className="inline-block px-3 py-1 rounded-full bg-[#f28d00]/20 text-[#f28d00] border border-[#f28d00]/30 backdrop-blur-sm font-heading text-xs tracking-wider uppercase" data-testid="badge-hero">
        <Text field={tf(fields, 'Badge Text')} />
      </span>
    </div>
  );
}

function HeroTitle({ fields }: { fields: ComponentFields }) {
  return (
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
  );
}

function HeroSubtitle({ fields, className }: { fields: ComponentFields; className?: string }) {
  return (
    <div className={`text-lg md:text-xl text-white/70 mb-10 leading-relaxed ${className || 'max-w-2xl'}`} data-testid="text-hero-subtitle">
      <Text field={tf(fields, 'Subtitle')} />
    </div>
  );
}

function HeroCTAs({ fields, className }: { fields: ComponentFields; className?: string }) {
  return (
    <div className={`flex items-center gap-4 flex-wrap ${className || ''}`}>
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
  );
}

function ConnectivityMotif({ fields }: { fields: ComponentFields }) {
  if (getFieldValue<string>(fields, 'Show Connectivity Motif', '') !== '1') return null;
  return (
    <div className="mt-12 pt-8 border-t border-white/10">
      <div className="flex flex-col gap-2 w-48">
        <div className="h-1 rounded-full bg-[#f28d00]" style={{ width: '100%' }} />
        <div className="h-1 rounded-full bg-white/20" style={{ width: '80%' }} />
        <div className="h-1 rounded-full bg-[#167a87]" style={{ width: '60%' }} />
      </div>
    </div>
  );
}

function ConnectivityLines() {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 overflow-hidden h-20">
      <svg viewBox="0 0 1400 80" className="w-full h-full" preserveAspectRatio="none" aria-hidden="true">
        <line x1="0" y1="20" x2="1400" y2="20" stroke="#f28d00" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
        <line x1="0" y1="40" x2="1100" y2="40" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.12" />
        <line x1="0" y1="60" x2="800" y2="60" stroke="#167a87" strokeWidth="3" strokeLinecap="round" opacity="0.35" />
      </svg>
    </div>
  );
}

function DefaultBackground() {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-br from-[#04215d]/90 via-[#2e4957]/85 to-[#167a87]/70 z-10" />
      <div className="absolute inset-0 bg-[#2e4957]" />
      <svg className="absolute inset-0 w-full h-full opacity-[0.04] z-[1]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="hero-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-grid)" />
      </svg>
      <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-[#f28d00]/5 blur-3xl z-[2]" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full bg-[#167a87]/[0.08] blur-3xl z-[2]" />
    </>
  );
}

function matchVariant(variant: string, ...names: string[]): boolean {
  const v = variant.toLowerCase().trim();
  return names.some(n => v === n.toLowerCase());
}

export const Default = ({ fields, params }: HeroBannerProps) => {
  const variant = params?.FieldNames || '';

  if (matchVariant(variant, 'Centered', 'hero--centered')) {
    return (
      <section
        className="relative min-h-[85vh] flex items-center text-white overflow-hidden"
        data-testid="section-hero-banner"
        data-variant="centered"
      >
        <div className="absolute inset-0 bg-black z-10" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.03] z-[2]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hero-grid-centered" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid-centered)" />
        </svg>
        <div className="relative z-20 max-w-[1400px] mx-auto px-4 py-20 md:py-32 w-full text-center">
          <div className="max-w-3xl mx-auto">
            <HeroBadge fields={fields} />
            <HeroTitle fields={fields} />
            <HeroSubtitle fields={fields} className="max-w-2xl mx-auto" />
            <HeroCTAs fields={fields} className="justify-center" />
            <ConnectivityMotif fields={fields} />
          </div>
        </div>
        <ConnectivityLines />
      </section>
    );
  }

  if (matchVariant(variant, 'Right Justified', 'hero--right')) {
    return (
      <section
        className="relative min-h-[85vh] flex items-center text-white overflow-hidden"
        data-testid="section-hero-banner"
        data-variant="right"
      >
        <DefaultBackground />
        <div className="relative z-20 max-w-[1400px] mx-auto px-4 py-20 md:py-32 w-full">
          <div className="max-w-3xl ml-auto text-right">
            <HeroBadge fields={fields} />
            <HeroTitle fields={fields} />
            <HeroSubtitle fields={fields} className="max-w-2xl ml-auto" />
            <HeroCTAs fields={fields} className="justify-end" />
            <ConnectivityMotif fields={fields} />
          </div>
        </div>
        <ConnectivityLines />
      </section>
    );
  }

  const isCompact = matchVariant(variant, 'Compact', 'hero--compact');

  return (
    <section
      className={`relative ${isCompact ? 'min-h-[50vh]' : 'min-h-[85vh]'} flex items-center text-white overflow-hidden`}
      data-testid="section-hero-banner"
    >
      <DefaultBackground />
      <div className="relative z-20 max-w-[1400px] mx-auto px-4 py-20 md:py-32 w-full">
        <div className="max-w-3xl">
          <HeroBadge fields={fields} />
          <HeroTitle fields={fields} />
          <HeroSubtitle fields={fields} />
          <HeroCTAs fields={fields} />
          <ConnectivityMotif fields={fields} />
        </div>
      </div>
      <ConnectivityLines />
    </section>
  );
};
