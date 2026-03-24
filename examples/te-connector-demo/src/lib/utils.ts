import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFieldValue<T = string>(
  fields: Record<string, any> | undefined,
  fieldName: string
): T | undefined {
  return fields?.[fieldName]?.value as T | undefined;
}

export function getLinkHref(fields: Record<string, any> | undefined, fieldName: string): string {
  return fields?.[fieldName]?.value?.href || '#';
}
