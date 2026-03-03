import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Box, ArrowLeft } from "lucide-react";
import type { Order, OrderItem, Product } from "@shared/schema";

type OrderDetail = Order & { items: (OrderItem & { product?: Product })[] };

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  submitted: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  processing: "bg-primary/10 text-primary",
  shipped: "bg-green-500/10 text-green-700 dark:text-green-400",
  delivered: "bg-green-500/10 text-green-700 dark:text-green-400",
  cancelled: "bg-destructive/10 text-destructive",
};

export default function OrderDetailPage() {
  const [, routeParams] = useRoute("/orders/:id");
  const { user } = useAuth();

  const { data: order, isLoading } = useQuery<OrderDetail>({
    queryKey: ["/api/orders", routeParams?.id],
    enabled: !!routeParams?.id && !!user,
  });

  if (isLoading) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        <Skeleton className="h-4 w-48 mb-6" />
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 py-16 text-center">
        <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="font-heading font-semibold mb-1">Order not found</h2>
      </div>
    );
  }

  const colorClass = statusColors[order.status || "pending"] || statusColors.pending;

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/orders">Orders</Link>
        <span>/</span>
        <span className="text-foreground">{order.id.substring(0, 8).toUpperCase()}</span>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <Link href="/orders">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-heading font-semibold" data-testid="text-order-id">
              Order {order.id.substring(0, 8).toUpperCase()}
            </h1>
            <Badge variant="secondary" className={`text-[10px] capitalize ${colorClass}`}>
              {order.status}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Placed on {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : ""}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-0">
            <div className="px-4 py-3 border-b">
              <h3 className="text-sm font-heading font-semibold">Order Items</h3>
            </div>
            <div className="divide-y">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4" data-testid={`order-item-${item.id}`}>
                  <div className="w-14 h-14 rounded-md bg-accent/50 flex items-center justify-center flex-shrink-0">
                    {item.product?.imageUrl ? (
                      <img src={item.product.imageUrl} alt="" className="w-10 h-10 object-contain" />
                    ) : (
                      <Box className="h-6 w-6 text-muted-foreground/30" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{item.product?.name || "Product"}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{item.product?.sku}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p>{item.quantity} x ${parseFloat(item.unitPrice).toFixed(4)}</p>
                    <p className="font-semibold">${parseFloat(item.totalPrice).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="text-sm font-heading font-semibold mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between gap-4 font-semibold pt-2 border-t">
                <span>Total</span>
                <span data-testid="text-order-total">${parseFloat(order.total || "0").toFixed(2)}</span>
              </div>
            </div>
          </Card>

          {(order.poNumber || order.shippingAddress) && (
            <Card className="p-5">
              <h3 className="text-sm font-heading font-semibold mb-3">Details</h3>
              {order.poNumber && (
                <div className="mb-3">
                  <p className="text-xs text-muted-foreground mb-1">PO Number</p>
                  <p className="text-sm font-mono">{order.poNumber}</p>
                </div>
              )}
              {order.shippingAddress && (
                <div className="mb-3">
                  <p className="text-xs text-muted-foreground mb-1">Shipping Address</p>
                  <p className="text-sm whitespace-pre-wrap">{order.shippingAddress}</p>
                </div>
              )}
              {order.notes && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm">{order.notes}</p>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
