'use client';

import { Text } from '@sitecore-content-sdk/nextjs';
import type { ComponentRendering, ComponentFields } from '@sitecore-content-sdk/nextjs';
import {
  BatteryCharging, Server, Factory, Zap, Shield, Globe, Cpu,
  Lightbulb, Box, TrendingUp,
  DollarSign, MapPin, Wrench, Users,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<any>> = {
  BatteryCharging, Server, Factory, DollarSign, MapPin, Wrench, Users,
  Zap, Shield, Globe, Cpu, Lightbulb, Box, TrendingUp,
};

type StatItemProps = {
  rendering: ComponentRendering;
  fields: ComponentFields;
  params: Record<string, string>;
};

export default function StatItem({ fields }: StatItemProps) {
  const iconName = (fields?.['Icon Name'] as any)?.value;
  const Icon = iconMap[iconName] || Zap;
  const val = (fields?.['Value'] as any)?.value || '0';
  const prefix = (fields?.['Prefix'] as any)?.value || '';
  const suffix = (fields?.['Suffix'] as any)?.value || '';

  return (
    <div className="text-center" data-testid="stat-item">
      <div className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 bg-[#2e4957]/5">
        <Icon className="h-6 w-6 text-[#2e4957]" />
      </div>
      <div className="text-3xl md:text-4xl font-heading font-bold mb-1 text-[#2e4957]">
        {prefix}{val}{suffix}
      </div>
      <p className="text-sm font-medium text-gray-500">
        <Text field={fields?.['Label']} />
      </p>
    </div>
  );
}
