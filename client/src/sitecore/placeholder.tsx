import { useIsEditing } from "./context";
import type { ComponentData } from "./types";
import { componentRegistry } from "./component-registry";

interface PlaceholderProps {
  name: string;
  components?: ComponentData[];
  className?: string;
}

export function Placeholder({ name, components, className }: PlaceholderProps) {
  const isEditing = useIsEditing();

  if (!components || components.length === 0) {
    if (isEditing) {
      return (
        <div
          className={`sc-placeholder sc-placeholder-empty ${className || ""}`}
          data-placeholder={name}
          data-testid={`placeholder-${name}`}
        >
          <div className="border-2 border-dashed border-blue-300/50 rounded-lg p-8 text-center">
            <p className="text-sm text-blue-400">
              Drop components here
            </p>
            <p className="text-xs text-muted-foreground mt-1">{name}</p>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div
      className={`sc-placeholder ${className || ""}`}
      data-placeholder={name}
      data-testid={`placeholder-${name}`}
    >
      {components.map((component) => (
        <ComponentRenderer key={component.uid} component={component} />
      ))}
    </div>
  );
}

interface ComponentRendererProps {
  component: ComponentData;
}

function ComponentRenderer({ component }: ComponentRendererProps) {
  const isEditing = useIsEditing();
  const RegisteredComponent = componentRegistry[component.componentName];

  if (!RegisteredComponent) {
    if (isEditing) {
      return (
        <div
          className="border border-amber-300 bg-amber-50 dark:bg-amber-950/20 rounded-lg p-4 my-2"
          data-component={component.componentName}
          data-uid={component.uid}
        >
          <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">
            Unknown component: {component.componentName}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            UID: {component.uid} | DataSource: {component.dataSource}
          </p>
        </div>
      );
    }
    return null;
  }

  const variant = component.params?.FieldNames || component.params?.variant || "";

  const wrapperProps = isEditing
    ? {
        "data-sc-component": component.componentName,
        "data-sc-uid": component.uid,
        "data-sc-datasource": component.dataSource,
        "data-sc-variant": variant,
      }
    : {};

  return (
    <div {...wrapperProps} data-testid={`component-${component.componentName}`}>
      <RegisteredComponent
        fields={component.fields}
        params={component.params}
        uid={component.uid}
        variant={variant}
        rendering={{
          componentName: component.componentName,
          dataSource: component.dataSource,
          uid: component.uid,
        }}
      >
        {component.placeholders && Object.entries(component.placeholders).map(([phName, phComponents]) => (
          <Placeholder key={phName} name={phName} components={phComponents} />
        ))}
      </RegisteredComponent>
    </div>
  );
}
