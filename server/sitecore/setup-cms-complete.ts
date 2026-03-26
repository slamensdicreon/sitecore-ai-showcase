import { getAuthoringToken } from "./auth";

const CM_BASE = process.env.SITECORE_CM_URL || "https://xmc-icreonpartn828a-novatech15a9-novatechf6c7.sitecorecloud.io";
const GQL = `${CM_BASE}/sitecore/api/authoring/graphql/v1`;

async function gql<T = any>(query: string, variables?: Record<string, any>): Promise<T> {
  const token = await getAuthoringToken();
  const res = await fetch(GQL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ query, variables }),
  });
  const data = await res.json();
  if (data.errors?.length) {
    console.error("GQL errors:", JSON.stringify(data.errors, null, 2));
    throw new Error("GQL error: " + data.errors[0].message);
  }
  return data.data;
}

async function getItemId(path: string): Promise<string | null> {
  try {
    const d = await gql(`query($p:String!){item(where:{path:$p}){itemId}}`, { p: path });
    return d?.item?.itemId || null;
  } catch { return null; }
}

async function getItemFields(path: string): Promise<{ id: string; fields: Record<string, string> } | null> {
  try {
    const d = await gql(`query($p:String!){item(where:{path:$p}){itemId fields(ownFields:false){nodes{name value}}}}`, { p: path });
    if (!d?.item) return null;
    const fields: Record<string, string> = {};
    for (const f of d.item.fields?.nodes || []) fields[f.name] = f.value;
    return { id: d.item.itemId, fields };
  } catch { return null; }
}

async function getItemWithTemplate(path: string): Promise<{ id: string; templateId: string } | null> {
  try {
    const d = await gql(`query($p:String!){item(where:{path:$p}){itemId template{templateId}}}`, { p: path });
    if (!d?.item) return null;
    return { id: d.item.itemId, templateId: d.item.template?.templateId || "" };
  } catch { return null; }
}

function normalizeGuid(g: string): string {
  return g.replace(/[{}-]/g, "").toLowerCase();
}

async function ensureItem(parentPath: string, name: string, templateId: string, fields?: Record<string, string>): Promise<string> {
  const fullPath = `${parentPath}/${name}`;
  const existing = await getItemWithTemplate(fullPath);
  if (existing) {
    const expectedTpl = normalizeGuid(templateId);
    const actualTpl = normalizeGuid(existing.templateId);
    if (actualTpl !== expectedTpl) {
      console.log(`  ⚠ ${fullPath}: wrong template (${actualTpl}), expected (${expectedTpl}). Deleting and recreating...`);
      await gql(`mutation($id:ID!){deleteItem(input:{itemId:$id}){successful}}`, { id: existing.id });
    } else {
      if (fields && Object.keys(fields).length > 0) {
        await gql(`mutation($id:ID!,$lang:String!,$fields:[FieldValueInput!]!){updateItem(input:{itemId:$id,language:$lang,fields:$fields}){item{itemId}}}`, {
          id: existing.id, lang: "en",
          fields: Object.entries(fields).map(([name, value]) => ({ name, value: value || "" })),
        });
      }
      return existing.id;
    }
  }
  const parentId = await getItemId(parentPath);
  if (!parentId) throw new Error(`Parent not found: ${parentPath}`);
  const d = await gql(`mutation($n:String!,$p:ID!,$t:ID!,$l:String!,$f:[FieldValueInput!]){createItem(input:{name:$n,parent:$p,templateId:$t,language:$l,fields:$f}){item{itemId}}}`, {
    n: name, p: parentId, t: templateId, l: "en",
    f: fields ? Object.entries(fields).map(([name, value]) => ({ name, value: value || "" })) : [],
  });
  const id = d?.createItem?.item?.itemId;
  if (!id) throw new Error(`Failed to create ${fullPath}`);
  console.log(`  + Created ${fullPath}`);
  return id;
}

async function setLayout(itemId: string, finalRenderings: string, sharedRenderings?: string) {
  const fields: { name: string; value: string }[] = [
    { name: "__Final Renderings", value: finalRenderings },
  ];
  if (sharedRenderings) {
    fields.push({ name: "__Renderings", value: sharedRenderings });
  }
  await gql(`mutation($id:ID!,$lang:String!,$fields:[FieldValueInput!]!){updateItem(input:{itemId:$id,language:$lang,fields:$fields}){item{itemId}}}`, {
    id: itemId, lang: "en", fields,
  });
}

const SITE_ROOT = "/sitecore/content/TE Connectivity/TE Connectivity";
const TEMPLATES_ROOT = "/sitecore/templates/Project/nxp";
const RENDERINGS_ROOT = "/sitecore/layout/Renderings/Project/build/NovaTech";
const BRANCHES_ROOT = "/sitecore/templates/Branches/Project/build";

const WELL_KNOWN_DEVICE_PATH = "/sitecore/layout/Devices/Default";
const WELL_KNOWN_LAYOUT_PATH = "/sitecore/layout/Layouts/Project/build/Headless Layout";

let DEVICE_ID = "{FE5D7FDF-89C0-4D99-9AA3-B5FBD009C9F3}";
let LAYOUT_ID = "{96E5F4BA-A2CF-4A4C-A4E7-64DA88226362}";

function formatGuid(raw: string): string {
  const hex = raw.replace(/[{}-]/g, "").toUpperCase();
  if (hex.length !== 32) return `{${raw.replace(/[{}]/g, "")}}`;
  return `{${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}}`;
}

async function resolveWellKnownIds() {
  const deviceId = await getItemId(WELL_KNOWN_DEVICE_PATH);
  if (deviceId) {
    DEVICE_ID = formatGuid(deviceId);
    console.log(`  Resolved Device ID: ${DEVICE_ID}`);
  } else {
    console.log(`  ⚠ Could not resolve device at ${WELL_KNOWN_DEVICE_PATH}, using fallback ${DEVICE_ID}`);
  }
  const layoutId = await getItemId(WELL_KNOWN_LAYOUT_PATH);
  if (layoutId) {
    LAYOUT_ID = formatGuid(layoutId);
    console.log(`  Resolved Layout ID: ${LAYOUT_ID}`);
  } else {
    console.log(`  ⚠ Could not resolve layout at ${WELL_KNOWN_LAYOUT_PATH}, using fallback ${LAYOUT_ID}`);
  }
}

const BRANCH_TEMPLATE_ID = "{35E75C72-4985-4E09-88C3-0EAC6CD1E64F}";
const PAGE_TEMPLATE_ID = "{57D89B89-6F79-44E7-B5BD-435326761859}";
const PAGE_DATA_TEMPLATE_ID = "{1C82E550-EBCD-4E5D-8ABD-D50D0809541E}";
const FOLDER_TEMPLATE_ID = "{A87A00B1-E6DB-45AB-8B54-636FEC3B5523}";

const RENDERING_IDS: Record<string, string> = {
  "Hero Banner":       "055C6661-4626-4E8F-8453-2D4805CE88A6",
  "Mega Trends":       "3C9096AE-2412-44C1-8D8E-2FD6968D13CC",
  "Solution Pathways": "1C31FEF4-1226-4C10-B47E-8787E1A0E3A0",
  "Authority Stats":   "82DF2D4D-D64D-44AE-B50C-23A4CFF187DD",
  "Solution Hero":     "C01A77B7-2FC9-459D-8952-613F009105D4",
  "Solution Narrative":"716F45F8-B1F0-49DB-9C1B-E008C65514D4",
  "Product Discovery": "0E0F2E66-1B94-4CD2-A8AC-36590E41CF3A",
  "Proof Point Counter":"ED6E623A-A365-4B6C-A84C-97904CED3922",
  "Cross Navigation":  "42125EA2-75A6-4542-A370-BB5257790416",
  "Rich Text Block":   "89FA3DB5-21D1-49D9-8601-5CDE77B62B19",
};

