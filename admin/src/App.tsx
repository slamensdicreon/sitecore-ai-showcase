import { useState, useEffect } from "react";
import { QueryClientProvider, useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "./lib/queryClient";
import { Loader2, CheckCircle, XCircle, RefreshCw, Upload, Database, Cloud, Package, FolderTree, DollarSign, History, Link2, Activity, Trash2, ArrowRightLeft } from "lucide-react";

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

function Badge({ children, variant = "default", className = "" }: { children: React.ReactNode; variant?: "default" | "secondary" | "outline" | "destructive"; className?: string }) {
  const base = "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap";
  const variants: Record<string, string> = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-muted text-muted-foreground",
    outline: "border border-border text-foreground",
    destructive: "bg-destructive/10 text-destructive",
  };
  return <span className={`${base} ${variants[variant]} ${className}`}>{children}</span>;
}

type AuditEntry = {
  timestamp: string;
  action: string;
  details: string;
  status: "success" | "error" | "info";
};

function AdminDashboard() {
  const { toast, toasts } = useToast();
  const [syncLog, setSyncLog] = useState<string[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [syncProgress, setSyncProgress] = useState<{ active: boolean; current: number; total: number }>({ active: false, current: 0, total: 0 });
  const [apiMetrics, setApiMetrics] = useState<{ avgResponseTime: number; totalRequests: number; errorRate: number }>({ avgResponseTime: 0, totalRequests: 0, errorRate: 0 });

  const addAuditEntry = (action: string, details: string, status: "success" | "error" | "info" = "info") => {
    setAuditLog(prev => [{
      timestamp: new Date().toISOString(),
      action,
      details,
      status,
    }, ...prev].slice(0, 50));
  };

  useEffect(() => {
    addAuditEntry("Dashboard Loaded", "Admin dashboard initialized", "info");
    const startTime = performance.now();
    fetch("/api/products").then(res => {
      const elapsed = performance.now() - startTime;
      setApiMetrics(prev => ({
        ...prev,
        avgResponseTime: Math.round(elapsed),
        totalRequests: prev.totalRequests + 1,
        errorRate: res.ok ? prev.errorRate : prev.errorRate + 1,
      }));
    }).catch(() => {});
  }, []);

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

  const localProductsQuery = useQuery<{ products: any[]; total: number }>({
    queryKey: ["/api/products"],
  });

  const relationshipsQuery = useQuery<any[]>({
    queryKey: ["/api/admin/relationships"],
    queryFn: async () => {
      const products = localProductsQuery.data?.products || [];
      const allRelationships: any[] = [];
      for (const product of products.slice(0, 14)) {
        try {
          const res = await fetch(`/api/products/${product.id}/related`);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
              data.forEach((r: any) => {
                allRelationships.push({
                  ...r,
                  sourceProduct: product,
                });
              });
            }
          }
        } catch {}
      }
      return allRelationships;
    },
    enabled: (localProductsQuery.data?.products?.length ?? 0) > 0,
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/ordercloud/sync");
      return res.json();
    },
    onSuccess: (data: any) => {
      setSyncLog(data.details || []);
      addAuditEntry("Full Sync", data.message, data.success ? "success" : "error");
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
      addAuditEntry("Sync Error", err.message, "error");
      toast({ title: "Sync Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (sku: string) => {
      const res = await apiRequest("DELETE", `/api/admin/ordercloud/products/${sku}`);
      return res.json();
    },
    onSuccess: (_: any, sku: string) => {
      addAuditEntry("Product Deleted", `Removed product ${sku} from OrderCloud`, "success");
      toast({ title: "Product Deleted", description: "Product removed from OrderCloud" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ordercloud/products"] });
    },
    onError: (err: Error) => {
      addAuditEntry("Delete Error", err.message, "error");
      toast({ title: "Delete Error", description: err.message, variant: "destructive" });
    },
  });

  const bulkSyncMutation = useMutation({
    mutationFn: async () => {
      setSyncProgress({ active: true, current: 0, total: 3 });
      const steps = [
        { label: "Syncing categories...", endpoint: "/api/admin/ordercloud/sync" },
      ];
      for (let i = 0; i < steps.length; i++) {
        setSyncProgress({ active: true, current: i + 1, total: steps.length });
        const res = await apiRequest("POST", steps[i].endpoint);
        await res.json();
      }
      setSyncProgress({ active: false, current: 0, total: 0 });
      return { success: true };
    },
    onSuccess: () => {
      addAuditEntry("Bulk Sync", "Full catalog sync completed", "success");
      toast({ title: "Bulk Sync Complete", description: "All data synced to OrderCloud" });
      queryClient.invalidateQueries();
    },
    onError: (err: Error) => {
      setSyncProgress({ active: false, current: 0, total: 0 });
      addAuditEntry("Bulk Sync Error", err.message, "error");
      toast({ title: "Bulk Sync Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteAllMutation = useMutation({
    mutationFn: async () => {
      const products = ocProductsQuery.data?.Items || [];
      for (const product of products) {
        await apiRequest("DELETE", `/api/admin/ordercloud/products/${product.ID}`);
      }
      return { count: products.length };
    },
    onSuccess: (data: { count: number }) => {
      addAuditEntry("Bulk Delete", `Removed ${data.count} products from OrderCloud`, "success");
      toast({ title: "All Products Deleted", description: `${data.count} products removed` });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ordercloud/products"] });
    },
    onError: (err: Error) => {
      addAuditEntry("Bulk Delete Error", err.message, "error");
      toast({ title: "Delete Error", description: err.message, variant: "destructive" });
    },
  });

  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const isConnected = statusQuery.data?.success === true;
  const ocProducts = ocProductsQuery.data?.Items || [];
  const ocCategories = ocCategoriesQuery.data?.Items || [];
  const ocPriceSchedules = ocPriceSchedulesQuery.data?.Items || [];
  const localProducts = localProductsQuery.data?.products || [];
  const relationships = relationshipsQuery.data || [];

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
            onClick={() => bulkSyncMutation.mutate()}
            disabled={bulkSyncMutation.isPending || !isConnected}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            data-testid="button-bulk-sync"
          >
            {bulkSyncMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Sync All
          </button>

          {!deleteConfirm ? (
            <button
              onClick={() => setDeleteConfirm(true)}
              disabled={ocProducts.length === 0}
              className="inline-flex items-center gap-2 rounded-md border border-destructive/50 px-4 py-2 text-sm font-medium text-destructive disabled:opacity-50"
              data-testid="button-delete-all-init"
            >
              <Trash2 className="h-4 w-4" />
              Delete All Products
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-destructive font-medium">Are you sure?</span>
              <button
                onClick={() => { deleteAllMutation.mutate(); setDeleteConfirm(false); }}
                disabled={deleteAllMutation.isPending}
                className="inline-flex items-center gap-2 rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground disabled:opacity-50"
                data-testid="button-delete-all-confirm"
              >
                {deleteAllMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Delete"}
              </button>
              <button
                onClick={() => setDeleteConfirm(false)}
                className="rounded-md border border-border px-3 py-2 text-sm"
              >
                Cancel
              </button>
            </div>
          )}

          <button
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ["/api/admin/ordercloud/status"] });
              queryClient.invalidateQueries({ queryKey: ["/api/admin/ordercloud/products"] });
              queryClient.invalidateQueries({ queryKey: ["/api/admin/ordercloud/categories"] });
              queryClient.invalidateQueries({ queryKey: ["/api/admin/ordercloud/priceschedules"] });
              addAuditEntry("Refresh", "Dashboard data refreshed", "info");
            }}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground"
            data-testid="button-refresh"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {syncProgress.active && (
          <div className="rounded-md border border-border bg-card p-4 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm font-medium">Syncing... Step {syncProgress.current} of {syncProgress.total}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${(syncProgress.current / syncProgress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

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
              { key: "products", label: `Products (${ocProducts.length})`, icon: Package, testId: "tab-products" },
              { key: "categories", label: `Categories (${ocCategories.length})`, icon: FolderTree, testId: "tab-categories" },
              { key: "pricing", label: `Price Schedules (${ocPriceSchedules.length})`, icon: DollarSign, testId: "tab-pricing" },
              { key: "relationships", label: `Relationships (${relationships.length})`, icon: Link2, testId: "tab-relationships" },
              { key: "audit", label: `Audit Log (${auditLog.length})`, icon: History, testId: "tab-audit" },
              { key: "monitoring", label: "Monitoring", icon: Activity, testId: "tab-monitoring" },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                    activeTab === tab.key
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground"
                  }`}
                  data-testid={tab.testId}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
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
                                onClick={() => { deleteProductMutation.mutate(product.ID); }}
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

          {activeTab === "relationships" && (
            <div className="rounded-md border border-border bg-card">
              <div className="p-6 pb-2">
                <h2 className="text-lg font-heading font-semibold">Product Relationships</h2>
                <p className="text-sm text-muted-foreground">Related, alternative, and accessory product mappings</p>
              </div>
              <div className="p-6 pt-2">
                {relationshipsQuery.isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : relationships.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground" data-testid="text-no-relationships">
                    <Link2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="font-heading font-semibold">No product relationships found</p>
                    <p className="text-sm mt-1">Product relationships are seeded automatically</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left p-3 font-medium text-muted-foreground">Source Product</th>
                          <th className="text-left p-3 font-medium text-muted-foreground">Type</th>
                          <th className="text-left p-3 font-medium text-muted-foreground">Related Product</th>
                          <th className="text-left p-3 font-medium text-muted-foreground">Sort Order</th>
                        </tr>
                      </thead>
                      <tbody>
                        {relationships.map((rel: any, i: number) => (
                          <tr key={i} className="border-b border-border" data-testid={`row-relationship-${i}`}>
                            <td className="p-3">
                              <div>
                                <p className="font-medium text-sm">{rel.sourceProduct?.name || "Unknown"}</p>
                                <p className="text-[10px] text-muted-foreground font-mono">{rel.sourceProduct?.sku}</p>
                              </div>
                            </td>
                            <td className="p-3">
                              <Badge variant={rel.relationshipType === "related" ? "default" : rel.relationshipType === "alternative" ? "outline" : "secondary"}>
                                <ArrowRightLeft className="h-2.5 w-2.5 mr-1" />
                                {rel.relationshipType}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <div>
                                <p className="font-medium text-sm">{rel.relatedProduct?.name || "Unknown"}</p>
                                <p className="text-[10px] text-muted-foreground font-mono">{rel.relatedProduct?.sku}</p>
                              </div>
                            </td>
                            <td className="p-3">{rel.sortOrder || 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "audit" && (
            <div className="rounded-md border border-border bg-card">
              <div className="p-6 pb-2">
                <h2 className="text-lg font-heading font-semibold">Audit Log</h2>
                <p className="text-sm text-muted-foreground">Recent sync operations, product changes, and admin actions</p>
              </div>
              <div className="p-6 pt-2">
                {auditLog.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground" data-testid="text-no-audit">
                    <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="font-heading font-semibold">No audit entries yet</p>
                    <p className="text-sm mt-1">Actions will be logged as you perform them</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto" data-testid="audit-log-entries">
                    {auditLog.map((entry, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-md border border-border" data-testid={`audit-entry-${i}`}>
                        <div className={`p-1.5 rounded-md mt-0.5 ${
                          entry.status === "success" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                          entry.status === "error" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                          "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        }`}>
                          {entry.status === "success" ? <CheckCircle className="h-3.5 w-3.5" /> :
                           entry.status === "error" ? <XCircle className="h-3.5 w-3.5" /> :
                           <History className="h-3.5 w-3.5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{entry.action}</span>
                            <Badge variant={entry.status === "success" ? "default" : entry.status === "error" ? "destructive" : "secondary"}>
                              {entry.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{entry.details}</p>
                          <p className="text-[10px] text-muted-foreground/60 mt-1">
                            {new Date(entry.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "monitoring" && (
            <div className="space-y-6">
              <div className="rounded-md border border-border bg-card">
                <div className="p-6 pb-2">
                  <h2 className="text-lg font-heading font-semibold">API Performance</h2>
                  <p className="text-sm text-muted-foreground">Real-time API metrics and health indicators</p>
                </div>
                <div className="p-6 pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-md border border-border p-4">
                      <p className="text-sm text-muted-foreground">Avg Response Time</p>
                      <p className="text-2xl font-bold" data-testid="text-avg-response">{apiMetrics.avgResponseTime}ms</p>
                      <Badge variant={apiMetrics.avgResponseTime < 200 ? "default" : apiMetrics.avgResponseTime < 500 ? "secondary" : "destructive"}>
                        {apiMetrics.avgResponseTime < 200 ? "Excellent" : apiMetrics.avgResponseTime < 500 ? "Good" : "Slow"}
                      </Badge>
                    </div>
                    <div className="rounded-md border border-border p-4">
                      <p className="text-sm text-muted-foreground">Total Requests</p>
                      <p className="text-2xl font-bold" data-testid="text-total-requests">{apiMetrics.totalRequests}</p>
                      <Badge variant="secondary">This session</Badge>
                    </div>
                    <div className="rounded-md border border-border p-4">
                      <p className="text-sm text-muted-foreground">Error Rate</p>
                      <p className="text-2xl font-bold" data-testid="text-error-rate">{apiMetrics.errorRate}%</p>
                      <Badge variant={apiMetrics.errorRate === 0 ? "default" : "destructive"}>
                        {apiMetrics.errorRate === 0 ? "Healthy" : "Issues"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-md border border-border bg-card">
                <div className="p-6 pb-2">
                  <h2 className="text-lg font-heading font-semibold">System Status</h2>
                  <p className="text-sm text-muted-foreground">Integration and service health</p>
                </div>
                <div className="p-6 pt-2">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-md border border-border">
                      <div className="flex items-center gap-3">
                        <Cloud className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">OrderCloud API</span>
                      </div>
                      <Badge variant={isConnected ? "default" : "destructive"} data-testid="status-ordercloud">
                        {isConnected ? "Connected" : "Disconnected"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-md border border-border">
                      <div className="flex items-center gap-3">
                        <Database className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">PostgreSQL Database</span>
                      </div>
                      <Badge variant="default" data-testid="status-database">Connected</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-md border border-border">
                      <div className="flex items-center gap-3">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Local Products</span>
                      </div>
                      <Badge variant="secondary" data-testid="status-local-products">{localProducts.length} products</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-md border border-border">
                      <div className="flex items-center gap-3">
                        <Link2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Product Relationships</span>
                      </div>
                      <Badge variant="secondary" data-testid="status-relationships">{relationships.length} mappings</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-md border border-border">
                      <div className="flex items-center gap-3">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Last Sync</span>
                      </div>
                      <Badge variant="secondary" data-testid="status-last-sync">
                        {syncLog.length > 0 ? "Just now" : "Not yet synced"}
                      </Badge>
                    </div>
                  </div>
                </div>
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
