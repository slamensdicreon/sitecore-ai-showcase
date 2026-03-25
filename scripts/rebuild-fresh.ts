import { getAuthoringToken } from '../server/sitecore/auth';
import { randomUUID } from 'crypto';
import * as fs from 'fs';

const CM = 'https://xmc-icreonpartn828a-novatech15a9-novatechf6c7.sitecorecloud.io';

function formatGuid(id: string): string {
  if (id.includes('-')) return id;
  return `${id.slice(0,8)}-${id.slice(8,12)}-${id.slice(12,16)}-${id.slice(16,20)}-${id.slice(20)}`;
}

async function gql(query: string, variables?: any) {
  const token = await getAuthoringToken();
  const body: any = { query };
  if (variables) body.variables = variables;
  const res = await fetch(CM + '/sitecore/api/authoring/graphql/v1', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify(body),
  });
  const d: any = await res.json();
  if (d.errors?.length) {
    console.error('GQL_ERR:', JSON.stringify(d.errors).substring(0, 500));
    throw new Error('GraphQL error: ' + d.errors[0]?.message);
  }
  return d.data;
}

async function getItemId(path: string): Promise<string> {
  const data = await gql(`query { item(where: { path: "${path}" }) { itemId } }`);
  if (!data?.item?.itemId) throw new Error(`Item not found: ${path}`);
  return data.item.itemId;
}

async function createItem(name: string, templateId: string, parentId: string, fields?: { name: string; value: string }[]) {
  const mutation = `mutation CreateItem($input: CreateItemInput!) { createItem(input: $input) { item { itemId name path } } }`;
  const input: any = {
    name,
    templateId: formatGuid(templateId),
    parent: parentId,
    language: 'en',
  };
  if (fields && fields.length > 0) {
    input.fields = fields.map(f => ({ name: f.name, value: f.value }));
  }
  const result = await gql(mutation, { input });
  const item = result?.createItem?.item;
  if (!item) throw new Error(`Failed to create item: ${name}`);
  return item;
}

async function updateItemByPath(path: string, fields: { name: string; value: string }[]) {
  const mutation = `mutation UpdateItem($input: UpdateItemInput!) { updateItem(input: $input) { item { itemId name } } }`;
  const input: any = {
    path,
    language: 'en',
    fields: fields.map(f => ({ name: f.name, value: f.value })),
  };
  const result = await gql(mutation, { input });
  return result?.updateItem?.item;
}

async function updateItemById(itemId: string, fields: { name: string; value: string }[]) {
  const mutation = `mutation UpdateItem($input: UpdateItemInput!) { updateItem(input: $input) { item { itemId name } } }`;
  const input: any = {
    itemId: formatGuid(itemId),
    language: 'en',
    fields: fields.map(f => ({ name: f.name, value: f.value })),
  };
  const result = await gql(mutation, { input });
  return result?.updateItem?.item;
}

async function publishItem(itemId: string) {
  const mutation = `mutation { publishItem(input: { itemId: "${formatGuid(itemId)}", languages: ["en"], publishingTargets: ["Edge"] }) { operationId } }`;
  const result = await gql(mutation);
  return result?.publishItem?.operationId;
}

const WELL_KNOWN = {
  templateTemplate: 'ab86861a-6030-46c5-b394-e8f99e8b87db',
  templateSectionTemplate: 'e269fbb5-3750-427a-9149-7aa950b49301',
  templateFieldTemplate: '455a3e98-a627-4b40-8035-e683a0331ac7',
  jsonRenderingTemplate: '04646a89-996f-4ee7-878a-ffdbf1f0ef0d',
  pageDataTemplate: '1c82e550-ebcd-4e5d-8abd-d50d0809541e',
  headlessLayoutId: '96E5F4BA-A2CF-4A4C-A4E7-64DA88226362',
  deviceId: 'FE5D7FDF-89C0-4D99-9AA3-B5FBD009C9F3',
  pageTemplate: '57d89b89-6f79-44e7-b5bd-435326761859',
  siteRoot: '/sitecore/content/TE Connectivity/TE Connectivity',
  pageDesignTemplate: 'ebcffae1-b6b4-4b50-b722-155e869fc430',
  partialDesignTemplate: 'bf680756-b2fa-4cae-8b69-ee361080616f',
  pageDesignsFolderId: '2cf786c1-fa8f-4583-9289-62f5bfa991a9',
  partialDesignsFolderId: 'fa4da8ed-46b6-4cf1-b301-279f4103cc7e',
  stdValuesId: '2f722d14-4a0d-4924-8458-eb0fe903cb4f',
  novatechTemplateFolderId: '0801da4a-ffee-4af4-8600-9b02d7b71f40',
};