const TEMPLATE_IDS: Record<string, string> = {
  "Hero Banner":       "5cf185add3a54f198fb8488ed5a54e03",
  "Mega Trends":       "18a95f742dcf4798914747694b9836e2",
  "Mega Trend Card":   "0430fee585b049a9b8f9d4c2dcdd11f8",
  "Solution Pathways": "4a8ad106274b4d86b91c7aa1e7e37602",
  "Solution Pathway Card":"41d38ce8d5654c25aab75a8aa6887ce6",
  "Authority Stats":   "e90b7fd6538a47d1a26e3e25d46e7689",
  "Stat Item":         "19929c41cc3a44968ea3d35bbaefbdb0",
  "Solution Hero":     "7325aeca17f840eba3c74b7e1ebc0773",
  "Solution Narrative":"af57195c3edf40039ae87bc936d89aa3",
  "Product Discovery": "345cbcfcb37141579156c4ce95e0563c",
  "Cross Navigation":  "4dd207edc4d0411d91b93c976922a2e7",
  "Cross Nav Link":    "25e5d6f8b178416baab34c033ce84913",
  "Rich Text Block":   "f21694227ea041d681298a3f9c1c819a",
  "Proof Point Counter":"c70ba91ec359415fa45d73bb6366b49a",
  "Proof Point Item":  "aa2b393cfbff4f41b85424420d279803",
};

function guid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  }).toUpperCase();
}

interface RenderingEntry {
  renderingName: string;
  datasourceId: string;
}

function buildSharedLayout(): string {
  return `<r xmlns:xsd="http://www.w3.org/2001/XMLSchema"><d id="${DEVICE_ID}" l="${LAYOUT_ID}" /></r>`;
}

function buildFinalRenderings(entries: RenderingEntry[]): string {
  const renderings = entries.map(e => {
    const uid = `{${guid()}}`;
    const rid = RENDERING_IDS[e.renderingName];
    if (!rid) throw new Error(`Unknown rendering: ${e.renderingName}`);
    return `<r uid="${uid}" p:before="*" s:id="${formatGuid(rid)}" s:ph="headless-main" s:ds="${formatGuid(e.datasourceId)}" />`;
  }).join("");
  return `<r xmlns:p="p" xmlns:s="s" p:p="1"><d id="${DEVICE_ID}">${renderings}</d></r>`;
}

const DESIRED_DS_LOCATION = "./Data";

async function step1_fixDatasourceLocation() {
  console.log("\n═══ Step 1: Fix Datasource Location on all renderings ═══");
  const renderings = await gql(`query($p:String!){item(where:{path:$p}){children{nodes{itemId name fields(ownFields:true){nodes{name value}}}}}}`, { p: RENDERINGS_ROOT });
  for (const r of renderings?.item?.children?.nodes || []) {
    const fields = r.fields?.nodes || [];
    const dsLoc = fields.find((f: any) => f.name === "Datasource Location")?.value || "";
    if (dsLoc !== DESIRED_DS_LOCATION) {
      await gql(`mutation($id:ID!,$lang:String!,$fields:[FieldValueInput!]!){updateItem(input:{itemId:$id,language:$lang,fields:$fields}){item{itemId}}}`, {
        id: r.itemId, lang: "en",
        fields: [{ name: "Datasource Location", value: DESIRED_DS_LOCATION }],
      });
      console.log(`  ~ ${r.name}: Datasource Location updated from "${dsLoc}" to "${DESIRED_DS_LOCATION}"`);
    } else {
      console.log(`  ✓ ${r.name}: Datasource Location correct (${dsLoc})`);
    }
  }
}

const DATASOURCE_CHILDREN_RESOLVER_ID = "{2F5C334E-5615-423C-8281-9FC180191302}";

async function step1b_clearRenderingContentsResolver() {
  console.log("\n═══ Step 1b: Clear Rendering Contents Resolver on tile renderings ═══");
  console.log("  (Items are now referenced via Multilist field on parent templates)");
  const tileRenderings = ["Mega Trends", "Solution Pathways", "Authority Stats", "Cross Navigation", "Proof Point Counter"];
  for (const name of tileRenderings) {
    const rawId = RENDERING_IDS[name];
    if (!rawId) { console.log(`  ⚠ Rendering ID not found for: ${name}`); continue; }
    const id = rawId.replace(/[{}-]/g, "").toLowerCase();
    try {
      await gql(`mutation($id:ID!,$lang:String!,$fields:[FieldValueInput!]!){updateItem(input:{itemId:$id,language:$lang,fields:$fields}){item{itemId}}}`, {
        id, lang: "en",
        fields: [{ name: "Rendering Contents Resolver", value: "" }],
      });
      console.log(`  ✓ ${name}: Rendering Contents Resolver cleared`);
    } catch (e) {
      console.error(`  ✗ ${name}: ${(e as Error).message}`);
    }
  }
}

const VARIANT_DEFINITION_TEMPLATE_ID = "4d50cdaec2d94de8b0808f992bfb1b55";
const HEADLESS_VARIANTS_ROOT = `${SITE_ROOT}/Presentation/Headless Variants`;

async function step1c_ensureHeroBannerVariants() {
  console.log("\n═══ Step 1c: Ensure HeroBanner Headless Variant items ═══");
  const heroVariantsPath = `${HEADLESS_VARIANTS_ROOT}/HeroBanner`;
  const heroVariantsId = await getItemId(heroVariantsPath);
  if (!heroVariantsId) {
    console.log("  ⚠ HeroBanner variants folder not found, skipping");
    return;
  }
  const requiredVariants = ["Default", "Compact", "Centered", "Right Justified"];
  for (const name of requiredVariants) {
    await ensureItem(heroVariantsPath, name, VARIANT_DEFINITION_TEMPLATE_ID);
    console.log(`  ✓ Variant: ${name}`);
  }
}

const TEMPLATE_FIELD_TEMPLATE_ID = "{455A3E98-A627-4B40-8035-E683A0331AC7}";
const TEMPLATE_SECTION_TEMPLATE_ID = "e269fbb53750427a91497aa950b49301";

async function step1d_addMultilistFields() {
  console.log("\n═══ Step 1d: Add 'Items' Multilist field to tile templates ═══");

  const DATA_ROOT = `${SITE_ROOT}/Home/Data`;
  const templates = [
    { name: "Mega Trends", cardsFolder: "Mega Trend Cards" },
    { name: "Solution Pathways", cardsFolder: "Solution Pathway Cards" },
    { name: "Authority Stats", cardsFolder: "Stat Items" },
    { name: "Cross Navigation", cardsFolder: "Cross Nav Links" },
    { name: "Proof Point Counter", cardsFolder: "Proof Point Items" },
  ];

  for (const tpl of templates) {
    await ensureItem(DATA_ROOT, tpl.cardsFolder, FOLDER_TEMPLATE_ID);
    console.log(`  ✓ Cards folder: ${tpl.cardsFolder}`);
  }

  for (const tpl of templates) {
    const tplPath = `${TEMPLATES_ROOT}/${tpl.name}`;
    const d = await gql(`query($p:String!){item(where:{path:$p}){children{nodes{itemId name template{templateId}}}}}`, { p: tplPath });
    const sections = d?.item?.children?.nodes || [];
    const section = sections.find((s: any) =>
      normalizeGuid(s.template?.templateId || '') === TEMPLATE_SECTION_TEMPLATE_ID
    );

    if (!section) {
      console.log(`  ⚠ No section found for ${tpl.name}, skipping`);
      continue;
    }

    const sectionChildren = await gql(`query($id:ID!){item(where:{itemId:$id}){children{nodes{itemId name}}}}`, { id: section.itemId });
    const existingFields = sectionChildren?.item?.children?.nodes || [];
    const itemsField = existingFields.find((f: any) => f.name === 'Items');

    const source = `${DATA_ROOT}/${tpl.cardsFolder}`;

    if (itemsField) {
      await gql(`mutation($id:ID!,$lang:String!,$fields:[FieldValueInput!]!){updateItem(input:{itemId:$id,language:$lang,fields:$fields}){item{itemId}}}`, {
        id: itemsField.itemId, lang: "en",
        fields: [{ name: "Source", value: source }],
      });
      console.log(`  ✓ ${tpl.name}: Items field exists, Source updated to ${source}`);
      continue;
    }

    await gql(`mutation($n:String!,$p:ID!,$t:ID!,$l:String!,$f:[FieldValueInput!]){createItem(input:{name:$n,parent:$p,templateId:$t,language:$l,fields:$f}){item{itemId}}}`, {
      n: "Items",
      p: section.itemId,
      t: TEMPLATE_FIELD_TEMPLATE_ID,
      l: "en",
      f: [
        { name: "Type", value: "Multilist" },
        { name: "Source", value: source },
      ],
    });
    console.log(`  + ${tpl.name}: Items Multilist field added (Source: ${source})`);
  }
}

