import { getAuthoringToken } from "./auth";

const CM_BASE = process.env.SITECORE_CM_URL || "https://xmcloudcm.sitecorecloud.io";
const GRAPHQL_ENDPOINT = `${CM_BASE}/sitecore/api/authoring/graphql/v1`;
const REST_ENDPOINT = `${CM_BASE}/sitecore/api/management/v1`;

export interface SitecoreItem {
  id: string;
  name: string;
  path: string;
  templateId: string;
  fields?: Record<string, any>;
  children?: SitecoreItem[];
}

export interface CreateItemInput {
  name: string;
  parentPath: string;
  templateId: string;
  fields?: Record<string, string>;
  language?: string;
}

export interface UpdateItemInput {
  itemId: string;
  fields: Record<string, string>;
  language?: string;
}

async function authoringGraphQL<T = any>(query: string, variables?: Record<string, any>): Promise<T> {
  const token = await getAuthoringToken();
  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Authoring GraphQL error: ${res.status} ${text}`);
  }

  const data = await res.json();
  if (data.errors?.length) {
    throw new Error(`Authoring GraphQL errors: ${JSON.stringify(data.errors)}`);
  }
  return data.data;
}

async function managementAPI(method: string, path: string, body?: any): Promise<any> {
  const token = await getAuthoringToken();
  const url = `${REST_ENDPOINT}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Management API error: ${res.status} ${text} [${method} ${path}]`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return null;
}

export async function getItem(path: string, language = "en"): Promise<SitecoreItem | null> {
  try {
    const data = await authoringGraphQL(`
      query GetItem($path: String!, $language: String!) {
        item(path: $path, language: $language) {
          id
          name
          path
          template {
            id
          }
          fields {
            name
            value
          }
          children {
            results {
              id
              name
              path
              template {
                id
              }
            }
          }
        }
      }
    `, { path, language });
    if (!data?.item) return null;
    return {
      id: data.item.id,
      name: data.item.name,
      path: data.item.path,
      templateId: data.item.template?.id || "",
      fields: data.item.fields?.reduce((acc: Record<string, any>, f: any) => {
        acc[f.name] = f.value;
        return acc;
      }, {}),
      children: data.item.children?.results?.map((c: any) => ({
        id: c.id,
        name: c.name,
        path: c.path,
        templateId: c.template?.id || "",
      })),
    };
  } catch (e) {
    console.error("[sitecore] getItem error:", (e as Error).message);
    return null;
  }
}

export async function createItem(input: CreateItemInput): Promise<SitecoreItem | null> {
  try {
    const data = await authoringGraphQL(`
      mutation CreateItem($input: CreateItemInput!) {
        createItem(input: $input) {
          item {
            id
            name
            path
            template {
              id
            }
          }
        }
      }
    `, {
      input: {
        name: input.name,
        parent: input.parentPath,
        templateId: input.templateId,
        language: input.language || "en",
        fields: input.fields ? Object.entries(input.fields).map(([name, value]) => ({
          name,
          value,
        })) : [],
      },
    });

    const item = data?.createItem?.item;
    if (!item) return null;
    return {
      id: item.id,
      name: item.name,
      path: item.path,
      templateId: item.template?.id || "",
    };
  } catch (e) {
    console.error("[sitecore] createItem error:", (e as Error).message);
    return null;
  }
}

export async function updateItem(input: UpdateItemInput): Promise<boolean> {
  try {
    await authoringGraphQL(`
      mutation UpdateItem($input: UpdateItemInput!) {
        updateItem(input: $input) {
          item {
            id
          }
        }
      }
    `, {
      input: {
        itemId: input.itemId,
        language: input.language || "en",
        fields: Object.entries(input.fields).map(([name, value]) => ({
          name,
          value,
        })),
      },
    });
    return true;
  } catch (e) {
    console.error("[sitecore] updateItem error:", (e as Error).message);
    return false;
  }
}

export async function deleteItem(itemIdOrPath: string): Promise<boolean> {
  try {
    await authoringGraphQL(`
      mutation DeleteItem($input: DeleteItemInput!) {
        deleteItem(input: $input) {
          successful
        }
      }
    `, {
      input: { itemId: itemIdOrPath },
    });
    return true;
  } catch (e) {
    console.error("[sitecore] deleteItem error:", (e as Error).message);
    return false;
  }
}

export async function getChildren(path: string): Promise<SitecoreItem[]> {
  try {
    const data = await authoringGraphQL(`
      query GetChildren($path: String!) {
        item(path: $path) {
          children {
            results {
              id
              name
              path
              template {
                id
              }
              fields {
                name
                value
              }
            }
          }
        }
      }
    `, { path });

    return data?.item?.children?.results?.map((c: any) => ({
      id: c.id,
      name: c.name,
      path: c.path,
      templateId: c.template?.id || "",
      fields: c.fields?.reduce((acc: Record<string, any>, f: any) => {
        acc[f.name] = f.value;
        return acc;
      }, {}),
    })) || [];
  } catch (e) {
    console.error("[sitecore] getChildren error:", (e as Error).message);
    return [];
  }
}

export async function publishItem(itemId: string, publishSubItems = true): Promise<boolean> {
  try {
    await authoringGraphQL(`
      mutation PublishItem($input: PublishItemInput!) {
        publishItem(input: $input) {
          jobId
        }
      }
    `, {
      input: {
        itemId,
        publishSubItems,
        languages: ["en"],
        targets: ["edge"],
      },
    });
    console.log(`[sitecore] Published item ${itemId}`);
    return true;
  } catch (e) {
    console.error("[sitecore] publishItem error:", (e as Error).message);
    return false;
  }
}

export async function publishSite(): Promise<boolean> {
  try {
    await authoringGraphQL(`
      mutation PublishSite {
        publishSite(input: {
          siteName: "${process.env.SITECORE_SITE_NAME || "NXP"}"
          languages: ["en"]
          publishSubItems: true
        }) {
          jobId
        }
      }
    `);
    console.log("[sitecore] Full site publish initiated");
    return true;
  } catch (e) {
    console.error("[sitecore] publishSite error:", (e as Error).message);
    return false;
  }
}

export async function getItemByQuery(query: string): Promise<SitecoreItem[]> {
  try {
    const data = await authoringGraphQL(`
      query SearchItems($query: String!) {
        search(query: $query, first: 100) {
          results {
            id
            name
            path
            template {
              id
            }
          }
        }
      }
    `, { query });

    return data?.search?.results?.map((c: any) => ({
      id: c.id,
      name: c.name,
      path: c.path,
      templateId: c.template?.id || "",
    })) || [];
  } catch (e) {
    console.error("[sitecore] getItemByQuery error:", (e as Error).message);
    return [];
  }
}
