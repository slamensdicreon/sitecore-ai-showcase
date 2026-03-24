'use client';

import { Text } from '@sitecore-content-sdk/nextjs';
import type { ComponentRendering, ComponentFields } from '@sitecore-content-sdk/nextjs';
import {
  BatteryCharging, Server, Factory, Zap, Shield, Globe, Cpu,
  Lightbulb, Box, TrendingUp, ChevronRight,
  DollarSign, MapPin, Wrench, Users,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<any>> = {
  BatteryCharging, Server, Factory, DollarSign, MapPin, Wrench, Users,
  Zap, Shield, Globe, Cpu, Lightbulb, Box, TrendingUp,
};

type MegaTrendCardProps = {
  rendering: ComponentRendering;
  fields: ComponentFields;
  params: Record<string, string>;
};

export default function MegaTrendCard({ fields }: MegaTrendCardProps) {
  const iconName = (fields?.['Icon Name'] as any)?.value;
  const Icon = iconMap[iconName] || Zap;
  const color = (fields?.['Accent Color'] as any)?.value || '#f28d00';
  const href = fields?.['Link']?.value?.href || '#';

  return (
    <a href={href} className="block">
      <div className="hover-elevate cursor-pointer h-full rounded-lg border border-gray-200 bg-white relative overflow-hidden group" data-testid="card-mega-trend">
        <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: color }} />
        <div className="p-6 md:p-8">
          <div className="w-14 h-14 rounded-lg flex items-center justify-center mb-5 transition-transform group-hover:scale-110" style={{ backgroundColor: `${color}15` }}>
            <Icon className="h-7 w-7" style={{ color }} />
          </div>
          <h3 className="text-xl font-heading font-bold mb-1">
            <Text field={fields?.['Title']} />
          </h3>
          <p className="text-sm text-gray-500 font-medium mb-3">
            <Text field={fields?.['Subtitle']} />
          </p>
          <div className="text-sm text-gray-500 leading-relaxed mb-6">
            <Text field={fields?.['Description']} />
          </div>
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-heading font-bold" style={{ color }}>
                <Text field={fields?.['Stat Value']} />
              </span>
              <span className="text-xs text-gray-400">
                <Text field={fields?.['Stat Label']} />
              </span>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm font-heading font-medium group-hover:gap-2 transition-all" style={{ color }}>
            Learn More <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </a>
  );
}
