'use client';

import { Text, RichText } from '@sitecore-content-sdk/nextjs';
import type { ComponentRendering, ComponentFields } from '@sitecore-content-sdk/nextjs';

type ContentBlockProps = {
  rendering: ComponentRendering;
  fields: ComponentFields;
  params: Record<string, string>;
};

export default function ContentBlock({ fields }: ContentBlockProps) {
  return (
    <div className="py-8">
      <h2 className="text-2xl font-heading font-bold mb-4">
        <Text field={fields?.['heading']} />
      </h2>
      <div className="prose max-w-none">
        <RichText field={fields?.['content']} />
      </div>
    </div>
  );
}
