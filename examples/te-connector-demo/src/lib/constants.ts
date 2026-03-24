export const TE_COLORS = {
  slate: '#2e4957',
  orange: '#f28d00',
  teal: '#167a87',
  navy: '#04215d',
  slateLight: '#3a5a6a',
  orangeDark: '#e07d00',
  tealLight: '#1a8f9e',
} as const;

export const SITE_NAME = process.env.SITECORE_SITE_NAME || 'nxp';
export const DEFAULT_LANGUAGE = process.env.DEFAULT_LANGUAGE || 'en';
