import { db } from "./db";
import { categories, products, priceBreaks } from "@shared/schema";
import { asc, eq } from "drizzle-orm";
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
