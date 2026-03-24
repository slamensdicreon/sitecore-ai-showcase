'use client';

import { Placeholder, LayoutServicePageState } from '@sitecore-content-sdk/nextjs';
import type { LayoutServiceData, ComponentRendering } from '@sitecore-content-sdk/nextjs';

export type RouteFields = {
  [key: string]: { value: string | Record<string, any> };
};

type LayoutProps = {
  page: {
    layout: LayoutServiceData;
    headLinks?: any[];
  };
};

export default function Layout({ page }: LayoutProps) {
  const { layout } = page;
  const route = layout?.sitecore?.route;
  const isEditing = layout?.sitecore?.context?.pageState === LayoutServicePageState.Edit;

  if (!route) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-2xl font-heading font-bold text-[#2e4957] mb-2">No Route Data</h1>
        <p className="text-gray-500">This page has not been configured in Sitecore yet.</p>
      </div>
    );
  }

  return (
    <main>
      {route.placeholders?.['headless-header'] && (
        <Placeholder name="headless-header" rendering={route as unknown as ComponentRendering} />
      )}
      {route.placeholders?.['headless-main'] ? (
        <Placeholder name="headless-main" rendering={route as unknown as ComponentRendering} />
      ) : (
        isEditing && (
          <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center m-4">
            <p className="text-blue-400 text-sm">Drop components into the headless-main placeholder</p>
          </div>
        )
      )}
      {route.placeholders?.['headless-footer'] && (
        <Placeholder name="headless-footer" rendering={route as unknown as ComponentRendering} />
      )}
    </main>
  );
}
