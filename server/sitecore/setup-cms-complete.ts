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

async function ensureItem(parentPath: string, name: string, templateId: string, fields?: Record<string, string>): Promise<string> {
  const fullPath = `${parentPath}/${name}`;
  const existing = await getItemId(fullPath);
  if (existing) {
    if (fields && Object.keys(fields).length > 0) {
      await gql(`mutation($id:ID!,$lang:String!,$fields:[FieldValueInput!]!){updateItem(input:{itemId:$id,language:$lang,fields:$fields}){item{itemId}}}`, {
        id: existing, lang: "en",
        fields: Object.entries(fields).map(([name, value]) => ({ name, value: value || "" })),
      });
    }
    return existing;
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
const PAGE_TEMPLATE_ID = "{76036F5E-CBCE-46D1-AF0A-4143F9B557AA}";
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

async function step3_fixSolutionPages() {
  console.log("\n═══ Step 3: Verify & fix Solution page layouts ═══");
  const solutions = [
    { name: "Transportation", path: `${SITE_ROOT}/Home/Solutions/Transportation` },
    { name: "Industrial", path: `${SITE_ROOT}/Home/Solutions/Industrial` },
    { name: "Communications", path: `${SITE_ROOT}/Home/Solutions/Communications` },
  ];

  for (const sol of solutions) {
    const page = await getItemFields(sol.path);
    if (!page) { console.log(`  ✗ ${sol.name} not found`); continue; }

    const dataPath = `${SITE_ROOT}/Home/Data`;
    const heroId = await getItemId(`${dataPath}/${sol.name} Hero`);
    const narrativeId = await getItemId(`${dataPath}/${sol.name} Narrative`);
    const productsId = await getItemId(`${dataPath}/${sol.name} Products`);
    const crossNavId = await getItemId(`${dataPath}/${sol.name} Cross Nav`);

    if (!heroId || !narrativeId || !productsId || !crossNavId) {
      console.log(`  ✗ ${sol.name}: Missing datasources`);
      continue;
    }

    const finalRenderings = buildFinalRenderings([
      { renderingName: "Solution Hero", datasourceId: heroId },
      { renderingName: "Solution Narrative", datasourceId: narrativeId },
      { renderingName: "Product Discovery", datasourceId: productsId },
      { renderingName: "Cross Navigation", datasourceId: crossNavId },
    ]);

    await setLayout(page.id, finalRenderings, buildSharedLayout());
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
    "CTA Link": "<link linktype=\"internal\" url=\"/products\" />",
  });

  const crossNavId = await ensureItem(innovDataPath, "Innovation Cross Nav", TEMPLATE_IDS["Cross Navigation"], {
    "Heading": "Explore Our Solutions",
    "Description": "See how TE innovation translates into industry-specific solutions.",
  });

  const crossNavItemPath = `${innovDataPath}/Innovation Cross Nav`;
  await ensureItem(crossNavItemPath, "Transportation", TEMPLATE_IDS["Cross Nav Link"], {
    "Title": "Transportation Solutions",
    "Description": "EV connectors, sensor systems, and automotive harnesses",
    "Link": "<link linktype=\"internal\" url=\"/solutions/transportation\" />",
    "Icon Name": "Car",
    "Accent Color": "#f28d00",
  });
  await ensureItem(crossNavItemPath, "Industrial", TEMPLATE_IDS["Cross Nav Link"], {
    "Title": "Industrial Solutions",
    "Description": "Factory automation, robotics, and harsh-environment connectivity",
    "Link": "<link linktype=\"internal\" url=\"/solutions/industrial\" />",
    "Icon Name": "Factory",
    "Accent Color": "#2e4957",
  });
  await ensureItem(crossNavItemPath, "Communications", TEMPLATE_IDS["Cross Nav Link"], {
    "Title": "Communications Solutions",
    "Description": "Data center, 5G, and high-speed network infrastructure",
    "Link": "<link linktype=\"internal\" url=\"/solutions/communications\" />",
    "Icon Name": "Server",
    "Accent Color": "#167a87",
  });

  const finalRenderings = buildFinalRenderings([
    { renderingName: "Solution Hero", datasourceId: heroId },
    { renderingName: "Solution Narrative", datasourceId: narrativeId },
    { renderingName: "Product Discovery", datasourceId: productsId },
    { renderingName: "Cross Navigation", datasourceId: crossNavId },
  ]);

  await setLayout(innovId, finalRenderings, buildSharedLayout());
  console.log("  ✓ Innovation page created with 4 renderings and datasources");
}

async function step5_createBranchTemplates() {
  console.log("\n═══ Step 5: Create Branch Templates ═══");

  const branchFolder = await getItemId(BRANCHES_ROOT);
  if (!branchFolder) {
    console.log("  Creating build branch folder...");
    await ensureItem("/sitecore/templates/Branches/Project", "build", FOLDER_TEMPLATE_ID);
  }

  const branches = [
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

  console.log("\n  Setting Insert Options on Page template...");
  const pageStdValuesPath = `${TEMPLATES_ROOT}/Page/__Standard Values`;
  const stdValues = await getItemId(pageStdValuesPath);
  if (stdValues) {
    const branchIds = [];
    for (const branch of branches) {
      const id = await getItemId(`${BRANCHES_ROOT}/${branch.name}`);
      if (id) branchIds.push(formatGuid(id));
    }
    const pageTemplateFormatted = formatGuid(PAGE_TEMPLATE_ID);
    const insertOptions = [pageTemplateFormatted, ...branchIds].join("|");
    await gql(`mutation($id:ID!,$lang:String!,$fields:[FieldValueInput!]!){updateItem(input:{itemId:$id,language:$lang,fields:$fields}){item{itemId}}}`, {
      id: stdValues, lang: "en",
      fields: [{ name: "__Masters", value: insertOptions }],
    });
    console.log(`  ✓ Insert Options set on Page template: ${branches.length} branches + Page template`);
  } else {
    console.log("  ✗ Page template Standard Values not found");
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

  for (const page of pages) {
    const item = await getItemFields(page.path);
    if (!item) {
      console.log(`  ✗ ${page.name}: page not found`);
      errors++;
      continue;
    }
    const fr = item.fields["__Final Renderings"] || "";
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
    if (bid) {
      console.log(`  ✓ Branch "${bn}" exists (${bid})`);
    } else {
      console.log(`  ✗ Branch "${bn}" not found`);
      errors++;
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
  await step2_fixHomepage();
  await step3_fixSolutionPages();
  await step4_createInnovationPage();
  await step5_createBranchTemplates();
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
