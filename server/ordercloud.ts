const OC_API_URL = process.env.ORDERCLOUD_API_URL || "https://sandboxapi.ordercloud.io";
const OC_CLIENT_ID = process.env.ORDERCLOUD_CLIENT_ID || "";
const OC_CLIENT_SECRET = process.env.ORDERCLOUD_CLIENT_SECRET || "";
const CATALOG_ID = "te-connectivity-catalog";

let cachedToken: string | null = null;
let tokenExpiry = 0;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry - 30000) {
    return cachedToken;
  }

  const body = new URLSearchParams({
    client_id: OC_CLIENT_ID,
    client_secret: OC_CLIENT_SECRET,
    grant_type: "client_credentials",
    scope: "FullAccess",
  });

  const res = await fetch(`${OC_API_URL}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OrderCloud auth failed (${res.status}): ${err}`);
  }

  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + data.expires_in * 1000;
  return cachedToken!;
}

async function ocFetch(path: string, options: RequestInit = {}): Promise<any> {
  const token = await getAccessToken();
  const url = `${OC_API_URL}/v1${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (res.status === 204) return null;

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  if (!res.ok) {
    const msg = typeof data === "object" ? JSON.stringify(data) : data;
    throw new Error(`OrderCloud API ${res.status} ${options.method || "GET"} ${path}: ${msg}`);
  }

  return data;
}

export const ordercloud = {
  CATALOG_ID,

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      await getAccessToken();
      return { success: true, message: "Successfully authenticated with OrderCloud" };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  },

  async createCatalog(id: string, name: string, description?: string) {
    return ocFetch("/catalogs", {
      method: "POST",
      body: JSON.stringify({ ID: id, Name: name, Description: description, Active: true }),
    });
  },

  async getCatalog(id: string) {
    return ocFetch(`/catalogs/${id}`);
  },

  async saveCatalog(id: string, data: any) {
    return ocFetch(`/catalogs/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async listCategories(catalogId: string = CATALOG_ID) {
    return ocFetch(`/catalogs/${catalogId}/categories?pageSize=100`);
  },

  async createCategory(catalogId: string, data: { ID: string; Name: string; Description?: string; ListOrder?: number; Active?: boolean; ParentID?: string; xp?: any }) {
    return ocFetch(`/catalogs/${catalogId}/categories`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async saveCategory(catalogId: string, categoryId: string, data: any) {
    return ocFetch(`/catalogs/${catalogId}/categories/${categoryId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteCategory(catalogId: string, categoryId: string) {
    return ocFetch(`/catalogs/${catalogId}/categories/${categoryId}`, { method: "DELETE" });
  },

  async listProducts(params?: { search?: string; page?: number; pageSize?: number }) {
    const qs = new URLSearchParams();
    if (params?.search) qs.set("search", params.search);
    qs.set("page", String(params?.page || 1));
    qs.set("pageSize", String(params?.pageSize || 100));
    return ocFetch(`/products?${qs.toString()}`);
  },

  async getProduct(productId: string) {
    return ocFetch(`/products/${productId}`);
  },

  async createProduct(data: {
    ID: string;
    Name: string;
    Description?: string;
    Active?: boolean;
    DefaultPriceScheduleID?: string;
    Inventory?: { Enabled?: boolean; QuantityAvailable?: number; OrderCanExceed?: boolean };
    xp?: any;
  }) {
    return ocFetch("/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async saveProduct(productId: string, data: any) {
    return ocFetch(`/products/${productId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteProduct(productId: string) {
    return ocFetch(`/products/${productId}`, { method: "DELETE" });
  },

  async listPriceSchedules(params?: { page?: number; pageSize?: number }) {
    const qs = new URLSearchParams();
    qs.set("page", String(params?.page || 1));
    qs.set("pageSize", String(params?.pageSize || 100));
    return ocFetch(`/priceschedules?${qs.toString()}`);
  },

  async createPriceSchedule(data: {
    ID?: string;
    Name: string;
    MinQuantity?: number;
    MaxQuantity?: number;
    PriceBreaks: { Quantity: number; Price: number }[];
    Currency?: string;
    xp?: any;
  }) {
    return ocFetch("/priceschedules", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async savePriceSchedule(id: string, data: any) {
    return ocFetch(`/priceschedules/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deletePriceSchedule(id: string) {
    return ocFetch(`/priceschedules/${id}`, { method: "DELETE" });
  },

  async saveCategoryProductAssignment(catalogId: string, categoryId: string, productId: string) {
    return ocFetch(`/catalogs/${catalogId}/categories/productassignments`, {
      method: "POST",
      body: JSON.stringify({ CategoryID: categoryId, ProductID: productId }),
    });
  },

  async listCategoryProductAssignments(catalogId: string, params?: { categoryID?: string; productID?: string }) {
    const qs = new URLSearchParams();
    qs.set("pageSize", "100");
    if (params?.categoryID) qs.set("categoryID", params.categoryID);
    if (params?.productID) qs.set("productID", params.productID);
    return ocFetch(`/catalogs/${catalogId}/categories/productassignments?${qs.toString()}`);
  },

  async deleteCategoryProductAssignment(catalogId: string, categoryId: string, productId: string) {
    return ocFetch(`/catalogs/${catalogId}/categories/${categoryId}/productassignments/${productId}`, { method: "DELETE" });
  },
};
