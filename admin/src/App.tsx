import { useState } from "react";
import { QueryClientProvider, useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "./lib/queryClient";
import { Loader2, CheckCircle, XCircle, RefreshCw, Upload, Database, Cloud, Package, FolderTree, DollarSign } from "lucide-react";

function useToast() {
  const [toasts, setToasts] = useState<Array<{ id: number; title: string; description?: string; variant?: string }>>([]);

  const toast = ({ title, description, variant }: { title: string; description?: string; variant?: string }) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, description, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  return { toast, toasts, setToasts };
}

function ToastContainer({ toasts }: { toasts: Array<{ id: number; title: string; description?: string; variant?: string }> }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2" data-testid="toast-container">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`rounded-md border px-4 py-3 shadow-lg ${
            t.variant === "destructive"
              ? "border-destructive bg-destructive text-destructive-foreground"
              : "border-border bg-card text-card-foreground"
          }`}
        >
          <p className="font-semibold text-sm">{t.title}</p>
          {t.description && <p className="text-sm opacity-80 mt-0.5">{t.description}</p>}
        </div>
      ))}
    </div>
  );
}

function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "secondary" | "outline" }) {
  const base = "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap";
  const variants: Record<string, string> = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-muted text-muted-foreground",
    outline: "border border-border text-foreground",
  };
  return <span className={`${base} ${variants[variant]}`}>{children}</span>;
}

function AdminDashboard() {
  const { toast, toasts } = useToast();
  const [syncLog, setSyncLog] = useState<string[]>([]);

  const statusQuery = useQuery<{ success: boolean; message: string }>({
    queryKey: ["/api/admin/ordercloud/status"],
  });

  const ocProductsQuery = useQuery<{ Items: any[]; Meta: any }>({
    queryKey: ["/api/admin/ordercloud/products"],
    enabled: statusQuery.data?.success === true,
  });

  const ocCategoriesQuery = useQuery<{ Items: any[]; Meta: any }>({
    queryKey: ["/api/admin/ordercloud/categories"],
    enabled: statusQuery.data?.success === true,
  });

  const ocPriceSchedulesQuery = useQuery<{ Items: any[]; Meta: any }>({
    queryKey: ["/api/admin/ordercloud/priceschedules"],
    enabled: statusQuery.data?.success === true,
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/ordercloud/sync");
      return res.json();
    },
    onSuccess: (data: any) => {
      setSyncLog(data.details || []);
      toast({
        title: data.success ? "Sync Complete" : "Sync Failed",
        description: data.message,
        variant: data.success ? "default" : "destructive",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ordercloud/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ordercloud/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ordercloud/priceschedules"] });
    },
    onError: (err: Error) => {
      toast({ title: "Sync Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (sku: string) => {
      const res = await apiRequest("DELETE", `/api/admin/ordercloud/products/${sku}`);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Product Deleted", description: "Product removed from OrderCloud" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ordercloud/products"] });
    },
    onError: (err: Error) => {
      toast({ title: "Delete Error", description: err.message, variant: "destructive" });
    },
  });

  const isConnected = statusQuery.data?.success === true;
  const ocProducts = ocProductsQuery.data?.Items || [];
  const ocCategories = ocCategoriesQuery.data?.Items || [];
  const ocPriceSchedules = ocPriceSchedulesQuery.data?.Items || [];

  const [activeTab, setActiveTab] = useState("products");

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground" data-testid="text-admin-title">
            OrderCloud Admin
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your Sitecore OrderCloud catalog integration
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="rounded-md border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-md ${isConnected ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                <Cloud className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Connection</p>
                <div className="flex items-center gap-1.5">
                  {statusQuery.isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isConnected ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="font-semibold text-green-700 dark:text-green-400" data-testid="text-connection-status">Connected</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      <span className="font-semibold text-red-700 dark:text-red-400" data-testid="text-connection-status">Disconnected</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-md border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">OC Products</p>
                <p className="text-2xl font-bold" data-testid="text-oc-product-count">
                  {ocProductsQuery.isLoading ? "..." : ocProducts.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-md border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                <FolderTree className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">OC Categories</p>
                <p className="text-2xl font-bold" data-testid="text-oc-category-count">
                  {ocCategoriesQuery.isLoading ? "..." : ocCategories.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-md border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Price Schedules</p>
                <p className="text-2xl font-bold" data-testid="text-oc-price-count">
                  {ocPriceSchedulesQuery.isLoading ? "..." : ocPriceSchedules.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending || !isConnected}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            data-testid="button-sync"
          >
            {syncMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {syncMutation.isPending ? "Syncing..." : "Sync to OrderCloud"}
          </button>

          <button
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ["/api/admin/ordercloud/status"] });
              queryClient.invalidateQueries({ queryKey: ["/api/admin/ordercloud/products"] });
              queryClient.invalidateQueries({ queryKey: ["/api/admin/ordercloud/categories"] });
              queryClient.invalidateQueries({ queryKey: ["/api/admin/ordercloud/priceschedules"] });
            }}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground"
            data-testid="button-refresh"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {syncLog.length > 0 && (
          <div className="rounded-md border border-border bg-card mb-8">
            <div className="p-6 pb-2">
              <h2 className="text-lg font-heading font-semibold">Sync Log</h2>
              <p className="text-sm text-muted-foreground">Last sync operation results</p>
            </div>
            <div className="p-6 pt-2">
              <div className="bg-muted rounded-md p-4 max-h-64 overflow-y-auto font-mono text-sm space-y-1" data-testid="text-sync-log">
                {syncLog.map((line, i) => (
                  <div key={i} className={line.includes("Error") ? "text-destructive" : "text-foreground"}>
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div>
          <div className="flex flex-wrap gap-1 mb-4 border-b border-border">
            {[
              { key: "products", label: `Products (${ocProducts.length})`, testId: "tab-products" },
              { key: "categories", label: `Categories (${ocCategories.length})`, testId: "tab-categories" },
              { key: "pricing", label: `Price Schedules (${ocPriceSchedules.length})`, testId: "tab-pricing" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  activeTab === tab.key
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground"
                }`}
                data-testid={tab.testId}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "products" && (
            <div className="rounded-md border border-border bg-card">
              <div className="p-6 pb-2">
                <h2 className="text-lg font-heading font-semibold">OrderCloud Products</h2>
                <p className="text-sm text-muted-foreground">Products synced to your Sitecore OrderCloud marketplace</p>
              </div>
              <div className="p-6 pt-2">
                {ocProductsQuery.isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : ocProducts.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground" data-testid="text-no-products">
                    <Database className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="font-heading font-semibold">No products in OrderCloud</p>
                    <p className="text-sm mt-1">Click &quot;Sync to OrderCloud&quot; to push your catalog</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left p-3 font-medium text-muted-foreground">ID (SKU)</th>
                          <th className="text-left p-3 font-medium text-muted-foreground">Name</th>
                          <th className="text-left p-3 font-medium text-muted-foreground">Active</th>
                          <th className="text-left p-3 font-medium text-muted-foreground">Inventory</th>
                          <th className="text-left p-3 font-medium text-muted-foreground">Price Schedule</th>
                          <th className="text-left p-3 font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ocProducts.map((product: any) => (
                          <tr key={product.ID} className="border-b border-border" data-testid={`row-product-${product.ID}`}>
                            <td className="p-3 font-mono text-sm">{product.ID}</td>
                            <td className="p-3 font-medium">{product.Name}</td>
                            <td className="p-3">
                              <Badge variant={product.Active ? "default" : "secondary"}>
                                {product.Active ? "Active" : "Inactive"}
                              </Badge>
                            </td>
                            <td className="p-3">
                              {product.Inventory?.Enabled ? (
                                <span className="text-sm">{product.Inventory.QuantityAvailable} units</span>
                              ) : (
                                <span className="text-muted-foreground text-sm">N/A</span>
                              )}
                            </td>
                            <td className="p-3 font-mono text-sm">
                              {product.DefaultPriceScheduleID || "None"}
                            </td>
                            <td className="p-3">
                              <button
                                className="text-sm text-destructive"
                                onClick={() => deleteProductMutation.mutate(product.ID)}
                                disabled={deleteProductMutation.isPending}
                                data-testid={`button-delete-${product.ID}`}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "categories" && (
            <div className="rounded-md border border-border bg-card">
              <div className="p-6 pb-2">
                <h2 className="text-lg font-heading font-semibold">OrderCloud Categories</h2>
                <p className="text-sm text-muted-foreground">Categories in your TE Connectivity catalog</p>
              </div>
              <div className="p-6 pt-2">
                {ocCategoriesQuery.isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : ocCategories.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground" data-testid="text-no-categories">
                    <FolderTree className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="font-heading font-semibold">No categories in OrderCloud</p>
                    <p className="text-sm mt-1">Click &quot;Sync to OrderCloud&quot; to push your catalog</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left p-3 font-medium text-muted-foreground">ID (Slug)</th>
                          <th className="text-left p-3 font-medium text-muted-foreground">Name</th>
                          <th className="text-left p-3 font-medium text-muted-foreground">Description</th>
                          <th className="text-left p-3 font-medium text-muted-foreground">Active</th>
                          <th className="text-left p-3 font-medium text-muted-foreground">Sort Order</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ocCategories.map((cat: any) => (
                          <tr key={cat.ID} className="border-b border-border" data-testid={`row-category-${cat.ID}`}>
                            <td className="p-3 font-mono text-sm">{cat.ID}</td>
                            <td className="p-3 font-medium">{cat.Name}</td>
                            <td className="p-3 text-sm text-muted-foreground max-w-xs truncate">{cat.Description}</td>
                            <td className="p-3">
                              <Badge variant={cat.Active ? "default" : "secondary"}>
                                {cat.Active ? "Active" : "Inactive"}
                              </Badge>
                            </td>
                            <td className="p-3">{cat.ListOrder}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "pricing" && (
            <div className="rounded-md border border-border bg-card">
              <div className="p-6 pb-2">
                <h2 className="text-lg font-heading font-semibold">OrderCloud Price Schedules</h2>
                <p className="text-sm text-muted-foreground">Volume pricing tiers for your products</p>
              </div>
              <div className="p-6 pt-2">
                {ocPriceSchedulesQuery.isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : ocPriceSchedules.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground" data-testid="text-no-prices">
                    <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="font-heading font-semibold">No price schedules in OrderCloud</p>
                    <p className="text-sm mt-1">Click &quot;Sync to OrderCloud&quot; to push your catalog</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left p-3 font-medium text-muted-foreground">ID</th>
                          <th className="text-left p-3 font-medium text-muted-foreground">Name</th>
                          <th className="text-left p-3 font-medium text-muted-foreground">Min Qty</th>
                          <th className="text-left p-3 font-medium text-muted-foreground">Currency</th>
                          <th className="text-left p-3 font-medium text-muted-foreground">Price Breaks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ocPriceSchedules.map((ps: any) => (
                          <tr key={ps.ID} className="border-b border-border" data-testid={`row-priceschedule-${ps.ID}`}>
                            <td className="p-3 font-mono text-sm">{ps.ID}</td>
                            <td className="p-3 font-medium">{ps.Name}</td>
                            <td className="p-3">{ps.MinQuantity}</td>
                            <td className="p-3">{ps.Currency || "USD"}</td>
                            <td className="p-3">
                              <div className="flex flex-wrap gap-1">
                                {ps.PriceBreaks?.map((pb: any, i: number) => (
                                  <Badge key={i} variant="outline">
                                    {pb.Quantity}+ @ ${pb.Price?.toFixed(2)}
                                  </Badge>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {!isConnected && !statusQuery.isLoading && (
          <div className="rounded-md border border-destructive/50 bg-card mt-8 p-6">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <p className="font-semibold text-destructive font-heading">Connection Failed</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {statusQuery.data?.message || "Unable to connect to OrderCloud. Verify your ORDERCLOUD_CLIENT_ID, ORDERCLOUD_CLIENT_SECRET, and ORDERCLOUD_API_URL environment variables."}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <ToastContainer toasts={toasts} />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminDashboard />
    </QueryClientProvider>
  );
}
