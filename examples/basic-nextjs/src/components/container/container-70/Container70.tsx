import type React from 'react';
import { ComponentProps } from 'lib/component-props';
import componentMap from '.sitecore/component-map';
import { AppPlaceholder } from '@sitecore-content-sdk/nextjs';
import type { JSX } from 'react';

/**
 * Model used for Sitecore Component integration
 */
type Container70Props = ComponentProps & {
  children?: JSX.Element | JSX.Element[];
  params: ComponentProps['params'] & {
    excludeTopMargin?: string;
  };
};

export const Default: React.FC<Container70Props> = (props) => {
  const { rendering, children, page } = props;

  const isPageEditing = page.mode.isEditing;

  const PLACEHOLDER_FRAGMENT = 'container-seventy';
  const PLACEHOLDER_NAME = `${PLACEHOLDER_FRAGMENT}-${props.params.DynamicPlaceholderId}`;
  const isEmptyPlaceholder =
    !(
      rendering?.placeholders?.[PLACEHOLDER_NAME] ||
      rendering?.placeholders?.[`${PLACEHOLDER_FRAGMENT}-{*}`]
    ) && !children;

  if (isEmptyPlaceholder && !isPageEditing) {
    return null;
  }

  const excludeTopMargin = props?.params?.excludeTopMargin === '1';

  return (
    <section
      data-component="Container70"
      className={[
        excludeTopMargin ? 'mt-0' : 'mt-4',
        props?.params?.styles || '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="mx-auto max-w-screen-xl px-4 xl:px-8 flex flex-col items-center gap-4 flex-wrap md:flex-row">
        <div className="w-full basis-full">
          <div className="mx-auto md:max-w-[70%]">
            <AppPlaceholder
              name={PLACEHOLDER_NAME}
              rendering={rendering}
              page={page}
              componentMap={componentMap}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
