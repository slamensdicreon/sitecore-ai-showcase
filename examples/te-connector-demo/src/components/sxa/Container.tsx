'use client';

import { Placeholder } from '@sitecore-content-sdk/nextjs';
import type { ComponentRendering, ComponentFields } from '@sitecore-content-sdk/nextjs';

type ContainerProps = {
  rendering: ComponentRendering;
  fields: ComponentFields;
  params: Record<string, string>;
};

export default function Container({ rendering }: ContainerProps) {
  return (
    <div className="max-w-[1400px] mx-auto px-4">
      <Placeholder name="container" rendering={rendering} />
    </div>
  );
}
