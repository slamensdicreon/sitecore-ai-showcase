import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Trash2, Minus, Plus, ArrowRight, Box } from "lucide-react";
import type { CartItem, Product } from "@shared/schema";

type PricedCartItem = CartItem & { product?: Product; unitPrice: number; totalPrice: number };

export default function Cart() {
  const { user } = useAuth();
  const { toast } = useToast();
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
        <h2 className="font-heading font-semibold mb-2">Sign in to view your cart</h2>
        <Link href="/login"><Button data-testid="button-sign-in-cart">Sign In</Button></Link>
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
        <h2 className="font-heading font-semibold mb-2">Your cart is empty</h2>
        <p className="text-sm text-muted-foreground mb-4">Add products to your cart to get started</p>
        <Link href="/products"><Button data-testid="button-browse-empty">Browse Products</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
        <Link href="/">Home</Link>
        <span>/</span>
        <span className="text-foreground">Cart</span>
      </div>

      <h1 className="text-xl font-heading font-semibold mb-6" data-testid="text-cart-title">
        Shopping Cart ({cartItems.length} item{cartItems.length !== 1 ? "s" : ""})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {cartItems.map((item) => (
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
                  <div className="flex items-center gap-3 mt-2">
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
                  <p className="text-sm font-semibold">${(item.totalPrice || 0).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">${(item.unitPrice || 0).toFixed(4)} ea</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div>
          <Card className="p-5 sticky top-24">
            <h3 className="font-heading font-semibold mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-muted-foreground text-xs">Calculated at checkout</span>
              </div>
              <div className="flex items-center justify-between gap-4 pt-2 border-t font-semibold">
                <span>Estimated Total</span>
                <span data-testid="text-cart-total">${subtotal.toFixed(2)}</span>
              </div>
            </div>
            <Button
              className="w-full"
              onClick={() => navigate("/checkout")}
              data-testid="button-proceed-checkout"
            >
              Proceed to Checkout
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Link href="/products">
              <Button variant="ghost" className="w-full mt-2" size="sm">
                Continue Shopping
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
