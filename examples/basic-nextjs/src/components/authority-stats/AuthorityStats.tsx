'use client';

import {
  Text,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import type { ComponentRendering, ComponentFields } from '@sitecore-content-sdk/nextjs';
import {
  BatteryCharging, Server, Factory, Zap, Shield, Globe, Cpu,
  Lightbulb, Box, TrendingUp, ArrowRight,
  DollarSign, MapPin, Wrench, Users,
} from 'lucide-react';
import { getChildItems, getChildFieldValue, getLinkHref, type IconMap, type ChildItem } from 'src/lib/field-utils';

const iconMap: IconMap = {
  BatteryCharging, Server, Factory, DollarSign, MapPin, Wrench, Users,
  Zap, Shield, Globe, Cpu, Lightbulb, Box, TrendingUp,
};

function getIcon(name: string) {
  return iconMap[name] || Zap;
}

type AuthorityStatsProps = {
  rendering: ComponentRendering;
  fields: ComponentFields;
  params: Record<string, string>;
};

export default function AuthorityStats({ fields, rendering, params }: AuthorityStatsProps) {
  const { page: { mode } } = useSitecore();
  const isEditing = mode?.isEditing === true;
  const variant = params?.FieldNames || '';
  const isDark = variant === 'authority--dark';

  const children = getChildItems(rendering as Record<string, unknown>);

  return (
    <section
      className={`py-20 md:py-24 ${isDark ? 'bg-[#2e4957] text-white' : 'bg-white'} relative overflow-hidden`}
      data-testid="section-authority-stats"
    >
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-[#f28d00] font-heading font-semibold text-sm tracking-wider uppercase mb-3" data-testid="text-authority-label">
            <Text field={fields?.['Section Label']} />
          </p>
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4" data-testid="text-authority-title">
            <Text field={fields?.['Heading']} />
          </h2>
          <div className={`max-w-2xl mx-auto leading-relaxed ${isDark ? 'text-white/75' : 'text-gray-500'}`}>
            <Text field={fields?.['Description']} />
          </div>
        </div>

        {children.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-10 max-w-4xl mx-auto mb-16">
            {children.map((stat: ChildItem, i: number) => {
              const Icon = getIcon(getChildFieldValue(stat, 'Icon Name'));
              const val = getChildFieldValue(stat, 'Value', '0');
              const prefix = getChildFieldValue(stat, 'Prefix');
              const suffix = getChildFieldValue(stat, 'Suffix');
              return (
                <div key={stat.id || i} className="text-center">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-white/5' : 'bg-[#2e4957]/5'}`}>
                    <Icon className={`h-6 w-6 ${isDark ? 'text-[#167a87]' : 'text-[#2e4957]'}`} />
                  </div>
                  <div className={`text-3xl md:text-4xl font-heading font-bold mb-1 ${isDark ? 'text-white' : 'text-[#2e4957]'}`}>
                    {prefix}{val}{suffix}
                  </div>
                  <p className={`text-sm font-medium ${isDark ? 'text-white/70' : 'text-gray-500'}`}>
                    {getChildFieldValue(stat, 'Label')}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {fields?.['CTA Heading']?.value && (
          <div className="bg-[#2e4957] rounded-xl p-8 md:p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#167a87]/20 to-transparent" />
            <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex-1">
                <h3 className="text-xl md:text-2xl font-heading font-bold mb-2">
                  <Text field={fields['CTA Heading']} />
                </h3>
                <div className="text-white/75 leading-relaxed">
                  <Text field={fields?.['CTA Description']} />
                </div>
              </div>
              <a href={getLinkHref(fields, 'CTA Link')}>
                <button className="inline-flex items-center justify-center px-6 h-11 bg-[#f28d00] hover:bg-[#e07d00] text-white font-heading rounded-md whitespace-nowrap transition-colors" data-testid="button-authority-cta">
                  <Text field={fields?.['CTA Link Text']} />
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