interface TemplateFieldDef { name: string; type: string; }
interface TemplateSectionDef { name: string; fields: TemplateFieldDef[]; }
interface TemplateDef { name: string; sections: TemplateSectionDef[]; }

const TEMPLATES: TemplateDef[] = [
  { name: 'NT_Hero Banner', sections: [
    { name: 'Content', fields: [
      { name: 'Badge Text', type: 'Single-Line Text' }, { name: 'Subtitle', type: 'Multi-Line Text' },
      { name: 'Title', type: 'Single-Line Text' }, { name: 'Title Accent', type: 'Single-Line Text' },
    ]},
    { name: 'CTA', fields: [
      { name: 'Primary CTA Link', type: 'General Link' }, { name: 'Primary CTA Text', type: 'Single-Line Text' },
      { name: 'Secondary CTA Link', type: 'General Link' }, { name: 'Secondary CTA Text', type: 'Single-Line Text' },
    ]},
    { name: 'Display', fields: [{ name: 'Show Connectivity Motif', type: 'Checkbox' }]},
    { name: 'Media', fields: [
      { name: 'Background Image', type: 'Image' }, { name: 'Background Video URL', type: 'Single-Line Text' },
    ]},
  ]},
  { name: 'NT_Solution Hero', sections: [
    { name: 'Content', fields: [
      { name: 'Industry Label', type: 'Single-Line Text' }, { name: 'Subtitle', type: 'Multi-Line Text' },
      { name: 'Title', type: 'Single-Line Text' }, { name: 'Title Accent', type: 'Single-Line Text' },
    ]},
    { name: 'Media', fields: [
      { name: 'Background Image', type: 'Image' }, { name: 'Icon Image', type: 'Image' },
    ]},
  ]},
  { name: 'NT_Authority Stats', sections: [
    { name: 'Content', fields: [
      { name: 'Description', type: 'Multi-Line Text' }, { name: 'Heading', type: 'Single-Line Text' },
      { name: 'Subheading', type: 'Single-Line Text' },
    ]},
    { name: 'Display', fields: [{ name: 'Layout Variant', type: 'Single-Line Text' }]},
    { name: 'Media', fields: [
      { name: 'Background Image', type: 'Image' }, { name: 'Logo Image', type: 'Image' },
      { name: 'Video URL', type: 'Single-Line Text' },
    ]},
  ]},
  { name: 'NT_Stat Item', sections: [
    { name: 'Content', fields: [
      { name: 'Label', type: 'Single-Line Text' }, { name: 'Prefix', type: 'Single-Line Text' },
      { name: 'Suffix', type: 'Single-Line Text' }, { name: 'Value', type: 'Single-Line Text' },
    ]},
    { name: 'Display', fields: [{ name: 'Animate', type: 'Checkbox' }]},
  ]},
  { name: 'NT_Mega Trends', sections: [
    { name: 'Content', fields: [
      { name: 'Heading', type: 'Single-Line Text' }, { name: 'Subheading', type: 'Multi-Line Text' },
      { name: 'CTA Text', type: 'Single-Line Text' },
    ]},
  ]},
  { name: 'NT_Mega Trend Card', sections: [
    { name: 'Content', fields: [
      { name: 'Title', type: 'Single-Line Text' }, { name: 'Description', type: 'Multi-Line Text' },
      { name: 'Stat Value', type: 'Single-Line Text' }, { name: 'Stat Label', type: 'Single-Line Text' },
      { name: 'CTA Text', type: 'Single-Line Text' }, { name: 'CTA Link', type: 'General Link' },
    ]},
    { name: 'Media', fields: [
      { name: 'Image', type: 'Image' }, { name: 'Icon', type: 'Single-Line Text' },
    ]},
  ]},
  { name: 'NT_Challenge Card', sections: [
    { name: 'Content', fields: [
      { name: 'Title', type: 'Single-Line Text' }, { name: 'Description', type: 'Multi-Line Text' },
      { name: 'Icon', type: 'Single-Line Text' },
    ]},
  ]},
  { name: 'NT_Solution Pathways', sections: [
    { name: 'Content', fields: [
      { name: 'Heading', type: 'Single-Line Text' }, { name: 'Subheading', type: 'Multi-Line Text' },
      { name: 'CTA Text', type: 'Single-Line Text' },
    ]},
  ]},
  { name: 'NT_Solution Pathway Card', sections: [
    { name: 'Content', fields: [
      { name: 'Title', type: 'Single-Line Text' }, { name: 'Description', type: 'Multi-Line Text' },
      { name: 'Link', type: 'General Link' },
    ]},
    { name: 'Media', fields: [{ name: 'Image', type: 'Image' }]},
  ]},
  { name: 'NT_Cross Navigation', sections: [
    { name: 'Content', fields: [
      { name: 'Heading', type: 'Single-Line Text' }, { name: 'Background Color', type: 'Single-Line Text' },
    ]},
  ]},
  { name: 'NT_Cross Nav Link', sections: [
    { name: 'Content', fields: [
      { name: 'Title', type: 'Single-Line Text' }, { name: 'Description', type: 'Multi-Line Text' },
      { name: 'Link', type: 'General Link' }, { name: 'Icon', type: 'Single-Line Text' },
      { name: 'Color', type: 'Single-Line Text' },
    ]},
  ]},
  { name: 'NT_Product Discovery', sections: [
    { name: 'Content', fields: [
      { name: 'Heading', type: 'Single-Line Text' }, { name: 'Description', type: 'Multi-Line Text' },
      { name: 'Search Placeholder', type: 'Single-Line Text' }, { name: 'Category Filter Label', type: 'Single-Line Text' },
      { name: 'CTA Text', type: 'Single-Line Text' }, { name: 'CTA Link', type: 'General Link' },
    ]},
    { name: 'Display', fields: [
      { name: 'Layout Variant', type: 'Single-Line Text' }, { name: 'Show Filters', type: 'Checkbox' },
    ]},
  ]},
  { name: 'NT_Solution Narrative', sections: [
    { name: 'Content', fields: [
      { name: 'Heading', type: 'Single-Line Text' }, { name: 'Body', type: 'Rich Text' },
      { name: 'CTA Text', type: 'Single-Line Text' }, { name: 'CTA Link', type: 'General Link' },
    ]},
  ]},
  { name: 'NT_Proof Point Counter', sections: [
    { name: 'Content', fields: [
      { name: 'Heading', type: 'Single-Line Text' }, { name: 'Background Color', type: 'Single-Line Text' },
    ]},
  ]},
  { name: 'NT_Proof Point Item', sections: [
    { name: 'Content', fields: [
      { name: 'Value', type: 'Single-Line Text' }, { name: 'Label', type: 'Single-Line Text' },
      { name: 'Suffix', type: 'Single-Line Text' },
    ]},
  ]},
  { name: 'NT_Rich Text Block', sections: [
    { name: 'Content', fields: [{ name: 'Content', type: 'Rich Text' }]},
  ]},
];

