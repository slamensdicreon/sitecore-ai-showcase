'use client';

import { Placeholder } from '@sitecore-content-sdk/nextjs';
import type { ComponentRendering, ComponentFields } from '@sitecore-content-sdk/nextjs';

type ColumnSplitterProps = {
  rendering: ComponentRendering;
  fields: ComponentFields;
  params: Record<string, string>;
};

export default function ColumnSplitter({ rendering, params }: ColumnSplitterProps) {
  const columnCount = parseInt(params?.ColumnCount || '2', 10);

  return (
    <div className={`grid grid-cols-1 md:grid-cols-${columnCount} gap-6`}>
      {Array.from({ length: columnCount }).map((_, i) => (
        <div key={i}>
          <Placeholder name={`column-${i + 1}`} rendering={rendering} />
        </div>
      ))}
    </div>
  );
}
