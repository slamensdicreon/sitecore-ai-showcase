import type { ComponentData, FieldValue, ImageFieldValue, LinkFieldValue } from "./types";

export interface SitecoreComponentProps {
  fields: Record<string, FieldValue | ImageFieldValue | LinkFieldValue>;
  params: Record<string, string>;
  uid: string;
  variant?: string;
  rendering: {
    componentName: string;
    dataSource: string;
    uid: string;
  };
  children?: React.ReactNode;
}

type SitecoreComponent = React.ComponentType<SitecoreComponentProps>;

export const componentRegistry: Record<string, SitecoreComponent> = {};

export function registerComponent(name: string, component: SitecoreComponent) {
  componentRegistry[name] = component;
}

export function registerComponents(components: Record<string, SitecoreComponent>) {
  Object.entries(components).forEach(([name, component]) => {
    componentRegistry[name] = component;
  });
}
