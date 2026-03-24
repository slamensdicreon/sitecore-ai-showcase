import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { SitecoreContextValue, LayoutServiceResponse, RouteData } from "./types";

const SitecoreContext = createContext<SitecoreContextValue>({
  isEditing: false,
  language: "en",
  siteName: "NXP",
  route: null,
  layoutData: null,
});

export function useSitecoreContext() {
  return useContext(SitecoreContext);
}

export function useIsEditing() {
  const ctx = useContext(SitecoreContext);
  return ctx.isEditing;
}

export function useRouteData() {
  const ctx = useContext(SitecoreContext);
  return ctx.route;
}

interface SitecoreProviderProps {
  children: React.ReactNode;
  layoutData?: LayoutServiceResponse | null;
}

export function SitecoreProvider({ children, layoutData }: SitecoreProviderProps) {
  const [contextValue, setContextValue] = useState<SitecoreContextValue>({
    isEditing: layoutData?.sitecore?.context?.pageEditing ?? false,
    language: layoutData?.sitecore?.context?.language ?? "en",
    siteName: layoutData?.sitecore?.context?.site?.name ?? "NXP",
    route: layoutData?.sitecore?.route ?? null,
    layoutData: layoutData ?? null,
  });

  useEffect(() => {
    if (layoutData) {
      setContextValue({
        isEditing: layoutData.sitecore?.context?.pageEditing ?? false,
        language: layoutData.sitecore?.context?.language ?? "en",
        siteName: layoutData.sitecore?.context?.site?.name ?? "NXP",
        route: layoutData.sitecore?.route ?? null,
        layoutData,
      });
    }
  }, [layoutData]);

  const updateContext = useCallback((updates: Partial<SitecoreContextValue>) => {
    setContextValue((prev) => ({ ...prev, ...updates }));
  }, []);

  return (
    <SitecoreContext.Provider value={contextValue}>
      {children}
    </SitecoreContext.Provider>
  );
}

export function isEditingMode(): boolean {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return params.has("sc_mode") && params.get("sc_mode") === "edit";
}

export function isPreviewMode(): boolean {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return params.has("sc_mode") && params.get("sc_mode") === "preview";
}