async function step2_fixHomepage() {
  console.log("\n═══ Step 2: Verify & fix Homepage layout ═══");
  const homePath = `${SITE_ROOT}/Home`;
  const home = await getItemFields(homePath);
  if (!home) { console.log("  ✗ Home page not found!"); return; }

  const dataPath = `${homePath}/Data`;
  const heroId = await getItemId(`${dataPath}/Home Hero`);
  const megaId = await getItemId(`${dataPath}/Home Mega Trends`);
  const pathwaysId = await getItemId(`${dataPath}/Home Solution Pathways`);
  const statsId = await getItemId(`${dataPath}/Home Authority Stats`);

  if (!heroId || !megaId || !pathwaysId || !statsId) {
    console.log("  ✗ Missing datasource items!");
    console.log(`    Hero=${heroId} Mega=${megaId} Pathways=${pathwaysId} Stats=${statsId}`);
    return;
  }

  const finalRenderings = buildFinalRenderings([
    { renderingName: "Hero Banner", datasourceId: heroId },
    { renderingName: "Mega Trends", datasourceId: megaId },
    { renderingName: "Solution Pathways", datasourceId: pathwaysId },
    { renderingName: "Authority Stats", datasourceId: statsId },
  ]);

  await setLayout(home.id, finalRenderings, buildSharedLayout());
  console.log("  ✓ Homepage layout set with 4 renderings + shared layout");
}

async function step2b_createCardItems() {
  console.log("\n═══ Step 2b: Create card items in shared folders & populate Multilist ═══");

  const dataPath = `${SITE_ROOT}/Home/Data`;
  const megaCardsFolder = `${dataPath}/Mega Trend Cards`;
  const pathwayCardsFolder = `${dataPath}/Solution Pathway Cards`;
  const statCardsFolder = `${dataPath}/Stat Items`;
  const crossNavCardsFolder = `${dataPath}/Cross Nav Links`;

  const megaTrendCards = [
    { name: "Electrification", fields: { "Title": "Electrification", "Subtitle": "Powering the transition to electric everything", "Description": "From EV battery systems to renewable energy grids, TE connectivity solutions enable the reliable flow of power across next-generation electrical architectures.", "Stat Value": "40%", "Stat Label": "growth in EV connector demand", "Icon Name": "BatteryCharging", "Accent Color": "#f28d00", "Link": '<link linktype="external" url="/solutions/transportation" />' } },
    { name: "AI Infrastructure", fields: { "Title": "AI Infrastructure", "Subtitle": "The backbone of intelligent systems", "Description": "Hyperscale data centers require unprecedented power density and high-speed connectivity. TE delivers both — enabling AI compute at scale.", "Stat Value": "3x", "Stat Label": "data center power demand by 2030", "Icon Name": "Server", "Accent Color": "#167a87", "Link": '<link linktype="external" url="/solutions/communications" />' } },
    { name: "Industrial Automation", fields: { "Title": "Industrial Automation", "Subtitle": "Connecting the smart factory", "Description": "Robotics, smart manufacturing, and factory automation demand connectivity that survives heat, vibration, and continuous operation. That's where TE thrives.", "Stat Value": "90K+", "Stat Label": "employees across 140 countries", "Icon Name": "Factory", "Accent Color": "#2e4957", "Link": '<link linktype="external" url="/solutions/industrial" />' } },
  ];
  const megaTrendIds: string[] = [];
  for (const card of megaTrendCards) {
    const id = await ensureItem(megaCardsFolder, card.name, TEMPLATE_IDS["Mega Trend Card"], card.fields);
    megaTrendIds.push(id);
    console.log(`  ✓ Mega Trend Card: ${card.name}`);
  }
  const megaDsId = await getItemId(`${dataPath}/Home Mega Trends`);
  if (megaDsId) {
    await gql(`mutation($id:ID!,$lang:String!,$fields:[FieldValueInput!]!){updateItem(input:{itemId:$id,language:$lang,fields:$fields}){item{itemId}}}`, {
      id: megaDsId, lang: "en",
      fields: [{ name: "Items", value: megaTrendIds.map(id => formatGuid(id)).join("|") }],
    });
    console.log(`  ✓ Home Mega Trends: Items field set with ${megaTrendIds.length} references`);
  }

  const pathwayCards = [
    { name: "EV Charging", fields: { "Question": "How do I improve EV charging reliability?", "Context": "High-voltage connectors and thermal management solutions engineered for the harshest automotive environments.", "Industry Label": "Transportation", "Link": '<link linktype="external" url="/solutions/transportation" />' } },
    { name: "AI Data Center", fields: { "Question": "How do I scale AI data center infrastructure?", "Context": "High-speed, high-density connectivity solutions that handle the power and signal demands of next-gen AI compute.", "Industry Label": "Communications", "Link": '<link linktype="external" url="/solutions/communications" />' } },
    { name: "Energy Grid", fields: { "Question": "How do I modernize energy grid systems?", "Context": "Utility-grade connectors, sensors, and power distribution solutions for smart grid and renewable energy infrastructure.", "Industry Label": "Industrial", "Link": '<link linktype="external" url="/solutions/industrial" />' } },
    { name: "Signal Integrity", fields: { "Question": "How do I ensure signal integrity in harsh environments?", "Context": "Connectors and sensors rated for extreme temperatures, vibration, and mission-critical reliability across industries.", "Industry Label": "Cross-Industry", "Link": '<link linktype="external" url="/products" />' } },
  ];
  const pathwayIds: string[] = [];
  for (const card of pathwayCards) {
    const id = await ensureItem(pathwayCardsFolder, card.name, TEMPLATE_IDS["Solution Pathway Card"], card.fields);
    pathwayIds.push(id);
    console.log(`  ✓ Solution Pathway Card: ${card.name}`);
  }
  const pathwaysDsId = await getItemId(`${dataPath}/Home Solution Pathways`);
  if (pathwaysDsId) {
    await gql(`mutation($id:ID!,$lang:String!,$fields:[FieldValueInput!]!){updateItem(input:{itemId:$id,language:$lang,fields:$fields}){item{itemId}}}`, {
      id: pathwaysDsId, lang: "en",
      fields: [{ name: "Items", value: pathwayIds.map(id => formatGuid(id)).join("|") }],
    });
    console.log(`  ✓ Home Solution Pathways: Items field set with ${pathwayIds.length} references`);
  }

  const statItems = [
    { name: "Revenue", fields: { "Value": "18", "Prefix": "$", "Suffix": "B+", "Label": "Annual Revenue", "Icon Name": "DollarSign" } },
    { name: "Countries", fields: { "Value": "140", "Prefix": "", "Suffix": "+", "Label": "Countries Served", "Icon Name": "MapPin" } },
    { name: "Engineers", fields: { "Value": "8000", "Prefix": "", "Suffix": "+", "Label": "Engineers Worldwide", "Icon Name": "Wrench" } },
    { name: "Employees", fields: { "Value": "90000", "Prefix": "", "Suffix": "+", "Label": "Global Employees", "Icon Name": "Users" } },
  ];
  const statIds: string[] = [];
  for (const stat of statItems) {
    const id = await ensureItem(statCardsFolder, stat.name, TEMPLATE_IDS["Stat Item"], stat.fields);
    statIds.push(id);
    console.log(`  ✓ Stat Item: ${stat.name}`);
  }
  const statsDsId = await getItemId(`${dataPath}/Home Authority Stats`);
  if (statsDsId) {
    await gql(`mutation($id:ID!,$lang:String!,$fields:[FieldValueInput!]!){updateItem(input:{itemId:$id,language:$lang,fields:$fields}){item{itemId}}}`, {
      id: statsDsId, lang: "en",
      fields: [{ name: "Items", value: statIds.map(id => formatGuid(id)).join("|") }],
    });
    console.log(`  ✓ Home Authority Stats: Items field set with ${statIds.length} references`);
  }

  console.log("\n═══ Step 2c: Create cross nav link items & populate Multilist ═══");

  const crossNavConfigs = [
    {
      dsName: "Transportation Cross Nav",
      items: [
        { name: "Transportation-Industrial", fields: { "Title": "Industrial Solutions", "Description": "Factory automation, robotics, and harsh-environment connectivity", "Link": '<link linktype="external" url="/solutions/industrial" />', "Icon Name": "Factory", "Accent Color": "#2e4957" } },
        { name: "Transportation-Communications", fields: { "Title": "Communications Solutions", "Description": "Data center, 5G, and high-speed network infrastructure", "Link": '<link linktype="external" url="/solutions/communications" />', "Icon Name": "Server", "Accent Color": "#167a87" } },
      ],
    },
    {
      dsName: "Industrial Cross Nav",
      items: [
        { name: "Industrial-Transportation", fields: { "Title": "Transportation Solutions", "Description": "EV powertrains, autonomous systems, and vehicle connectivity", "Link": '<link linktype="external" url="/solutions/transportation" />', "Icon Name": "BatteryCharging", "Accent Color": "#f28d00" } },
        { name: "Industrial-Communications", fields: { "Title": "Communications Solutions", "Description": "Data center, 5G, and high-speed network infrastructure", "Link": '<link linktype="external" url="/solutions/communications" />', "Icon Name": "Server", "Accent Color": "#167a87" } },
      ],
    },
    {
      dsName: "Communications Cross Nav",
      items: [
        { name: "Communications-Transportation", fields: { "Title": "Transportation Solutions", "Description": "EV powertrains, autonomous systems, and vehicle connectivity", "Link": '<link linktype="external" url="/solutions/transportation" />', "Icon Name": "BatteryCharging", "Accent Color": "#f28d00" } },
        { name: "Communications-Industrial", fields: { "Title": "Industrial Solutions", "Description": "Factory automation, robotics, and harsh-environment connectivity", "Link": '<link linktype="external" url="/solutions/industrial" />', "Icon Name": "Factory", "Accent Color": "#2e4957" } },
      ],
    },
  ];

  for (const nav of crossNavConfigs) {
    const navItemIds: string[] = [];
    for (const item of nav.items) {
      const id = await ensureItem(crossNavCardsFolder, item.name, TEMPLATE_IDS["Cross Nav Link"], item.fields);
      navItemIds.push(id);
      console.log(`  ✓ Cross Nav Link: ${item.name}`);
    }
    const navDsId = await getItemId(`${dataPath}/${nav.dsName}`);
    if (navDsId) {
      await gql(`mutation($id:ID!,$lang:String!,$fields:[FieldValueInput!]!){updateItem(input:{itemId:$id,language:$lang,fields:$fields}){item{itemId}}}`, {
        id: navDsId, lang: "en",
        fields: [{ name: "Items", value: navItemIds.map(id => formatGuid(id)).join("|") }],
      });
      console.log(`  ✓ ${nav.dsName}: Items field set with ${navItemIds.length} references`);
    }
  }

  console.log("\n═══ Step 2d: Create Proof Point items in shared folder ═══");
  const proofPointCardsFolder = `${dataPath}/Proof Point Items`;
  const proofPointItems = [
    { name: "Patents Filed", fields: { "Value": "$2,400+", "Label": "Patents Filed", "Description": "Active patents protecting our innovations" } },
    { name: "RD Investment", fields: { "Value": "$640M", "Label": "Annual R&D Investment", "Description": "Invested annually in research and development" } },
    { name: "Engineering Centers", fields: { "Value": "30+", "Label": "Engineering Centers", "Description": "R&D facilities across the globe" } },
    { name: "Product Launches", fields: { "Value": "1,200+", "Label": "New Products per Year", "Description": "New products launched annually" } },
  ];
  for (const item of proofPointItems) {
    await ensureItem(proofPointCardsFolder, item.name, TEMPLATE_IDS["Proof Point Item"], item.fields);
    console.log(`  ✓ Proof Point Item: ${item.name}`);
  }
}

