import { getAuthoringToken } from '../server/sitecore/auth';
import * as fs from 'fs';
import * as path from 'path';

const CM = 'https://xmc-icreonpartn828a-novatech15a9-novatechf6c7.sitecorecloud.io';
let token = '';

function fmtGuid(raw: string): string {
  const s = raw.replace(/-/g, '');
  return `${s.slice(0,8)}-${s.slice(8,12)}-${s.slice(12,16)}-${s.slice(16,20)}-${s.slice(20)}`;
}

async function gql(q: string): Promise<any> {
  const r = await fetch(CM + '/sitecore/api/authoring/graphql/v1', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ query: q }),
  });
  const d: any = await r.json();
  if (d.errors?.length) console.error('GQL_ERR:', JSON.stringify(d.errors));
  return d.data;
}

async function getItem(pathStr: string, includeAllFields = false) {
  const fieldsQ = includeAllFields ? 'fields(ownFields: false) { nodes { name value } }' : 'fields(ownFields: true) { nodes { name value } }';
  const frag = `name itemId path template { templateId name } ${fieldsQ}`;
  const q = `query { item(where: { path: "${pathStr}" }) { ${frag} children { nodes { ${frag} } } } }`;
  return (await gql(q))?.item;
}

async function getItemDeep(pathStr: string) {
  const frag = `name itemId path template { templateId name } fields(ownFields: true) { nodes { name value } }`;
  const q = `query { item(where: { path: "${pathStr}" }) { ${frag} children { nodes { ${frag} children { nodes { ${frag} children { nodes { ${frag} } } } } } } } }`;
  return (await gql(q))?.item;
}

function yamlForItem(item: any, parentId: string): string {
  const id = fmtGuid(item.itemId);
  const templateId = fmtGuid(item.template?.templateId || item.templateId || '00000000000000000000000000000000');
  const lines = [
    '---',
    `ID: "${id}"`,
    `Parent: "${fmtGuid(parentId)}"`,
    `Template: "${templateId}"`,
    `Path: "${item.path}"`,
    'Languages:',
    '- Language: en',
    '  Versions:',
    '  - Version: 1',
    '    Fields:',
  ];

  const ownFields = item.fields?.nodes || [];
  for (const f of ownFields) {
    if (f.name.startsWith('__')) continue;
    if (!f.value) continue;
    if (f.value.includes('\n') || f.value.includes('<')) {
      lines.push(`    - Hint: ${f.name}`);
      lines.push(`      Value: |`);
      for (const l of f.value.split('\n')) {
        lines.push(`        ${l}`);
      }
    } else {
      lines.push(`    - Hint: ${f.name}`);
      lines.push(`      Value: "${f.value.replace(/"/g, '\\"')}"`);
    }
  }

  lines.push(`    - ID: "25bed78c-4957-4165-998a-ca1b52f67497"`);
  lines.push(`      Hint: __Created`);
  lines.push(`      Value: 20260325T000000Z`);
  lines.push(`    - ID: "5dd74568-4d4b-44c1-b513-0af5f4cda34f"`);
  lines.push(`      Hint: __Created by`);
  lines.push(`      Value: |`);
  lines.push(`        sitecore\\Admin`);

  return lines.join('\n');
}

function writeYaml(dir: string, fileName: string, content: string) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, fileName), content + '\n');
}

function writeItemAndChildren(item: any, parentId: string, baseDir: string) {
  const yml = yamlForItem(item, parentId);
  writeYaml(baseDir, item.name + '.yml', yml);

  for (const child of item.children?.nodes || []) {
    const childDir = path.join(baseDir, item.name);
    writeItemAndChildren(child, item.itemId, childDir);
  }
}

