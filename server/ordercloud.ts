const OC_API_URL = process.env.ORDERCLOUD_API_URL || "https://sandboxapi.ordercloud.io";
const OC_CLIENT_ID = process.env.ORDERCLOUD_CLIENT_ID || "";
const OC_CLIENT_SECRET = process.env.ORDERCLOUD_CLIENT_SECRET || "";
const CATALOG_ID = "te-connectivity-catalog";
const DEFAULT_BUYER_ID = "te-connectivity-buyers";

let cachedToken: string | null = null;
let tokenExpiry = 0;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry - 30000) {
    return cachedToken;
  }

  const params: Record<string, string> = {
    client_id: OC_CLIENT_ID,
    grant_type: "client_credentials",
    scope: "FullAccess",
  };
  if (OC_CLIENT_SECRET) {
    params.client_secret = OC_CLIENT_SECRET;
  }
  const body = new URLSearchParams(params);

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
  DEFAULT_BUYER_ID,

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

  async createBuyer(data: { ID: string; Name: string; Active?: boolean; xp?: any }) {
    return ocFetch("/buyers", { method: "POST", body: JSON.stringify(data) });
  },

  async getBuyer(buyerID: string) {
    return ocFetch(`/buyers/${buyerID}`);
  },

  async listBuyers() {
    return ocFetch("/buyers?pageSize=100");
  },

  async createBuyerUser(buyerID: string, data: { ID?: string; Username: string; FirstName: string; LastName: string; Email: string; Active?: boolean; xp?: any }) {
    return ocFetch(`/buyers/${buyerID}/users`, { method: "POST", body: JSON.stringify({ ...data, Active: data.Active ?? true }) });
  },

  async saveBuyerUser(buyerID: string, userID: string, data: any) {
    return ocFetch(`/buyers/${buyerID}/users/${userID}`, { method: "PUT", body: JSON.stringify(data) });
  },

  async listBuyerUsers(buyerID: string, params?: { page?: number; pageSize?: number }) {
    const qs = new URLSearchParams();
    qs.set("page", String(params?.page || 1));
    qs.set("pageSize", String(params?.pageSize || 100));
    return ocFetch(`/buyers/${buyerID}/users?${qs.toString()}`);
  },

  async getBuyerUser(buyerID: string, userID: string) {
    return ocFetch(`/buyers/${buyerID}/users/${userID}`);
  },

  async createBuyerAddress(buyerID: string, data: { ID?: string; AddressName?: string; Street1: string; City: string; State: string; Zip: string; Country: string; xp?: any }) {
    return ocFetch(`/buyers/${buyerID}/addresses`, { method: "POST", body: JSON.stringify(data) });
  },

  async listBuyerAddresses(buyerID: string) {
    return ocFetch(`/buyers/${buyerID}/addresses?pageSize=100`);
  },

  async createOrder(direction: string, data: { ID?: string; FromUserID?: string; BillingAddressID?: string; ShippingAddressID?: string; Comments?: string; xp?: any }) {
    return ocFetch(`/orders/${direction}`, { method: "POST", body: JSON.stringify(data) });
  },

  async getOrder(direction: string, orderID: string) {
    return ocFetch(`/orders/${direction}/${orderID}`);
  },

  async listOrders(direction: string, params?: { page?: number; pageSize?: number; buyerID?: string; status?: string }) {
    const qs = new URLSearchParams();
    qs.set("page", String(params?.page || 1));
    qs.set("pageSize", String(params?.pageSize || 100));
    if (params?.buyerID) qs.set("buyerID", params.buyerID);
    if (params?.status) qs.set("Status", params.status);
    return ocFetch(`/orders/${direction}?${qs.toString()}`);
  },

  async patchOrder(direction: string, orderID: string, data: any) {
    return ocFetch(`/orders/${direction}/${orderID}`, { method: "PATCH", body: JSON.stringify(data) });
  },

  async submitOrder(direction: string, orderID: string) {
    return ocFetch(`/orders/${direction}/${orderID}/submit`, { method: "POST" });
  },

  async createLineItem(direction: string, orderID: string, data: { ProductID: string; Quantity: number; UnitPrice?: number; xp?: any }) {
    return ocFetch(`/orders/${direction}/${orderID}/lineitems`, { method: "POST", body: JSON.stringify(data) });
  },

  async listLineItems(direction: string, orderID: string) {
    return ocFetch(`/orders/${direction}/${orderID}/lineitems?pageSize=100`);
  },

  async createCatalogAssignment(data: { CatalogID: string; BuyerID: string; ViewAllCategories?: boolean; ViewAllProducts?: boolean }) {
    return ocFetch("/catalogs/assignments", { method: "POST", body: JSON.stringify(data) });
  },

  async createUserGroupAssignment(buyerID: string, data: { UserGroupID: string; UserID: string }) {
    return ocFetch(`/buyers/${buyerID}/usergroups/assignments`, { method: "POST", body: JSON.stringify(data) });
  },
};