async function step3_fixSolutionPages() {
  console.log("\n═══ Step 3: Create Solution page datasources & fix layouts ═══");

  const crossNavCardsFolder = `${SITE_ROOT}/Home/Data/Cross Nav Links`;

  const solutions = [
    {
      name: "Transportation",
      path: `${SITE_ROOT}/Home/Solutions/Transportation`,
      hero: {
        "Industry Label": "Transportation",
        "Title": "Driving the Future of Mobility",
        "Subtitle": "From EV powertrains to autonomous systems, TE Connectivity delivers the connectors, sensors, and harness solutions that keep next-generation vehicles running safely and efficiently.",
        "Accent Color": "#f28d00",
      },
      narrative: {
        "Section Label": "Our Approach",
        "Heading": "Engineering for the Road Ahead",
        "Lead Text": "TE partners with the world's leading automotive OEMs to co-engineer connectivity solutions that meet the extreme demands of modern vehicles.",
        "Body": "<p>Our transportation portfolio spans high-voltage connectors rated for 800V+ EV architectures, miniaturized sensor arrays for ADAS and autonomous driving, and complete wiring harness systems engineered for weight reduction and thermal management.</p><p>With decades of automotive expertise and global manufacturing scale, TE delivers the reliability that tier-one suppliers and OEMs depend on — from prototype through high-volume production.</p>",
      },
      products: {
        "Section Label": "Featured Products",
        "Heading": "Transportation Solutions",
        "Description": "Explore our range of automotive connectors, sensors, and harness solutions designed for next-generation vehicles.",
        "Max Products": "6",
        "CTA Text": "View All Products",
        "CTA Link": '<link linktype="external" url="/products" />',
      },
      crossNavItems: ["Transportation-Industrial", "Transportation-Communications"],
      crossNav: {
        "Heading": "Explore Related Solutions",
        "Description": "See how TE connectivity solutions serve other industries.",
      },
    },
    {
      name: "Industrial",
      path: `${SITE_ROOT}/Home/Solutions/Industrial`,
      hero: {
        "Industry Label": "Industrial",
        "Title": "Powering the Smart Factory",
        "Subtitle": "Factory automation, robotics, energy management, and harsh-environment connectivity — TE solutions keep industrial systems running in the most demanding conditions.",
        "Accent Color": "#2e4957",
      },
      narrative: {
        "Section Label": "Our Approach",
        "Heading": "Built for the Harshest Environments",
        "Lead Text": "TE industrial solutions are engineered to withstand extreme temperatures, vibration, moisture, and continuous operation cycles that define modern manufacturing.",
        "Body": "<p>Our industrial portfolio includes ruggedized circular and rectangular connectors, industrial Ethernet solutions for real-time factory communication, and sensor systems for predictive maintenance and process control.</p><p>From discrete manufacturing to process industries, TE delivers the connectivity backbone that enables Industry 4.0 — helping manufacturers increase uptime, reduce waste, and accelerate production.</p>",
      },
      products: {
        "Section Label": "Featured Products",
        "Heading": "Industrial Solutions",
        "Description": "Explore our industrial connectors, sensors, and automation solutions built for demanding factory environments.",
        "Max Products": "6",
        "CTA Text": "View All Products",
        "CTA Link": '<link linktype="external" url="/products" />',
      },
      crossNavItems: ["Industrial-Transportation", "Industrial-Communications"],
      crossNav: {
        "Heading": "Explore Related Solutions",
        "Description": "See how TE connectivity solutions serve other industries.",
      },
    },
    {
      name: "Communications",
      path: `${SITE_ROOT}/Home/Solutions/Communications`,
      hero: {
        "Industry Label": "Communications",
        "Title": "Connecting the Digital World",
        "Subtitle": "Data center infrastructure, 5G networks, and high-speed signal integrity — TE delivers the connectivity that powers global communications at scale.",
        "Accent Color": "#167a87",
      },
      narrative: {
        "Section Label": "Our Approach",
        "Heading": "Engineered for Speed and Density",
        "Lead Text": "As data demands accelerate, TE delivers the high-speed, high-density connectivity solutions that hyperscale operators and network builders require.",
        "Body": "<p>Our communications portfolio spans high-speed backplane connectors supporting 112G PAM4 signaling, fiber optic interconnects for data center fabric, and antenna solutions for 5G macro and small cell deployments.</p><p>TE works alongside the world's leading cloud providers and telecom operators to ensure signal integrity, thermal performance, and power delivery at the densities required by next-generation infrastructure.</p>",
      },
      products: {
        "Section Label": "Featured Products",
        "Heading": "Communications Solutions",
        "Description": "Explore our data center connectors, fiber optics, and 5G infrastructure solutions for high-speed networks.",
        "Max Products": "6",
        "CTA Text": "View All Products",
        "CTA Link": '<link linktype="external" url="/products" />',
      },
      crossNavItems: ["Communications-Transportation", "Communications-Industrial"],
      crossNav: {
        "Heading": "Explore Related Solutions",
        "Description": "See how TE connectivity solutions serve other industries.",
      },
    },
  ];

  await ensureItem(`${SITE_ROOT}/Home`, "Solutions", PAGE_TEMPLATE_ID, { Title: "Solutions" });

  for (const sol of solutions) {
    const pageId = await ensureItem(`${SITE_ROOT}/Home/Solutions`, sol.name, PAGE_TEMPLATE_ID, {
      Title: sol.name,
    });

    const dataPath = `${sol.path}/Data`;
    await ensureItem(sol.path, "Data", PAGE_DATA_TEMPLATE_ID);

    const heroId = await ensureItem(dataPath, `${sol.name} Hero`, TEMPLATE_IDS["Solution Hero"], sol.hero);
    console.log(`  ✓ ${sol.name} Hero datasource created`);

    const narrativeId = await ensureItem(dataPath, `${sol.name} Narrative`, TEMPLATE_IDS["Solution Narrative"], sol.narrative);
    console.log(`  ✓ ${sol.name} Narrative datasource created`);

    const productsId = await ensureItem(dataPath, `${sol.name} Products`, TEMPLATE_IDS["Product Discovery"], sol.products);
    console.log(`  ✓ ${sol.name} Products datasource created`);

    const crossNavId = await ensureItem(dataPath, `${sol.name} Cross Nav`, TEMPLATE_IDS["Cross Navigation"], sol.crossNav);
    console.log(`  ✓ ${sol.name} Cross Nav datasource created`);

    const crossNavItemIds: string[] = [];
    for (const itemName of sol.crossNavItems) {
      const id = await getItemId(`${crossNavCardsFolder}/${itemName}`);
      if (id) crossNavItemIds.push(id);
    }
    if (crossNavItemIds.length > 0) {
      await gql(`mutation($id:ID!,$lang:String!,$fields:[FieldValueInput!]!){updateItem(input:{itemId:$id,language:$lang,fields:$fields}){item{itemId}}}`, {
        id: crossNavId, lang: "en",
        fields: [{ name: "Items", value: crossNavItemIds.map(id => formatGuid(id)).join("|") }],
      });
      console.log(`  ✓ ${sol.name} Cross Nav: Items field set with ${crossNavItemIds.length} references`);
    }

    const finalRenderings = buildFinalRenderings([
      { renderingName: "Solution Hero", datasourceId: heroId },
      { renderingName: "Solution Narrative", datasourceId: narrativeId },
      { renderingName: "Product Discovery", datasourceId: productsId },
      { renderingName: "Cross Navigation", datasourceId: crossNavId },
    ]);

    await setLayout(pageId, finalRenderings, buildSharedLayout());
    console.log(`  ✓ ${sol.name} layout set with 4 renderings`);
  }
}

