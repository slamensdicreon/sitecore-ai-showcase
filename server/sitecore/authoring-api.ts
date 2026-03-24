import { getAuthoringToken } from "./auth";

const CM_BASE = process.env.SITECORE_CM_URL || "https://xmc-icreonpartn828a-novatech15a9-novatechf6c7.sitecorecloud.io";
const GRAPHQL_ENDPOINT = `${CM_BASE}/sitecore/api/authoring/graphql/v1`;

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

export async function getItem(path: string): Promise<SitecoreItem | null> {
  try {
    const data = await authoringGraphQL(`
      query GetItem($path: String!) {
        item(where: { path: $path }) {
          itemId
          name
          path
          template {
            templateId
            name
          }
          fields(ownFields: true) {
            nodes {
              name
              value
            }
          }
        }
      }
    `, { path });
    if (!data?.item) return null;
    return {
      id: data.item.itemId,
      name: data.item.name,
      path: data.item.path,
      templateId: data.item.template?.templateId || "",
      fields: data.item.fields?.nodes?.reduce((acc: Record<string, any>, f: any) => {
        acc[f.name] = f.value;
        return acc;
      }, {}),
    };
  } catch (e) {
    console.error("[sitecore] getItem error:", (e as Error).message);
    return null;
  }
}

export async function createItem(input: CreateItemInput): Promise<SitecoreItem | null> {
  try {
    const parentItem = await getItem(input.parentPath);
    if (!parentItem) {
      console.error(`[sitecore] createItem: parent not found at path: ${input.parentPath}`);
      return null;
    }

    const data = await authoringGraphQL(`
      mutation CreateItem(
        $name: String!
        $parent: ID!
        $templateId: ID!
        $language: String!
        $fields: [FieldValueInput!]
      ) {
        createItem(input: {
          name: $name
          parent: $parent
          templateId: $templateId
          language: $language
          fields: $fields
        }) {
          item {
            itemId
            name
            path
          }
        }
      }
    `, {
      name: input.name,
      parent: parentItem.id,
      templateId: input.templateId,
      language: input.language || "en",
      fields: input.fields ? Object.entries(input.fields).map(([name, value]) => ({
        name,
        value: value || "",
      })) : [],
    });

    const item = data?.createItem?.item;
    if (!item) return null;
    return {
      id: item.itemId,
      name: item.name,
      path: item.path,
      templateId: "",
    };
  } catch (e) {
    console.error("[sitecore] createItem error:", (e as Error).message);
    return null;
  }
}

export async function updateItem(input: UpdateItemInput): Promise<boolean> {
  try {
    await authoringGraphQL(`
      mutation UpdateItem(
        $itemId: ID!
        $language: String!
        $fields: [FieldValueInput!]!
      ) {
        updateItem(input: {
          itemId: $itemId
          language: $language
          fields: $fields
        }) {
          item {
            itemId
          }
        }
      }
    `, {
      itemId: input.itemId,
      language: input.language || "en",
      fields: Object.entries(input.fields).map(([name, value]) => ({
        name,
        value: value || "",
      })),
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
      mutation DeleteItem($itemId: ID!) {
        deleteItem(input: { itemId: $itemId }) {
          successful
        }
      }
    `, { itemId: itemIdOrPath });
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
        item(where: { path: $path }) {
          children {
            nodes {
              itemId
              name
              path
              template {
                templateId
                name
              }
              fields(ownFields: true) {
                nodes {
                  name
                  value
                }
              }
            }
          }
        }
      }
    `, { path });

    return data?.item?.children?.nodes?.map((c: any) => ({
      id: c.itemId,
      name: c.name,
      path: c.path,
      templateId: c.template?.templateId || "",
      fields: c.fields?.nodes?.reduce((acc: Record<string, any>, f: any) => {
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
      mutation PublishItem(
        $itemId: ID!
        $publishSubItems: Boolean!
        $languages: [String!]!
      ) {
        publishItem(input: {
          itemId: $itemId
          publishSubItems: $publishSubItems
          languages: $languages
        }) {
          jobId
        }
      }
    `, {
      itemId,
      publishSubItems,
      languages: ["en"],
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
      mutation PublishSite(
        $languages: [String!]!
        $publishSiteMode: PublishSiteMode!
        $targetDatabases: [String!]!
      ) {
        publishSite(input: {
          publishSiteMode: $publishSiteMode
          languages: $languages
          targetDatabases: $targetDatabases
        }) {
          operationId
        }
      }
    `, {
      languages: ["en"],
      publishSiteMode: "SMART",
      targetDatabases: ["experienceedge"],
    });
    console.log("[sitecore] Full site publish initiated");
    return true;
  } catch (e) {
    console.error("[sitecore] publishSite error:", (e as Error).message);
    return false;
  }
}
