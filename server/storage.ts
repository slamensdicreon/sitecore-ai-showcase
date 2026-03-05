import {
  type User, type InsertUser,
  type Category, type InsertCategory,
  type Product, type InsertProduct,
  type PriceBreak, type InsertPriceBreak,
  type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem,
  type CartItem, type InsertCartItem,
  type PartsList, type InsertPartsList,
  type PartsListItem, type InsertPartsListItem,
  type ProductRelationship, type InsertProductRelationship,
  type OrderStatusHistoryEntry, type InsertOrderStatusHistory,
  type AdminAuditLogEntry, type InsertAdminAuditLog,
  users, categories, products, priceBreaks, orders, orderItems, cartItems, partsLists, partsListItems,
  productRelationships, orderStatusHistory, adminAuditLog,
} from "@shared/schema";
import { db } from "./db";
import { eq, ilike, and, sql, desc, asc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;

  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(cat: InsertCategory): Promise<Category>;

  getProducts(filters?: { categoryId?: string; search?: string; industry?: string; application?: string; page?: number; limit?: number }): Promise<{ products: Product[]; total: number }>;
  getProductById(id: string): Promise<Product | undefined>;
  getProductBySku(sku: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;

  getPriceBreaks(productId: string): Promise<PriceBreak[]>;
  createPriceBreak(pb: InsertPriceBreak): Promise<PriceBreak>;

  getOrders(userId: string): Promise<Order[]>;
  getOrderById(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;
  updateOrder(id: string, data: Partial<Order>): Promise<Order | undefined>;

  getOrderItems(orderId: string): Promise<(OrderItem & { product?: Product })[]>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;

  getCartItems(userId: string): Promise<(CartItem & { product?: Product })[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItemQty(id: string, quantity: number): Promise<CartItem | undefined>;
  removeCartItem(id: string): Promise<void>;
  clearCart(userId: string): Promise<void>;

  getPartsLists(userId: string): Promise<PartsList[]>;
  createPartsList(list: InsertPartsList): Promise<PartsList>;
  deletePartsList(id: string): Promise<void>;
  getPartsListItems(partsListId: string): Promise<(PartsListItem & { product?: Product })[]>;
  addPartsListItem(item: InsertPartsListItem): Promise<PartsListItem>;
  removePartsListItem(id: string): Promise<void>;

  getRelatedProducts(productId: string): Promise<(ProductRelationship & { relatedProduct?: Product })[]>;
  createProductRelationship(rel: InsertProductRelationship): Promise<ProductRelationship>;

  getOrderStatusHistory(orderId: string): Promise<OrderStatusHistoryEntry[]>;
  addOrderStatusHistory(entry: InsertOrderStatusHistory): Promise<OrderStatusHistoryEntry>;

  getAllOrders(): Promise<Order[]>;
  getAllUsers(): Promise<Omit<User, 'password'>[]>;
  getAllProductsWithBreaks(): Promise<(Product & { priceBreaks: PriceBreak[] })[]>;
  updateProduct(id: string, data: Partial<Product>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<void>;
  updateCategory(id: string, data: Partial<Category>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<void>;
  getStats(): Promise<{ totalProducts: number; totalCategories: number; totalOrders: number; totalUsers: number; totalRevenue: number }>;

  getRevenueOverTime(): Promise<{ date: string; revenue: number; orderCount: number }[]>;
  getOrdersByStatus(): Promise<{ status: string; count: number }[]>;
  getTopProducts(limit?: number): Promise<{ productId: string; name: string; sku: string; totalQty: number; totalRevenue: number }[]>;
  getLowStockProducts(threshold?: number): Promise<Product[]>;
  getCustomerAnalytics(): Promise<{ byRole: Record<string, number>; byLocale: Record<string, number>; byCurrency: Record<string, number>; topBuyers: { userId: string; username: string; companyName: string | null; orderCount: number; totalSpent: number }[] }>;

  getAuditLog(filters?: { category?: string; limit?: number; offset?: number }): Promise<{ entries: AdminAuditLogEntry[]; total: number }>;
  addAuditLog(entry: InsertAdminAuditLog): Promise<AdminAuditLogEntry>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const [updated] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return updated || undefined;
  }

  async getCategories(): Promise<Category[]> {
    return db.select().from(categories).orderBy(asc(categories.sortOrder));
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [cat] = await db.select().from(categories).where(eq(categories.slug, slug));
    return cat || undefined;
  }

  async createCategory(cat: InsertCategory): Promise<Category> {
    const [created] = await db.insert(categories).values(cat).returning();
    return created;
  }

  async getProducts(filters?: { categoryId?: string; search?: string; industry?: string; application?: string; page?: number; limit?: number }): Promise<{ products: Product[]; total: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const offset = (page - 1) * limit;
    const conditions = [];

    if (filters?.categoryId) conditions.push(eq(products.categoryId, filters.categoryId));
    if (filters?.search) conditions.push(ilike(products.name, `%${filters.search}%`));
    if (filters?.industry) conditions.push(eq(products.industry, filters.industry));
    if (filters?.application) conditions.push(eq(products.application, filters.application));
    conditions.push(eq(products.active, true));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [countResult] = await db.select({ count: sql<number>`count(*)::int` }).from(products).where(where);
    const result = await db.select().from(products).where(where).limit(limit).offset(offset).orderBy(asc(products.name));

    return { products: result, total: countResult.count };
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async getProductBySku(sku: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.sku, sku));
    return product || undefined;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [created] = await db.insert(products).values(product).returning();
    return created;
  }

  async getPriceBreaks(productId: string): Promise<PriceBreak[]> {
    return db.select().from(priceBreaks).where(eq(priceBreaks.productId, productId)).orderBy(asc(priceBreaks.minQty));
  }

  async createPriceBreak(pb: InsertPriceBreak): Promise<PriceBreak> {
    const [created] = await db.insert(priceBreaks).values(pb).returning();
    return created;
  }

  async getOrders(userId: string): Promise<Order[]> {
    return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  }

  async getOrderById(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [created] = await db.insert(orders).values(order).returning();
    return created;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const [updated] = await db.update(orders).set({ status, updatedAt: new Date() }).where(eq(orders.id, id)).returning();
    return updated || undefined;
  }

  async updateOrder(id: string, data: Partial<Order>): Promise<Order | undefined> {
    const [updated] = await db.update(orders).set({ ...data, updatedAt: new Date() }).where(eq(orders.id, id)).returning();
    return updated || undefined;
  }

  async getOrderItems(orderId: string): Promise<(OrderItem & { product?: Product })[]> {
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
    const enriched = [];
    for (const item of items) {
      const [product] = await db.select().from(products).where(eq(products.id, item.productId));
      enriched.push({ ...item, product: product || undefined });
    }
    return enriched;
  }

  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const [created] = await db.insert(orderItems).values(item).returning();
    return created;
  }

  async getCartItems(userId: string): Promise<(CartItem & { product?: Product })[]> {
    const items = await db.select().from(cartItems).where(eq(cartItems.userId, userId));
    const enriched = [];
    for (const item of items) {
      const [product] = await db.select().from(products).where(eq(products.id, item.productId));
      enriched.push({ ...item, product: product || undefined });
    }
    return enriched;
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    const existing = await db.select().from(cartItems).where(and(eq(cartItems.userId, item.userId), eq(cartItems.productId, item.productId)));
    if (existing.length > 0) {
      const [updated] = await db.update(cartItems).set({ quantity: existing[0].quantity + (item.quantity || 1) }).where(eq(cartItems.id, existing[0].id)).returning();
      return updated;
    }
    const [created] = await db.insert(cartItems).values(item).returning();
    return created;
  }

  async updateCartItemQty(id: string, quantity: number): Promise<CartItem | undefined> {
    const [updated] = await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, id)).returning();
    return updated || undefined;
  }

  async removeCartItem(id: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(userId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  async getPartsLists(userId: string): Promise<PartsList[]> {
    return db.select().from(partsLists).where(eq(partsLists.userId, userId)).orderBy(desc(partsLists.createdAt));
  }

  async createPartsList(list: InsertPartsList): Promise<PartsList> {
    const [created] = await db.insert(partsLists).values(list).returning();
    return created;
  }

  async deletePartsList(id: string): Promise<void> {
    await db.delete(partsListItems).where(eq(partsListItems.partsListId, id));
    await db.delete(partsLists).where(eq(partsLists.id, id));
  }

  async getPartsListItems(partsListId: string): Promise<(PartsListItem & { product?: Product })[]> {
    const items = await db.select().from(partsListItems).where(eq(partsListItems.partsListId, partsListId));
    const enriched = [];
    for (const item of items) {
      const [product] = await db.select().from(products).where(eq(products.id, item.productId));
      enriched.push({ ...item, product: product || undefined });
    }
    return enriched;
  }

  async addPartsListItem(item: InsertPartsListItem): Promise<PartsListItem> {
    const [created] = await db.insert(partsListItems).values(item).returning();
    return created;
  }

  async removePartsListItem(id: string): Promise<void> {
    await db.delete(partsListItems).where(eq(partsListItems.id, id));
  }

  async getRelatedProducts(productId: string): Promise<(ProductRelationship & { relatedProduct?: Product })[]> {
    const rels = await db.select().from(productRelationships).where(eq(productRelationships.productId, productId));
    const enriched = [];
    for (const rel of rels) {
      const [product] = await db.select().from(products).where(eq(products.id, rel.relatedProductId));
      enriched.push({ ...rel, relatedProduct: product || undefined });
    }
    return enriched;
  }

  async createProductRelationship(rel: InsertProductRelationship): Promise<ProductRelationship> {
    const [created] = await db.insert(productRelationships).values(rel).returning();
    return created;
  }

  async getOrderStatusHistory(orderId: string): Promise<OrderStatusHistoryEntry[]> {
    return db.select().from(orderStatusHistory).where(eq(orderStatusHistory.orderId, orderId)).orderBy(desc(orderStatusHistory.createdAt));
  }

  async addOrderStatusHistory(entry: InsertOrderStatusHistory): Promise<OrderStatusHistoryEntry> {
    const [created] = await db.insert(orderStatusHistory).values(entry).returning();
    return created;
  }

  async getAllOrders(): Promise<Order[]> {
    return db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getAllUsers(): Promise<Omit<User, 'password'>[]> {
    const allUsers = await db.select().from(users).orderBy(asc(users.username));
    return allUsers.map(({ password: _, ...rest }) => rest);
  }

  async getAllProductsWithBreaks(): Promise<(Product & { priceBreaks: PriceBreak[] })[]> {
    const allProducts = await db.select().from(products).orderBy(asc(products.name));
    const enriched = [];
    for (const prod of allProducts) {
      const breaks = await db.select().from(priceBreaks).where(eq(priceBreaks.productId, prod.id)).orderBy(asc(priceBreaks.minQty));
      enriched.push({ ...prod, priceBreaks: breaks });
    }
    return enriched;
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product | undefined> {
    const [updated] = await db.update(products).set(data).where(eq(products.id, id)).returning();
    return updated || undefined;
  }

  async deleteProduct(id: string): Promise<void> {
    await db.delete(priceBreaks).where(eq(priceBreaks.productId, id));
    await db.delete(productRelationships).where(eq(productRelationships.productId, id));
    await db.delete(productRelationships).where(eq(productRelationships.relatedProductId, id));
    await db.delete(products).where(eq(products.id, id));
  }

  async updateCategory(id: string, data: Partial<Category>): Promise<Category | undefined> {
    const [updated] = await db.update(categories).set(data).where(eq(categories.id, id)).returning();
    return updated || undefined;
  }

  async deleteCategory(id: string): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  async getStats(): Promise<{ totalProducts: number; totalCategories: number; totalOrders: number; totalUsers: number; totalRevenue: number }> {
    const [prodCount] = await db.select({ count: sql<number>`count(*)::int` }).from(products);
    const [catCount] = await db.select({ count: sql<number>`count(*)::int` }).from(categories);
    const [orderCount] = await db.select({ count: sql<number>`count(*)::int` }).from(orders);
    const [userCount] = await db.select({ count: sql<number>`count(*)::int` }).from(users);
    const [revenueResult] = await db.select({ total: sql<string>`COALESCE(SUM(total::numeric), 0)::text` }).from(orders);
    return {
      totalProducts: prodCount.count,
      totalCategories: catCount.count,
      totalOrders: orderCount.count,
      totalUsers: userCount.count,
      totalRevenue: parseFloat(revenueResult.total || "0"),
    };
  }

  async getRevenueOverTime(): Promise<{ date: string; revenue: number; orderCount: number }[]> {
    const rows = await db.select({
      date: sql<string>`TO_CHAR(created_at, 'YYYY-MM-DD')`,
      revenue: sql<string>`COALESCE(SUM(total::numeric), 0)::text`,
      orderCount: sql<number>`count(*)::int`,
    }).from(orders).groupBy(sql`TO_CHAR(created_at, 'YYYY-MM-DD')`).orderBy(sql`TO_CHAR(created_at, 'YYYY-MM-DD')`);
    return rows.map(r => ({ date: r.date, revenue: parseFloat(r.revenue), orderCount: r.orderCount }));
  }

  async getOrdersByStatus(): Promise<{ status: string; count: number }[]> {
    return db.select({
      status: sql<string>`COALESCE(status, 'pending')`,
      count: sql<number>`count(*)::int`,
    }).from(orders).groupBy(orders.status);
  }

  async getTopProducts(limit = 10): Promise<{ productId: string; name: string; sku: string; totalQty: number; totalRevenue: number }[]> {
    const rows = await db.select({
      productId: orderItems.productId,
      totalQty: sql<number>`SUM(${orderItems.quantity})::int`,
      totalRevenue: sql<string>`COALESCE(SUM(${orderItems.totalPrice}::numeric), 0)::text`,
    }).from(orderItems).groupBy(orderItems.productId).orderBy(sql`SUM(${orderItems.totalPrice}::numeric) DESC`).limit(limit);

    const enriched = [];
    for (const row of rows) {
      const [product] = await db.select().from(products).where(eq(products.id, row.productId));
      enriched.push({
        productId: row.productId,
        name: product?.name || "Unknown",
        sku: product?.sku || "N/A",
        totalQty: row.totalQty,
        totalRevenue: parseFloat(row.totalRevenue),
      });
    }
    return enriched;
  }

  async getLowStockProducts(threshold = 50): Promise<Product[]> {
    return db.select().from(products).where(
      and(eq(products.active, true), sql`${products.stockQty} < ${threshold}`)
    ).orderBy(asc(products.stockQty));
  }

  async getCustomerAnalytics(): Promise<{ byRole: Record<string, number>; byLocale: Record<string, number>; byCurrency: Record<string, number>; topBuyers: { userId: string; username: string; companyName: string | null; orderCount: number; totalSpent: number }[] }> {
    const allUsers = await db.select().from(users);
    const byRole: Record<string, number> = {};
    const byLocale: Record<string, number> = {};
    const byCurrency: Record<string, number> = {};
    for (const u of allUsers) {
      byRole[u.role || "buyer"] = (byRole[u.role || "buyer"] || 0) + 1;
      byLocale[u.locale || "en"] = (byLocale[u.locale || "en"] || 0) + 1;
      byCurrency[u.preferredCurrency || "USD"] = (byCurrency[u.preferredCurrency || "USD"] || 0) + 1;
    }

    const topBuyersRows = await db.select({
      userId: orders.userId,
      orderCount: sql<number>`count(*)::int`,
      totalSpent: sql<string>`COALESCE(SUM(total::numeric), 0)::text`,
    }).from(orders).groupBy(orders.userId).orderBy(sql`SUM(total::numeric) DESC`).limit(10);

    const topBuyers = [];
    for (const row of topBuyersRows) {
      const [user] = await db.select().from(users).where(eq(users.id, row.userId));
      topBuyers.push({
        userId: row.userId,
        username: user?.username || "Unknown",
        companyName: user?.companyName || null,
        orderCount: row.orderCount,
        totalSpent: parseFloat(row.totalSpent),
      });
    }
    return { byRole, byLocale, byCurrency, topBuyers };
  }

  async getAuditLog(filters?: { category?: string; limit?: number; offset?: number }): Promise<{ entries: AdminAuditLogEntry[]; total: number }> {
    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;
    const conditions = [];
    if (filters?.category) conditions.push(eq(adminAuditLog.category, filters.category));
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [countResult] = await db.select({ count: sql<number>`count(*)::int` }).from(adminAuditLog).where(where);
    const entries = await db.select().from(adminAuditLog).where(where).orderBy(desc(adminAuditLog.createdAt)).limit(limit).offset(offset);
    return { entries, total: countResult.count };
  }

  async addAuditLog(entry: InsertAdminAuditLog): Promise<AdminAuditLogEntry> {
    const [created] = await db.insert(adminAuditLog).values(entry).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