async function step4_createInnovationPage() {
  console.log("\n═══ Step 4: Create Innovation page ═══");

  const innovPath = `${SITE_ROOT}/Home`;
  const innovId = await ensureItem(innovPath, "Innovation", PAGE_TEMPLATE_ID, {
    Title: "Innovation & R&D",
  });

  const dataId = await ensureItem(`${SITE_ROOT}/Home/Innovation`, "Data", PAGE_DATA_TEMPLATE_ID);

  const innovDataPath = `${SITE_ROOT}/Home/Innovation/Data`;

  const heroId = await ensureItem(innovDataPath, "Innovation Hero", TEMPLATE_IDS["Solution Hero"], {
    "Industry Label": "Innovation & R&D",
    "Title": "Engineering Tomorrow's Connections",
    "Subtitle": "TE Connectivity invests over $600M annually in R&D, pushing the boundaries of materials science, miniaturization, and high-speed connectivity to solve challenges that don't yet exist.",
    "Accent Color": "#167a87",
  });

  const narrativeId = await ensureItem(innovDataPath, "Innovation Narrative", TEMPLATE_IDS["Solution Narrative"], {
    "Section Label": "Our Innovation Philosophy",
    "Heading": "Co-Engineering the Future with Our Customers",
    "Lead Text": "Innovation at TE isn't theoretical. It's driven by real engineering challenges from our customers — the world's leading OEMs and system integrators.",
    "Body": "<p>With 8,000+ engineers across 30+ engineering centers worldwide, TE operates at the intersection of fundamental materials science and practical product engineering. Our co-design model means we embed with customer teams from concept through production validation.</p><p>Key focus areas include next-generation high-voltage connectors for 800V+ EV platforms, miniaturized sensor arrays for autonomous systems, and high-density power delivery solutions for AI data centers requiring 100kW+ per rack.</p>",
  });

  const productsId = await ensureItem(innovDataPath, "Innovation Products", TEMPLATE_IDS["Product Discovery"], {
    "Section Label": "Innovation Spotlight",
    "Heading": "Next-Generation Solutions",
    "Description": "Explore our latest innovations in connectivity, sensing, and power management.",
    "Max Products": "6",
    "CTA Text": "View All Innovations",
    "CTA Link": "<link linktype=\"external\" url=\"/products\" />",
  });

  const crossNavId = await ensureItem(innovDataPath, "Innovation Cross Nav", TEMPLATE_IDS["Cross Navigation"], {
    "Heading": "Explore Our Solutions",
    "Description": "See how TE innovation translates into industry-specific solutions.",
  });

  const crossNavCardsFolder = `${SITE_ROOT}/Home/Data/Cross Nav Links`;
  const innovCrossNavIds: string[] = [];
  innovCrossNavIds.push(await ensureItem(crossNavCardsFolder, "Innovation-Transportation", TEMPLATE_IDS["Cross Nav Link"], {
    "Title": "Transportation Solutions",
    "Description": "EV connectors, sensor systems, and automotive harnesses",
    "Link": "<link linktype=\"external\" url=\"/solutions/transportation\" />",
    "Icon Name": "Car",
    "Accent Color": "#f28d00",
  }));
  innovCrossNavIds.push(await ensureItem(crossNavCardsFolder, "Innovation-Industrial", TEMPLATE_IDS["Cross Nav Link"], {
    "Title": "Industrial Solutions",
    "Description": "Factory automation, robotics, and harsh-environment connectivity",
    "Link": "<link linktype=\"external\" url=\"/solutions/industrial\" />",
    "Icon Name": "Factory",
    "Accent Color": "#2e4957",
  }));
  innovCrossNavIds.push(await ensureItem(crossNavCardsFolder, "Innovation-Communications", TEMPLATE_IDS["Cross Nav Link"], {
    "Title": "Communications Solutions",
    "Description": "Data center, 5G, and high-speed network infrastructure",
    "Link": "<link linktype=\"external\" url=\"/solutions/communications\" />",
    "Icon Name": "Server",
    "Accent Color": "#167a87",
  }));
  await gql(`mutation($id:ID!,$lang:String!,$fields:[FieldValueInput!]!){updateItem(input:{itemId:$id,language:$lang,fields:$fields}){item{itemId}}}`, {
    id: crossNavId, lang: "en",
    fields: [{ name: "Items", value: innovCrossNavIds.map(id => formatGuid(id)).join("|") }],
  });
  console.log(`  ✓ Innovation Cross Nav: Items field set with ${innovCrossNavIds.length} references`);

  const finalRenderings = buildFinalRenderings([
    { renderingName: "Solution Hero", datasourceId: heroId },
    { renderingName: "Solution Narrative", datasourceId: narrativeId },
    { renderingName: "Product Discovery", datasourceId: productsId },
    { renderingName: "Cross Navigation", datasourceId: crossNavId },
  ]);

  await setLayout(innovId, finalRenderings, buildSharedLayout());
  console.log("  ✓ Innovation page created with 4 renderings and datasources");
}

