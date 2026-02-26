import type React from 'react';
import { ComponentProps } from 'lib/component-props';
import componentMap from '.sitecore/component-map';
import { AppPlaceholder } from '@sitecore-content-sdk/nextjs';
import type { JSX } from 'react';

/**
 * Model used for Sitecore Component integration
 */
type ContainerFullBleedProps = ComponentProps & {
  children?: JSX.Element | JSX.Element[];
  params: ComponentProps['params'] & {
    backgroundColor?: 'primary' | 'secondary' | 'tertiary' | 'transparent';
    backgroundImagePath?: string;
    excludeTopMargin?: string;
    inset?: string;
    [key: string]: string | undefined;
  };
};

const backgroundColorClasses: Record<string, string> = {
  primary: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  tertiary: 'bg-tertiary text-tertiary-foreground',
  transparent: 'bg-transparent',
};

export const Default: React.FC<ContainerFullBleedProps> = (props) => {
  const { rendering, page } = props;

  const PLACEHOLDER_NAME = `container-fullbleed-${props.params.DynamicPlaceholderId}`;

  const backgroundImage = props?.params?.backgroundImagePath || '';
  const backgroundColor = props?.params?.backgroundColor;
  const excludeTopMargin = props?.params?.excludeTopMargin === '1';
  const inset =
    backgroundColor !== 'transparent' && props?.params?.inset === '1';

  const hasBg =
    backgroundColor && backgroundColor !== 'transparent';
  const bgColorClass = backgroundColor
    ? backgroundColorClasses[backgroundColor] || ''
    : '';

  const classNames = [
    'group @container container--full-bleed',
    props?.params?.styles || '',
    bgColorClass,
    hasBg ? 'has-bg' : '',
    inset
      ? 'is-inset px-4 sm:px-8 md:px-16 2xl:px-24 mx-4 overflow-hidden rounded-3xl'
      : '',
    excludeTopMargin ? 'mt-0 mb-0' : 'my-8 sm:my-16',
    hasBg && !inset ? 'py-4 sm:py-16' : 'py-0',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section
      className={classNames}
      style={{
        ...(backgroundImage && {
          backgroundImage: `url('${backgroundImage}')`,
          backgroundSize: 'cover',
        }),
      }}
    >
      <div className="mx-auto max-w-screen-xl px-4 xl:px-8 flex flex-col items-center gap-4 flex-wrap md:flex-row">
        <div className="w-full basis-full">
          <AppPlaceholder
            name={PLACEHOLDER_NAME}
            rendering={rendering}
            page={page}
            componentMap={componentMap}
          />
        </div>
      </div>
    </section>
  );
};
