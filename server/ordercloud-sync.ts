import { db } from "./db";
import { categories, products, priceBreaks, users, orders, orderItems } from "@shared/schema";
import { asc, eq, isNull } from "drizzle-orm";
import { ordercloud } from "./ordercloud";

export async function syncToOrderCloud(): Promise<{ success: boolean; message: string; details: string[] }> {
  const details: string[] = [];

  try {
    const connTest = await ordercloud.testConnection();
    if (!connTest.success) {
      return { success: false, message: connTest.message, details: [] };
    }
    details.push("Authenticated with OrderCloud");

    let catalog;
    try {
      catalog = await ordercloud.getCatalog(ordercloud.CATALOG_ID);
      details.push(`Catalog "${catalog.Name}" already exists`);
    } catch {
      catalog = await ordercloud.createCatalog(
        ordercloud.CATALOG_ID,
        "TE Connectivity Product Catalog",
        "B2B electronic components catalog featuring connectors, sensors, relays, wire & cable, circuit protection, and terminal blocks"
      );
      details.push(`Created catalog "${catalog.Name}"`);
    }

    const allCategories = await db.select().from(categories).orderBy(asc(categories.sortOrder));
    for (const cat of allCategories) {
      const ocCategoryId = cat.slug;
      try {
        await ordercloud.saveCategory(ordercloud.CATALOG_ID, ocCategoryId, {
          ID: ocCategoryId,
          Name: cat.name,
          Description: cat.description || "",
          ListOrder: cat.sortOrder || 0,
          Active: true,
          xp: {
            localId: cat.id,
            imageUrl: cat.imageUrl || "",
          },
        });
        details.push(`Synced category: ${cat.name}`);
      } catch (err: any) {
        if (err.message.includes("409") || err.message.includes("already exists")) {
          details.push(`Category already exists: ${cat.name}`);
        } else {
          details.push(`Error syncing category ${cat.name}: ${err.message}`);
        }
      }
    }

    const allProducts = await db.select().from(products).orderBy(asc(products.name));
    for (const prod of allProducts) {
      const ocProductId = prod.sku;
      const ocPriceScheduleId = `ps-${prod.sku}`;

      const prodPriceBreaks = await db
        .select()
        .from(priceBreaks)
        .where(eq(priceBreaks.productId, prod.id))
        .orderBy(asc(priceBreaks.minQty));

      const ocPriceBreaks = prodPriceBreaks.map((pb) => ({
        Quantity: pb.minQty,
        Price: parseFloat(pb.price),
      }));

      if (ocPriceBreaks.length === 0) {
        ocPriceBreaks.push({ Quantity: 1, Price: parseFloat(prod.basePrice) });
      }

      try {
        await ordercloud.savePriceSchedule(ocPriceScheduleId, {
          ID: ocPriceScheduleId,
          Name: `${prod.name} Pricing`,
          MinQuantity: prod.minOrderQty || 1,
          PriceBreaks: ocPriceBreaks,
          Currency: prod.currency || "USD",
          xp: { localProductId: prod.id },
        });
        details.push(`Synced price schedule: ${prod.name}`);
      } catch (err: any) {
        details.push(`Error syncing price schedule for ${prod.name}: ${err.message}`);
      }

      try {
        await ordercloud.saveProduct(ocProductId, {
          ID: ocProductId,
          Name: prod.name,
          Description: prod.description || "",
          Active: prod.active ?? true,
          DefaultPriceScheduleID: ocPriceScheduleId,
          Inventory: {
            Enabled: true,
            QuantityAvailable: prod.stockQty || 0,
            OrderCanExceed: false,
          },
          xp: {
            localId: prod.id,
            imageUrl: prod.imageUrl || "",
            specs: prod.specs || {},
            industry: prod.industry || "",
            application: prod.application || "",
            minOrderQty: prod.minOrderQty || 1,
            leadTimeDays: prod.leadTimeDays || 5,
            inStock: prod.inStock ?? true,
            datasheetUrl: prod.datasheetUrl || "",
          },
        });
        details.push(`Synced product: ${prod.name} (${prod.sku})`);
      } catch (err: any) {
        details.push(`Error syncing product ${prod.name}: ${err.message}`);
      }

      const cat = allCategories.find((c) => c.id === prod.categoryId);
      if (cat) {
        try {
          await ordercloud.saveCategoryProductAssignment(
            ordercloud.CATALOG_ID,
            cat.slug,
            ocProductId
          );
          details.push(`Assigned ${prod.sku} to category ${cat.slug}`);
        } catch (err: any) {
          if (!err.message.includes("409")) {
            details.push(`Error assigning ${prod.sku} to ${cat.slug}: ${err.message}`);
          }
        }
      }
    }

    return {
      success: true,
      message: `Synced ${allCategories.length} categories, ${allProducts.length} products to OrderCloud`,
      details,
    };
  } catch (err: any) {
    return { success: false, message: err.message, details };
  }
}

