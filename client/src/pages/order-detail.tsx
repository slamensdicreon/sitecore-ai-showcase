import { useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Package, Box, ArrowLeft, Truck, ExternalLink, XCircle, Clock, CheckCircle, ShoppingCart, RefreshCw } from "lucide-react";
import type { Order, OrderItem, Product, OrderStatusHistoryEntry } from "@shared/schema";

type OrderDetail = Order & {
  items: (OrderItem & { product?: Product })[];
  statusHistory?: OrderStatusHistoryEntry[];
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  submitted: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  processing: "bg-primary/10 text-primary",
  shipped: "bg-green-500/10 text-green-700 dark:text-green-400",
  delivered: "bg-green-500/10 text-green-700 dark:text-green-400",
  cancelled: "bg-destructive/10 text-destructive",
};

const statusIcons: Record<string, typeof Clock> = {
  pending: Clock,
  submitted: Package,
  processing: RefreshCw,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
};

export default function OrderDetailPage() {
  const [, routeParams] = useRoute("/orders/:id");
  const { user } = useAuth();
  const { t, formatPrice } = useI18n();
  const { toast } = useToast();

  const { data: order, isLoading } = useQuery<OrderDetail>({
    queryKey: ["/api/orders", routeParams?.id],
    enabled: !!routeParams?.id && !!user,
  });

  const cancelMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/orders/${order!.id}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders", routeParams?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "Order cancelled" });
    },
    onError: (err: Error) => {
      toast({ title: "Cannot cancel order", description: err.message, variant: "destructive" });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async () => {
      for (const item of order!.items) {
        if (item.product) {
          await apiRequest("POST", "/api/cart", { productId: item.productId, quantity: item.quantity });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({ title: "Items added to cart" });
    },
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
  const canCancel = order.status === "submitted" || order.status === "pending";

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/orders">{t("orders.title")}</Link>
        <span>/</span>
        <span className="text-foreground">{order.id.substring(0, 8).toUpperCase()}</span>
      </div>

      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <Link href="/orders">
            <Button variant="ghost" size="icon" data-testid="button-back-orders">
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
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => reorderMutation.mutate()}
            disabled={reorderMutation.isPending}
            data-testid="button-reorder"
          >
            <ShoppingCart className="h-3.5 w-3.5 mr-1" />
            {t("orders.reorder")}
          </Button>
          {canCancel && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (confirm("Are you sure you want to cancel this order?")) {
                  cancelMutation.mutate();
                }
              }}
              disabled={cancelMutation.isPending}
              data-testid="button-cancel-order"
            >
              <XCircle className="h-3.5 w-3.5 mr-1" />
              {t("orders.cancel")}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-0">
            <div className="px-4 py-3 border-b">
              <h3 className="text-sm font-heading font-semibold">Order Items</h3>
            </div>
            <div className="divide-y">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4" data-testid={`order-item-${item.id}`}>
                  <Link href={`/products/${item.productId}`}>
                    <div className="w-14 h-14 rounded-md bg-accent/50 flex items-center justify-center flex-shrink-0 cursor-pointer">
                      {item.product?.imageUrl ? (
                        <img src={item.product.imageUrl} alt="" className="w-10 h-10 object-contain" />
                      ) : (
                        <Box className="h-6 w-6 text-muted-foreground/30" />
                      )}
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item.productId}`}>
                      <p className="text-sm font-medium cursor-pointer hover:text-primary">{item.product?.name || "Product"}</p>
                    </Link>
                    <p className="text-[10px] text-muted-foreground font-mono">{item.product?.sku}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p>{item.quantity} x {formatPrice(parseFloat(item.unitPrice))}</p>
                    <p className="font-semibold">{formatPrice(parseFloat(item.totalPrice))}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {order.statusHistory && order.statusHistory.length > 0 && (
            <Card className="p-5">
              <h3 className="text-sm font-heading font-semibold mb-4">{t("orders.history")}</h3>
              <div className="space-y-4">
                {order.statusHistory.map((entry, i) => {
                  const StatusIcon = statusIcons[entry.status] || Clock;
                  const color = statusColors[entry.status] || statusColors.pending;
                  return (
                    <div key={entry.id} className="flex items-start gap-3" data-testid={`status-history-${i}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}>
                        <StatusIcon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <p className="text-sm font-medium capitalize">{entry.status}</p>
                        {entry.note && <p className="text-xs text-muted-foreground">{entry.note}</p>}
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {entry.createdAt ? new Date(entry.createdAt).toLocaleString() : ""}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="text-sm font-heading font-semibold mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              {order.shippingCost && parseFloat(order.shippingCost) > 0 && (
                <>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">{t("cart.subtotal")}</span>
                    <span>{formatPrice(parseFloat(order.total || "0") - parseFloat(order.shippingCost || "0") - parseFloat(order.taxAmount || "0") + parseFloat(order.discountAmount || "0"))}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">{t("cart.shipping")}</span>
                    <span>{formatPrice(parseFloat(order.shippingCost))}</span>
                  </div>
                </>
              )}
              {order.taxAmount && parseFloat(order.taxAmount) > 0 && (
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">{t("cart.tax")}</span>
                  <span>{formatPrice(parseFloat(order.taxAmount))}</span>
                </div>
              )}
              {order.discountAmount && parseFloat(order.discountAmount) > 0 && (
                <div className="flex justify-between gap-4 text-[#8fb838]">
                  <span>{t("cart.discount")} {order.discountCode && `(${order.discountCode})`}</span>
                  <span>-{formatPrice(parseFloat(order.discountAmount))}</span>
                </div>
              )}
              <div className="flex justify-between gap-4 font-semibold pt-2 border-t">
                <span>{t("cart.total")}</span>
                <span data-testid="text-order-total">{formatPrice(parseFloat(order.total || "0"))}</span>
              </div>
            </div>
          </Card>

          {order.trackingNumber && (
            <Card className="p-5">
              <h3 className="text-sm font-heading font-semibold mb-3">{t("orders.track")}</h3>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-mono">{order.trackingNumber}</span>
              </div>
              <a href={`https://www.google.com/search?q=track+${order.trackingNumber}`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="mt-2 w-full" data-testid="button-track-shipment">
                  {t("orders.track")} <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </a>
            </Card>
          )}

          <Card className="p-5">
            <h3 className="text-sm font-heading font-semibold mb-3">Details</h3>
            {order.poNumber && (
              <div className="mb-3">
                <p className="text-xs text-muted-foreground mb-1">PO Number</p>
                <p className="text-sm font-mono" data-testid="text-po-number">{order.poNumber}</p>
              </div>
            )}
            {order.shippingMethod && (
              <div className="mb-3">
                <p className="text-xs text-muted-foreground mb-1">{t("checkout.shippingMethod")}</p>
                <p className="text-sm capitalize">{order.shippingMethod}</p>
              </div>
            )}
            {order.paymentMethod && (
              <div className="mb-3">
                <p className="text-xs text-muted-foreground mb-1">{t("checkout.payment")}</p>
                <p className="text-sm capitalize">{order.paymentMethod.replace("_", " ")}</p>
              </div>
            )}
            {order.shippingAddress && (
              <div className="mb-3">
                <p className="text-xs text-muted-foreground mb-1">{t("checkout.shipping")}</p>
                <p className="text-sm whitespace-pre-wrap">{order.shippingAddress}</p>
              </div>
            )}
            {order.notes && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t("checkout.notes")}</p>
                <p className="text-sm">{order.notes}</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
