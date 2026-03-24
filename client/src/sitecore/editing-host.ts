import type { LayoutServiceResponse } from "./types";

export interface EditingData {
  layoutData: LayoutServiceResponse;
  language: string;
  dictionary: Record<string, string>;
}

export function isEditingRequest(): boolean {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return (
    params.has("sc_mode") ||
    params.has("sc_itemid") ||
    params.has("sc_lang") ||
    window.location.pathname.includes("/_sc/editing")
  );
}

export function getEditingParams(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    if (key.startsWith("sc_")) {
      result[key] = value;
    }
  });
  return result;
}

export function injectEditingScripts() {
  if (typeof window === "undefined") return;
  if (!isEditingRequest()) return;

  document.documentElement.classList.add("sc-editing");

  const style = document.createElement("style");
  style.textContent = `
    .sc-editing [data-sc-component] {
      position: relative;
      outline: 1px dashed rgba(85, 72, 217, 0.3);
      outline-offset: 2px;
      transition: outline-color 0.2s;
    }
    .sc-editing [data-sc-component]:hover {
      outline-color: rgba(85, 72, 217, 0.7);
    }
    .sc-editing [data-sc-component]::before {
      content: attr(data-sc-component);
      position: absolute;
      top: -18px;
      left: 4px;
      font-size: 10px;
      font-family: Inter, sans-serif;
      background: #5548D9;
      color: white;
      padding: 1px 6px;
      border-radius: 3px;
      z-index: 100;
      opacity: 0;
      transition: opacity 0.2s;
      pointer-events: none;
    }
    .sc-editing [data-sc-component]:hover::before {
      opacity: 1;
    }
    .sc-editing .sc-placeholder-empty {
      min-height: 80px;
    }
  `;
  document.head.appendChild(style);
}

export function notifyEditingHost(event: string, data?: any) {
  if (typeof window === "undefined") return;
  if (!window.parent || window.parent === window) return;

  window.parent.postMessage(
    {
      type: `sc:${event}`,
      ...data,
    },
    "*"
  );
}

export function setupEditingMessageListener() {
  if (typeof window === "undefined") return;

  window.addEventListener("message", (event) => {
    if (!event.data?.type?.startsWith("sc:")) return;

    const { type, ...data } = event.data;

    switch (type) {
      case "sc:route:change":
        if (data.path && typeof window !== "undefined") {
          window.location.href = data.path;
        }
        break;
      case "sc:component:select":
        const el = document.querySelector(`[data-sc-uid="${data.uid}"]`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          (el as HTMLElement).style.outline = "2px solid #5548D9";
          setTimeout(() => {
            (el as HTMLElement).style.outline = "";
          }, 2000);
        }
        break;
      case "sc:refresh":
        window.location.reload();
        break;
    }
  });
}
