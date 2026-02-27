import React, { JSX } from "react";
import { Field, Page, DesignLibraryApp } from "@sitecore-content-sdk/nextjs";
import Scripts from "src/Scripts";
import SitecoreStyles from "components/content-sdk/SitecoreStyles";
import { AppPlaceholder } from "@sitecore-content-sdk/nextjs";
import componentMap from ".sitecore/component-map";
import { DefaultPlaceholder } from "src/components/default-content/DefaultContent";

interface LayoutProps {
  page: Page;
  routePath?: string;
}

export interface RouteFields {
  [key: string]: unknown;
  Title?: Field;
}

function isPlaceholderEmpty(
  route: any,
  placeholderName: string
): boolean {
  const ph = route?.placeholders?.[placeholderName];
  return !ph || ph.length === 0;
}

const sectionLayoutStyles = `
  #content {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }
  #content > * {
    grid-column: 1 / -1;
  }
  #content > .component.feature-card {
    grid-column: auto;
  }
  @media (max-width: 900px) {
    #content > .component.feature-card {
      grid-column: 1 / -1;
    }
  }
`;

const Layout = ({ page, routePath: urlPath }: LayoutProps): JSX.Element => {
  const { layout, mode } = page;
  const route = layout?.sitecore?.route ?? null;
  const routePath = urlPath || (route?.name === 'Home' ? '/' : route?.name ? `/${route.name}` : '/');
  const mainClassPageEditing = mode.isEditing ? "editing-mode" : "prod-mode";

  const headerEmpty = isPlaceholderEmpty(route, "headless-header");
  const mainEmpty = isPlaceholderEmpty(route, "headless-main");
  const footerEmpty = isPlaceholderEmpty(route, "headless-footer");

  return (
    <>
      <Scripts />
      {layout?.sitecore && <SitecoreStyles layoutData={layout} />}
      <style dangerouslySetInnerHTML={{ __html: sectionLayoutStyles }} />
      <div className={mainClassPageEditing}>
        {mode.isDesignLibrary ? (
          route && (
            <DesignLibraryApp
              page={page}
              rendering={route}
              componentMap={componentMap}
              loadServerImportMap={() => import(".sitecore/import-map.server")}
            />
          )
        ) : (
          <>
            <header>
              <div id="header">
                {route && !headerEmpty ? (
                  <AppPlaceholder
                    page={page}
                    componentMap={componentMap}
                    name="headless-header"
                    rendering={route}
                  />
                ) : (
                  <DefaultPlaceholder name="headless-header" routePath={routePath} />
                )}
              </div>
            </header>
            <main>
              <div id="content">
                {route && !mainEmpty ? (
                  <AppPlaceholder
                    page={page}
                    componentMap={componentMap}
                    name="headless-main"
                    rendering={route}
                  />
                ) : (
                  <DefaultPlaceholder name="headless-main" routePath={routePath} />
                )}
              </div>
            </main>
            <footer>
              <div id="footer">
                {route && !footerEmpty ? (
                  <AppPlaceholder
                    page={page}
                    componentMap={componentMap}
                    name="headless-footer"
                    rendering={route}
                  />
                ) : (
                  <DefaultPlaceholder name="headless-footer" routePath={routePath} />
                )}
              </div>
            </footer>
          </>
        )}
      </div>
    </>
  );
};

export default Layout;
