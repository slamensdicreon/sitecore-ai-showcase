import { createItem, deleteItem, getItem, getChildren, publishSite, updateItem } from "./authoring-api";
import {
  componentTemplates, pageDefinitions, renderingDefinitions,
  SITE_ROOT, TEMPLATES_ROOT, RENDERINGS_ROOT, DATA_ROOT, HOME_PATH,
  type ComponentTemplate
} from "./content-model";

function formatGuid(raw: string): string {
  const clean = raw.replace(/[{}-]/g, "").toUpperCase();
  if (clean.length !== 32) return `{${raw}}`;
  return `{${clean.slice(0,8)}-${clean.slice(8,12)}-${clean.slice(12,16)}-${clean.slice(16,20)}-${clean.slice(20)}}`;
}

const JSON_RENDERING_TEMPLATE = "{04646A89-996F-4EE7-878A-FFDBF1F0EF0D}";
const TEMPLATE_TEMPLATE = "{AB86861A-6030-46C5-B394-E8F99E8B87DB}";
const TEMPLATE_SECTION = "{E269FBB5-3750-427A-9149-7AA950B49301}";
const TEMPLATE_FIELD = "{455A3E98-A627-4B40-8035-E683A0331AC7}";
const FOLDER_TEMPLATE = "{A87A00B1-E6DB-45AB-8B54-636FEC3B5523}";
const NODE_TEMPLATE = "{35E75C72-4985-4E09-88C3-0EAC6CD1E64F}";

export interface SyncResult {
  success: boolean;
  steps: SyncStep[];
  errors: string[];
}

export interface SyncStep {
  action: string;
  target: string;
  status: "success" | "error" | "skipped";
  message?: string;
}

const TE_RENDERING_NAMES = renderingDefinitions.map(r => r.name);
const TE_TEMPLATE_NAMES = componentTemplates.map(t => t.name);
const TE_DATASOURCE_NAMES = pageDefinitions.flatMap(p => p.components.map(c => c.datasourceName));

export async function cleanNxpSite(): Promise<SyncResult> {
  const result: SyncResult = { success: true, steps: [], errors: [] };
  console.log("[sitecore-sync] Cleaning TE demo content only (preserving existing site items)...");

  const dataFolder = await getItem(DATA_ROOT);
  if (dataFolder) {
    const children = await getChildren(DATA_ROOT);
    for (const child of children) {
      if (TE_DATASOURCE_NAMES.includes(child.name)) {
        const deleted = await deleteItem(child.id);
        result.steps.push({
          action: "delete",
          target: child.path,
          status: deleted ? "success" : "error",
          message: deleted ? `Deleted TE datasource: ${child.name}` : `Failed to delete: ${child.name}`,
        });
        if (!deleted) result.errors.push(`Failed to delete datasource: ${child.path}`);
      }
    }
  }

  const renderingFolder = await getItem(RENDERINGS_ROOT);
  if (renderingFolder) {
    const children = await getChildren(RENDERINGS_ROOT);
    for (const child of children) {
      if (TE_RENDERING_NAMES.includes(child.name)) {
        const deleted = await deleteItem(child.id);
        result.steps.push({
          action: "delete",
          target: child.path,
          status: deleted ? "success" : "error",
          message: deleted ? `Deleted TE rendering: ${child.name}` : `Failed to delete: ${child.name}`,
        });
      }
    }
  }

  const templateFolder = await getItem(TEMPLATES_ROOT);
  if (templateFolder) {
    const children = await getChildren(TEMPLATES_ROOT);
    for (const child of children) {
      if (TE_TEMPLATE_NAMES.includes(child.name)) {
        const deleted = await deleteItem(child.id);
        result.steps.push({
          action: "delete",
          target: child.path,
          status: deleted ? "success" : "error",
        });
      }
    }
  }

  result.success = result.errors.length === 0;
  console.log(`[sitecore-sync] Cleanup complete. ${result.steps.length} items processed, ${result.errors.length} errors`);
  return result;
}

