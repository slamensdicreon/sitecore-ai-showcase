import type { Field, LinkField } from '@sitecore-content-sdk/nextjs';
import type { ChildItem } from './field-utils';

const EDGE_URL = 'https://edge-platform.sitecorecloud.io/v1/content/api/graphql/v1';

const CHILDREN_QUERY = `
query DatasourceChildren($datasource: String!, $language: String!) {
  item(path: $datasource, language: $language) {
    children(hasLayout: false, first: 50) {
      results {
        id
        name
        fields {
          name
          jsonValue
        }
      }
    }
  }
}`;

interface EdgeField {
  name: string;
  jsonValue: Record<string, unknown>;
}

interface EdgeChildResult {
  id: string;
  name: string;
  fields: EdgeField[];
}

function parseChild(child: EdgeChildResult): ChildItem {
  const fields: Record<string, Field<string> | Field<number> | LinkField | undefined> = {};
  for (const f of child.fields) {
    fields[f.name] = f.jsonValue as Field<string> | Field<number> | LinkField | undefined;
  }
  return { id: child.id, fields };
}

export async function fetchDatasourceChildren(datasourceId: string): Promise<ChildItem[]> {
  const contextId = process.env.SITECORE_EDGE_CONTEXT_ID || process.env.NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID;
  if (!datasourceId || !contextId) return [];

  const cleanId = datasourceId.replace(/[{}]/g, '');

  try {
    const res = await fetch(`${EDGE_URL}?sitecoreContextId=${contextId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: CHILDREN_QUERY,
        variables: { datasource: cleanId, language: 'en' },
      }),
      next: { revalidate: 300 } as any,
    });
    if (!res.ok) return [];
    const json = await res.json();
    const results = json?.data?.item?.children?.results;
    if (!Array.isArray(results) || results.length === 0) return [];
    return results.map(parseChild);
  } catch {
    return [];
  }
}