interface RenderingDef { name: string; componentName: string; templateName: string; }

const RENDERINGS: RenderingDef[] = [
  { name: 'NT_Hero Banner', componentName: 'HeroBanner', templateName: 'NT_Hero Banner' },
  { name: 'NT_Solution Hero', componentName: 'SolutionHero', templateName: 'NT_Solution Hero' },
  { name: 'NT_Authority Stats', componentName: 'AuthorityStats', templateName: 'NT_Authority Stats' },
  { name: 'NT_Mega Trends', componentName: 'MegaTrends', templateName: 'NT_Mega Trends' },
  { name: 'NT_Solution Pathways', componentName: 'SolutionPathways', templateName: 'NT_Solution Pathways' },
  { name: 'NT_Cross Navigation', componentName: 'CrossNavigation', templateName: 'NT_Cross Navigation' },
  { name: 'NT_Product Discovery', componentName: 'ProductDiscovery', templateName: 'NT_Product Discovery' },
  { name: 'NT_Solution Narrative', componentName: 'SolutionNarrative', templateName: 'NT_Solution Narrative' },
  { name: 'NT_Proof Point Counter', componentName: 'ProofPointCounter', templateName: 'NT_Proof Point Counter' },
  { name: 'NT_Rich Text Block', componentName: 'RichTextBlock', templateName: 'NT_Rich Text Block' },
  { name: 'NT_SiteHeader', componentName: 'SiteHeader', templateName: '' },
  { name: 'NT_SiteFooter', componentName: 'SiteFooter', templateName: '' },
];