export async function createTemplates(): Promise<SyncResult> {
  const result: SyncResult = { success: true, steps: [], errors: [] };
  console.log("[sitecore-sync] Creating component templates...");

  const templateFolder = await getItem(TEMPLATES_ROOT);
  if (!templateFolder) {
    result.steps.push({ action: "info", target: TEMPLATES_ROOT, status: "skipped", message: "Templates root already exists" });
  }

  for (const template of componentTemplates) {
    try {
      const existing = await getItem(template.path);
      if (existing) {
        result.steps.push({ action: "create", target: template.path, status: "skipped", message: "Template already exists" });
        continue;
      }

      const templateItem = await createItem({
        name: template.name,
        parentPath: TEMPLATES_ROOT,
        templateId: TEMPLATE_TEMPLATE,
      });

      if (!templateItem) {
        result.errors.push(`Failed to create template: ${template.name}`);
        continue;
      }

      const sections = [...new Set(template.fields.map(f => f.section || "Content"))];
      for (const sectionName of sections) {
        await createItem({
          name: sectionName,
          parentPath: template.path,
          templateId: TEMPLATE_SECTION,
        });
      }

      for (const field of template.fields) {
        await createItem({
          name: field.name,
          parentPath: `${template.path}/${field.section || "Content"}`,
          templateId: TEMPLATE_FIELD,
          fields: {
            Type: field.type,
            Shared: field.shared ? "1" : "",
            Unversioned: field.unversioned ? "1" : "",
          },
        });
      }

      result.steps.push({ action: "create", target: template.path, status: "success", message: `Created template with ${template.fields.length} fields` });
    } catch (e) {
      const msg = `Error creating template ${template.name}: ${(e as Error).message}`;
      result.errors.push(msg);
      result.steps.push({ action: "create", target: template.path, status: "error", message: msg });
    }
  }

  result.success = result.errors.length === 0;
  console.log(`[sitecore-sync] Templates: ${result.steps.filter(s => s.status === "success").length} created, ${result.errors.length} errors`);
  return result;
}

export async function createRenderings(): Promise<SyncResult> {
  const result: SyncResult = { success: true, steps: [], errors: [] };
  console.log("[sitecore-sync] Creating rendering definitions under build/NovaTech...");

  const renderingFolder = await getItem(RENDERINGS_ROOT);
  if (!renderingFolder) {
    result.errors.push(`Renderings folder not found at ${RENDERINGS_ROOT}`);
    result.success = false;
    return result;
  }

  for (const rendering of renderingDefinitions) {
    try {
      const existing = await getItem(rendering.path);
      if (existing) {
        await updateItem({
          itemId: existing.id,
          fields: {
            componentName: rendering.componentName,
            "Data source": rendering.datasourceTemplate || "",
            "Datasource Location": rendering.datasourceLocation || "",
          },
        });
        result.steps.push({ action: "update", target: rendering.path, status: "success", message: `Updated rendering: ${rendering.componentName}` });
        continue;
      }

      const renderingItem = await createItem({
        name: rendering.name,
        parentPath: RENDERINGS_ROOT,
        templateId: JSON_RENDERING_TEMPLATE,
        fields: {
          componentName: rendering.componentName,
          "Data source": rendering.datasourceTemplate || "",
          "Datasource Location": rendering.datasourceLocation || "",
        },
      });

      if (renderingItem) {
        result.steps.push({ action: "create", target: rendering.path, status: "success", message: `Created rendering: ${rendering.componentName}` });
      } else {
        result.errors.push(`Failed to create rendering: ${rendering.name}`);
      }
    } catch (e) {
      const msg = `Error creating rendering ${rendering.name}: ${(e as Error).message}`;
      result.errors.push(msg);
      result.steps.push({ action: "create", target: rendering.path, status: "error", message: msg });
    }
  }

  result.success = result.errors.length === 0;
  return result;
}

