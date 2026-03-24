import { useIsEditing } from "./context";
import type { FieldValue, ImageFieldValue, LinkFieldValue } from "./types";

interface TextFieldProps {
  field?: FieldValue<string>;
  tag?: keyof JSX.IntrinsicElements;
  className?: string;
  "data-testid"?: string;
  editable?: boolean;
}

export function Text({ field, tag: Tag = "span", className, editable = true, ...rest }: TextFieldProps) {
  const isEditing = useIsEditing();

  if (!field) return null;

  if (isEditing && editable && field.editable) {
    return (
      <Tag
        className={className}
        dangerouslySetInnerHTML={{ __html: field.editable }}
        {...rest}
      />
    );
  }

  return (
    <Tag className={className} {...rest}>
      {field.value}
    </Tag>
  );
}

interface RichTextFieldProps {
  field?: FieldValue<string>;
  tag?: keyof JSX.IntrinsicElements;
  className?: string;
  "data-testid"?: string;
  editable?: boolean;
}

export function RichText({ field, tag: Tag = "div", className, editable = true, ...rest }: RichTextFieldProps) {
  const isEditing = useIsEditing();

  if (!field) return null;

  const html = isEditing && editable && field.editable ? field.editable : field.value;

  return (
    <Tag
      className={className}
      dangerouslySetInnerHTML={{ __html: html as string }}
      {...rest}
    />
  );
}

interface ImageFieldProps {
  field?: ImageFieldValue;
  className?: string;
  "data-testid"?: string;
  editable?: boolean;
  width?: number;
  height?: number;
}

export function Image({ field, className, editable = true, width, height, ...rest }: ImageFieldProps) {
  const isEditing = useIsEditing();

  if (!field?.value?.src) {
    if (isEditing) {
      return (
        <div className={`${className} flex items-center justify-center bg-muted/30 border-2 border-dashed border-muted-foreground/20 rounded-lg min-h-[100px]`}>
          <span className="text-xs text-muted-foreground">Click to add image</span>
        </div>
      );
    }
    return null;
  }

  if (isEditing && editable && field.editable) {
    return <span dangerouslySetInnerHTML={{ __html: field.editable }} />;
  }

  return (
    <img
      src={field.value.src}
      alt={field.value.alt || ""}
      width={width || field.value.width}
      height={height || field.value.height}
      className={className}
      loading="lazy"
      {...rest}
    />
  );
}

interface LinkFieldProps {
  field?: LinkFieldValue;
  className?: string;
  children?: React.ReactNode;
  "data-testid"?: string;
  editable?: boolean;
}

export function SitecoreLink({ field, className, children, editable = true, ...rest }: LinkFieldProps) {
  const isEditing = useIsEditing();

  if (!field?.value?.href) {
    if (isEditing) {
      return (
        <span className={`${className} border border-dashed border-muted-foreground/30 px-2 py-1 rounded text-xs text-muted-foreground`}>
          {children || "Click to add link"}
        </span>
      );
    }
    return children ? <span className={className}>{children}</span> : null;
  }

  if (isEditing && editable && field.editable) {
    return <span dangerouslySetInnerHTML={{ __html: field.editable }} />;
  }

  return (
    <a
      href={field.value.href}
      target={field.value.target}
      className={className}
      {...rest}
    >
      {children || field.value.text || field.value.href}
    </a>
  );
}

export function getFieldValue<T = string>(field?: FieldValue<T>): T | undefined {
  return field?.value;
}

export function getLinkHref(field?: LinkFieldValue): string {
  return field?.value?.href || "";
}

export function getImageSrc(field?: ImageFieldValue): string {
  return field?.value?.src || "";
}
