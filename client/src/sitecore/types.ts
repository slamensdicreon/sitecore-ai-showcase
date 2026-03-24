export interface FieldValue<T = string> {
  value: T;
  editable?: string;
}

export interface ImageFieldValue {
  value: {
    src: string;
    alt?: string;
    width?: number;
    height?: number;
  };
  editable?: string;
}

export interface LinkFieldValue {
  value: {
    href: string;
    text?: string;
    target?: string;
    linktype?: string;
    class?: string;
  };
  editable?: string;
}

export interface ComponentData {
  uid: string;
  componentName: string;
  dataSource: string;
  fields: Record<string, FieldValue | ImageFieldValue | LinkFieldValue>;
  params: Record<string, string>;
  placeholders?: Record<string, ComponentData[]>;
}

export interface RouteData {
  name: string;
  displayName: string;
  fields: Record<string, any>;
  placeholders: Record<string, ComponentData[]>;
  itemId: string;
  templateId: string;
  templateName: string;
  itemLanguage: string;
}

export interface LayoutServiceResponse {
  sitecore: {
    context: {
      pageEditing: boolean;
      site: { name: string };
      language: string;
    };
    route: RouteData | null;
  };
}

export interface SitecoreContextValue {
  isEditing: boolean;
  language: string;
  siteName: string;
  route: RouteData | null;
  layoutData: LayoutServiceResponse | null;
}
