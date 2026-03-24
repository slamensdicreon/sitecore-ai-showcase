'use client';

import { SitecoreContext, type LayoutServiceData } from '@sitecore-content-sdk/nextjs';
import componentMap from '../.sitecore/component-map';

type ProvidersProps = {
  page: {
    layout: LayoutServiceData;
    headLinks?: any[];
  };
  componentProps: Record<string, unknown>;
  children: React.ReactNode;
};

export default function Providers({ page, componentProps, children }: ProvidersProps) {
  return (
    <SitecoreContext
      componentFactory={(name: string) => componentMap[name] || null}
      layoutData={page.layout}
    >
      {children}
    </SitecoreContext>
  );
}