// NOTE: Branch templates use actual item GUIDs in s:ds attributes. This is correct
// Sitecore behavior. When a page is created from a branch template, the Sitecore
// engine clones all items under $name and automatically remaps all internal GUID
// references (including s:ds in __Final Renderings) to the newly generated IDs.
// The "local:" syntax is only valid for the Datasource Location field on rendering
// items, NOT for s:ds attributes in layout XML which always require GUIDs.
async function step5_createBranchTemplates() {
  console.log("\n═══ Step 5: Create Branch Templates ═══");

  const branchFolder = await getItemId(BRANCHES_ROOT);
  if (!branchFolder) {
    console.log("  Creating build branch folder...");
    await ensureItem("/sitecore/templates/Branches/Project", "build", FOLDER_TEMPLATE_ID);
  }

  interface BranchDatasource {
    name: string;
    template: string;
    fields: Record<string, string>;
  }
  interface BranchDef {
    name: string;
    renderings: string[];
    datasources: BranchDatasource[];
  }

  const branches: BranchDef[] = [
    {
      name: "Homepage",
      renderings: ["Hero Banner", "Mega Trends", "Solution Pathways", "Authority Stats"],
      datasources: [
        { name: "Hero", template: "Hero Banner", fields: { "Badge Text": "Welcome", "Title": "Page Title", "Title Accent": "Accent", "Subtitle": "Page subtitle goes here" } },
        { name: "Trends", template: "Mega Trends", fields: { "Section Label": "Trends", "Heading": "Industry Mega-Trends", "Description": "Description of key trends" } },
        { name: "Pathways", template: "Solution Pathways", fields: { "Section Label": "Solutions", "Heading": "Explore Solutions", "Description": "Find the right solution for your challenge" } },
        { name: "Stats", template: "Authority Stats", fields: { "Section Label": "By The Numbers", "Heading": "Our Impact", "Description": "Key statistics" } },
      ],
    },
    {
      name: "Solutions Page",
      renderings: ["Solution Hero", "Solution Narrative", "Product Discovery", "Cross Navigation"],
      datasources: [
        { name: "Hero", template: "Solution Hero", fields: { "Industry Label": "Industry", "Title": "Solution Title", "Subtitle": "Solution description" } },
        { name: "Narrative", template: "Solution Narrative", fields: { "Section Label": "The Advantage", "Heading": "Why Choose TE", "Lead Text": "Lead paragraph", "Body": "<p>Body content</p>" } },
        { name: "Products", template: "Product Discovery", fields: { "Section Label": "Products", "Heading": "Featured Products", "Description": "Explore the product portfolio" } },
        { name: "Cross Nav", template: "Cross Navigation", fields: { "Heading": "Explore Other Industries", "Description": "See more solutions" } },
      ],
    },
    {
      name: "Innovation Page",
      renderings: ["Solution Hero", "Solution Narrative", "Product Discovery", "Cross Navigation"],
      datasources: [
        { name: "Hero", template: "Solution Hero", fields: { "Industry Label": "Innovation", "Title": "Innovation Title", "Subtitle": "Innovation description" } },
        { name: "Narrative", template: "Solution Narrative", fields: { "Section Label": "Our Approach", "Heading": "Innovation Philosophy", "Lead Text": "Lead paragraph", "Body": "<p>Body content</p>" } },
        { name: "Products", template: "Product Discovery", fields: { "Section Label": "Spotlight", "Heading": "Latest Innovations", "Description": "Explore new innovations" } },
        { name: "Cross Nav", template: "Cross Navigation", fields: { "Heading": "Explore Solutions", "Description": "See industry solutions" } },
      ],
    },
  ];

  for (const branch of branches) {
    console.log(`\n  Creating branch: ${branch.name}...`);

    const branchId = await ensureItem(BRANCHES_ROOT, branch.name, BRANCH_TEMPLATE_ID);

    const pageId = await ensureItem(`${BRANCHES_ROOT}/${branch.name}`, "$name", PAGE_TEMPLATE_ID, {
      Title: "",
    });

    const dataId = await ensureItem(`${BRANCHES_ROOT}/${branch.name}/$name`, "Data", PAGE_DATA_TEMPLATE_ID);

    const dataPath = `${BRANCHES_ROOT}/${branch.name}/$name/Data`;
    const renderingEntries: RenderingEntry[] = [];

    for (let i = 0; i < branch.datasources.length; i++) {
      const ds = branch.datasources[i];
      const dsId = await ensureItem(dataPath, ds.name, TEMPLATE_IDS[ds.template], ds.fields);
      renderingEntries.push({
        renderingName: branch.renderings[i],
        datasourceId: dsId,
      });
    }

    const finalRenderings = buildFinalRenderings(renderingEntries);
    await setLayout(pageId, finalRenderings, buildSharedLayout());
    console.log(`  ✓ Branch "${branch.name}" created with ${branch.renderings.length} renderings`);
  }

  console.log("\n  Setting Insert Options on Page template and content items...");
  const pageStdValuesPath = `${TEMPLATES_ROOT}/Page/__Standard Values`;
  const stdValues = await getItemId(pageStdValuesPath);
  const branchIds: string[] = [];
  for (const branch of branches) {
    const id = await getItemId(`${BRANCHES_ROOT}/${branch.name}`);
    if (id) branchIds.push(formatGuid(id));
  }
  const pageTemplateFormatted = formatGuid(PAGE_TEMPLATE_ID);
  const insertOptions = [pageTemplateFormatted, ...branchIds].join("|");

  if (stdValues) {
    await gql(`mutation($id:ID!,$lang:String!,$fields:[FieldValueInput!]!){updateItem(input:{itemId:$id,language:$lang,fields:$fields}){item{itemId}}}`, {
      id: stdValues, lang: "en",
      fields: [{ name: "__Masters", value: insertOptions }],
    });
    console.log(`  ✓ Insert Options set on Page template Standard Values: ${branches.length} branches + Page template`);
  } else {
    console.log("  ✗ Page template Standard Values not found");
  }

  const contentItems = [
    `${SITE_ROOT}/Home`,
    `${SITE_ROOT}/Home/Solutions`,
    `${SITE_ROOT}/Home/Innovation`,
  ];
  for (const itemPath of contentItems) {
    const itemId = await getItemId(itemPath);
    if (itemId) {
      await gql(`mutation($id:ID!,$lang:String!,$fields:[FieldValueInput!]!){updateItem(input:{itemId:$id,language:$lang,fields:$fields}){item{itemId}}}`, {
        id: itemId, lang: "en",
        fields: [{ name: "__Masters", value: insertOptions }],
      });
      const name = itemPath.split("/").pop();
      console.log(`  ✓ Insert Options set on ${name}`);
    }
  }
}

const MEDIA_ROOT = "/sitecore/media library/Project/TE Connectivity";
const THUMBNAILS_FOLDER = `${MEDIA_ROOT}/Thumbnails`;
const SVG_MEDIA_TEMPLATE_ID = "{EB3FB96C-D56B-4AC9-97F8-F07B24BB9BF7}";