export async function createPages(): Promise<SyncResult> {
  const result: SyncResult = { success: true, steps: [], errors: [] };
  console.log("[sitecore-sync] Creating page items and datasources...");

  const dataFolder = await getItem(DATA_ROOT);
  if (!dataFolder) {
    await createItem({
      name: "Data",
      parentPath: HOME_PATH,
      templateId: FOLDER_TEMPLATE,
    });
    result.steps.push({ action: "create", target: DATA_ROOT, status: "success", message: "Created Data folder" });
  }

  for (const pageDef of pageDefinitions) {
    try {
      for (const comp of pageDef.components) {
        const datasourcePath = `${DATA_ROOT}/${comp.datasourceName}`;
        const existingDs = await getItem(datasourcePath);
        if (existingDs) {
          await updateItem({ itemId: existingDs.id, fields: comp.fields });
          result.steps.push({ action: "update", target: datasourcePath, status: "success", message: `Updated datasource: ${comp.datasourceName}` });
        } else {
          const template = componentTemplates.find(t => t.name === comp.renderingName);
          let templateId = FOLDER_TEMPLATE;
          if (template) {
            const templateItem = await getItem(template.path);
            if (templateItem) {
              templateId = formatGuid(templateItem.id);
            }
          }
          const dsItem = await createItem({
            name: comp.datasourceName,
            parentPath: DATA_ROOT,
            templateId,
            fields: comp.fields,
          });
          if (dsItem) {
            result.steps.push({ action: "create", target: datasourcePath, status: "success", message: `Created datasource: ${comp.datasourceName}` });

            if (comp.children) {
              const childTemplate = componentTemplates.find(t => t.name === comp.children!.templateName);
              if (childTemplate) {
                const childTemplateItem = await getItem(childTemplate.path);
                const childTemplateId = childTemplateItem ? formatGuid(childTemplateItem.id) : FOLDER_TEMPLATE;
                for (const childItem of comp.children.items) {
                  await createItem({
                    name: childItem.name,
                    parentPath: datasourcePath,
                    templateId: childTemplateId,
                    fields: childItem.fields,
                  });
                }
                result.steps.push({ action: "create", target: `${datasourcePath}/*`, status: "success", message: `Created ${comp.children.items.length} child items` });
              }
            }
          } else {
            result.errors.push(`Failed to create datasource: ${comp.datasourceName}`);
          }
        }
      }
    } catch (e) {
      const msg = `Error creating page ${pageDef.name}: ${(e as Error).message}`;
      result.errors.push(msg);
      result.steps.push({ action: "create", target: pageDef.path, status: "error", message: msg });
    }
  }

  result.success = result.errors.length === 0;
  console.log(`[sitecore-sync] Pages: ${result.steps.filter(s => s.status === "success").length} created/updated, ${result.errors.length} errors`);
  return result;
}

export async function publishToEdge(): Promise<SyncResult> {
  const result: SyncResult = { success: true, steps: [], errors: [] };
  console.log("[sitecore-sync] Publishing to Edge...");

  const published = await publishSite();
  result.steps.push({
    action: "publish",
    target: "nxp site",
    status: published ? "success" : "error",
    message: published ? "Full site publish initiated" : "Publish failed",
  });

  result.success = published;
  if (!published) result.errors.push("Failed to publish site to Edge");
  return result;
}

export async function fullSync(): Promise<SyncResult> {
  const allSteps: SyncStep[] = [];
  const allErrors: string[] = [];

  console.log("[sitecore-sync] === Starting full NXP site sync ===");

  console.log("[sitecore-sync] Step 1/5: Cleaning existing TE content...");
  const cleanResult = await cleanNxpSite();
  allSteps.push(...cleanResult.steps);
  allErrors.push(...cleanResult.errors);

  console.log("[sitecore-sync] Step 2/5: Creating templates...");
  const templateResult = await createTemplates();
  allSteps.push(...templateResult.steps);
  allErrors.push(...templateResult.errors);

  console.log("[sitecore-sync] Step 3/5: Creating renderings...");
  const renderingResult = await createRenderings();
  allSteps.push(...renderingResult.steps);
  allErrors.push(...renderingResult.errors);

  console.log("[sitecore-sync] Step 4/5: Creating pages and datasources...");
  const pageResult = await createPages();
  allSteps.push(...pageResult.steps);
  allErrors.push(...pageResult.errors);

  console.log("[sitecore-sync] Step 5/5: Publishing to Edge...");
  const publishResult = await publishToEdge();
  allSteps.push(...publishResult.steps);
  allErrors.push(...publishResult.errors);

  console.log(`[sitecore-sync] === Sync complete: ${allSteps.length} steps, ${allErrors.length} errors ===`);

  return {
    success: allErrors.length === 0,
    steps: allSteps,
    errors: allErrors,
  };
}