const createdTemplateIds: Record<string, string> = {};
const createdRenderingIds: Record<string, string> = {};

async function step1_CreateTemplates() {
  console.log('\n========== STEP 1: CREATE TEMPLATES ==========');
  
  const novatechFolderId = WELL_KNOWN.novatechTemplateFolderId;
  console.log('NovaTech folder ID:', novatechFolderId);

  for (const tDef of TEMPLATES) {
    console.log(`\n  Creating template: ${tDef.name}`);
    let tItem: any;
    try {
      const existing = await gql(`query { item(where: { path: "/sitecore/templates/Project/NovaTech/${tDef.name}" }) { itemId name path } }`);
      if (existing?.item) {
        tItem = existing.item;
        console.log(`    Already exists: ${tItem.itemId}`);
      } else {
        tItem = await createItem(tDef.name, WELL_KNOWN.templateTemplate, novatechFolderId);
        console.log(`    Created: ${tItem.itemId}`);
      }
    } catch {
      tItem = await createItem(tDef.name, WELL_KNOWN.templateTemplate, novatechFolderId);
      console.log(`    Created: ${tItem.itemId}`);
    }
    createdTemplateIds[tDef.name] = tItem.itemId;
    
    for (const section of tDef.sections) {
      let sectionItem: any;
      try {
        const existing = await gql(`query { item(where: { path: "${tItem.path}/${section.name}" }) { itemId name path } }`);
        if (existing?.item) {
          sectionItem = existing.item;
        } else {
          sectionItem = await createItem(section.name, WELL_KNOWN.templateSectionTemplate, tItem.itemId);
        }
      } catch {
        sectionItem = await createItem(section.name, WELL_KNOWN.templateSectionTemplate, tItem.itemId);
      }
      
      for (const field of section.fields) {
        try {
          const existing = await gql(`query { item(where: { path: "${sectionItem.path}/${field.name}" }) { itemId } }`);
          if (existing?.item) continue;
        } catch {}
        const fieldItem = await createItem(field.name, WELL_KNOWN.templateFieldTemplate, sectionItem.itemId);
        await updateItemByPath(fieldItem.path, [{ name: 'Type', value: field.type }]);
      }
    }
  }
  
  fs.writeFileSync('/tmp/created_templates.json', JSON.stringify(createdTemplateIds, null, 2));
  console.log('\n  Templates created:', Object.keys(createdTemplateIds).length);
}

async function step2_CreateRenderings() {
  console.log('\n========== STEP 2: CREATE RENDERINGS ==========');
  
  let renderingFolderId: string;
  try {
    renderingFolderId = await getItemId('/sitecore/layout/Renderings/Project/NovaTech');
  } catch {
    const projectRenderings = await getItemId('/sitecore/layout/Renderings/Project');
    const folder = await createItem('NovaTech', 'a87a00b1-e6db-45ab-8b54-636fec3b5523', projectRenderings);
    renderingFolderId = folder.itemId;
  }
  console.log('Rendering folder ID:', renderingFolderId);

  for (const rDef of RENDERINGS) {
    console.log(`\n  Creating rendering: ${rDef.name} (componentName: ${rDef.componentName})`);
    const rItem = await createItem(rDef.name, WELL_KNOWN.jsonRenderingTemplate, renderingFolderId);
    createdRenderingIds[rDef.componentName] = rItem.itemId;
    
    const fields: { name: string; value: string }[] = [
      { name: 'componentName', value: rDef.componentName },
    ];
    
    if (rDef.templateName) {
      fields.push({ name: 'Datasource Template', value: `/sitecore/templates/Project/NovaTech/${rDef.templateName}` });
      fields.push({ name: 'Datasource Location', value: `query:$site/*[@@name='Data']/*[@@templatename='${rDef.templateName}']|query:$sharedSites/*[@@name='Data']/*[@@templatename='${rDef.templateName}']` });
    }
    
    await updateItemByPath(rItem.path, fields);
    console.log(`    Rendering ID: ${rItem.itemId}`);
  }
  
  fs.writeFileSync('/tmp/created_renderings.json', JSON.stringify(createdRenderingIds, null, 2));
  console.log('\n  Renderings created:', Object.keys(createdRenderingIds).length);
}

