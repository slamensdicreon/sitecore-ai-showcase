import type { Field, LinkField } from '@sitecore-content-sdk/nextjs';
import type { LucideIcon } from 'lucide-react';

export function getFieldValue<T = string>(fields: Record<string, unknown> | undefined, fieldName: string, fallback: T): T {
  const field = fields?.[fieldName] as Field<T> | undefined;
  return field?.value ?? fallback;
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
  const field = item.fields?.[fieldName] as Field<string> | undefined;
  return field?.value ?? fallback;
}

export function getChildLinkHref(item: ChildItem, fieldName: string): string {
  const field = item.fields?.[fieldName] as LinkField | undefined;
  return field?.value?.href || '#';
}

export type IconMap = Record<string, LucideIcon>;
