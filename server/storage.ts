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
  users, categories, products, priceBreaks, orders, orderItems, cartItems, partsLists, partsListItems,
} from "@shared/schema";
import { db } from "./db";
import { eq, ilike, and, sql, desc, asc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

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
}

export const storage = new DatabaseStorage();