async function step3_CreatePagesAndDatasources() {
  console.log('\n========== STEP 3: CREATE PAGES & DATASOURCES ==========');
  
  const dsInventory = JSON.parse(fs.readFileSync('/tmp/datasource_inventory.json', 'utf8'));
  const homeId = await getItemId(WELL_KNOWN.siteRoot + '/Home');

  const childTemplateMap: Record<string, string> = {
    'Stat Item': 'NT_Stat Item',
    'Solution Pathway Card': 'NT_Solution Pathway Card',
    'Cross Nav Link': 'NT_Cross Nav Link',
    'Mega Trend Card': 'NT_Mega Trend Card',
    'Challenge Card': 'NT_Challenge Card',
    'Proof Point Item': 'NT_Proof Point Item',
  };

  async function createDatasource(parentId: string, dsName: string, templateName: string, sourcePath: string) {
    const srcData = dsInventory[sourcePath];
    if (!srcData) {
      console.error(`    *** Missing source: ${sourcePath}`);
      return null;
    }

    const templateId = createdTemplateIds[templateName];
    if (!templateId) {
      console.error(`    *** Missing template: ${templateName}`);
      return null;
    }

    const dsItem = await createItem(dsName, templateId, parentId);
    
    const dsFields = Object.entries(srcData.fields)
      .filter(([k]) => !k.startsWith('__'))
      .map(([k, v]) => ({ name: k, value: v as string }));
    if (dsFields.length > 0) {
      for (const f of dsFields) {
        try {
          await updateItemByPath(dsItem.path, [f]);
        } catch (e: any) {
          if (e.message?.includes('Cannot find a field')) {
            console.log(`    Skipping unmapped field: ${f.name}`);
          } else {
            throw e;
          }
        }
      }
    }

    for (const child of srcData.children || []) {
      const ctName = childTemplateMap[child.template];
      const ctId = ctName ? createdTemplateIds[ctName] : null;
      if (!ctId) {
        console.error(`    *** Missing child template for: ${child.template}`);
        continue;
      }

      const childItem = await createItem(child.name, ctId, dsItem.itemId);
      const cFields = Object.entries(child.fields)
        .filter(([k]) => !k.startsWith('__'))
        .map(([k, v]) => ({ name: k, value: v as string }));
      for (const f of cFields) {
        try {
          await updateItemByPath(childItem.path, [f]);
        } catch (e: any) {
          if (e.message?.includes('Cannot find a field')) {
            console.log(`      Skipping child field: ${f.name}`);
          } else { throw e; }
        }
      }

      for (const gc of child.children || []) {
        const gcTName = childTemplateMap[gc.template];
        const gcTId = gcTName ? createdTemplateIds[gcTName] : null;
        if (gcTId) {
          const gcItem = await createItem(gc.name, gcTId, childItem.itemId);
          const gcFields = Object.entries(gc.fields)
            .filter(([k]) => !k.startsWith('__'))
            .map(([k, v]) => ({ name: k, value: v as string }));
          for (const f of gcFields) {
            try {
              await updateItemByPath(gcItem.path, [f]);
            } catch (e: any) {
              if (e.message?.includes('Cannot find a field')) {
                console.log(`        Skipping grandchild field: ${f.name}`);
              } else { throw e; }
            }
          }
        }
      }
    }

    return dsItem;
  }

  interface PageDef {
    name: string;
    parentId: string;
    renderings: { componentName: string; dsTemplateName: string; dsName: string; dsSourcePath: string }[];
  }

  const createdPages: Record<string, { id: string; path: string }> = {};

  async function createPageWithComponents(pageDef: PageDef) {
    console.log(`\n--- Creating page: ${pageDef.name} ---`);
    
    const pageItem = await createItem(pageDef.name, WELL_KNOWN.pageTemplate, pageDef.parentId);
    createdPages[pageDef.name] = { id: pageItem.itemId, path: pageItem.path };
    
    await updateItemByPath(pageItem.path, [
      { name: '__Renderings', value: `<r xmlns:p="p" xmlns:s="s" p:p="1"><d id="{${WELL_KNOWN.deviceId}}" l="{${WELL_KNOWN.headlessLayoutId}}"/></r>` },
    ]);

    const pageDataTemplateId = await getItemId('/sitecore/templates/Foundation/Experience Accelerator/Local Datasources/Page Data');
    const dataFolder = await createItem('Data', pageDataTemplateId, pageItem.itemId);

    const renderingEntries: string[] = [];

    for (const rDef of pageDef.renderings) {
      const renderingId = createdRenderingIds[rDef.componentName];
      if (!renderingId) {
        console.error(`  *** Missing rendering ID for ${rDef.componentName}`);
        continue;
      }

      const dsItem = await createDatasource(dataFolder.itemId, rDef.dsName, rDef.dsTemplateName, rDef.dsSourcePath);
      if (!dsItem) continue;

      const uid = randomUUID().toUpperCase();
      const rIdFormatted = formatGuid(renderingId).toUpperCase();
      const dsIdFormatted = formatGuid(dsItem.itemId).toUpperCase();
      renderingEntries.push(`<r uid="{${uid}}" p:before="*" s:ds="{${dsIdFormatted}}" s:id="{${rIdFormatted}}" s:par="CSSStyles" s:ph="headless-main" />`);
    }

    const finalRenderings = `<r xmlns:p="p" xmlns:s="s" p:p="1"><d id="{${WELL_KNOWN.deviceId}}">${renderingEntries.join('')}</d></r>`;
    await updateItemByPath(pageItem.path, [
      { name: '__Final Renderings', value: finalRenderings },
    ]);

    console.log(`  Page ${pageDef.name} created with ${renderingEntries.length} components`);
    return pageItem;
  }

  await createPageWithComponents({
    name: 'NT_Homepage',
    parentId: homeId,
    renderings: [
      { componentName: 'HeroBanner', dsTemplateName: 'NT_Hero Banner', dsName: 'NT_Home Hero',
        dsSourcePath: '/sitecore/content/TE Connectivity/TE Connectivity/Home/Data/Home Hero' },
      { componentName: 'AuthorityStats', dsTemplateName: 'NT_Authority Stats', dsName: 'NT_Home Stats',
        dsSourcePath: '/sitecore/content/TE Connectivity/TE Connectivity/Home/Data/Home Authority Stats' },
      { componentName: 'SolutionPathways', dsTemplateName: 'NT_Solution Pathways', dsName: 'NT_Home Pathways',
        dsSourcePath: '/sitecore/content/TE Connectivity/TE Connectivity/Home/Data/Home Solution Pathways' },
      { componentName: 'MegaTrends', dsTemplateName: 'NT_Mega Trends', dsName: 'NT_Home Trends',
        dsSourcePath: '/sitecore/content/TE Connectivity/TE Connectivity/Home/Data/Home Mega Trends' },
    ],
  });

  await createPageWithComponents({
    name: 'NT_Solutions',
    parentId: homeId,
    renderings: [
      { componentName: 'HeroBanner', dsTemplateName: 'NT_Hero Banner', dsName: 'NT_Solutions Hero',
        dsSourcePath: '/sitecore/content/TE Connectivity/TE Connectivity/Home/Solutions/Data/Solutions Hero' },
      { componentName: 'SolutionHero', dsTemplateName: 'NT_Solution Hero', dsName: 'NT_Solutions SolutionHero',
        dsSourcePath: '/sitecore/content/TE Connectivity/TE Connectivity/Home/Solutions/Data/Solutions Solution Hero' },
      { componentName: 'SolutionNarrative', dsTemplateName: 'NT_Solution Narrative', dsName: 'NT_Solutions Narrative',
        dsSourcePath: '/sitecore/content/TE Connectivity/TE Connectivity/Home/Solutions/Data/Solutions Narrative' },
      { componentName: 'SolutionPathways', dsTemplateName: 'NT_Solution Pathways', dsName: 'NT_Solutions Pathways',
        dsSourcePath: '/sitecore/content/TE Connectivity/TE Connectivity/Home/Solutions/Data/Solutions Pathways' },
      { componentName: 'CrossNavigation', dsTemplateName: 'NT_Cross Navigation', dsName: 'NT_Solutions CrossNav',
        dsSourcePath: '/sitecore/content/TE Connectivity/TE Connectivity/Home/Solutions/Data/Solutions Cross Navigation' },
    ],
  });

  const solutionsPageId = createdPages['NT_Solutions'].id;

  await createPageWithComponents({
    name: 'NT_Innovation',
    parentId: homeId,
    renderings: [
      { componentName: 'SolutionHero', dsTemplateName: 'NT_Solution Hero', dsName: 'NT_Innovation Hero',
        dsSourcePath: '/sitecore/content/TE Connectivity/TE Connectivity/Home/Innovation/Data/Innovation Hero' },
      { componentName: 'CrossNavigation', dsTemplateName: 'NT_Cross Navigation', dsName: 'NT_Innovation CrossNav',
        dsSourcePath: '/sitecore/content/TE Connectivity/TE Connectivity/Home/Innovation/Data/Innovation Cross Nav' },
      { componentName: 'ProductDiscovery', dsTemplateName: 'NT_Product Discovery', dsName: 'NT_Innovation Products',
        dsSourcePath: '/sitecore/content/TE Connectivity/TE Connectivity/Home/Innovation/Data/Innovation Products' },
      { componentName: 'SolutionNarrative', dsTemplateName: 'NT_Solution Narrative', dsName: 'NT_Innovation Narrative',
        dsSourcePath: '/sitecore/content/TE Connectivity/TE Connectivity/Home/Innovation/Data/Innovation Narrative' },
    ],
  });

  await createPageWithComponents({
    name: 'NT_Communications',
    parentId: solutionsPageId,
    renderings: [
      { componentName: 'SolutionHero', dsTemplateName: 'NT_Solution Hero', dsName: 'NT_Comms Hero',
        dsSourcePath: '/sitecore/content/TE Connectivity/TE Connectivity/Home/Data/Communications Hero' },
      { componentName: 'CrossNavigation', dsTemplateName: 'NT_Cross Navigation', dsName: 'NT_Comms CrossNav',
        dsSourcePath: '/sitecore/content/TE Connectivity/TE Connectivity/Home/Data/Communications Cross Nav' },
      { componentName: 'ProductDiscovery', dsTemplateName: 'NT_Product Discovery', dsName: 'NT_Comms Products',
        dsSourcePath: '/sitecore/content/TE Connectivity/TE Connectivity/Home/Data/Communications Products' },
      { componentName: 'SolutionNarrative', dsTemplateName: 'NT_Solution Narrative', dsName: 'NT_Comms Narrative',
        dsSourcePath: '/sitecore/content/TE Connectivity/TE Connectivity/Home/Data/Communications Narrative' },
    ],
  });

  await createPageWithComponents({
    name: 'NT_Industrial',
    parentId: solutionsPageId,
    renderings: [
      { componentName: 'SolutionHero', dsTemplateName: 'NT_Solution Hero', dsName: 'NT_Industrial Hero',
        dsSourcePath: '/sitecore/content/TE Connectivity/TE Connectivity/Home/Data/Industrial Hero' },
      { componentName: 'CrossNavigation', dsTemplateName: 'NT_Cross Navigation', dsName: 'NT_Industrial CrossNav',
        dsSourcePath: '/sitecore/content/TE Connectivity/TE Connectivity/Home/Data/Industrial Cross Nav' },
      { componentName: 'ProductDiscovery', dsTemplateName: 'NT_Product Discovery', dsName: 'NT_Industrial Products',
        dsSourcePath: '/sitecore/content/TE Connectivity/TE Connectivity/Home/Data/Industrial Products' },
      { componentName: 'SolutionNarrative', dsTemplateName: 'NT_Solution Narrative', dsName: 'NT_Industrial Narrative',
        dsSourcePath: '/sitecore/content/TE Connectivity/TE Connectivity/Home/Data/Industrial Narrative' },
    ],
  });

  await createPageWithComponents({
    name: 'NT_Transportation',
    parentId: solutionsPageId,
    renderings: [
      { componentName: 'SolutionHero', dsTemplateName: 'NT_Solution Hero', dsName: 'NT_Transport Hero',
        dsSourcePath: '/sitecore/content/TE Connectivity/TE Connectivity/Home/Data/Transportation Hero' },
      { componentName: 'CrossNavigation', dsTemplateName: 'NT_Cross Navigation', dsName: 'NT_Transport CrossNav',
        dsSourcePath: '/sitecore/content/TE Connectivity/TE Connectivity/Home/Data/Transportation Cross Nav' },
      { componentName: 'ProductDiscovery', dsTemplateName: 'NT_Product Discovery', dsName: 'NT_Transport Products',
        dsSourcePath: '/sitecore/content/TE Connectivity/TE Connectivity/Home/Data/Transportation Products' },
      { componentName: 'SolutionNarrative', dsTemplateName: 'NT_Solution Narrative', dsName: 'NT_Transport Narrative',
        dsSourcePath: '/sitecore/content/TE Connectivity/TE Connectivity/Home/Data/Transportation Narrative' },
    ],
  });

  fs.writeFileSync('/tmp/created_pages.json', JSON.stringify(createdPages, null, 2));
  return createdPages;
}

