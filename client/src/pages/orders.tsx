import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Clock, CheckCircle, Truck, XCircle } from "lucide-react";
import type { Order } from "@shared/schema";

const statusConfig: Record<string, { label: string; icon: typeof Clock; className: string }> = {
  pending: { label: "Pending", icon: Clock, className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400" },
  submitted: { label: "Submitted", icon: Package, className: "bg-blue-500/10 text-blue-700 dark:text-blue-400" },
  processing: { label: "Processing", icon: Package, className: "bg-primary/10 text-primary" },
  shipped: { label: "Shipped", icon: Truck, className: "bg-green-500/10 text-green-700 dark:text-green-400" },
  delivered: { label: "Delivered", icon: CheckCircle, className: "bg-green-500/10 text-green-700 dark:text-green-400" },
  cancelled: { label: "Cancelled", icon: XCircle, className: "bg-destructive/10 text-destructive" },
};

export default function Orders() {
  const { user } = useAuth();

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 py-16 text-center">
        <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="font-semibold mb-2">Sign in to view orders</h2>
        <Link href="/login"><Button>Sign In</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
        <Link href="/">Home</Link>
        <span>/</span>
        <span className="text-foreground">My Orders</span>
      </div>

      <h1 className="text-xl font-semibold mb-6" data-testid="text-orders-title">My Orders</h1>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            </Card>
          ))}
        </div>
      ) : !orders || orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-semibold mb-1">No orders yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Start shopping to create your first order</p>
          <Link href="/products"><Button data-testid="button-start-shopping">Browse Products</Button></Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const config = statusConfig[order.status || "pending"] || statusConfig.pending;
            const StatusIcon = config.icon;
            return (
              <Link key={order.id} href={`/orders/${order.id}`}>
                <Card className="p-4 hover-elevate cursor-pointer" data-testid={`card-order-${order.id}`}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-md bg-accent/50 flex items-center justify-center">
                        <StatusIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium font-mono">
                            {order.id.substring(0, 8).toUpperCase()}
                          </span>
                          <Badge variant="secondary" className={`text-[10px] ${config.className}`}>
                            {config.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          {order.poNumber && <span>PO: {order.poNumber}</span>}
                          <span>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ""}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-sm">${parseFloat(order.total || "0").toFixed(2)}</span>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
