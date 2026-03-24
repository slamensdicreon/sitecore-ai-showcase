'use client';

import { Text } from '@sitecore-content-sdk/nextjs';
import type { ComponentRendering, ComponentFields } from '@sitecore-content-sdk/nextjs';
import {
  BatteryCharging, Server, Factory, Zap, Shield, Globe, Cpu,
  Lightbulb, Box, TrendingUp, ChevronRight,
  DollarSign, MapPin, Wrench, Users,
} from 'lucide-react';
import { getFieldValue, getLinkHref, type IconMap } from 'src/lib/field-utils';

const iconMap: IconMap = {
  BatteryCharging, Server, Factory, DollarSign, MapPin, Wrench, Users,
  Zap, Shield, Globe, Cpu, Lightbulb, Box, TrendingUp,
};

type CrossNavLinkProps = {
  rendering: ComponentRendering;
  fields: ComponentFields;
  params: Record<string, string>;
};

export default function CrossNavLink({ fields }: CrossNavLinkProps) {
  const iconName = getFieldValue(fields, 'Icon Name', '');
  const Icon = iconMap[iconName] || Zap;
  const color = getFieldValue(fields, 'Accent Color', '#167a87');
  const href = getLinkHref(fields, 'Link');

  return (
    <a href={href} className="block">
      <div className="group p-6 rounded-lg border border-gray-200 bg-white hover:border-gray-300 transition-all hover-elevate" data-testid="card-cross-nav-link">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}15` }}>
            <Icon className="h-5 w-5" style={{ color }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-heading font-semibold mb-1 group-hover:text-[#f28d00] transition-colors">
              <Text field={fields?.['Title']} />
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              <Text field={fields?.['Description']} />
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-[#f28d00] group-hover:translate-x-1 transition-all shrink-0 mt-1" />
        </div>
      </div>
    </a>
  );
}
