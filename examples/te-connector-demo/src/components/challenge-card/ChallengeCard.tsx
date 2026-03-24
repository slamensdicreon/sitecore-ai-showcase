'use client';

import { Text } from '@sitecore-content-sdk/nextjs';
import type { ComponentRendering, ComponentFields } from '@sitecore-content-sdk/nextjs';
import {
  BatteryCharging, Server, Factory, Zap, Shield, Globe, Cpu,
  Lightbulb, Box, TrendingUp,
  DollarSign, MapPin, Wrench, Users,
} from 'lucide-react';
import { getFieldValue, type IconMap } from 'src/lib/field-utils';

const iconMap: IconMap = {
  BatteryCharging, Server, Factory, DollarSign, MapPin, Wrench, Users,
  Zap, Shield, Globe, Cpu, Lightbulb, Box, TrendingUp,
};

type ChallengeCardProps = {
  rendering: ComponentRendering;
  fields: ComponentFields;
  params: Record<string, string>;
};

export default function ChallengeCard({ fields }: ChallengeCardProps) {
  const iconName = getFieldValue(fields, 'Icon Name', '');
  const Icon = iconMap[iconName] || Zap;

  return (
    <div className="p-6 rounded-lg border border-gray-200 bg-white" data-testid="card-challenge">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 bg-[#f28d00]/10">
        <Icon className="h-5 w-5 text-[#f28d00]" />
      </div>
      <h3 className="font-heading font-semibold mb-2">
        <Text field={fields?.['Title']} />
      </h3>
      <p className="text-sm text-gray-500 leading-relaxed">
        <Text field={fields?.['Description']} />
      </p>
    </div>
  );
}
