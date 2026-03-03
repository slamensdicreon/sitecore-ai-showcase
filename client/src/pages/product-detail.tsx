import { useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Package, FileText, Box, CheckCircle, Clock, Minus, Plus, ListChecks } from "lucide-react";
import { useState } from "react";
import type { Product, PriceBreak, PartsList } from "@shared/schema";

type ProductDetail = Product & { priceBreaks: PriceBreak[] };

export default function ProductDetail() {
  const [, routeParams] = useRoute("/products/:id");
  const { user } = useAuth();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading } = useQuery<ProductDetail>({
    queryKey: ["/api/products", routeParams?.id],
    enabled: !!routeParams?.id,
  });

  const { data: partsLists } = useQuery<PartsList[]>({
    queryKey: ["/api/parts-lists"],
    enabled: !!user,
  });

  const addToCartMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/cart", { productId: product!.id, quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({ title: "Added to cart", description: `${quantity}x ${product!.name}` });
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

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/products">Products</Link>
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
                <p className="text-xs text-muted-foreground mb-1">Unit Price</p>
                <p className="text-2xl font-bold text-[#f28d00]" data-testid="text-unit-price">
                  ${currentPrice.toFixed(4)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Extended: ${(currentPrice * quantity).toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                {product.inStock ? (
                  <div className="flex items-center gap-1.5 text-[#6a8a2a] dark:text-[#8fb838]">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">In Stock</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Lead Time: {product.leadTimeDays} days</span>
                  </div>
                )}
                {product.stockQty && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {product.stockQty.toLocaleString()} available
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
                {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
              </Button>
              {!user && (
                <Link href="/login">
                  <Button variant="outline" size="sm">Sign in to order</Button>
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

          {product.priceBreaks && product.priceBreaks.length > 0 && (
            <Card className="p-4">
              <h3 className="text-sm font-heading font-semibold mb-3">Volume Pricing</h3>
              <div className="grid grid-cols-5 gap-2 text-xs">
                <div className="font-medium text-muted-foreground">Qty</div>
                <div className="font-medium text-muted-foreground">Unit Price</div>
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
                      <div>${price.toFixed(4)}</div>
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
        </div>
      </div>

      <div className="mt-8">
        <Tabs defaultValue="specs">
          <TabsList>
            <TabsTrigger value="specs" data-testid="tab-specs">Specifications</TabsTrigger>
            <TabsTrigger value="details" data-testid="tab-details">Product Details</TabsTrigger>
            <TabsTrigger value="docs" data-testid="tab-docs">Documentation</TabsTrigger>
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
                <Button variant="outline" size="sm" className="ml-auto">Download</Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
