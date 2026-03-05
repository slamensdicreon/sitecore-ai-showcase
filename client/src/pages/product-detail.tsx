import { useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Package, FileText, Box, CheckCircle, Clock, Minus, Plus, ListChecks, ExternalLink, AlertTriangle, XCircle, Wrench, Download, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import type { Product, PriceBreak, PartsList, ProductRelationship } from "@shared/schema";

type ProductDetail = Product & { priceBreaks: PriceBreak[] };
type RelatedProductData = ProductRelationship & { relatedProduct?: Product };

function getAvailabilityStatus(product: Product) {
  const qty = product.stockQty || 0;
  if (!product.inStock && qty === 0) return { label: "contactSales", color: "text-destructive", icon: XCircle, bg: "bg-destructive/10" };
  if (!product.inStock) return { label: "backorder", color: "text-orange-600 dark:text-orange-400", icon: Clock, bg: "bg-orange-500/10" };
  if (qty > 0 && qty < 50) return { label: "limited", color: "text-amber-600 dark:text-amber-400", icon: AlertTriangle, bg: "bg-amber-500/10" };
  return { label: "inStock", color: "text-[#6a8a2a] dark:text-[#8fb838]", icon: CheckCircle, bg: "bg-[#8fb838]/10" };
}

function RelatedProductCard({ product, formatPrice }: { product: Product; formatPrice: (p: number) => string }) {
  return (
    <Link href={`/products/${product.id}`}>
      <Card className="hover-elevate cursor-pointer h-full" data-testid={`card-related-${product.id}`}>
        <div className="p-3">
          <div className="aspect-[4/3] rounded-md bg-accent/50 flex items-center justify-center">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-2/3 h-2/3 object-contain" />
            ) : (
              <Box className="h-8 w-8 text-muted-foreground/30" />
            )}
          </div>
        </div>
        <div className="px-3 pb-3">
          <p className="text-[10px] text-muted-foreground font-mono mb-1">{product.sku}</p>
          <h4 className="text-xs font-medium mb-1 line-clamp-2 leading-snug">{product.name}</h4>
          <span className="font-semibold text-xs text-[#f28d00]">{formatPrice(parseFloat(product.basePrice))}</span>
        </div>
      </Card>
    </Link>
  );
}

