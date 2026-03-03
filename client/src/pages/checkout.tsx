import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Box } from "lucide-react";
import { useState } from "react";
import type { CartItem, Product } from "@shared/schema";

type PricedCartItem = CartItem & { product?: Product; unitPrice: number; totalPrice: number };

export default function Checkout() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");

  const { data: cartItems, isLoading } = useQuery<PricedCartItem[]>({
    queryKey: ["/api/cart"],
    enabled: !!user,
  });

  const form = useForm({
    defaultValues: {
      shippingAddress: "",
      poNumber: "",
      notes: "",
    },
  });

  const placeOrderMutation = useMutation({
    mutationFn: (data: { shippingAddress: string; poNumber: string; notes: string }) =>
      apiRequest("POST", "/api/orders", data),
    onSuccess: async (res) => {
      const order = await res.json();
      setOrderId(order.id);
      setOrderPlaced(true);
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "Order placed successfully!" });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to place order", description: err.message, variant: "destructive" });
    },
  });

  if (orderPlaced) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Order Confirmed</h1>
        <p className="text-muted-foreground mb-2">
          Your order has been submitted for processing.
        </p>
        <p className="text-xs text-muted-foreground font-mono mb-6">Order ID: {orderId}</p>
        <div className="flex items-center justify-center gap-3">
          <Link href={`/orders`}>
            <Button data-testid="button-view-orders">View Orders</Button>
          </Link>
          <Link href="/products">
            <Button variant="outline" data-testid="button-continue-shopping-confirm">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 py-16 text-center">
        <h2 className="font-semibold mb-2">Sign in to checkout</h2>
        <Link href="/login"><Button>Sign In</Button></Link>
      </div>
    );
  }

  const subtotal = cartItems?.reduce((sum, item) => sum + (item.totalPrice || 0), 0) || 0;

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/cart">Cart</Link>
        <span>/</span>
        <span className="text-foreground">Checkout</span>
      </div>

      <h1 className="text-xl font-semibold mb-6" data-testid="text-checkout-title">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => placeOrderMutation.mutate(data))} className="space-y-4">
              <Card className="p-5">
                <h3 className="font-semibold mb-4">Shipping Information</h3>
                <FormField
                  control={form.control}
                  name="shippingAddress"
                  rules={{ required: "Shipping address is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shipping Address</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter full shipping address..." {...field} data-testid="input-shipping-address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Card>

              <Card className="p-5">
                <h3 className="font-semibold mb-4">Purchase Order</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="poNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PO Number (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="PO-2024-001" {...field} data-testid="input-po-number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Order Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Special instructions..." {...field} data-testid="input-notes" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Card>

              <Button
                type="submit"
                className="w-full"
                disabled={placeOrderMutation.isPending}
                data-testid="button-place-order"
              >
                {placeOrderMutation.isPending ? "Processing..." : `Place Order - $${subtotal.toFixed(2)}`}
              </Button>
            </form>
          </Form>
        </div>

        <div>
          <Card className="p-5 sticky top-24">
            <h3 className="font-semibold mb-4">Order Review</h3>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
              </div>
            ) : (
              <div className="space-y-3 mb-4">
                {cartItems?.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-accent/50 flex items-center justify-center flex-shrink-0">
                      {item.product?.imageUrl ? (
                        <img src={item.product.imageUrl} alt="" className="w-7 h-7 object-contain" />
                      ) : (
                        <Box className="h-4 w-4 text-muted-foreground/30" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{item.product?.name}</p>
                      <p className="text-[10px] text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-xs font-medium">
                      ${(item.totalPrice || 0).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="border-t pt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between gap-4 font-semibold">
                <span>Total</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
