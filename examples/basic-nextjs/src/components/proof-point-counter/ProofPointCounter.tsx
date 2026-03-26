'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Text,
} from '@sitecore-content-sdk/nextjs';
import type { ComponentRendering, ComponentFields } from '@sitecore-content-sdk/nextjs';
import { tf, getChildItems, getChildFieldValue, type ChildItem } from 'lib/field-utils';

function AnimatedValue({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const numericMatch = value.match(/^([^0-9]*)(\d[\d,]*)(.*)$/);
  const initialDisplay = numericMatch ? `${numericMatch[1]}0${numericMatch[3]}` : value;
  const [displayed, setDisplayed] = useState(initialDisplay);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!ref.current || hasAnimated) return;
    if (!numericMatch) return;
    const [, prefix, numStr, suffix] = numericMatch;
    const target = parseInt(numStr.replace(/,/g, ''), 10);
    if (isNaN(target)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true);
          const start = performance.now();
          const duration = 2000;
          const step = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(eased * target);
            const formatted = target >= 1000 ? current.toLocaleString() : String(current);
            setDisplayed(`${prefix}${formatted}${suffix}`);
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, hasAnimated]);

  return <span ref={ref}>{displayed}</span>;
}

type ProofPointCounterProps = {
  rendering: ComponentRendering;
  fields: ComponentFields;
  params: Record<string, string>;
};

export const Default = ({ fields, rendering, params }: ProofPointCounterProps) => {
  const isEditing = params?.sc_mode === 'edit' || params?.sc_mode === 'preview';

  const children = getChildItems(rendering);

  return (
    <section className="py-16 md:py-24 bg-[#2e4957] text-white" data-testid="section-proof-points">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-[#f28d00] font-heading font-semibold text-sm tracking-wider uppercase mb-3">
            <Text field={tf(fields, 'Section Label')} />
          </p>
          <h2 className="text-3xl md:text-4xl font-heading font-bold">
            <Text field={tf(fields, 'Heading')} />
          </h2>
        </div>

        {children.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {children.map((item: ChildItem, i: number) => (
              <div key={item.id || i} className="text-center">
                <div className="text-3xl md:text-4xl font-heading font-bold text-[#f28d00] mb-2">
                  <AnimatedValue value={getChildFieldValue(item, 'Value')} />
                </div>
                <div className="text-sm font-medium text-white/80 mb-1">
                  {getChildFieldValue(item, 'Label')}
                </div>
                {getChildFieldValue(item, 'Description') && (
                  <p className="text-xs text-white/50">
                    {getChildFieldValue(item, 'Description')}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {isEditing && children.length === 0 && (
          <div className="border-2 border-dashed border-white/20 rounded-lg p-12 text-center">
            <p className="text-white/40">Add Proof Point Item children to this datasource</p>
          </div>
        )}
      </div>
    </section>
  );
};
