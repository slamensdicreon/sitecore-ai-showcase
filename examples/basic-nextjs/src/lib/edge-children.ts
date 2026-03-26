import type { Field, LinkField } from '@sitecore-content-sdk/nextjs';
import type { ChildItem } from './field-utils';

const EDGE_URL =
  process.env.SITECORE_EDGE_URL ||
  'https://edge-platform.sitecorecloud.io/v1/content/api/graphql/v1';

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
    fields[f.name] = f.jsonValue as unknown as Field<string> | Field<number> | LinkField | undefined;
  }
  return { id: child.id, fields };
}

interface EdgeFetchInit extends RequestInit {
  next?: { revalidate?: number | false; tags?: string[] };
}

export async function fetchDatasourceChildren(
  datasourceId: string,
  language = 'en'
): Promise<ChildItem[]> {
  const contextId = process.env.SITECORE_EDGE_CONTEXT_ID || process.env.NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID;
  if (!datasourceId || !contextId) return [];

  const cleanId = datasourceId.replace(/[{}]/g, '');

  try {
    const fetchOptions: EdgeFetchInit = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: CHILDREN_QUERY,
        variables: { datasource: cleanId, language },
      }),
      next: { revalidate: 300 },
    };
    const res = await fetch(`${EDGE_URL}?sitecoreContextId=${contextId}`, fetchOptions);
    if (!res.ok) {
      console.warn(`[edge-children] fetch failed for ${cleanId}: ${res.status}`);
      return [];
    }
    const json = await res.json();
    if (json?.errors) {
      console.warn(`[edge-children] GQL errors for ${cleanId}:`, json.errors[0]?.message);
    }
    const results = json?.data?.item?.children?.results;
    if (!Array.isArray(results) || results.length === 0) return [];
    return results.map(parseChild);
  } catch (err) {
    console.warn(`[edge-children] exception for ${cleanId}:`, (err as Error).message);
    return [];
  }
}
