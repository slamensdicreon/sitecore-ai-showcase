'use client';
import { JSX } from 'react';
import { EditingScripts, useSitecore } from '@sitecore-content-sdk/nextjs';
import CdpPageView from 'components/content-sdk/CdpPageView';

const Scripts = (): JSX.Element => {
  const { page } = useSitecore();
  const hasSitecoreData = !!page?.layout?.sitecore;

  return (
    <>
      {hasSitecoreData && <CdpPageView />}
      {hasSitecoreData && <EditingScripts />}
    </>
  );
};

export default Scripts;
