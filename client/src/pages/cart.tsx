import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Trash2, Minus, Plus, ArrowRight, Box, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import type { CartItem, Product } from "@shared/schema";

type PricedCartItem = CartItem & { product?: Product; unitPrice: number; totalPrice: number };

function getStockBadge(product?: Product) {
  if (!product) return null;
  const qty = product.stockQty || 0;
  if (!product.inStock && qty === 0) return { label: "Backorder", color: "bg-destructive/10 text-destructive", icon: Clock };
  if (!product.inStock) return { label: "Backorder", color: "bg-orange-500/10 text-orange-600 dark:text-orange-400", icon: Clock };
  if (qty > 0 && qty < 50) return { label: "Limited Stock", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400", icon: AlertTriangle };
  return { label: "Available", color: "bg-[#8fb838]/10 text-[#6a8a2a] dark:text-[#8fb838]", icon: CheckCircle };
}

export default function Cart() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t, formatPrice } = useI18n();
  const [, navigate] = useLocation();

  const { data: cartItems, isLoading } = useQuery<PricedCartItem[]>({
    queryKey: ["/api/cart"],
    enabled: !!user,
  });

  const updateQtyMutation = useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      apiRequest("PATCH", `/api/cart/${id}`, { quantity }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/cart"] }),
  });

  const removeItemMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/cart/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({ title: "Item removed from cart" });
    },
  });

  if (!user) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 py-16 text-center">
        <ShoppingCart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="font-heading font-semibold mb-2">{t("auth.signIn")} to view your cart</h2>
        <Link href="/login"><Button data-testid="button-sign-in-cart">{t("auth.signIn")}</Button></Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        <Skeleton className="h-8 w-32 mb-6" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-4 mb-3">
            <div className="flex gap-4">
              <Skeleton className="w-20 h-20 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const subtotal = cartItems?.reduce((sum, item) => sum + (item.totalPrice || 0), 0) || 0;

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 py-16 text-center">
        <ShoppingCart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="font-heading font-semibold mb-2">{t("cart.empty")}</h2>
        <p className="text-sm text-muted-foreground mb-4">Add products to your cart to get started</p>
        <Link href="/products"><Button data-testid="button-browse-empty">{t("nav.products")}</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
        <Link href="/">Home</Link>
        <span>/</span>
        <span className="text-foreground">{t("cart.title")}</span>
      </div>

      <h1 className="text-xl font-heading font-semibold mb-6" data-testid="text-cart-title">
        {t("cart.title")} ({cartItems.length} item{cartItems.length !== 1 ? "s" : ""})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {cartItems.map((item) => {
            const stockBadge = getStockBadge(item.product);
            const StockIcon = stockBadge?.icon;
            return (
              <Card key={item.id} className="p-4" data-testid={`cart-item-${item.id}`}>
                <div className="flex gap-4">
                  <Link href={`/products/${item.productId}`}>
                    <div className="w-20 h-20 rounded-md bg-accent/50 flex items-center justify-center flex-shrink-0 cursor-pointer">
                      {item.product?.imageUrl ? (
                        <img src={item.product.imageUrl} alt={item.product.name} className="w-14 h-14 object-contain" />
                      ) : (
                        <Box className="h-8 w-8 text-muted-foreground/30" />
                      )}
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-muted-foreground font-mono">{item.product?.sku}</p>
                    <Link href={`/products/${item.productId}`}>
                      <h3 className="text-sm font-medium mb-1 cursor-pointer">{item.product?.name}</h3>
                    </Link>
                    {stockBadge && StockIcon && (
                      <Badge variant="secondary" className={`text-[10px] mb-2 ${stockBadge.color}`} data-testid={`badge-stock-${item.id}`}>
                        <StockIcon className="h-2.5 w-2.5 mr-0.5" />
                        {stockBadge.label}
                      </Badge>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center border rounded-md">
                        <button
                          onClick={() => updateQtyMutation.mutate({ id: item.id, quantity: Math.max(1, item.quantity - 1) })}
                          className="p-1.5"
                          data-testid={`button-cart-minus-${item.id}`}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-10 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQtyMutation.mutate({ id: item.id, quantity: item.quantity + 1 })}
                          className="p-1.5"
                          data-testid={`button-cart-plus-${item.id}`}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItemMutation.mutate(item.id)}
                        data-testid={`button-cart-remove-${item.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold">{formatPrice(item.totalPrice || 0)}</p>
                    <p className="text-xs text-muted-foreground">{formatPrice(item.unitPrice || 0)} ea</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div>
          <Card className="p-5 sticky top-24">
            <h3 className="font-heading font-semibold mb-4">{t("cart.subtotal")}</h3>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">{t("cart.subtotal")}</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">{t("cart.shipping")}</span>
                <span className="text-muted-foreground text-xs">Calculated at checkout</span>
              </div>
              <div className="flex items-center justify-between gap-4 pt-2 border-t font-semibold">
                <span>{t("cart.total")}</span>
                <span data-testid="text-cart-total">{formatPrice(subtotal)}</span>
              </div>
            </div>
            <Button
              className="w-full"
              onClick={() => navigate("/checkout")}
              data-testid="button-proceed-checkout"
            >
              {t("cart.checkout")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Link href="/products">
              <Button variant="ghost" className="w-full mt-2" size="sm">
                {t("cart.continue")}
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
