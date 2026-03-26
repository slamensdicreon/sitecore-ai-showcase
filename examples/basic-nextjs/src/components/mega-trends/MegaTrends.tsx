'use client';

import {
  Text,
} from '@sitecore-content-sdk/nextjs';
import type { ComponentRendering, ComponentFields } from '@sitecore-content-sdk/nextjs';
import {
  BatteryCharging, Server, Factory, Zap, Shield, Globe, Cpu,
  Lightbulb, Box, TrendingUp, ChevronRight,
  DollarSign, MapPin, Wrench, Users,
} from 'lucide-react';
import { tf, getChildItems, getChildFieldValue, getChildLinkHref, type IconMap, type ChildItem } from 'lib/field-utils';

const iconMap: IconMap = {
  BatteryCharging, Server, Factory, DollarSign, MapPin, Wrench, Users,
  Zap, Shield, Globe, Cpu, Lightbulb, Box, TrendingUp,
};

function getIcon(name: string) {
  return iconMap[name] || Zap;
}

type MegaTrendsProps = {
  rendering: ComponentRendering;
  fields: ComponentFields;
  params: Record<string, string>;
};

export const Default = ({ fields, rendering, params }: MegaTrendsProps) => {
  const isEditing = params?.sc_mode === 'edit' || params?.sc_mode === 'preview';

  const children = getChildItems(rendering);

  return (
    <section className="relative bg-white py-20 md:py-28 overflow-hidden" data-testid="section-mega-trends">
      <div className="max-w-[1400px] mx-auto px-4 relative">
        <div className="text-center mb-16">
          <p className="text-[#f28d00] font-heading font-semibold text-sm tracking-wider uppercase mb-3" data-testid="text-megatrends-label">
            <Text field={tf(fields, 'Section Label')} />
          </p>
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4" data-testid="text-megatrends-title">
            <Text field={tf(fields, 'Heading')} />
          </h2>
          <div className="text-gray-500 max-w-2xl mx-auto text-base leading-relaxed">
            <Text field={tf(fields, 'Description')} />
          </div>
        </div>

        {children.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {children.map((card: ChildItem, i: number) => {
              const Icon = getIcon(getChildFieldValue(card, 'Icon Name'));
              const color = getChildFieldValue(card, 'Accent Color', '#f28d00');
              const href = getChildLinkHref(card, 'Link');
              return (
                <a key={card.id || i} href={href || '#'} className="block">
                  <div className="hover-elevate cursor-pointer h-full rounded-lg border border-gray-200 bg-white relative overflow-hidden group" data-testid={`card-megatrend-${i}`}>
                    <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: color }} />
                    <div className="p-6 md:p-8">
                      <div className="w-14 h-14 rounded-lg flex items-center justify-center mb-5 transition-transform group-hover:scale-110" style={{ backgroundColor: `${color}15` }}>
                        <Icon className="h-7 w-7" style={{ color }} />
                      </div>
                      <h3 className="text-xl font-heading font-bold mb-1">{getChildFieldValue(card, 'Title')}</h3>
                      <p className="text-sm text-gray-500 font-medium mb-3">{getChildFieldValue(card, 'Subtitle')}</p>
                      <p className="text-sm text-gray-500 leading-relaxed mb-6">{getChildFieldValue(card, 'Description')}</p>
                      <div className="pt-4 border-t border-gray-100">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-heading font-bold" style={{ color }}>{getChildFieldValue(card, 'Stat Value')}</span>
                          <span className="text-xs text-gray-400">{getChildFieldValue(card, 'Stat Label')}</span>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center text-sm font-heading font-medium group-hover:gap-2 transition-all" style={{ color }}>
                        Learn More <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}

        {isEditing && children.length === 0 && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <p className="text-gray-400">Add Mega Trend Card items as children of this datasource</p>
          </div>
        )}
      </div>
    </section>
  );
};
