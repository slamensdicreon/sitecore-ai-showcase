import { getAuthoringToken } from './auth';

const CM_BASE = 'https://xmc-icreonpartn828a-novatech15a9-novatechf6c7.sitecorecloud.io';
const GQL = `${CM_BASE}/sitecore/api/authoring/graphql/v1`;

function toGuid(hex: string) {
  const h = hex.replace(/[{}-]/g, '');
  return `${h.substring(0,8)}-${h.substring(8,12)}-${h.substring(12,16)}-${h.substring(16,20)}-${h.substring(20)}`;
}

async function gql(query: string, variables?: Record<string, unknown>) {
  const token = await getAuthoringToken();
  const res = await fetch(GQL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ query, variables }),
  });
  const j = await res.json();
  if (j.errors) console.error('GQL Error:', JSON.stringify(j.errors));
  return j.data;
}

async function getItemId(path: string): Promise<string | null> {
  const d = await gql(`query { item(where: { path: "${path}" }) { itemId name } }`);
  return d?.item?.itemId || null;
}

async function main() {
  const RENDERING_PATH = '/sitecore/content/TE Connectivity/TE Connectivity/Presentation/Headless Services/Components';
  const tileRenderings = ['MegaTrends', 'SolutionPathways', 'AuthorityStats', 'CrossNavigation', 'ProofPointCounter'];

  console.log('=== Removing Rendering Contents Resolver from tile renderings ===');
  for (const name of tileRenderings) {
    const path = `${RENDERING_PATH}/${name}`;
    const id = await getItemId(path);
    if (!id) {
      console.log(`  ⚠ Not found: ${path}`);
      continue;
    }
    const guid = toGuid(id);
    const result = await gql(
      `mutation($id:ID!,$lang:String!,$fields:[FieldValueInput!]!){updateItem(input:{itemId:$id,language:$lang,fields:$fields}){item{itemId}}}`,
      {
        id: guid,
        lang: 'en',
        fields: [{ name: 'Rendering Contents Resolver', value: '' }],
      }
    );
    if (result?.updateItem?.item?.itemId) {
      console.log(`  ✓ ${name}: Rendering Contents Resolver cleared`);
    } else {
      console.log(`  ✗ ${name}: failed to clear`);
    }
  }

  console.log('\n=== Publishing rendering items ===');
  const componentsId = await getItemId(RENDERING_PATH);
  if (componentsId) {
    const guid = toGuid(componentsId);
    const pub = await gql(`mutation { publishItem(input: { rootItemId: "${guid}", languages: "en", targetDatabases: "experienceedge", publishItemMode: SMART, publishSubItems: true }) { operationId } }`);
    console.log('Publish opId:', pub?.publishItem?.operationId);
  }

  console.log('\nDone. Components will now get parent fields from Layout Service and fetch children from Edge GraphQL.');
}

main().catch(e => console.error(e));
