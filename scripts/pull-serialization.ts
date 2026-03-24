import { getItem, getChildren } from "../server/sitecore/authoring-api";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATES_ROOT = "/sitecore/templates/Project/nxp";
const RENDERINGS_ROOT = "/sitecore/layout/Renderings/Project/build/NovaTech";

const OUTPUT_BASE = path.resolve(__dirname, "../authoring/items/te-connector");

function formatGuid(raw: string): string {
  const clean = raw.replace(/[{}\-]/g, "").toLowerCase();
  if (clean.length !== 32) return raw.toLowerCase();
  return `${clean.slice(0,8)}-${clean.slice(8,12)}-${clean.slice(12,16)}-${clean.slice(16,20)}-${clean.slice(20)}`;
}

function generateYaml(item: {
  id: string;
  name: string;
  path: string;
  parentId: string;
  templateId: string;
  sharedFields?: { id: string; hint: string; value: string }[];
  langFields?: { id: string; hint: string; value: string }[];
}): string {
  let yaml = `---\nID: "${formatGuid(item.id)}"\nParent: "${formatGuid(item.parentId)}"\nTemplate: "${formatGuid(item.templateId)}"\nPath: "${item.path}"\n`;

  if (item.sharedFields && item.sharedFields.length > 0) {
    yaml += `SharedFields:\n`;
    for (const f of item.sharedFields) {
      yaml += `- ID: "${formatGuid(f.id)}"\n  Hint: ${f.hint}\n  Value: ${JSON.stringify(f.value)}\n`;
    }
  }

  yaml += `Languages:\n- Language: en\n  Versions:\n  - Version: 1\n    Fields:\n`;
  yaml += `    - ID: "25bed78c-4957-4165-998a-ca1b52f67497"\n      Hint: __Created\n      Value: 20260324T000000Z\n`;
  yaml += `    - ID: "5dd74568-4d4b-44c1-b513-0af5f4cda34f"\n      Hint: __Created by\n      Value: |\n        sitecore\\Admin\n`;
  yaml += `    - ID: "8cdc337e-a112-42fb-bbb4-4143751e123f"\n      Hint: __Revision\n      Value: "${formatGuid(crypto.randomUUID())}"\n`;
  yaml += `    - ID: "badd9cf9-53e0-4d0c-bcc0-2d784c282f6a"\n      Hint: __Updated by\n      Value: |\n        sitecore\\Admin\n`;
  yaml += `    - ID: "d9cf14b1-fa16-4ba6-9288-e8a174d4d522"\n      Hint: __Updated\n      Value: 20260324T000000Z\n`;

  if (item.langFields && item.langFields.length > 0) {
    for (const f of item.langFields) {
      yaml += `    - ID: "${formatGuid(f.id)}"\n      Hint: ${f.hint}\n      Value: ${JSON.stringify(f.value)}\n`;
    }
  }

  return yaml;
}

