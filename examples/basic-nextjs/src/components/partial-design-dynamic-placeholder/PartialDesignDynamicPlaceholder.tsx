import React, { JSX } from 'react';
import { ComponentProps } from 'lib/component-props';
import componentMap from 'src/lib/component-map-enhanced';
import { AppPlaceholder } from "@sitecore-content-sdk/nextjs";

export const Default = (
  props: ComponentProps
): JSX.Element => (
  <AppPlaceholder
    name={props.rendering?.params?.sig || ""}
    rendering={props.rendering}
    page={props.page}
    componentMap={componentMap}
  />
);