async function step4_CreatePageDesigns() {
  console.log('\n========== STEP 4: CREATE PAGE DESIGNS ==========');
  
  const headerRenderingId = createdRenderingIds['SiteHeader'];
  const footerRenderingId = createdRenderingIds['SiteFooter'];
  
  if (!headerRenderingId || !footerRenderingId) {
    console.error('  Missing SiteHeader or SiteFooter rendering IDs!');
    return;
  }

  const headerPartial = await createItem('NT_Header', WELL_KNOWN.partialDesignTemplate, WELL_KNOWN.partialDesignsFolderId);
  const headerUid = randomUUID().toUpperCase();
  await updateItemByPath(headerPartial.path, [
    { name: '__Final Renderings', value: `<r xmlns:p="p" xmlns:s="s" p:p="1"><d id="{${WELL_KNOWN.deviceId}}"><r uid="{${headerUid}}" p:before="*" s:id="{${formatGuid(headerRenderingId).toUpperCase()}}" s:ph="headless-header" /></d></r>` },
  ]);
  console.log(`  Header partial: ${headerPartial.itemId}`);
  
  const footerPartial = await createItem('NT_Footer', WELL_KNOWN.partialDesignTemplate, WELL_KNOWN.partialDesignsFolderId);
  const footerUid = randomUUID().toUpperCase();
  await updateItemByPath(footerPartial.path, [
    { name: '__Final Renderings', value: `<r xmlns:p="p" xmlns:s="s" p:p="1"><d id="{${WELL_KNOWN.deviceId}}"><r uid="{${footerUid}}" p:before="*" s:id="{${formatGuid(footerRenderingId).toUpperCase()}}" s:ph="headless-footer" /></d></r>` },
  ]);
  console.log(`  Footer partial: ${footerPartial.itemId}`);
  
  const defaultDesign = await createItem('NT_Default', WELL_KNOWN.pageDesignTemplate, WELL_KNOWN.pageDesignsFolderId);
  const partialDesignIds = `{${formatGuid(headerPartial.itemId).toUpperCase()}}|{${formatGuid(footerPartial.itemId).toUpperCase()}}`;
  await updateItemByPath(defaultDesign.path, [
    { name: 'PartialDesigns', value: partialDesignIds },
  ]);
  console.log(`  Default page design: ${defaultDesign.itemId}`);
  
  await updateItemById(WELL_KNOWN.stdValuesId, [
    { name: 'Page Design', value: `{${formatGuid(defaultDesign.itemId).toUpperCase()}}` },
  ]);
  console.log('  Updated Standard Values with new Page Design');
  
  const createdPages = JSON.parse(fs.readFileSync('/tmp/created_pages.json', 'utf8'));
  for (const [name, page] of Object.entries(createdPages) as any) {
    await updateItemById(page.id, [
      { name: 'Page Design', value: `{${formatGuid(defaultDesign.itemId).toUpperCase()}}` },
    ]);
    console.log(`  Assigned Page Design to ${name}`);
  }

  fs.writeFileSync('/tmp/created_designs.json', JSON.stringify({
    headerPartial: headerPartial.itemId,
    footerPartial: footerPartial.itemId,
    defaultDesign: defaultDesign.itemId,
  }, null, 2));
}

