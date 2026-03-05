import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { seedDatabase } from "./seed";
import session from "express-session";
import pgSession from "connect-pg-simple";
import { pool } from "./db";
import { z } from "zod";
import { ordercloud } from "./ordercloud";
import { syncToOrderCloud, pullFromOrderCloud } from "./ordercloud-sync";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const PgStore = pgSession(session);
  app.use(
    session({
      store: new PgStore({ pool, createTableIfMissing: true }),
      secret: process.env.SESSION_SECRET || "te-ordercloud-demo-secret",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false, sameSite: "lax", maxAge: 24 * 60 * 60 * 1000 },
    })
  );

  await seedDatabase();

  const loginSchema = z.object({ username: z.string().min(1), password: z.string().min(1) });
  const registerSchema = z.object({
    username: z.string().min(1),
    password: z.string().min(6),
    companyName: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email().optional(),
  });
  const cartItemSchema = z.object({ productId: z.string().min(1), quantity: z.number().int().min(1).optional() });
  const updateCartSchema = z.object({ quantity: z.number().int().min(1) });
  const placeOrderSchema = z.object({
    shippingAddress: z.string().optional(),
    poNumber: z.string().optional(),
    notes: z.string().optional(),
    shippingMethod: z.string().optional(),
    paymentMethod: z.string().optional(),
    discountCode: z.string().optional(),
    streetAddress: z.string().optional(),
    city: z.string().optional(),
    stateProvince: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
  });
  const createListSchema = z.object({ name: z.string().min(1) });
  const addListItemSchema = z.object({ productId: z.string().min(1), quantity: z.number().int().min(1).optional() });

  app.post("/api/auth/login", async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid input" });
    const { username, password } = parsed.data;
    const user = await storage.getUserByUsername(username);
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    (req.session as any).userId = user.id;
    const { password: _, ...safe } = user;
    req.session.save(() => {
      res.json(safe);
    });
  });

  app.post("/api/auth/register", async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid input" });
    const { username, password, companyName, firstName, lastName, email } = parsed.data;
    const existing = await storage.getUserByUsername(username);
    if (existing) return res.status(400).json({ message: "Username already exists" });
    const user = await storage.createUser({ username, password, companyName, firstName, lastName, email });
    (req.session as any).userId = user.id;
    const { password: _, ...safe } = user;
    req.session.save(() => {
      res.json(safe);
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const user = await storage.getUser(userId);
    if (!user) return res.status(401).json({ message: "Not authenticated" });
    const { password: _, ...safe } = user;
    res.json(safe);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });

  app.get("/api/categories", async (_req, res) => {
    const cats = await storage.getCategories();
    res.json(cats);
  });

  app.get("/api/categories/:slug", async (req, res) => {
    const cat = await storage.getCategoryBySlug(req.params.slug);
    if (!cat) return res.status(404).json({ message: "Category not found" });
    res.json(cat);
  });

  app.get("/api/products", async (req, res) => {
    const { categoryId, search, industry, application, page, limit } = req.query;
    const result = await storage.getProducts({
      categoryId: categoryId as string,
      search: search as string,
      industry: industry as string,
      application: application as string,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
    });
    res.json(result);
  });

  app.get("/api/products/sku/:sku", async (req, res) => {
    const product = await storage.getProductBySku(req.params.sku);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  });

  app.get("/api/products/:id", async (req, res) => {
    const product = await storage.getProductById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    const breaks = await storage.getPriceBreaks(product.id);
    res.json({ ...product, priceBreaks: breaks });
  });

  app.get("/api/products/:id/related", async (req, res) => {
    const rels = await storage.getRelatedProducts(req.params.id);
    res.json(rels);
  });

  const requireAuth = (req: any, res: any, next: any) => {
    const userId = req.session?.userId;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    req.userId = userId;
    next();
  };

  async function computeCartPricing(items: any[]) {
    const enriched = [];
    for (const item of items) {
      if (item.product) {
        const breaks = await storage.getPriceBreaks(item.product.id);
        let unitPrice = parseFloat(item.product.basePrice);
        for (const pb of breaks) {
          if (item.quantity >= pb.minQty) unitPrice = parseFloat(pb.price);
        }
        enriched.push({ ...item, unitPrice, totalPrice: unitPrice * item.quantity });
      } else {
        enriched.push({ ...item, unitPrice: 0, totalPrice: 0 });
      }
    }
    return enriched;
  }

  app.get("/api/cart", requireAuth, async (req: any, res) => {
    const items = await storage.getCartItems(req.userId);
    const priced = await computeCartPricing(items);
    res.json(priced);
  });

  app.post("/api/cart", requireAuth, async (req: any, res) => {
    const parsed = cartItemSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid input" });
    const { productId, quantity } = parsed.data;
    const item = await storage.addToCart({ userId: req.userId, productId, quantity: quantity || 1 });
    res.json(item);
  });

  app.patch("/api/cart/:id", requireAuth, async (req: any, res) => {
    const parsed = updateCartSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid input" });
    const item = await storage.updateCartItemQty(req.params.id, parsed.data.quantity);
    if (!item) return res.status(404).json({ message: "Cart item not found" });
    res.json(item);
  });

  app.delete("/api/cart/:id", requireAuth, async (req: any, res) => {
    await storage.removeCartItem(req.params.id);
    res.json({ message: "Removed" });
  });

  app.get("/api/orders", requireAuth, async (req: any, res) => {
    const ordersList = await storage.getOrders(req.userId);
    res.json(ordersList);
  });

  app.get("/api/orders/:id", requireAuth, async (req: any, res) => {
    const order = await storage.getOrderById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.userId !== req.userId) return res.status(403).json({ message: "Not authorized" });
    const items = await storage.getOrderItems(order.id);
    const history = await storage.getOrderStatusHistory(order.id);
    res.json({ ...order, items, statusHistory: history });
  });

  app.get("/api/orders/:id/history", requireAuth, async (req: any, res) => {
    const history = await storage.getOrderStatusHistory(req.params.id);
    res.json(history);
  });

  app.post("/api/orders/:id/cancel", requireAuth, async (req: any, res) => {
    const order = await storage.getOrderById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.userId !== req.userId) return res.status(403).json({ message: "Not authorized" });
    if (order.status !== "submitted" && order.status !== "pending") {
      return res.status(400).json({ message: "Only submitted orders can be cancelled" });
    }
    const updated = await storage.updateOrderStatus(order.id, "cancelled");
    await storage.addOrderStatusHistory({ orderId: order.id, status: "cancelled", note: "Cancelled by customer" });
    res.json(updated);
  });

  app.patch("/api/users/preferences", requireAuth, async (req: any, res) => {
    const { locale, preferredCurrency, role } = req.body;
    const updates: any = {};
    if (locale) updates.locale = locale;
    if (preferredCurrency) updates.preferredCurrency = preferredCurrency;
    if (role) updates.role = role;
    const user = await storage.updateUser(req.userId, updates);
    if (!user) return res.status(404).json({ message: "User not found" });
    const { password: _, ...safe } = user;
    res.json(safe);
  });

  const DISCOUNT_CODES: Record<string, number> = {
    "TE10": 0.10,
    "VOLUME20": 0.20,
  };

  const SHIPPING_RATES: Record<string, number> = {
    "standard": 0,
    "express": 15,
    "nextday": 35,
  };

  app.post("/api/orders/validate-discount", requireAuth, async (req: any, res) => {
    const { code } = req.body;
    const upperCode = (code || "").toUpperCase();
    if (DISCOUNT_CODES[upperCode]) {
      res.json({ valid: true, code: upperCode, percentage: DISCOUNT_CODES[upperCode] * 100 });
    } else {
      res.json({ valid: false, message: "Invalid discount code" });
    }
  });

  app.post("/api/orders", requireAuth, async (req: any, res) => {
    const parsed = placeOrderSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid input" });
    const { shippingAddress, poNumber, notes, shippingMethod, paymentMethod, discountCode, streetAddress, city, stateProvince, postalCode, country } = parsed.data;
    const cartItems = await storage.getCartItems(req.userId);
    if (cartItems.length === 0) return res.status(400).json({ message: "Cart is empty" });

    let subtotal = 0;
    for (const item of cartItems) {
      if (item.product) {
        const breaks = await storage.getPriceBreaks(item.product.id);
        let unitPrice = parseFloat(item.product.basePrice);
        for (const pb of breaks) {
          if (item.quantity >= pb.minQty) unitPrice = parseFloat(pb.price);
        }
        subtotal += unitPrice * item.quantity;
      }
    }

    const shippingCost = SHIPPING_RATES[shippingMethod || "standard"] || 0;
    const taxRate = 0.0825;
    const taxAmount = subtotal * taxRate;

    let discountAmount = 0;
    let validDiscountCode = discountCode || null;
    if (discountCode) {
      const upperCode = discountCode.toUpperCase();
      if (DISCOUNT_CODES[upperCode]) {
        discountAmount = subtotal * DISCOUNT_CODES[upperCode];
        validDiscountCode = upperCode;
      }
    }

    const total = subtotal + shippingCost + taxAmount - discountAmount;

    const fullAddress = streetAddress
      ? `${streetAddress}, ${city || ""}, ${stateProvince || ""} ${postalCode || ""}, ${country || ""}`
      : shippingAddress || "";

    const order = await storage.createOrder({
      userId: req.userId,
      status: "submitted",
      total: total.toFixed(2),
      shippingAddress: fullAddress,
      poNumber,
      notes,
      shippingMethod: shippingMethod || "standard",
      shippingCost: shippingCost.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      discountCode: validDiscountCode,
      discountAmount: discountAmount.toFixed(2),
      paymentMethod: paymentMethod || "purchase_order",
      paymentStatus: "pending",
      streetAddress,
      city,
      stateProvince,
      postalCode,
      country,
    });

    for (const item of cartItems) {
      if (item.product) {
        const breaks = await storage.getPriceBreaks(item.product.id);
        let unitPrice = parseFloat(item.product.basePrice);
        for (const pb of breaks) {
          if (item.quantity >= pb.minQty) unitPrice = parseFloat(pb.price);
        }
        await storage.createOrderItem({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: unitPrice.toFixed(4),
          totalPrice: (unitPrice * item.quantity).toFixed(2),
        });
      }
    }

    await storage.addOrderStatusHistory({ orderId: order.id, status: "submitted", note: "Order placed" });
    await storage.clearCart(req.userId);
    res.json(order);
  });

  app.get("/api/parts-lists", requireAuth, async (req: any, res) => {
    const lists = await storage.getPartsLists(req.userId);
    res.json(lists);
  });

  app.post("/api/parts-lists", requireAuth, async (req: any, res) => {
    const parsed = createListSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid input" });
    const list = await storage.createPartsList({ userId: req.userId, name: parsed.data.name });
    res.json(list);
  });

  app.delete("/api/parts-lists/:id", requireAuth, async (req: any, res) => {
    await storage.deletePartsList(req.params.id);
    res.json({ message: "Deleted" });
  });

  app.get("/api/parts-lists/:id/items", requireAuth, async (req: any, res) => {
    const items = await storage.getPartsListItems(req.params.id);
    res.json(items);
  });

  app.post("/api/parts-lists/:id/items", requireAuth, async (req: any, res) => {
    const parsed = addListItemSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid input" });
    const { productId, quantity } = parsed.data;
    const item = await storage.addPartsListItem({ partsListId: req.params.id, productId, quantity });
    res.json(item);
  });

  app.delete("/api/parts-list-items/:id", requireAuth, async (req: any, res) => {
    await storage.removePartsListItem(req.params.id);
    res.json({ message: "Removed" });
  });

  const adminCors = (req: Request, res: Response, next: NextFunction) => {
    res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }
    next();
  };

  app.use("/api/admin", adminCors);

  app.get("/api/admin/ordercloud/status", async (_req, res) => {
    const result = await ordercloud.testConnection();
    res.json(result);
  });

  app.post("/api/admin/ordercloud/sync", async (_req, res) => {
    try {
      const result = await syncToOrderCloud();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.get("/api/admin/ordercloud/catalog", async (_req, res) => {
    try {
      const data = await pullFromOrderCloud();
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/admin/ordercloud/products", async (_req, res) => {
    try {
      const result = await ordercloud.listProducts({ pageSize: 100 });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/admin/ordercloud/categories", async (_req, res) => {
    try {
      const result = await ordercloud.listCategories();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/admin/ordercloud/priceschedules", async (_req, res) => {
    try {
      const result = await ordercloud.listPriceSchedules({ pageSize: 100 });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  const adminProductSchema = z.object({
    name: z.string().min(1),
    sku: z.string().min(1),
    description: z.string().optional(),
    categorySlug: z.string().optional(),
    basePrice: z.number().positive(),
    active: z.boolean().optional(),
    specs: z.record(z.string()).optional(),
    industry: z.string().optional(),
    application: z.string().optional(),
    minOrderQty: z.number().int().min(1).optional(),
    leadTimeDays: z.number().int().min(0).optional(),
    inStock: z.boolean().optional(),
    stockQty: z.number().int().min(0).optional(),
    imageUrl: z.string().optional(),
    priceBreaks: z.array(z.object({
      minQty: z.number().int().min(1),
      price: z.number().positive(),
    })).optional(),
  });

  app.post("/api/admin/ordercloud/products", async (req, res) => {
    const parsed = adminProductSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid input", errors: parsed.error.errors });

    const data = parsed.data;
    const ocProductId = data.sku;
    const ocPriceScheduleId = `ps-${data.sku}`;

    try {
      const breaks = data.priceBreaks || [{ minQty: 1, price: data.basePrice }];
      await ordercloud.savePriceSchedule(ocPriceScheduleId, {
        ID: ocPriceScheduleId,
        Name: `${data.name} Pricing`,
        MinQuantity: data.minOrderQty || 1,
        PriceBreaks: breaks.map(b => ({ Quantity: b.minQty, Price: b.price })),
        Currency: "USD",
      });

      const ocProduct = await ordercloud.saveProduct(ocProductId, {
        ID: ocProductId,
        Name: data.name,
        Description: data.description || "",
        Active: data.active ?? true,
        DefaultPriceScheduleID: ocPriceScheduleId,
        Inventory: {
          Enabled: true,
          QuantityAvailable: data.stockQty || 0,
          OrderCanExceed: false,
        },
        xp: {
          imageUrl: data.imageUrl || "",
          specs: data.specs || {},
          industry: data.industry || "",
          application: data.application || "",
          minOrderQty: data.minOrderQty || 1,
          leadTimeDays: data.leadTimeDays || 5,
          inStock: data.inStock ?? true,
        },
      });

      if (data.categorySlug) {
        try {
          await ordercloud.saveCategoryProductAssignment(
            ordercloud.CATALOG_ID,
            data.categorySlug,
            ocProductId
          );
        } catch {}
      }

      const localProduct = await storage.getProductBySku(data.sku);
      if (localProduct) {
        const { db: database } = await import("./db");
        const { products: productsTable, priceBreaks: priceBreaksTable } = await import("@shared/schema");
        const { eq } = await import("drizzle-orm");

        await database.update(productsTable).set({
          name: data.name,
          description: data.description,
          basePrice: data.basePrice.toFixed(4),
          active: data.active ?? true,
          specs: data.specs,
          industry: data.industry,
          application: data.application,
          minOrderQty: data.minOrderQty || 1,
          leadTimeDays: data.leadTimeDays || 5,
          inStock: data.inStock ?? true,
          stockQty: data.stockQty || 0,
          imageUrl: data.imageUrl,
        }).where(eq(productsTable.id, localProduct.id));

        await database.delete(priceBreaksTable).where(eq(priceBreaksTable.productId, localProduct.id));
        for (const pb of breaks) {
          await database.insert(priceBreaksTable).values({
            productId: localProduct.id,
            minQty: pb.minQty,
            price: pb.price.toFixed(4),
          });
        }
      }

      res.json({ success: true, product: ocProduct });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.get("/api/admin/stats", async (_req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/admin/orders", async (_req, res) => {
    try {
      const allOrders = await storage.getAllOrders();
      const enriched = [];
      for (const order of allOrders) {
        const items = await storage.getOrderItems(order.id);
        const user = await storage.getUser(order.userId);
        const safeUser = user ? { id: user.id, username: user.username, companyName: user.companyName, firstName: user.firstName, lastName: user.lastName, email: user.email } : null;
        enriched.push({ ...order, items, user: safeUser });
      }
      res.json(enriched);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.patch("/api/admin/orders/:id/status", async (req, res) => {
    try {
      const { status, trackingNumber, note } = req.body;
      const order = await storage.getOrderById(req.params.id);
      if (!order) return res.status(404).json({ message: "Order not found" });
      const updates: any = {};
      if (status) updates.status = status;
      if (trackingNumber !== undefined) updates.trackingNumber = trackingNumber;
      const updated = await storage.updateOrder(order.id, updates);
      if (status) {
        await storage.addOrderStatusHistory({
          orderId: order.id,
          status,
          note: note || `Status changed to ${status}`,
        });
      }
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/admin/users", async (_req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      res.json(allUsers);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/admin/local-products", async (_req, res) => {
    try {
      const allProducts = await storage.getAllProductsWithBreaks();
      res.json(allProducts);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  const localProductSchema = z.object({
    name: z.string().min(1),
    sku: z.string().min(1),
    description: z.string().optional(),
    categoryId: z.string().optional(),
    basePrice: z.string(),
    active: z.boolean().optional(),
    specs: z.record(z.string()).optional(),
    industry: z.string().optional(),
    application: z.string().optional(),
    minOrderQty: z.number().int().min(1).optional(),
    leadTimeDays: z.number().int().min(0).optional(),
    inStock: z.boolean().optional(),
    stockQty: z.number().int().min(0).optional(),
    imageUrl: z.string().optional(),
  });

  app.post("/api/admin/local-products", async (req, res) => {
    const parsed = localProductSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid input", errors: parsed.error.errors });
    try {
      const product = await storage.createProduct(parsed.data as any);
      res.json(product);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.put("/api/admin/local-products/:id", async (req, res) => {
    try {
      const updated = await storage.updateProduct(req.params.id, req.body);
      if (!updated) return res.status(404).json({ message: "Product not found" });
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.delete("/api/admin/local-products/:id", async (req, res) => {
    try {
      await storage.deleteProduct(req.params.id);
      res.json({ message: "Deleted" });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/admin/categories", async (req, res) => {
    try {
      const cat = await storage.createCategory(req.body);
      res.json(cat);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.put("/api/admin/categories/:id", async (req, res) => {
    try {
      const updated = await storage.updateCategory(req.params.id, req.body);
      if (!updated) return res.status(404).json({ message: "Category not found" });
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.delete("/api/admin/categories/:id", async (req, res) => {
    try {
      await storage.deleteCategory(req.params.id);
      res.json({ message: "Deleted" });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/admin/pull-from-oc", async (_req, res) => {
    try {
      const data = await pullFromOrderCloud();
      res.json({ success: true, ...data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.delete("/api/admin/ordercloud/products/:sku", async (req, res) => {
    try {
      const sku = req.params.sku;
      try {
        await ordercloud.deletePriceSchedule(`ps-${sku}`);
      } catch {}
      await ordercloud.deleteProduct(sku);
      res.json({ success: true, message: `Deleted product ${sku} from OrderCloud` });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.get("/api/admin/analytics/revenue", async (_req, res) => {
    try {
      const data = await storage.getRevenueOverTime();
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/admin/analytics/orders-by-status", async (_req, res) => {
    try {
      const data = await storage.getOrdersByStatus();
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/admin/analytics/top-products", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const data = await storage.getTopProducts(limit);
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/admin/analytics/low-stock", async (req, res) => {
    try {
      const threshold = parseInt(req.query.threshold as string) || 50;
      const data = await storage.getLowStockProducts(threshold);
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/admin/analytics/customers", async (_req, res) => {
    try {
      const data = await storage.getCustomerAnalytics();
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/admin/audit-log", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const data = await storage.getAuditLog({ category, limit, offset });
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/admin/audit-log", async (req, res) => {
    try {
      const entry = await storage.addAuditLog(req.body);
      res.json(entry);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  return httpServer;
}
