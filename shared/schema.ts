import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  companyName: text("company_name"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email"),
  role: text("role").default("buyer"),
  locale: text("locale").default("en"),
  preferredCurrency: text("preferred_currency").default("USD"),
  ocBuyerId: text("oc_buyer_id"),
  authToken: text("auth_token"),
});

export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  parentId: varchar("parent_id"),
  sortOrder: integer("sort_order").default(0),
  imageUrl: text("image_url"),
});

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  sku: text("sku").notNull().unique(),
  description: text("description"),
  categoryId: varchar("category_id").references(() => categories.id),
  basePrice: decimal("base_price", { precision: 10, scale: 4 }).notNull(),
  currency: text("currency").default("USD"),
  active: boolean("active").default(true),
  imageUrl: text("image_url"),
  specs: jsonb("specs").$type<Record<string, string>>(),
  industry: text("industry"),
  application: text("application"),
  minOrderQty: integer("min_order_qty").default(1),
  leadTimeDays: integer("lead_time_days").default(5),
  inStock: boolean("in_stock").default(true),
  stockQty: integer("stock_qty").default(100),
  datasheetUrl: text("datasheet_url"),
});

export const priceBreaks = pgTable("price_breaks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").references(() => products.id).notNull(),
  minQty: integer("min_qty").notNull(),
  price: decimal("price", { precision: 10, scale: 4 }).notNull(),
});

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  status: text("status").default("pending"),
  total: decimal("total", { precision: 10, scale: 2 }).default("0"),
  shippingAddress: text("shipping_address"),
  poNumber: text("po_number"),
  notes: text("notes"),
  shippingMethod: text("shipping_method"),
  shippingCost: decimal("shipping_cost", { precision: 10, scale: 2 }).default("0"),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0"),
  discountCode: text("discount_code"),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0"),
  paymentMethod: text("payment_method"),
  paymentStatus: text("payment_status").default("pending"),
  trackingNumber: text("tracking_number"),
  streetAddress: text("street_address"),
  city: text("city"),
  stateProvince: text("state_province"),
  postalCode: text("postal_code"),
  country: text("country"),
  ocOrderId: text("oc_order_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").references(() => orders.id).notNull(),
  productId: varchar("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 4 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
});

export const cartItems = pgTable("cart_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  productId: varchar("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull().default(1),
});

export const partsLists = pgTable("parts_lists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const partsListItems = pgTable("parts_list_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  partsListId: varchar("parts_list_id").references(() => partsLists.id).notNull(),
  productId: varchar("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").default(1),
});

export const productRelationships = pgTable("product_relationships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").references(() => products.id).notNull(),
  relatedProductId: varchar("related_product_id").references(() => products.id).notNull(),
  relationshipType: text("relationship_type").notNull(),
});

export const orderStatusHistory = pgTable("order_status_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").references(() => orders.id).notNull(),
  status: text("status").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const adminAuditLog = pgTable("admin_audit_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  action: text("action").notNull(),
  details: text("details"),
  actor: text("actor").default("admin"),
  category: text("category").default("system"),
  status: text("status").default("info"),
  metadata: jsonb("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, { fields: [categories.parentId], references: [categories.id], relationName: "categoryParent" }),
  children: many(categories, { relationName: "categoryParent" }),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  priceBreaks: many(priceBreaks),
  relationships: many(productRelationships, { relationName: "productRelationships" }),
}));

export const priceBreaksRelations = relations(priceBreaks, ({ one }) => ({
  product: one(products, { fields: [priceBreaks.productId], references: [products.id] }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  items: many(orderItems),
  statusHistory: many(orderStatusHistory),
}));

export const productRelationshipsRelations = relations(productRelationships, ({ one }) => ({
  product: one(products, { fields: [productRelationships.productId], references: [products.id], relationName: "productRelationships" }),
  relatedProduct: one(products, { fields: [productRelationships.relatedProductId], references: [products.id], relationName: "relatedProducts" }),
}));

export const orderStatusHistoryRelations = relations(orderStatusHistory, ({ one }) => ({
  order: one(orders, { fields: [orderStatusHistory.orderId], references: [orders.id] }),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, { fields: [cartItems.userId], references: [users.id] }),
  product: one(products, { fields: [cartItems.productId], references: [products.id] }),
}));

export const partsListsRelations = relations(partsLists, ({ one, many }) => ({
  user: one(users, { fields: [partsLists.userId], references: [users.id] }),
  items: many(partsListItems),
}));

export const partsListItemsRelations = relations(partsListItems, ({ one }) => ({
  partsList: one(partsLists, { fields: [partsListItems.partsListId], references: [partsLists.id] }),
  product: one(products, { fields: [partsListItems.productId], references: [products.id] }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  companyName: true,
  firstName: true,
  lastName: true,
  email: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertPriceBreakSchema = createInsertSchema(priceBreaks).omit({ id: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, updatedAt: true });
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });
export const insertCartItemSchema = createInsertSchema(cartItems).omit({ id: true });
export const insertPartsListSchema = createInsertSchema(partsLists).omit({ id: true, createdAt: true });
export const insertPartsListItemSchema = createInsertSchema(partsListItems).omit({ id: true });
export const insertProductRelationshipSchema = createInsertSchema(productRelationships).omit({ id: true });
export const insertOrderStatusHistorySchema = createInsertSchema(orderStatusHistory).omit({ id: true, createdAt: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type PriceBreak = typeof priceBreaks.$inferSelect;
export type InsertPriceBreak = z.infer<typeof insertPriceBreakSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type PartsList = typeof partsLists.$inferSelect;
export type InsertPartsList = z.infer<typeof insertPartsListSchema>;
export type PartsListItem = typeof partsListItems.$inferSelect;
export type InsertPartsListItem = z.infer<typeof insertPartsListItemSchema>;
export type ProductRelationship = typeof productRelationships.$inferSelect;
export type InsertProductRelationship = z.infer<typeof insertProductRelationshipSchema>;
export type OrderStatusHistoryEntry = typeof orderStatusHistory.$inferSelect;
export type InsertOrderStatusHistory = z.infer<typeof insertOrderStatusHistorySchema>;

export const insertAdminAuditLogSchema = createInsertSchema(adminAuditLog).omit({ id: true, createdAt: true });
export type AdminAuditLogEntry = typeof adminAuditLog.$inferSelect;
export type InsertAdminAuditLog = z.infer<typeof insertAdminAuditLogSchema>;

export const featureFlags = pgTable("feature_flags", {
  key: varchar("key").primaryKey(),
  enabled: boolean("enabled").default(true).notNull(),
  description: text("description"),
  category: varchar("category").default("general"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type FeatureFlag = typeof featureFlags.$inferSelect;
