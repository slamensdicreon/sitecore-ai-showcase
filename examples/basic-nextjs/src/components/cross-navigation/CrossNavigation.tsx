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
import { fetchDatasourceChildren } from 'lib/edge-children';

const iconMap: IconMap = {
  BatteryCharging, Server, Factory, DollarSign, MapPin, Wrench, Users,
  Zap, Shield, Globe, Cpu, Lightbulb, Box, TrendingUp,
};

type CrossNavigationProps = {
  rendering: ComponentRendering;
  fields: ComponentFields;
  params: Record<string, string>;
};

export const Default = async ({ fields, rendering, params }: CrossNavigationProps) => {
  const isEditing = params?.sc_mode === 'edit' || params?.sc_mode === 'preview';

  const language = params?.sc_lang || 'en';

  let children = getChildItems(rendering);
  if (children.length === 0 && rendering?.dataSource) {
    children = await fetchDatasourceChildren(rendering.dataSource, language);
  }

  return (
    <section className="py-16 md:py-20 bg-gray-50" data-testid="section-cross-navigation">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-heading font-bold mb-3">
            <Text field={tf(fields, 'Heading')} />
          </h2>
          <div className="text-gray-500 max-w-xl mx-auto">
            <Text field={tf(fields, 'Description')} />
          </div>
        </div>

        {children.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {children.map((link: ChildItem, i: number) => {
              const iconName = getChildFieldValue(link, 'Icon Name');
              const Icon = iconMap[iconName] || Zap;
              const color = getChildFieldValue(link, 'Accent Color', '#167a87');
              const href = getChildLinkHref(link, 'Link');

              return (
                <a key={link.id || i} href={href} className="block">
                  <div className="group p-6 rounded-lg border border-gray-200 bg-white hover:border-gray-300 transition-all hover-elevate" data-testid={`card-crossnav-${i}`}>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}15` }}>
                        <Icon className="h-5 w-5" style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-heading font-semibold mb-1 group-hover:text-[#f28d00] transition-colors">
                          {getChildFieldValue(link, 'Title')}
                        </h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                          {getChildFieldValue(link, 'Description')}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-[#f28d00] group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}

        {isEditing && children.length === 0 && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <p className="text-gray-400">Add Cross Nav Link items as children</p>
          </div>
        )}
      </div>
    </section>
  );
};