function generateThumbnailSvg(label: string, color: string, iconPath: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="6" fill="${color}" opacity="0.15"/>
  <rect x="1" y="1" width="62" height="62" rx="5" fill="none" stroke="${color}" stroke-width="1.5"/>
  <path d="${iconPath}" fill="${color}"/>
  <text x="32" y="56" text-anchor="middle" font-family="Arial,sans-serif" font-size="7" fill="${color}" font-weight="bold">${label}</text>
</svg>`;
}

const COMPONENT_THUMBNAILS: Record<string, { color: string; iconPath: string; label: string; description: string }> = {
  "Hero Banner": {
    color: "#f28d00",
    iconPath: "M8 12h48v4H8zm12 8h24v3H20zm16 7H28l4-4h0z",
    label: "HERO",
    description: "Full-width hero banner with headline, subtitle, badge, and call-to-action button",
  },
  "Mega Trends": {
    color: "#167a87",
    iconPath: "M10 14h12v12H10zm18 0h12v12H28zm9 0h12v12H37zM10 30h12v6H10zm18 0h12v6H28z",
    label: "TRENDS",
    description: "Grid of industry mega-trend cards with icons, stats, and descriptions",
  },
  "Solution Pathways": {
    color: "#04215d",
    iconPath: "M14 18l8-6 8 6v14H14zm20 0l8-6 8 6v14H34zM24 26h4v6h-4z",
    label: "PATHWAYS",
    description: "Interactive solution pathway cards guiding users to solutions",
  },
  "Authority Stats": {
    color: "#2e4957",
    iconPath: "M12 34V20h8v14zm14 0V14h8v20zm14 0V24h8v10z",
    label: "STATS",
    description: "Animated counter section showing key company statistics and metrics",
  },
  "Solution Hero": {
    color: "#167a87",
    iconPath: "M8 14h48v20H8zm12 4h24v3H20zm10 6h4v4h-4z",
    label: "SOL HERO",
    description: "Industry-specific hero with accent color, label, and full-width layout",
  },
  "Solution Narrative": {
    color: "#04215d",
    iconPath: "M8 14h24v24H8zm28 0h20v4H36zm0 8h20v2H36zm0 5h20v2H36zm0 5h14v2H36z",
    label: "NARRATIVE",
    description: "Two-column narrative section with heading, lead text, and rich body content",
  },
  "Product Discovery": {
    color: "#f28d00",
    iconPath: "M10 14h12v14H10zm16 0h12v14H26zm16 0h12v14H42zM10 32h12v4H10zm16 0h12v4H26z",
    label: "PRODUCTS",
    description: "Product grid with filters, integrated with OrderCloud commerce catalog",
  },
  "Cross Navigation": {
    color: "#2e4957",
    iconPath: "M10 18h12v12H10zm16 0h12v12H26zm16 0h12v12H42zM30 36l2-3 2 3z",
    label: "CROSS NAV",
    description: "Card-based links to related solution pages with icons and descriptions",
  },
  "Proof Point Counter": {
    color: "#167a87",
    iconPath: "M20 34a12 12 0 1 1 24 0M32 22v8l4 4M12 34h4m32 0h4",
    label: "PROOF PTS",
    description: "Animated proof-point counters for showcasing innovation metrics",
  },
  "Rich Text Block": {
    color: "#2e4957",
    iconPath: "M12 14h40v3H12zm0 7h36v2H12zm0 5h40v2H12zm0 5h28v2H12zm0 5h34v2H12z",
    label: "RICH TEXT",
    description: "Flexible rich text content block for any page section",
  },
};

async function uploadSvgToMediaLibrary(name: string, svgContent: string): Promise<string | null> {
  const itemName = name.replace(/\s+/g, "-").toLowerCase();
  const fullPath = `${THUMBNAILS_FOLDER}/${itemName}`;

  const existing = await getItemId(fullPath);
  if (existing) {
    return existing;
  }

  const parentId = await getItemId(THUMBNAILS_FOLDER);
  if (!parentId) {
    throw new Error(`Thumbnails folder not found at ${THUMBNAILS_FOLDER}`);
  }

  const base64Content = Buffer.from(svgContent).toString("base64");

  try {
    const d = await gql(`mutation($input:UploadMediaInput!){uploadMedia(input:$input){mediaItem{itemId path}}}`, {
      input: {
        itemPath: fullPath,
        fileName: `${itemName}.svg`,
        content: base64Content,
        language: "en",
      },
    });
    const mediaId = d?.uploadMedia?.mediaItem?.itemId;
    if (mediaId) {
      console.log(`  + Uploaded SVG: ${itemName}.svg → ${fullPath}`);
      return mediaId;
    }
  } catch (e: any) {
    console.log(`  ⚠ uploadMedia mutation not available, using createItem fallback for ${name}`);
  }

  try {
    const d = await gql(`mutation($n:String!,$p:ID!,$t:ID!,$l:String!,$f:[FieldValueInput!]){createItem(input:{name:$n,parent:$p,templateId:$t,language:$l,fields:$f}){item{itemId}}}`, {
      n: itemName, p: parentId, t: SVG_MEDIA_TEMPLATE_ID, l: "en",
      f: [
        { name: "Extension", value: "svg" },
        { name: "Mime Type", value: "image/svg+xml" },
        { name: "Blob", value: base64Content },
        { name: "Width", value: "64" },
        { name: "Height", value: "64" },
        { name: "Size", value: String(svgContent.length) },
        { name: "Alt", value: name },
      ],
    });
    const mediaId = d?.createItem?.item?.itemId;
    if (mediaId) {
      console.log(`  + Created media item: ${itemName} → ${fullPath}`);
      return mediaId;
    }
  } catch (e2: any) {
    console.log(`  ⚠ Could not create media item for ${name}: ${e2.message}`);
  }

  return null;
}

async function step5b_setRenderingThumbnails() {
  console.log("\n═══ Step 5b: Upload component thumbnails to Media Library ═══");

  const thumbFolderExists = await getItemId(THUMBNAILS_FOLDER);
  if (!thumbFolderExists) {
    await ensureItem(MEDIA_ROOT, "Thumbnails", FOLDER_TEMPLATE_ID);
    console.log("  + Created Thumbnails folder in Media Library");
  }

  const mediaIds: Record<string, string> = {};

  for (const [name, thumb] of Object.entries(COMPONENT_THUMBNAILS)) {
    const svg = generateThumbnailSvg(thumb.label, thumb.color, thumb.iconPath);
    const mediaId = await uploadSvgToMediaLibrary(name, svg);
    if (mediaId) {
      mediaIds[name] = mediaId;
    }
  }

  console.log("\n  Setting __Thumbnail on rendering items...");
  for (const [name, thumb] of Object.entries(COMPONENT_THUMBNAILS)) {
    const renderingId = RENDERING_IDS[name];
    if (!renderingId) continue;
    const formattedId = formatGuid(renderingId);

    const mediaId = mediaIds[name];
    let thumbnailValue: string;
    if (mediaId) {
      thumbnailValue = `<image mediaid="${formatGuid(mediaId)}" />`;
    } else {
      const itemName = name.replace(/\s+/g, "-").toLowerCase();
      thumbnailValue = `${THUMBNAILS_FOLDER}/${itemName}`;
    }

    await gql(`mutation($id:ID!,$lang:String!,$fields:[FieldValueInput!]!){updateItem(input:{itemId:$id,language:$lang,fields:$fields}){item{itemId}}}`, {
      id: formattedId, lang: "en",
      fields: [
        { name: "__Thumbnail", value: thumbnailValue },
        { name: "__Short description", value: thumb.description },
      ],
    });
    console.log(`  ✓ ${name}: thumbnail=${mediaId ? "media:" + formatGuid(mediaId) : "path"}, description set`);
  }
}

async function step6_validate() {
  console.log("\n═══ Step 6: Post-change validation ═══");
  let errors = 0;

  const pages = [
    { name: "Homepage", path: `${SITE_ROOT}/Home`, expectedCount: 4 },
    { name: "Transportation", path: `${SITE_ROOT}/Home/Solutions/Transportation`, expectedCount: 4 },
    { name: "Industrial", path: `${SITE_ROOT}/Home/Solutions/Industrial`, expectedCount: 4 },
    { name: "Communications", path: `${SITE_ROOT}/Home/Solutions/Communications`, expectedCount: 4 },
    { name: "Innovation", path: `${SITE_ROOT}/Home/Innovation`, expectedCount: 4 },
  ];

  const expectedPageTpl = normalizeGuid(PAGE_TEMPLATE_ID);

  for (const page of pages) {
    const item = await getItemWithTemplate(page.path);
    if (!item) {
      console.log(`  ✗ ${page.name}: page not found`);
      errors++;
      continue;
    }
    const actualTpl = normalizeGuid(item.templateId);
    if (actualTpl !== expectedPageTpl) {
      console.log(`  ✗ ${page.name}: WRONG template (${actualTpl}), expected Page (${expectedPageTpl})`);
      errors++;
    } else {
      console.log(`  ✓ ${page.name}: correct Page template`);
    }
    const itemFields = await getItemFields(page.path);
    const fr = itemFields?.fields["__Final Renderings"] || "";
    const renderingCount = (fr.match(/s:id="/g) || []).length;
    if (renderingCount === page.expectedCount) {
      console.log(`  ✓ ${page.name}: ${renderingCount} renderings in __Final Renderings`);
    } else {
      console.log(`  ✗ ${page.name}: expected ${page.expectedCount} renderings, found ${renderingCount}`);
      errors++;
    }

    const dsMatches = fr.match(/s:ds="([^"]+)"/g) || [];
    const allHaveDs = dsMatches.length === page.expectedCount;
    if (allHaveDs) {
      console.log(`  ✓ ${page.name}: all renderings have datasource references`);
    } else {
      console.log(`  ✗ ${page.name}: only ${dsMatches.length}/${page.expectedCount} renderings have datasource references`);
      errors++;
    }
  }

  const renderings = await gql(`query($p:String!){item(where:{path:$p}){children{nodes{itemId name fields(ownFields:false){nodes{name value}}}}}}`, { p: RENDERINGS_ROOT });
  let dsLocErrors = 0;
  for (const r of renderings?.item?.children?.nodes || []) {
    const fields = r.fields?.nodes || [];
    const dsLoc = fields.find((f: any) => f.name === "Datasource Location")?.value || "";
    if (dsLoc !== DESIRED_DS_LOCATION) {
      console.log(`  ✗ Rendering "${r.name}": Datasource Location is "${dsLoc}", expected "${DESIRED_DS_LOCATION}"`);
      dsLocErrors++;
      errors++;
    }
  }
  if (dsLocErrors === 0) {
    console.log(`  ✓ All renderings have Datasource Location set to "${DESIRED_DS_LOCATION}"`);
  }

  const branchNames = ["Homepage", "Solutions Page", "Innovation Page"];
  for (const bn of branchNames) {
    const bid = await getItemId(`${BRANCHES_ROOT}/${bn}`);
    if (!bid) {
      console.log(`  ✗ Branch "${bn}" not found`);
      errors++;
      continue;
    }
    console.log(`  ✓ Branch "${bn}" exists (${formatGuid(bid)})`);

    const namePageInfo = await getItemWithTemplate(`${BRANCHES_ROOT}/${bn}/$name`);
    if (!namePageInfo) {
      console.log(`  ✗ Branch "${bn}/$name" page not found`);
      errors++;
      continue;
    }
    const namePageTpl = normalizeGuid(namePageInfo.templateId);
    if (namePageTpl !== expectedPageTpl) {
      console.log(`  ✗ Branch "${bn}/$name": WRONG template (${namePageTpl}), expected Page (${expectedPageTpl})`);
      errors++;
    } else {
      console.log(`  ✓ Branch "${bn}/$name": correct Page template`);
    }

    const namePage = await getItemFields(`${BRANCHES_ROOT}/${bn}/$name`);
    const fr = namePage?.fields["__Final Renderings"] || "";
    const rCount = (fr.match(/s:id="/g) || []).length;
    const dsCount = (fr.match(/s:ds="/g) || []).length;
    if (rCount === 4 && dsCount === 4) {
      console.log(`  ✓ Branch "${bn}/$name": ${rCount} renderings, ${dsCount} datasource refs`);
    } else {
      console.log(`  ✗ Branch "${bn}/$name": ${rCount} renderings, ${dsCount} datasource refs (expected 4 each)`);
      errors++;
    }

    const dataFolder = await getItemId(`${BRANCHES_ROOT}/${bn}/$name/Data`);
    if (dataFolder) {
      console.log(`  ✓ Branch "${bn}/$name/Data" folder exists`);
    } else {
      console.log(`  ✗ Branch "${bn}/$name/Data" folder missing`);
      errors++;
    }
  }

  console.log("\n  Validating Insert Options on content items...");
  const insertOptItems = [
    { name: "Home", path: `${SITE_ROOT}/Home` },
    { name: "Solutions", path: `${SITE_ROOT}/Home/Solutions` },
    { name: "Innovation", path: `${SITE_ROOT}/Home/Innovation` },
  ];
  for (const ioi of insertOptItems) {
    const item = await getItemFields(ioi.path);
    const masters = item?.fields["__Masters"] || "";
    if (masters && masters.includes("{")) {
      console.log(`  ✓ ${ioi.name}: __Masters set (${masters.split("|").length} entries)`);
    } else {
      console.log(`  ✗ ${ioi.name}: __Masters not set or empty`);
      errors++;
    }
  }

  console.log("\n  Validating rendering thumbnails...");
  const renderingItems = await gql(`query($p:String!){item(where:{path:$p}){children{nodes{itemId name fields(ownFields:false){nodes{name value}}}}}}`, { p: RENDERINGS_ROOT });
  for (const r of renderingItems?.item?.children?.nodes || []) {
    const fields = r.fields?.nodes || [];
    const thumb = fields.find((f: any) => f.name === "__Thumbnail")?.value || "";
    const desc = fields.find((f: any) => f.name === "__Short description")?.value || "";
    if (thumb && thumb.length > 0) {
      console.log(`  ✓ ${r.name}: __Thumbnail set`);
    } else {
      console.log(`  ✗ ${r.name}: __Thumbnail not set`);
      errors++;
    }
    if (desc && desc.length > 0) {
      console.log(`  ✓ ${r.name}: __Short description set`);
    } else {
      console.log(`  ⚠ ${r.name}: __Short description not set`);
    }
  }

  if (errors > 0) {
    console.log(`\n  ⚠ ${errors} validation errors found`);
  } else {
    console.log(`\n  ✓ All validations passed`);
  }
  return errors;
}

async function step7_publish() {
  console.log("\n═══ Step 7: Full Publish to Experience Edge ═══");
  const d = await gql(`mutation{publishSite(input:{publishSiteMode:FULL,languages:["en"],targetDatabases:["experienceedge"]}){operationId}}`);
  console.log(`  ✓ Published: ${d?.publishSite?.operationId || "unknown"}`);
}

async function main() {
  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║   Complete CMS Setup — TE Connectivity           ║");
  console.log("╚══════════════════════════════════════════════════╝");

  console.log("\n═══ Step 0: Resolve well-known IDs ═══");
  await resolveWellKnownIds();

  await step1_fixDatasourceLocation();
  await step1b_clearRenderingContentsResolver();
  await step1c_ensureHeroBannerVariants();
  await step1d_addMultilistFields();
  await step2_fixHomepage();
  await step2b_createCardItems();
  await step3_fixSolutionPages();
  await step4_createInnovationPage();
  await step5_createBranchTemplates();
  await step5b_setRenderingThumbnails();
  const validationErrors = await step6_validate();
  await step7_publish();

  console.log("\n═══ Complete ═══");
  if (validationErrors > 0) {
    console.log(`⚠ Completed with ${validationErrors} validation warnings. Review above.`);
  } else {
    console.log("All CMS items configured and validated. Wait 2-3 minutes for Edge propagation.");
  }
}

main().catch(e => {
  console.error("Fatal error:", e);
  process.exit(1);
});