async function main() {
  token = await getAuthoringToken();
  const base = 'authoring/items/te-connector';

  // 1. Templates
  console.log('Generating template YAML...');
  const tplFolder = await getItemDeep('/sitecore/templates/Project/NovaTech');
  if (tplFolder) {
    const tplDir = path.join(base, 'te-connector.templates/NovaTech');
    fs.mkdirSync(tplDir, { recursive: true });
    // Remove old template YAMLs
    const oldTplDir = path.join(base, 'te-connector.templates/nxp');
    if (fs.existsSync(oldTplDir)) {
      console.log('  Removing old template dir:', oldTplDir);
      fs.rmSync(oldTplDir, { recursive: true });
    }

    const ntFolderId = tplFolder.itemId;
    const parentOfNT = await gql(`query { item(where: { path: "/sitecore/templates/Project" }) { itemId } }`);
    const projectId = parentOfNT?.item?.itemId;

    // Write folder YAML
    const folderYml = yamlForItem({ ...tplFolder, fields: { nodes: [] } }, projectId);
    writeYaml(path.join(base, 'te-connector.templates'), 'NovaTech.yml', folderYml);

    for (const tpl of tplFolder.children?.nodes || []) {
      writeItemAndChildren(tpl, ntFolderId, tplDir);
    }
    console.log('  Templates done:', tplFolder.children?.nodes?.length);
  }

  // 2. Renderings
  console.log('Generating rendering YAML...');
  const rndFolder = await getItem('/sitecore/layout/Renderings/Project/NovaTech', true);
  if (rndFolder) {
    const rndDir = path.join(base, 'te-connector.renderings/NovaTech');
    // Remove old rendering YAMLs
    const oldRndDir = path.join(base, 'te-connector.renderings/NovaTech');
    if (fs.existsSync(oldRndDir)) {
      fs.rmSync(oldRndDir, { recursive: true });
    }
    fs.mkdirSync(rndDir, { recursive: true });

    const rndParent = await gql(`query { item(where: { path: "/sitecore/layout/Renderings/Project" }) { itemId } }`);

    // Write folder YAML
    const folderYml = yamlForItem({ ...rndFolder, fields: { nodes: [] } }, rndParent?.item?.itemId);
    writeYaml(path.join(base, 'te-connector.renderings'), 'NovaTech.yml', folderYml);

    for (const rnd of rndFolder.children?.nodes || []) {
      // Get full field data for rendering (including inherited)
      const fullRnd = await getItem(rnd.path, true);
      const fields = (fullRnd?.fields?.nodes || []).filter((f: any) => !f.name.startsWith('__') && f.value);
      const rndYml = yamlForItem({ ...rnd, fields: { nodes: fields } }, rndFolder.itemId);
      writeYaml(rndDir, rnd.name + '.yml', rndYml);
    }
    console.log('  Renderings done:', rndFolder.children?.nodes?.length);
  }

  // 3. Content pages
  console.log('Generating content YAML...');
  const contentDir = path.join(base, 'te-connector.content/Home');
  // Remove old content dir
  if (fs.existsSync(contentDir)) {
    fs.rmSync(contentDir, { recursive: true });
  }

  const homeItem = await gql(`query { item(where: { path: "/sitecore/content/TE Connectivity/TE Connectivity/Home" }) { itemId } }`);
  const homeId = homeItem?.item?.itemId;

  const pages = [
    '/sitecore/content/TE Connectivity/TE Connectivity/Home/NT_Homepage',
    '/sitecore/content/TE Connectivity/TE Connectivity/Home/NT_Solutions',
    '/sitecore/content/TE Connectivity/TE Connectivity/Home/NT_Innovation',
  ];

  for (const p of pages) {
    const page = await getItemDeep(p);
    if (page) {
      writeItemAndChildren(page, homeId, contentDir);
      console.log('  Page:', page.name);
    }
  }

  // Sub-pages of NT_Solutions
  const solItem = await gql(`query { item(where: { path: "/sitecore/content/TE Connectivity/TE Connectivity/Home/NT_Solutions" }) { itemId } }`);
  const solId = solItem?.item?.itemId;
  const subPages = [
    '/sitecore/content/TE Connectivity/TE Connectivity/Home/NT_Solutions/NT_Communications',
    '/sitecore/content/TE Connectivity/TE Connectivity/Home/NT_Solutions/NT_Industrial',
    '/sitecore/content/TE Connectivity/TE Connectivity/Home/NT_Solutions/NT_Transportation',
  ];
  for (const p of subPages) {
    const page = await getItemDeep(p);
    if (page) {
      writeItemAndChildren(page, solId, path.join(contentDir, 'NT_Solutions'));
      console.log('  Sub-page:', page.name);
    }
  }

  // 4. Presentation (designs)
  console.log('Generating presentation YAML...');
  const presDir = path.join(base, 'te-connector.presentation/Presentation');
  if (fs.existsSync(presDir)) {
    fs.rmSync(presDir, { recursive: true });
  }

  const presItem = await getItemDeep('/sitecore/content/TE Connectivity/TE Connectivity/Presentation');
  if (presItem) {
    const siteRoot = await gql(`query { item(where: { path: "/sitecore/content/TE Connectivity/TE Connectivity" }) { itemId } }`);
    writeItemAndChildren(presItem, siteRoot?.item?.itemId, path.join(base, 'te-connector.presentation'));
    console.log('  Presentation done');
  }

  // 5. Update module.json
  console.log('Updating module.json...');
  const moduleJson = {
    "$schema": "../../.sitecore/schemas/ModuleFile.schema.json",
    "namespace": "Project.te-connector",
    "items": {
      "path": ".",
      "includes": [
        {
          "name": "te-connector.templates",
          "path": "/sitecore/templates/Project/NovaTech",
          "allowedPushOperations": "CreateUpdateAndDelete"
        },
        {
          "name": "te-connector.renderings",
          "path": "/sitecore/layout/Renderings/Project/NovaTech",
          "allowedPushOperations": "CreateUpdateAndDelete"
        },
        {
          "name": "te-connector.site",
          "path": "/sitecore/content/TE Connectivity",
          "scope": "SingleItem",
          "allowedPushOperations": "CreateAndUpdate"
        },
        {
          "name": "te-connector.site-root",
          "path": "/sitecore/content/TE Connectivity/TE Connectivity",
          "scope": "SingleItem",
          "allowedPushOperations": "CreateAndUpdate"
        },
        {
          "name": "te-connector.site-grouping",
          "path": "/sitecore/content/TE Connectivity/TE Connectivity/Settings/Site Grouping/TE Connectivity",
          "scope": "SingleItem",
          "allowedPushOperations": "CreateAndUpdate"
        },
        {
          "name": "te-connector.presentation",
          "path": "/sitecore/content/TE Connectivity/TE Connectivity/Presentation",
          "scope": "ItemAndDescendants",
          "allowedPushOperations": "CreateUpdateAndDelete"
        },
        {
          "name": "te-connector.content",
          "path": "/sitecore/content/TE Connectivity/TE Connectivity/Home",
          "scope": "ItemAndDescendants",
          "allowedPushOperations": "CreateAndUpdate"
        }
      ]
    }
  };
  fs.writeFileSync(path.join(base, 'te-connector.module.json'), JSON.stringify(moduleJson, null, 2) + '\n');

  console.log('\n=== YAML GENERATION COMPLETE ===');
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
