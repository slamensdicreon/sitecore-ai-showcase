'use client';

import { Placeholder } from '@sitecore-content-sdk/nextjs';
import type { ComponentRendering, ComponentFields } from '@sitecore-content-sdk/nextjs';

type ColumnSplitterProps = {
  rendering: ComponentRendering;
  fields: ComponentFields;
  params: Record<string, string>;
};

const gridColsMap: Record<number, string> = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
  5: 'md:grid-cols-5',
  6: 'md:grid-cols-6',
};

export default function ColumnSplitter({ rendering, params }: ColumnSplitterProps) {
  const columnCount = parseInt(params?.ColumnCount || '2', 10);
  const gridClass = gridColsMap[columnCount] || 'md:grid-cols-2';

  return (
    <div className={`grid grid-cols-1 ${gridClass} gap-6`}>
      {Array.from({ length: columnCount }).map((_, i) => (
        <div key={i}>
          <Placeholder name={`column-${i + 1}`} rendering={rendering} />
        </div>
      ))}
    </div>
  );
}
