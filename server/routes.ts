import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { seedDatabase } from "./seed";
import session from "express-session";
import pgSession from "connect-pg-simple";
import { pool } from "./db";
import { z } from "zod";

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
      cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 },
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
    shippingAddress: z.string().min(1),
    poNumber: z.string().optional(),
    notes: z.string().optional(),
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
    res.json(safe);
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
    res.json(safe);
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

  app.get("/api/products/:id", async (req, res) => {
    const product = await storage.getProductById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    const breaks = await storage.getPriceBreaks(product.id);
    res.json({ ...product, priceBreaks: breaks });
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
    const items = await storage.getOrderItems(order.id);
    res.json({ ...order, items });
  });

  app.post("/api/orders", requireAuth, async (req: any, res) => {
    const parsed = placeOrderSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid input" });
    const { shippingAddress, poNumber, notes } = parsed.data;
    const cartItems = await storage.getCartItems(req.userId);
    if (cartItems.length === 0) return res.status(400).json({ message: "Cart is empty" });

    let total = 0;
    for (const item of cartItems) {
      if (item.product) {
        const breaks = await storage.getPriceBreaks(item.product.id);
        let unitPrice = parseFloat(item.product.basePrice);
        for (const pb of breaks) {
          if (item.quantity >= pb.minQty) unitPrice = parseFloat(pb.price);
        }
        total += unitPrice * item.quantity;
      }
    }

    const order = await storage.createOrder({
      userId: req.userId,
      status: "submitted",
      total: total.toFixed(2),
      shippingAddress,
      poNumber,
      notes,
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

  return httpServer;
}