export default function ProductDetail() {
  const [, routeParams] = useRoute("/products/:id");
  const { user } = useAuth();
  const { toast } = useToast();
  const { t, formatPrice, currency } = useI18n();
  const [quantity, setQuantity] = useState(1);

  const isEngineer = user?.role === "engineer";

  const { data: product, isLoading } = useQuery<ProductDetail>({
    queryKey: ["/api/products", routeParams?.id],
    enabled: !!routeParams?.id,
  });

  useEffect(() => {
    if (routeParams?.id) {
      try {
        const stored = JSON.parse(localStorage.getItem("te_recently_viewed") || "[]");
        const filtered = stored.filter((id: string) => id !== routeParams.id);
        filtered.unshift(routeParams.id);
        localStorage.setItem("te_recently_viewed", JSON.stringify(filtered.slice(0, 10)));
      } catch {}
    }
  }, [routeParams?.id]);

  const { data: featureFlags } = useQuery<Record<string, boolean>>({
    queryKey: ["/api/feature-flags"],
    staleTime: 30000,
  });
  const relatedEnabled = featureFlags?.ai_related_products !== false;

  const { data: relatedProducts } = useQuery<RelatedProductData[]>({
    queryKey: ["/api/products", routeParams?.id, "related"],
    enabled: !!routeParams?.id && relatedEnabled,
  });

  const { data: partsLists } = useQuery<PartsList[]>({
    queryKey: ["/api/parts-lists"],
    enabled: !!user,
  });

  const addToCartMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/cart", { productId: product!.id, quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({ title: t("product.addToCart"), description: `${quantity}x ${product!.name}` });
    },
    onError: (err: Error) => {
      const msg = err.message.includes("401") ? "Please sign in to add items to your cart" : err.message;
      toast({ title: "Unable to add to cart", description: msg, variant: "destructive" });
    },
  });

  const addToListMutation = useMutation({
    mutationFn: (listId: string) => apiRequest("POST", `/api/parts-lists/${listId}/items`, { productId: product!.id, quantity }),
    onSuccess: () => {
      toast({ title: "Added to parts list" });
    },
  });

  const currentPrice = (() => {
    if (!product?.priceBreaks?.length) return parseFloat(product?.basePrice || "0");
    let price = parseFloat(product.basePrice);
    for (const pb of product.priceBreaks) {
      if (quantity >= pb.minQty) price = parseFloat(pb.price);
    }
    return price;
  })();

  if (isLoading) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        <Skeleton className="h-4 w-64 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-md" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 py-16 text-center">
        <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="font-heading font-semibold mb-1">Product not found</h2>
        <p className="text-sm text-muted-foreground">The requested product does not exist.</p>
      </div>
    );
  }

  const specs = product.specs as Record<string, string> | null;
  const availability = getAvailabilityStatus(product);
  const AvailIcon = availability.icon;

  const relatedItems = relatedProducts?.filter(r => r.relationshipType === "related" && r.relatedProduct) || [];
  const alternativeItems = relatedProducts?.filter(r => r.relationshipType === "alternative" && r.relatedProduct) || [];
  const accessoryItems = relatedProducts?.filter(r => r.relationshipType === "accessory" && r.relatedProduct) || [];

  const distributorLinks = [
    { name: "Digi-Key", url: `https://www.digikey.com/en/products/result?keywords=${product.sku}` },
    { name: "Mouser", url: `https://www.mouser.com/Search/Refine?Keyword=${product.sku}` },
    { name: "Arrow", url: `https://www.arrow.com/en/products/search?q=${product.sku}` },
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6" data-testid="breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/products">{t("nav.products")}</Link>
        <span>/</span>
        <span className="text-foreground">{product.sku}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2">
          <div className="aspect-square rounded-md bg-accent/50 flex items-center justify-center border">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-3/4 h-3/4 object-contain" />
            ) : (
              <Box className="h-24 w-24 text-muted-foreground/20" />
            )}
          </div>

          {isEngineer && (
            <Card className="p-4 mt-4">
              <h4 className="text-xs font-heading font-semibold mb-3 flex items-center gap-1.5">
                <Wrench className="h-3.5 w-3.5 text-[#167a87]" />
                Engineering Resources
              </h4>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start text-xs" data-testid="button-download-datasheet">
                  <FileText className="h-3.5 w-3.5 mr-2" />
                  Datasheet - {product.sku}.pdf
                  <Download className="h-3 w-3 ml-auto" />
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs" data-testid="button-download-cad">
                  <Box className="h-3.5 w-3.5 mr-2" />
                  3D CAD Model - STEP
                  <Download className="h-3 w-3 ml-auto" />
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs" data-testid="button-download-drawing">
                  <FileText className="h-3.5 w-3.5 mr-2" />
                  Product Drawing
                  <Download className="h-3 w-3 ml-auto" />
                </Button>
              </div>
            </Card>
          )}
        </div>

        <div className="lg:col-span-3 space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant="secondary" className="text-[10px] font-mono">{product.sku}</Badge>
              {product.industry && <Badge variant="secondary" className="text-[10px]">{product.industry}</Badge>}
              {product.application && <Badge variant="secondary" className="text-[10px]">{product.application}</Badge>}
            </div>
            <h1 className="text-xl md:text-2xl font-heading font-semibold leading-tight mb-3" data-testid="text-product-name">
              {product.name}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-product-desc">
              {product.description}
            </p>
          </div>

          <Card className="p-4">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t("product.unitPrice")}</p>
                <p className="text-2xl font-bold text-[#f28d00]" data-testid="text-unit-price">
                  {formatPrice(currentPrice)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Extended: {formatPrice(currentPrice * quantity)}
                </p>
              </div>
              <div className="text-right">
                <div className={`flex items-center gap-1.5 ${availability.color}`}>
                  <AvailIcon className="h-4 w-4" />
                  <span className="text-sm font-medium" data-testid="text-availability">
                    {t(`product.${availability.label}`)}
                  </span>
                </div>
                {product.stockQty !== null && product.stockQty !== undefined && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {product.stockQty.toLocaleString()} available
                  </p>
                )}
                {!product.inStock && product.leadTimeDays && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Lead Time: {product.leadTimeDays} days
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm text-muted-foreground">Qty:</span>
              <div className="flex items-center border rounded-md">
                <button
                  onClick={() => setQuantity(Math.max(product.minOrderQty || 1, quantity - 1))}
                  className="p-2"
                  data-testid="button-qty-minus"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <input
                  type="number"
                  min={product.minOrderQty || 1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(product.minOrderQty || 1, parseInt(e.target.value) || 1))}
                  className="w-16 text-center text-sm border-x bg-transparent focus:outline-none"
                  data-testid="input-quantity"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2"
                  data-testid="button-qty-plus"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
              {product.minOrderQty && product.minOrderQty > 1 && (
                <span className="text-xs text-muted-foreground">Min: {product.minOrderQty}</span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button
                onClick={() => addToCartMutation.mutate()}
                disabled={!user || addToCartMutation.isPending}
                className="flex-1 sm:flex-none"
                data-testid="button-add-to-cart"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {addToCartMutation.isPending ? "Adding..." : t("product.addToCart")}
              </Button>
              {!user && (
                <Link href="/login">
                  <Button variant="outline" size="sm">{t("auth.signIn")} to order</Button>
                </Link>
              )}
            </div>

            {user && partsLists && partsLists.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-muted-foreground mb-2">Add to Parts List:</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {partsLists.map((list) => (
                    <Button
                      key={list.id}
                      variant="outline"
                      size="sm"
                      onClick={() => addToListMutation.mutate(list.id)}
                      disabled={addToListMutation.isPending}
                      data-testid={`button-add-to-list-${list.id}`}
                    >
                      <ListChecks className="h-3 w-3 mr-1" />
                      {list.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {product.priceBreaks && product.priceBreaks.length > 0 && (user?.role !== "engineer") && (
            <Card className="p-4">
              <h3 className="text-sm font-heading font-semibold mb-3">{t("product.volume")}</h3>
              <div className="grid grid-cols-5 gap-2 text-xs">
                <div className="font-medium text-muted-foreground">Qty</div>
                <div className="font-medium text-muted-foreground">{t("product.unitPrice")}</div>
                <div className="font-medium text-muted-foreground">Savings</div>
                <div className="font-medium text-muted-foreground col-span-2"></div>
                {product.priceBreaks.map((pb) => {
                  const base = parseFloat(product.basePrice);
                  const price = parseFloat(pb.price);
                  const savings = ((1 - price / base) * 100).toFixed(0);
                  const isActive = quantity >= pb.minQty;
                  return (
                    <div key={pb.id} className={`contents ${isActive ? "font-medium" : "text-muted-foreground"}`}>
                      <div>{pb.minQty}+</div>
                      <div>{formatPrice(price)}</div>
                      <div>{savings !== "0" ? `-${savings}%` : "List"}</div>
                      <div className="col-span-2">
                        {isActive && <Badge variant="secondary" className="text-[9px]">Current</Badge>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          <Card className="p-4">
            <h3 className="text-sm font-heading font-semibold mb-3">{t("product.distributors")}</h3>
            <div className="flex items-center gap-2 flex-wrap">
              {distributorLinks.map((d) => (
                <a key={d.name} href={d.url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="text-xs" data-testid={`link-distributor-${d.name.toLowerCase()}`}>
                    {d.name}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </a>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-8">
        <Tabs defaultValue={isEngineer ? "specs" : "details"}>
          <TabsList>
            <TabsTrigger value="specs" data-testid="tab-specs">{t("product.specs")}</TabsTrigger>
            <TabsTrigger value="details" data-testid="tab-details">{t("product.details")}</TabsTrigger>
            <TabsTrigger value="docs" data-testid="tab-docs">{t("product.docs")}</TabsTrigger>
          </TabsList>
          <TabsContent value="specs">
            {specs && Object.keys(specs).length > 0 ? (
              <Card className="p-0">
                <table className="w-full text-sm">
                  <tbody>
                    {Object.entries(specs).map(([key, value], i) => (
                      <tr key={key} className={i % 2 === 0 ? "bg-accent/30" : ""}>
                        <td className="py-2.5 px-4 font-medium text-muted-foreground w-1/3">{key}</td>
                        <td className="py-2.5 px-4" data-testid={`spec-${key}`}>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            ) : (
              <p className="text-sm text-muted-foreground py-6">No specifications available.</p>
            )}
          </TabsContent>
          <TabsContent value="details">
            <Card className="p-5">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p>{product.description}</p>
                <h4>Key Features</h4>
                <ul>
                  <li>Industry: {product.industry || "General"}</li>
                  <li>Application: {product.application || "Multi-purpose"}</li>
                  <li>Minimum Order Quantity: {product.minOrderQty}</li>
                  <li>Lead Time: {product.leadTimeDays} business days</li>
                </ul>
              </div>
            </Card>
          </TabsContent>
          <TabsContent value="docs">
            <Card className="p-5">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <FileText className="h-5 w-5" />
                <div>
                  <p className="font-medium text-foreground">Datasheet - {product.sku}</p>
                  <p className="text-xs">PDF technical documentation</p>
                </div>
                <Button variant="outline" size="sm" className="ml-auto" data-testid="button-download-doc">Download</Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {relatedItems.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-heading font-semibold mb-4" data-testid="text-related-title">{t("product.related")}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {relatedItems.map((rel) => (
              <RelatedProductCard key={rel.id} product={rel.relatedProduct!} formatPrice={formatPrice} />
            ))}
          </div>
        </div>
      )}

      {alternativeItems.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-heading font-semibold mb-4" data-testid="text-alternatives-title">{t("product.alternatives")}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {alternativeItems.map((rel) => (
              <RelatedProductCard key={rel.id} product={rel.relatedProduct!} formatPrice={formatPrice} />
            ))}
          </div>
        </div>
      )}

      {accessoryItems.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-heading font-semibold mb-4" data-testid="text-accessories-title">{t("product.accessories")}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {accessoryItems.map((rel) => (
              <RelatedProductCard key={rel.id} product={rel.relatedProduct!} formatPrice={formatPrice} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