export async function pullFromOrderCloud(): Promise<{
  categories: any[];
  products: any[];
}> {
  const catResult = await ordercloud.listCategories(ordercloud.CATALOG_ID);
  const prodResult = await ordercloud.listProducts({ pageSize: 100 });

  const ocCategories = catResult.Items.map((c: any) => ({
    id: c.xp?.localId || c.ID,
    name: c.Name,
    slug: c.ID,
    description: c.Description,
    sortOrder: c.ListOrder,
    imageUrl: c.xp?.imageUrl || "",
  }));

  const allPriceSchedules = await ordercloud.listPriceSchedules({ pageSize: 100 });
  const psMap = new Map<string, any>();
  for (const ps of allPriceSchedules.Items) {
    psMap.set(ps.ID, ps);
  }

  const ocProducts = prodResult.Items.map((p: any) => {
    const priceSchedule = p.DefaultPriceScheduleID
      ? psMap.get(p.DefaultPriceScheduleID) || null
      : null;

    return {
      id: p.xp?.localId || p.ID,
      name: p.Name,
      sku: p.ID,
      description: p.Description,
      basePrice: priceSchedule?.PriceBreaks?.[0]?.Price?.toFixed(4) || "0.0000",
      active: p.Active,
      imageUrl: p.xp?.imageUrl || "",
      specs: p.xp?.specs || {},
      industry: p.xp?.industry || "",
      application: p.xp?.application || "",
      minOrderQty: p.xp?.minOrderQty || 1,
      leadTimeDays: p.xp?.leadTimeDays || 5,
      inStock: p.xp?.inStock ?? true,
      stockQty: p.Inventory?.QuantityAvailable || 0,
      datasheetUrl: p.xp?.datasheetUrl || "",
      priceBreaks: priceSchedule?.PriceBreaks?.map((pb: any) => ({
        minQty: pb.Quantity,
        price: pb.Price.toFixed(4),
      })) || [],
    };
  });

  return { categories: ocCategories, products: ocProducts };
}

