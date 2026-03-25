import {
  RichText,
} from '@sitecore-content-sdk/nextjs';
import type { ComponentRendering, ComponentFields } from '@sitecore-content-sdk/nextjs';
import { rtf } from 'lib/field-utils';

type RichTextBlockProps = {
  rendering: ComponentRendering;
  fields: ComponentFields;
  params: Record<string, string>;
};

export default function RichTextBlock({ fields, params }: RichTextBlockProps) {
  const variant = params?.FieldNames || '';
  const isNarrow = variant === 'rte--narrow';
  const isFull = variant === 'rte--full';

  return (
    <section className="py-12 md:py-16 bg-white" data-testid="section-rich-text">
      <div className={`mx-auto px-4 ${isNarrow ? 'max-w-3xl' : isFull ? 'max-w-[1400px]' : 'max-w-4xl'}`}>
        <div className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-[#2e4957] prose-a:text-[#167a87]">
          <RichText field={rtf(fields, 'Content')} />
        </div>
      </div>
    </section>
  );
}
