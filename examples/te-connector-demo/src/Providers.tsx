'use client';

import { SitecoreContext, ComponentPropsContext, type LayoutServiceData } from '@sitecore-content-sdk/nextjs';
import componentMap from '../.sitecore/component-map';

type ProvidersProps = {
  page: {
    layout: LayoutServiceData;
    headLinks?: Record<string, unknown>[];
  };
  componentProps: Record<string, unknown>;
  children: React.ReactNode;
};

export default function Providers({ page, componentProps, children }: ProvidersProps) {
  return (
    <ComponentPropsContext value={componentProps}>
      <SitecoreContext
        componentFactory={(name: string) => componentMap[name] || null}
        layoutData={page.layout}
      >
        {children}
      </SitecoreContext>
    </ComponentPropsContext>
  );
}