export async function ensureBuyerOrganization(): Promise<{ success: boolean; message: string }> {
  try {
    const conn = await ordercloud.testConnection();
    if (!conn.success) return { success: false, message: conn.message };

    try {
      await ordercloud.getBuyer(ordercloud.DEFAULT_BUYER_ID);
      return { success: true, message: "Buyer organization already exists" };
    } catch {
      await ordercloud.createBuyer({
        ID: ordercloud.DEFAULT_BUYER_ID,
        Name: "TE Connectivity Buyers",
        Active: true,
        xp: { description: "Default buyer organization for B2B storefront" },
      });

      try {
        await ordercloud.createCatalogAssignment({
          CatalogID: ordercloud.CATALOG_ID,
          BuyerID: ordercloud.DEFAULT_BUYER_ID,
          ViewAllCategories: true,
          ViewAllProducts: true,
        });
      } catch (err: any) {
        if (!err.message.includes("409")) {
          console.warn("Catalog assignment warning:", err.message);
        }
      }

      return { success: true, message: "Created buyer organization" };
    }
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

function sanitizeOcId(input: string): string {
  return input.replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 100);
}

export async function syncBuyerToOrderCloud(user: {
  id: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  companyName?: string | null;
  role?: string | null;
}): Promise<{ success: boolean; ocBuyerId?: string; message: string }> {
  try {
    const buyerUserId = sanitizeOcId(user.username);

    try {
      await ordercloud.saveBuyerUser(ordercloud.DEFAULT_BUYER_ID, buyerUserId, {
        ID: buyerUserId,
        Username: user.username,
        FirstName: user.firstName || user.username,
        LastName: user.lastName || "Buyer",
        Email: user.email || `${user.username}@demo.com`,
        Active: true,
        xp: {
          localId: user.id,
          companyName: user.companyName || "",
          role: user.role || "buyer",
        },
      });
    } catch (err: any) {
      if (err.message.includes("404") || err.message.includes("Not Found")) {
        await ordercloud.createBuyerUser(ordercloud.DEFAULT_BUYER_ID, {
          ID: buyerUserId,
          Username: user.username,
          FirstName: user.firstName || user.username,
          LastName: user.lastName || "Buyer",
          Email: user.email || `${user.username}@demo.com`,
          Active: true,
          xp: {
            localId: user.id,
            companyName: user.companyName || "",
            role: user.role || "buyer",
          },
        });
      } else {
        throw err;
      }
    }

    await db.update(users).set({ ocBuyerId: buyerUserId }).where(eq(users.id, user.id));

    return { success: true, ocBuyerId: buyerUserId, message: `Synced buyer: ${user.username}` };
  } catch (err: any) {
    return { success: false, message: `Failed to sync buyer ${user.username}: ${err.message}` };
  }
}

export async function syncOrderToOrderCloud(
  order: any,
  items: Array<{ productId: string; quantity: number; unitPrice: string; totalPrice: string; product?: any }>,
  user: any
): Promise<{ success: boolean; ocOrderId?: string; message: string }> {
  try {
    let buyerUserId = user.ocBuyerId || null;
    if (!buyerUserId) {
      const buyerResult = await syncBuyerToOrderCloud(user);
      if (!buyerResult.success) {
        return { success: false, message: `Order sync failed: buyer sync failed for ${user.username}: ${buyerResult.message}` };
      }
      buyerUserId = buyerResult.ocBuyerId || sanitizeOcId(user.username);
    }

    const ocOrder = await ordercloud.createOrder("incoming", {
      FromUserID: buyerUserId,
      Comments: order.notes || undefined,
      xp: {
        localOrderId: order.id,
        poNumber: order.poNumber || "",
        shippingMethod: order.shippingMethod || "standard",
        paymentMethod: order.paymentMethod || "purchase_order",
        shippingAddress: order.shippingAddress || "",
        shippingCost: order.shippingCost || "0",
        taxAmount: order.taxAmount || "0",
        discountCode: order.discountCode || "",
        discountAmount: order.discountAmount || "0",
        total: order.total || "0",
      },
    });

    let lineItemErrors = 0;
    for (const item of items) {
      const productSku = item.product?.sku || item.productId;
      try {
        await ordercloud.createLineItem("incoming", ocOrder.ID, {
          ProductID: productSku,
          Quantity: item.quantity,
          UnitPrice: parseFloat(item.unitPrice),
          xp: {
            localProductId: item.productId,
            totalPrice: item.totalPrice,
          },
        });
      } catch (err: any) {
        lineItemErrors++;
        console.warn(`Line item sync warning for ${productSku}:`, err.message);
      }
    }

    if (lineItemErrors === items.length && items.length > 0) {
      return { success: false, message: `Order ${order.id} created in OC (${ocOrder.ID}) but all ${lineItemErrors} line items failed` };
    }

    try {
      await ordercloud.submitOrder("incoming", ocOrder.ID);
    } catch (err: any) {
      console.warn("Order submit warning:", err.message);
    }

    await db.update(orders).set({ ocOrderId: ocOrder.ID }).where(eq(orders.id, order.id));

    const warnings = lineItemErrors > 0 ? ` (${lineItemErrors} line item(s) failed)` : "";
    return { success: true, ocOrderId: ocOrder.ID, message: `Synced order ${order.id} → OC ${ocOrder.ID}${warnings}` };
  } catch (err: any) {
    return { success: false, message: `Failed to sync order ${order.id}: ${err.message}` };
  }
}

export async function syncAllBuyersToOrderCloud(): Promise<{ success: boolean; message: string; details: string[] }> {
  const details: string[] = [];
  try {
    const ensureResult = await ensureBuyerOrganization();
    if (!ensureResult.success) return { success: false, message: ensureResult.message, details };
    details.push(ensureResult.message);

    const allUsers = await db.select().from(users);
    let synced = 0;
    for (const user of allUsers) {
      const result = await syncBuyerToOrderCloud(user);
      details.push(result.message);
      if (result.success) synced++;
    }

    return { success: true, message: `Synced ${synced}/${allUsers.length} buyers to OrderCloud`, details };
  } catch (err: any) {
    return { success: false, message: err.message, details };
  }
}

export async function syncAllOrdersToOrderCloud(): Promise<{ success: boolean; message: string; details: string[] }> {
  const details: string[] = [];
  try {
    const unsyncedOrders = await db.select().from(orders).where(isNull(orders.ocOrderId));
    let synced = 0;
    for (const order of unsyncedOrders) {
      const user = await db.select().from(users).where(eq(users.id, order.userId)).then(r => r[0]);
      if (!user) {
        details.push(`Skipped order ${order.id}: user not found`);
        continue;
      }

      if (!user.ocBuyerId) {
        const buyerResult = await syncBuyerToOrderCloud(user);
        if (!buyerResult.success) {
          details.push(`Skipped order ${order.id}: ${buyerResult.message}`);
          continue;
        }
        user.ocBuyerId = buyerResult.ocBuyerId || null;
      }

      const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
      const itemsWithProducts = [];
      for (const item of items) {
        const prod = await db.select().from(products).where(eq(products.id, item.productId)).then(r => r[0]);
        itemsWithProducts.push({ ...item, product: prod });
      }

      const result = await syncOrderToOrderCloud(order, itemsWithProducts, user);
      details.push(result.message);
      if (result.success) synced++;
    }

    return { success: true, message: `Synced ${synced}/${unsyncedOrders.length} orders to OrderCloud`, details };
  } catch (err: any) {
    return { success: false, message: err.message, details };
  }
}