function safeDirName(name: string): string {
  return name.replace(/[<>:"/\\|?*]/g, "_");
}

async function pullTree(rootPath: string, outputDir: string, parentId: string) {
  const children = await getChildren(rootPath);
  if (!children || children.length === 0) return;

  for (const child of children) {
    const childDir = path.join(outputDir, safeDirName(child.name));
    const childFields = child.fields || {};

    const sharedFields: { id: string; hint: string; value: string }[] = [];

    if (childFields["__Icon"]) {
      sharedFields.push({ id: "06d5295c-ed2f-4a54-9bf2-26228d113318", hint: "__Icon", value: childFields["__Icon"] });
    }
    if (childFields["Type"]) {
      sharedFields.push({ id: "ab162cc0-dc80-4abf-8871-998ee5d7ba32", hint: "Type", value: childFields["Type"] });
    }
    if (childFields["componentName"]) {
      sharedFields.push({ id: "037fe404-dd19-4bf7-8e30-4dadf68b27b0", hint: "componentName", value: childFields["componentName"] });
    }
    if (childFields["Datasource Template"] || childFields["Data source"]) {
      const dsTemplate = childFields["Datasource Template"] || childFields["Data source"] || "";
      sharedFields.push({ id: "1a7c85e5-dc0b-490d-9187-bb1dbcb4c72f", hint: "Datasource Template", value: dsTemplate });
    }
    if (childFields["Datasource Location"]) {
      sharedFields.push({ id: "b5b27af1-25ef-405c-87ce-369b3a004016", hint: "Datasource Location", value: childFields["Datasource Location"] });
    }

    const yaml = generateYaml({
      id: child.id,
      name: child.name,
      path: child.path,
      parentId: parentId,
      templateId: child.templateId,
      sharedFields,
    });

    fs.mkdirSync(childDir, { recursive: true });
    fs.writeFileSync(path.join(childDir.replace(/\/$/, "") + ".yml"), yaml);

    await pullTree(child.path, childDir, child.id);
  }
}

async function main() {
  console.log("Pulling serialization from XM Cloud...");

  fs.rmSync(path.join(OUTPUT_BASE, "te-connector.templates"), { recursive: true, force: true });
  fs.rmSync(path.join(OUTPUT_BASE, "te-connector.renderings"), { recursive: true, force: true });
  fs.rmSync(path.join(OUTPUT_BASE, "templates"), { recursive: true, force: true });
  fs.rmSync(path.join(OUTPUT_BASE, "renderings"), { recursive: true, force: true });

  const templatesRoot = await getItem(TEMPLATES_ROOT);
  if (!templatesRoot) {
    console.error("Templates root not found at", TEMPLATES_ROOT);
    process.exit(1);
  }

  console.log(`Templates root: ${templatesRoot.id} at ${templatesRoot.path}`);
  const templatesDir = path.join(OUTPUT_BASE, "te-connector.templates");
  fs.mkdirSync(templatesDir, { recursive: true });

  const templatesRootYaml = generateYaml({
    id: templatesRoot.id,
    name: templatesRoot.name,
    path: templatesRoot.path,
    parentId: "825b30b4-b40b-422e-9920-23a1b6bda89c",
    templateId: templatesRoot.templateId,
    sharedFields: [],
  });
  fs.writeFileSync(path.join(templatesDir, `${safeDirName(templatesRoot.name)}.yml`), templatesRootYaml);

  await pullTree(TEMPLATES_ROOT, path.join(templatesDir, safeDirName(templatesRoot.name)), templatesRoot.id);

  const renderingsRoot = await getItem(RENDERINGS_ROOT);
  if (!renderingsRoot) {
    console.error("Renderings root not found at", RENDERINGS_ROOT);
    process.exit(1);
  }

  console.log(`Renderings root: ${renderingsRoot.id} at ${renderingsRoot.path}`);
  const renderingsDir = path.join(OUTPUT_BASE, "te-connector.renderings");
  fs.mkdirSync(renderingsDir, { recursive: true });

  const renderingsParent = await getItem("/sitecore/layout/Renderings/Project/build");
  const renderingsParentId = renderingsParent ? renderingsParent.id : "00000000-0000-0000-0000-000000000000";

  const renderingsRootYaml = generateYaml({
    id: renderingsRoot.id,
    name: renderingsRoot.name,
    path: renderingsRoot.path,
    parentId: renderingsParentId,
    templateId: renderingsRoot.templateId,
    sharedFields: [],
  });
  fs.writeFileSync(path.join(renderingsDir, `${safeDirName(renderingsRoot.name)}.yml`), renderingsRootYaml);

  await pullTree(RENDERINGS_ROOT, path.join(renderingsDir, safeDirName(renderingsRoot.name)), renderingsRoot.id);

  const moduleJson = {
    "$schema": "../../.sitecore/schemas/ModuleFile.schema.json",
    "namespace": "Project.te-connector",
    "items": {
      "path": ".",
      "includes": [
        {
          "name": "te-connector.templates",
          "path": TEMPLATES_ROOT,
          "allowedPushOperations": "CreateUpdateAndDelete"
        },
        {
          "name": "te-connector.renderings",
          "path": RENDERINGS_ROOT,
          "allowedPushOperations": "CreateUpdateAndDelete"
        }
      ]
    }
  };
  fs.writeFileSync(path.join(OUTPUT_BASE, "te-connector.module.json"), JSON.stringify(moduleJson, null, 2));

  const count = countYamlFiles(OUTPUT_BASE);
  console.log(`\nSerialization complete: ${count} YAML files written to ${OUTPUT_BASE}`);
}

function countYamlFiles(dir: string): number {
  let count = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith(".yml")) count++;
    else if (entry.isDirectory()) count += countYamlFiles(path.join(dir, entry.name));
  }
  return count;
}

main().catch(e => {
  console.error("Fatal:", e);
  process.exit(1);
});
