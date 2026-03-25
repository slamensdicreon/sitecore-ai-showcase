import { getItem, getChildren, createItem, updateItem, deleteItem, publishSite } from "./authoring-api";
import {
  SITE_ROOT, RENDERINGS_ROOT, TEMPLATES_ROOT,
  renderingDefinitions, componentTemplates, placeholderSettings,
} from "./content-model";

const PARTIAL_DESIGN_TEMPLATE = "{FE137C63-3C98-4CF5-8839-EA1043B0FA25}";
const PLACEHOLDER_SETTINGS_TEMPLATE = "{5C547D4E-7111-4995-95B0-6B561D1DF2E0}";
const JSON_RENDERING_TEMPLATE = "{04646A89-996F-4EE7-878A-FFDBF1F0EF0D}";
const FOLDER_TEMPLATE = "{A87A00B1-E6DB-45AB-8B54-636FEC3B5523}";

const PARTIAL_DESIGNS_PATH = `${SITE_ROOT}/Presentation/Partial Designs`;
const PLACEHOLDER_SETTINGS_PATH = `${SITE_ROOT}/Presentation/Placeholder Settings`;
const RENDERING_PATH = RENDERINGS_ROOT;

interface StepLog {
  action: string;
  target: string;
  status: "ok" | "created" | "updated" | "deleted" | "error" | "skipped";
  detail?: string;
}

const log: StepLog[] = [];

function logStep(action: string, target: string, status: StepLog["status"], detail?: string) {
  log.push({ action, target, status, detail });
  const icon = status === "ok" ? "✓" : status === "created" ? "+" : status === "updated" ? "~" : status === "deleted" ? "-" : status === "error" ? "✗" : "⊘";
  console.log(`  ${icon} [${action}] ${target}${detail ? ` — ${detail}` : ""}`);
}

async function auditRenderings() {
  console.log("\n═══ 1. Auditing Renderings ═══");

  const folder = await getItem(RENDERING_PATH);
  if (!folder) {
    logStep("check", RENDERING_PATH, "error", "Renderings folder not found");
    return;
  }
  logStep("check", RENDERING_PATH, "ok", "Renderings folder exists");

  const existing = await getChildren(RENDERING_PATH);
  const existingByName = new Map(existing.map(r => [r.name, r]));

  for (const rd of renderingDefinitions) {
    const item = existingByName.get(rd.name);
    if (item) {
      const currentComponentName = item.fields?.["componentName"] || "";
      if (currentComponentName !== rd.componentName) {
        await updateItem({
          itemId: item.id,
          fields: {
            componentName: rd.componentName,
            "Data source": rd.datasourceTemplate || "",
            "Datasource Location": rd.datasourceLocation || "",
          },
        });
        logStep("rendering", rd.name, "updated", `componentName: ${currentComponentName} → ${rd.componentName}`);
      } else {
        logStep("rendering", rd.name, "ok", `componentName=${currentComponentName}`);
      }
    } else {
      const created = await createItem({
        name: rd.name,
        parentPath: RENDERING_PATH,
        templateId: JSON_RENDERING_TEMPLATE,
        fields: {
          componentName: rd.componentName,
          "Data source": rd.datasourceTemplate || "",
          "Datasource Location": rd.datasourceLocation || "",
        },
      });
      logStep("rendering", rd.name, created ? "created" : "error", created ? `componentName=${rd.componentName}` : "Failed to create");
    }
  }

  const orphanName = "SolutionsHero";
  const orphan = existingByName.get(orphanName);
  if (orphan) {
    await deleteItem(orphan.id);
    logStep("rendering", orphanName, "deleted", "Orphaned rendering with wrong componentName");
  }
}

async function auditTemplates() {
  console.log("\n═══ 2. Auditing Templates ═══");

  const folder = await getItem(TEMPLATES_ROOT);
  if (!folder) {
    logStep("check", TEMPLATES_ROOT, "error", "Templates folder not found");
    return;
  }

  const existing = await getChildren(TEMPLATES_ROOT);
  const existingByName = new Map(existing.map(t => [t.name, t]));

  for (const ct of componentTemplates) {
    if (existingByName.has(ct.name)) {
      logStep("template", ct.name, "ok", "Exists");
    } else {
      logStep("template", ct.name, "error", "MISSING — needs to be created via sync");
    }
  }
}

