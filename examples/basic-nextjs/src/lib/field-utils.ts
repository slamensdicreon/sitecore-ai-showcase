import type { Field, LinkField, ComponentFields } from '@sitecore-content-sdk/nextjs';
import type { LucideIcon } from 'lucide-react';

type TextField = Field<string | number | undefined>;
type RichTextField = Field<string | undefined>;

export function tf(fields: ComponentFields | undefined, name: string): TextField | undefined {
  return fields?.[name] as TextField | undefined;
}

export function rtf(fields: ComponentFields | undefined, name: string): RichTextField | undefined {
  return fields?.[name] as RichTextField | undefined;
}

export function getFieldValue(fields: Record<string, unknown> | undefined, fieldName: string, fallback = ''): string {
  const field = fields?.[fieldName] as Field<string | number> | undefined;
  const v = field?.value;
  if (v === undefined || v === null) return fallback;
  return String(v);
}

export function getLinkHref(fields: Record<string, unknown> | undefined, fieldName: string): string {
  const field = fields?.[fieldName] as LinkField | undefined;
  return field?.value?.href || '#';
}

export interface ChildItem {
  id?: string;
  fields?: Record<string, Field<string> | Field<number> | LinkField | undefined>;
}

export function getChildItems(rendering: unknown): ChildItem[] {
  const fields = (rendering as Record<string, unknown>)?.fields as Record<string, unknown> | undefined;
  const items = fields?.items;
  if (Array.isArray(items)) return items as ChildItem[];
  return [];
}

export function getChildFieldValue(item: ChildItem, fieldName: string, fallback = ''): string {
  const field = item.fields?.[fieldName] as Field<string | number> | undefined;
  const v = field?.value;
  if (v === undefined || v === null) return fallback;
  return String(v);
}

export function getChildLinkHref(item: ChildItem, fieldName: string): string {
  const field = item.fields?.[fieldName] as LinkField | undefined;
  return field?.value?.href || '#';
}

export type IconMap = Record<string, LucideIcon>;
