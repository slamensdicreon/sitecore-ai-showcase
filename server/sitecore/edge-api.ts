import { getEdgeToken } from "./auth";

const EDGE_URL = process.env.SITECORE_EDGE_URL || "https://edge.sitecorecloud.io/api/graphql/v1";

async function edgeGraphQL<T = any>(query: string, variables?: Record<string, any>, apiKey?: string): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (apiKey) {
    headers["sc_apikey"] = apiKey;
  } else {
    const token = await getEdgeToken();
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(EDGE_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Edge GraphQL error: ${res.status} ${text}`);
  }

  const data = await res.json();
  if (data.errors?.length) {
    throw new Error(`Edge GraphQL errors: ${JSON.stringify(data.errors)}`);
  }
  return data.data;
}

export interface LayoutServiceResponse {
  sitecore: {
    context: {
      pageEditing: boolean;
      site: { name: string };
      language: string;
    };
    route: {
      name: string;
      displayName: string;
      fields: Record<string, any>;
      placeholders: Record<string, ComponentData[]>;
      itemId: string;
      templateId: string;
      templateName: string;
      itemLanguage: string;
    } | null;
  };
}

export interface ComponentData {
  uid: string;
  componentName: string;
  dataSource: string;
  fields: Record<string, FieldValue>;
  params: Record<string, string>;
  placeholders?: Record<string, ComponentData[]>;
}

export interface FieldValue {
  value: string | boolean | number | Record<string, any>;
  editable?: string;
}

export async function getLayoutData(
  itemPath: string,
  language = "en",
  siteName?: string
): Promise<LayoutServiceResponse | null> {
  try {
    const site = siteName || process.env.SITECORE_SITE_NAME || "NXP";
    const data = await edgeGraphQL(`
      query LayoutQuery($path: String!, $language: String!, $site: String!) {
        layout(routePath: $path, language: $language, site: $site) {
          item {
            rendered
          }
        }
      }
    `, { path: itemPath, language, site });

    if (!data?.layout?.item?.rendered) return null;
    return JSON.parse(data.layout.item.rendered);
  } catch (e) {
    console.error("[sitecore-edge] getLayoutData error:", (e as Error).message);
    return null;
  }
}

export async function getItemFromEdge(
  itemPath: string,
  language = "en"
): Promise<Record<string, any> | null> {
  try {
    const data = await edgeGraphQL(`
      query GetEdgeItem($path: String!, $language: String!) {
        item(path: $path, language: $language) {
          id
          name
          path
          fields {
            name
            jsonValue
          }
          children(first: 50) {
            results {
              id
              name
              path
              fields {
                name
                jsonValue
              }
            }
          }
        }
      }
    `, { path: itemPath, language });

    return data?.item || null;
  } catch (e) {
    console.error("[sitecore-edge] getItemFromEdge error:", (e as Error).message);
    return null;
  }
}

export async function searchEdge(
  keyword: string,
  rootItemPath?: string,
  language = "en"
): Promise<any[]> {
  try {
    const data = await edgeGraphQL(`
      query SearchEdge($keyword: String!, $language: String!, $rootItem: String) {
        search(
          where: {
            AND: [
              { name: "_fulltext", value: $keyword }
              { name: "_language", value: $language }
            ]
          }
          rootItem: $rootItem
          first: 20
        ) {
          total
          results {
            id
            name
            path
            fields {
              name
              jsonValue
            }
          }
        }
      }
    `, { keyword, language, rootItem: rootItemPath });

    return data?.search?.results || [];
  } catch (e) {
    console.error("[sitecore-edge] searchEdge error:", (e as Error).message);
    return [];
  }
}
