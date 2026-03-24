import { createItem, deleteItem, getItem, getChildren, publishSite, updateItem } from "./authoring-api";
import {
  componentTemplates, pageDefinitions, renderingDefinitions, placeholderSettings,
  SITE_ROOT, TEMPLATES_ROOT, RENDERINGS_ROOT, DATA_ROOT, HOME_PATH,
  type PageComponentInstance, type ComponentTemplate
} from "./content-model";

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

export async function cleanNxpSite(): Promise<SyncResult> {
  const result: SyncResult = { success: true, steps: [], errors: [] };
  console.log("[sitecore-sync] Starting NXP site cleanup...");

  const dataFolder = await getItem(DATA_ROOT);
  if (dataFolder) {
    const children = await getChildren(DATA_ROOT);
    for (const child of children) {
      const deleted = await deleteItem(child.id);
      result.steps.push({
        action: "delete",
        target: child.path,
        status: deleted ? "success" : "error",
        message: deleted ? `Deleted data item: ${child.name}` : `Failed to delete: ${child.name}`,
      });
      if (!deleted) result.errors.push(`Failed to delete data item: ${child.path}`);
    }
  }

  const homePage = await getItem(HOME_PATH);
  if (homePage) {
    const homeChildren = await getChildren(HOME_PATH);
    for (const child of homeChildren) {
      const deleted = await deleteItem(child.id);
      result.steps.push({
        action: "delete",
        target: child.path,
        status: deleted ? "success" : "error",
      });
      if (!deleted) result.errors.push(`Failed to delete page: ${child.path}`);
    }
  }

  const templateFolder = await getItem(TEMPLATES_ROOT);
  if (templateFolder) {
    const children = await getChildren(TEMPLATES_ROOT);
    for (const child of children) {
      const deleted = await deleteItem(child.id);
      result.steps.push({
        action: "delete",
        target: child.path,
        status: deleted ? "success" : "error",
      });
    }
  }

  const renderingFolder = await getItem(RENDERINGS_ROOT);
  if (renderingFolder) {
    const children = await getChildren(RENDERINGS_ROOT);
    for (const child of children) {
      const deleted = await deleteItem(child.id);
      result.steps.push({
        action: "delete",
        target: child.path,
        status: deleted ? "success" : "error",
      });
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
    const created = await createItem({
      name: "NXP",
      parentPath: "/sitecore/templates/Project",
      templateId: "{35E75C72-4985-4E09-88C3-0EAC6CD1E64F}",
    });
    if (!created) {
      result.errors.push("Failed to create templates root folder");
      result.success = false;
      return result;
    }
    result.steps.push({ action: "create", target: TEMPLATES_ROOT, status: "success", message: "Created template folder" });
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
        templateId: "{AB86861A-6030-46C5-B394-E8F99E8B87DB}",
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
          templateId: "{E269FBB5-E840-44C9-B554-21F40D006296}",
        });
      }

      for (const field of template.fields) {
        await createItem({
          name: field.name,
          parentPath: `${template.path}/${field.section || "Content"}`,
          templateId: "{455A3E98-A627-4B40-8035-E683A20A8288}",
          fields: {
            Type: field.type,
            Shared: field.shared ? "1" : "",
            Unversioned: field.unversioned ? "1" : "",
            "Standard Value": field.standardValue || "",
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
  console.log("[sitecore-sync] Creating rendering definitions...");

  const renderingFolder = await getItem(RENDERINGS_ROOT);
  if (!renderingFolder) {
    const created = await createItem({
      name: "NXP",
      parentPath: "/sitecore/layout/Renderings/Project",
      templateId: "{35E75C72-4985-4E09-88C3-0EAC6CD1E64F}",
    });
    if (!created) {
      result.errors.push("Failed to create renderings folder");
      result.success = false;
      return result;
    }
  }

  for (const rendering of renderingDefinitions) {
    try {
      const existing = await getItem(rendering.path);
      if (existing) {
        result.steps.push({ action: "create", target: rendering.path, status: "skipped", message: "Rendering already exists" });
        continue;
      }

      const renderingItem = await createItem({
        name: rendering.name,
        parentPath: RENDERINGS_ROOT,
        templateId: "{04646A89-996F-4EE7-878A-FFDBF1F0EF0D}",
        fields: {
          "Component Name": rendering.componentName,
          "Datasource Template": rendering.datasourceTemplate || "",
          "Datasource Location": rendering.datasourceLocation || "",
          "Placeholders": rendering.allowedPlaceholders?.join(",") || "",
        },
      });

      if (renderingItem && rendering.variants) {
        for (const variant of rendering.variants) {
          await createItem({
            name: variant.name,
            parentPath: rendering.path,
            templateId: "{6C1C8492-2C76-47B5-B3A5-CF0D8E2A2E5F}",
            fields: {
              "Variant Name": variant.name,
              "Description": variant.description,
              "CSS Class": variant.cssClass,
            },
          });
        }
      }

      result.steps.push({ action: "create", target: rendering.path, status: "success", message: `Created rendering: ${rendering.componentName}` });
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
      parentPath: SITE_ROOT,
      templateId: "{A87A00B1-E6DB-45AB-8B54-636FEC3B5523}",
    });
    result.steps.push({ action: "create", target: DATA_ROOT, status: "success", message: "Created Data folder" });
  }

  for (const pageDef of pageDefinitions) {
    try {
      if (pageDef.name !== "Home") {
        const pathParts = pageDef.path.replace(HOME_PATH + "/", "").split("/");
        let currentPath = HOME_PATH;
        for (let i = 0; i < pathParts.length - 1; i++) {
          const folderPath = `${currentPath}/${pathParts[i]}`;
          const existing = await getItem(folderPath);
          if (!existing) {
            await createItem({
              name: pathParts[i],
              parentPath: currentPath,
              templateId: "{76036F5E-CBCE-46D1-AF0A-4143F9B557AA}",
            });
          }
          currentPath = folderPath;
        }

        const existing = await getItem(pageDef.path);
        if (!existing) {
          const pageItem = await createItem({
            name: pageDef.name,
            parentPath: currentPath,
            templateId: "{76036F5E-CBCE-46D1-AF0A-4143F9B557AA}",
            fields: {
              Title: pageDef.displayName,
            },
          });
          if (pageItem) {
            result.steps.push({ action: "create", target: pageDef.path, status: "success", message: `Created page: ${pageDef.displayName}` });
          }
        }
      }

      for (const comp of pageDef.components) {
        const datasourcePath = `${DATA_ROOT}/${comp.datasourceName}`;
        const existingDs = await getItem(datasourcePath);
        if (existingDs) {
          await updateItem({ itemId: existingDs.id, fields: comp.fields });
          result.steps.push({ action: "update", target: datasourcePath, status: "success", message: `Updated datasource: ${comp.datasourceName}` });
        } else {
          const template = componentTemplates.find(t => t.name === comp.renderingName);
          if (template) {
            const dsItem = await createItem({
              name: comp.datasourceName,
              parentPath: DATA_ROOT,
              templateId: template.path,
              fields: comp.fields,
            });
            if (dsItem) {
              result.steps.push({ action: "create", target: datasourcePath, status: "success", message: `Created datasource: ${comp.datasourceName}` });

              if (comp.children) {
                const childTemplate = componentTemplates.find(t => t.name === comp.children!.templateName);
                if (childTemplate) {
                  for (const childItem of comp.children.items) {
                    await createItem({
                      name: childItem.name,
                      parentPath: datasourcePath,
                      templateId: childTemplate.path,
                      fields: childItem.fields,
                    });
                  }
                  result.steps.push({ action: "create", target: `${datasourcePath}/*`, status: "success", message: `Created ${comp.children.items.length} child items` });
                }
              }
            }
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
    target: "NXP site",
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

  console.log("[sitecore-sync] Step 1/5: Cleaning existing content...");
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