async function auditPlaceholderSettings() {
  console.log("\n═══ 3. Auditing Placeholder Settings ═══");

  const presentationPath = `${SITE_ROOT}/Presentation`;
  const presentation = await getItem(presentationPath);
  if (!presentation) {
    logStep("check", presentationPath, "error", "Presentation folder not found");
    return;
  }

  let psFolder = await getItem(PLACEHOLDER_SETTINGS_PATH);
  if (!psFolder) {
    psFolder = await createItem({
      name: "Placeholder Settings",
      parentPath: presentationPath,
      templateId: FOLDER_TEMPLATE,
    });
    logStep("folder", PLACEHOLDER_SETTINGS_PATH, psFolder ? "created" : "error");
  } else {
    logStep("check", PLACEHOLDER_SETTINGS_PATH, "ok", "Folder exists");
  }
  if (!psFolder) return;

  const existingSettings = await getChildren(PLACEHOLDER_SETTINGS_PATH);
  const existingByName = new Map(existingSettings.map(s => [s.name, s]));

  for (const ps of placeholderSettings) {
    const existing = existingByName.get(ps.name);

    const renderingFolder = await getItem(RENDERING_PATH);
    if (!renderingFolder) continue;
    const allRenderings = await getChildren(RENDERING_PATH);
    const renderingIds = ps.allowedComponents
      .map(name => {
        const r = allRenderings.find(r => r.name === name || r.fields?.["componentName"] === name);
        return r ? r.id : null;
      })
      .filter(Boolean);

    const allowedValue = renderingIds.map(id => `{${id!.replace(/[{}]/g, "").toUpperCase()}}`).join("|");

    if (existing) {
      await updateItem({
        itemId: existing.id,
        fields: {
          "Allowed Controls": allowedValue,
        },
      });
      logStep("placeholder", ps.name, "updated", `${renderingIds.length} allowed renderings`);
    } else {
      const created = await createItem({
        name: ps.name,
        parentPath: PLACEHOLDER_SETTINGS_PATH,
        templateId: PLACEHOLDER_SETTINGS_TEMPLATE,
        fields: {
          "Allowed Controls": allowedValue,
        },
      });
      logStep("placeholder", ps.name, created ? "created" : "error", `${renderingIds.length} allowed renderings`);
    }
  }
}

async function auditPartialDesigns() {
  console.log("\n═══ 4. Auditing Partial Designs ═══");

  const presentationPath = `${SITE_ROOT}/Presentation`;
  let pdFolder = await getItem(PARTIAL_DESIGNS_PATH);
  if (!pdFolder) {
    pdFolder = await createItem({
      name: "Partial Designs",
      parentPath: presentationPath,
      templateId: FOLDER_TEMPLATE,
    });
    logStep("folder", PARTIAL_DESIGNS_PATH, pdFolder ? "created" : "error");
  } else {
    logStep("check", PARTIAL_DESIGNS_PATH, "ok", "Folder exists");
  }
  if (!pdFolder) return;

  const defaultPdPath = `${PARTIAL_DESIGNS_PATH}/Default`;
  let defaultPd = await getItem(defaultPdPath);
  if (!defaultPd) {
    defaultPd = await createItem({
      name: "Default",
      parentPath: PARTIAL_DESIGNS_PATH,
      templateId: PARTIAL_DESIGN_TEMPLATE,
    });
    logStep("partial-design", "Default", defaultPd ? "created" : "error", "Default partial design for header/footer");
  } else {
    logStep("partial-design", "Default", "ok", "Exists");
  }
}

async function auditSiteGrouping() {
  console.log("\n═══ 5. Auditing Site Configuration ═══");

  const siteGroupingPath = `${SITE_ROOT}/Settings/Site Grouping`;
  const siteGrouping = await getItem(siteGroupingPath);
  if (!siteGrouping) {
    logStep("check", siteGroupingPath, "error", "Site Grouping not found");
    return;
  }

  const children = await getChildren(siteGroupingPath);
  for (const child of children) {
    const host = child.fields?.["RenderingHost"] || "(not set)";
    logStep("site-grouping", child.name, "ok", `RenderingHost=${host}`);
  }
}

async function auditPages() {
  console.log("\n═══ 6. Auditing Pages & Datasources ═══");

  const homePath = `${SITE_ROOT}/Home`;
  const home = await getItem(homePath);
  if (!home) {
    logStep("check", homePath, "error", "Home page not found");
    return;
  }
  logStep("page", "Home", "ok");

  const homeChildren = await getChildren(homePath);
  for (const child of homeChildren) {
    logStep("page/folder", child.name, "ok", `template=${child.templateId}`);
    if (child.name === "Solutions" || child.name === "Data") {
      const subChildren = await getChildren(child.path);
      for (const sub of subChildren) {
        logStep("  child", sub.name, "ok");
      }
    }
  }
}

async function publishAll() {
  console.log("\n═══ 7. Publishing to Edge ═══");
  const result = await publishSite();
  logStep("publish", "Experience Edge", result ? "ok" : "error", result ? "Publish initiated" : "Publish failed");
}

async function main() {
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║   Sitecore CMS Audit & Fix                  ║");
  console.log("╚══════════════════════════════════════════════╝");

  await auditRenderings();
  await auditTemplates();
  await auditPlaceholderSettings();
  await auditPartialDesigns();
  await auditSiteGrouping();
  await auditPages();
  await publishAll();

  console.log("\n═══ Summary ═══");
  const counts = {
    ok: log.filter(s => s.status === "ok").length,
    created: log.filter(s => s.status === "created").length,
    updated: log.filter(s => s.status === "updated").length,
    deleted: log.filter(s => s.status === "deleted").length,
    error: log.filter(s => s.status === "error").length,
    skipped: log.filter(s => s.status === "skipped").length,
  };
  console.log(`  ✓ OK: ${counts.ok}  |  + Created: ${counts.created}  |  ~ Updated: ${counts.updated}  |  - Deleted: ${counts.deleted}  |  ✗ Errors: ${counts.error}`);

  if (counts.error > 0) {
    console.log("\n  Errors:");
    for (const s of log.filter(s => s.status === "error")) {
      console.log(`    ✗ ${s.action}: ${s.target} — ${s.detail}`);
    }
  }
}

main().catch(e => {
  console.error("Fatal error:", e);
  process.exit(1);
});