async function step5_Publish() {
  console.log('\n========== STEP 5: PUBLISH ==========');
  
  const siteRootId = await getItemId(WELL_KNOWN.siteRoot);
  const op1 = await publishItem(siteRootId);
  console.log('  Publish started: ' + op1);
  console.log('  Waiting 20s for publish to propagate...');
  await new Promise(r => setTimeout(r, 20000));
  
  const homeId = await getItemId(WELL_KNOWN.siteRoot + '/Home');
  const op2 = await publishItem(homeId);
  console.log('  Home subtree publish: ' + op2);
  await new Promise(r => setTimeout(r, 15000));
  console.log('  Publish complete');
}

async function main() {
  console.log('=== FRESH REBUILD WITH NT_ PREFIX ===');
  console.log('Started at: ' + new Date().toISOString());
  
  await step1_CreateTemplates();
  await step2_CreateRenderings();
  await step3_CreatePagesAndDatasources();
  await step4_CreatePageDesigns();
  await step5_Publish();
  
  console.log('\n=== REBUILD COMPLETE ===');
  console.log('Finished at: ' + new Date().toISOString());
  console.log('\nTemplate IDs:', JSON.stringify(createdTemplateIds, null, 2));
  console.log('\nRendering IDs:', JSON.stringify(createdRenderingIds, null, 2));
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
