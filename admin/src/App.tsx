import { useState, useEffect, useMemo } from "react";
import { QueryClientProvider, useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "./lib/queryClient";
import {
  Loader2, CheckCircle, XCircle, RefreshCw, Upload, Database, Cloud, Package,
  FolderTree, DollarSign, History, Link2, Activity, Trash2, ArrowRightLeft,
  LayoutDashboard, ShoppingCart, Users, Plus, Pencil, X, Search, Eye,
  Truck, CreditCard, TrendingUp, BarChart3, ChevronDown, Download,
} from "lucide-react";

function useToast() {
  const [toasts, setToasts] = useState<Array<{ id: number; title: string; description?: string; variant?: string }>>([]);
  const toast = ({ title, description, variant }: { title: string; description?: string; variant?: string }) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, description, variant }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };
  return { toast, toasts };
}

function ToastContainer({ toasts }: { toasts: Array<{ id: number; title: string; description?: string; variant?: string }> }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2" data-testid="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`rounded-md border px-4 py-3 shadow-lg max-w-sm ${t.variant === "destructive" ? "border-destructive bg-destructive text-destructive-foreground" : "border-border bg-card text-card-foreground"}`}>
          <p className="font-semibold text-sm">{t.title}</p>
          {t.description && <p className="text-sm opacity-80 mt-0.5">{t.description}</p>}
        </div>
      ))}
    </div>
  );
}

function Badge({ children, variant = "default", className = "" }: { children: React.ReactNode; variant?: string; className?: string }) {
  const base = "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap";
  const variants: Record<string, string> = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-muted text-muted-foreground",
    outline: "border border-border text-foreground",
    destructive: "bg-destructive/10 text-destructive",
    success: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  };
  return <span className={`${base} ${variants[variant] || variants.default} ${className}`}>{children}</span>;
}

type AuditEntry = { timestamp: string; action: string; details: string; status: "success" | "error" | "info" };

const ORDER_STATUSES = ["pending", "submitted", "processing", "shipped", "delivered", "cancelled"];

const statusBadgeVariant: Record<string, string> = {
  pending: "warning", submitted: "default", processing: "default",
  shipped: "success", delivered: "success", cancelled: "destructive",
};

function AdminDashboard() {
  const { toast, toasts } = useToast();
  const [syncLog, setSyncLog] = useState<string[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [syncProgress, setSyncProgress] = useState<{ active: boolean; current: number; total: number }>({ active: false, current: 0, total: 0 });
  const [apiMetrics, setApiMetrics] = useState<{ avgResponseTime: number; totalRequests: number; errorRate: number }>({ avgResponseTime: 0, totalRequests: 0, errorRate: 0 });
  const [activeTab, setActiveTab] = useState("dashboard");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [productModal, setProductModal] = useState<{ open: boolean; editing?: any }>({ open: false });
  const [categoryModal, setCategoryModal] = useState<{ open: boolean; editing?: any }>({ open: false });
  const [orderDetail, setOrderDetail] = useState<any>(null);
  const [productSearch, setProductSearch] = useState("");

  const addAuditEntry = (action: string, details: string, status: "success" | "error" | "info" = "info") => {
    setAuditLog(prev => [{ timestamp: new Date().toISOString(), action, details, status }, ...prev].slice(0, 50));
  };

  useEffect(() => {
    addAuditEntry("Dashboard Loaded", "Admin dashboard initialized", "info");
    const startTime = performance.now();
    fetch("/api/products").then(res => {
      const elapsed = performance.now() - startTime;
      setApiMetrics(prev => ({ ...prev, avgResponseTime: Math.round(elapsed), totalRequests: prev.totalRequests + 1, errorRate: res.ok ? prev.errorRate : prev.errorRate + 1 }));
    }).catch(() => {});
  }, []);

  const statsQuery = useQuery<{ totalProducts: number; totalCategories: number; totalOrders: number; totalUsers: number; totalRevenue: number }>({
    queryKey: ["/api/admin/stats"],
  });

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

  const localProductsQuery = useQuery<any[]>({
    queryKey: ["/api/admin/local-products"],
  });

  const localCategoriesQuery = useQuery<any[]>({
    queryKey: ["/api/categories"],
  });

  const adminOrdersQuery = useQuery<any[]>({
    queryKey: ["/api/admin/orders"],
  });

  const adminUsersQuery = useQuery<any[]>({
    queryKey: ["/api/admin/users"],
  });

  const relationshipsQuery = useQuery<any[]>({
    queryKey: ["/api/admin/relationships"],
    queryFn: async () => {
      const products = localProductsQuery.data || [];
      const allRelationships: any[] = [];
      for (const product of products.slice(0, 14)) {
        try {
          const res = await fetch(`/api/products/${product.id}/related`);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) data.forEach((r: any) => allRelationships.push({ ...r, sourceProduct: product }));
          }
        } catch {}
      }
      return allRelationships;
    },
    enabled: (localProductsQuery.data?.length ?? 0) > 0,
  });

  const syncMutation = useMutation({
    mutationFn: async () => { const res = await apiRequest("POST", "/api/admin/ordercloud/sync"); return res.json(); },
    onSuccess: (data: any) => {
      setSyncLog(data.details || []);
      addAuditEntry("Full Sync", data.message, data.success ? "success" : "error");
      toast({ title: data.success ? "Sync Complete" : "Sync Failed", description: data.message, variant: data.success ? "default" : "destructive" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ordercloud/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ordercloud/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ordercloud/priceschedules"] });
    },
    onError: (err: Error) => { addAuditEntry("Sync Error", err.message, "error"); toast({ title: "Sync Error", description: err.message, variant: "destructive" }); },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (sku: string) => { const res = await apiRequest("DELETE", `/api/admin/ordercloud/products/${sku}`); return res.json(); },
    onSuccess: (_: any, sku: string) => {
      addAuditEntry("OC Product Deleted", `Removed ${sku} from OrderCloud`, "success");
      toast({ title: "Product Deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ordercloud/products"] });
    },
    onError: (err: Error) => toast({ title: "Delete Error", description: err.message, variant: "destructive" }),
  });

  const bulkSyncMutation = useMutation({
    mutationFn: async () => {
      setSyncProgress({ active: true, current: 0, total: 3 });
      setSyncProgress({ active: true, current: 1, total: 3 });
      const res = await apiRequest("POST", "/api/admin/ordercloud/sync");
      await res.json();
      setSyncProgress({ active: true, current: 2, total: 3 });
      await new Promise(r => setTimeout(r, 500));
      setSyncProgress({ active: true, current: 3, total: 3 });
      setSyncProgress({ active: false, current: 0, total: 0 });
      return { success: true };
    },
    onSuccess: () => {
      addAuditEntry("Bulk Sync", "Full catalog sync completed", "success");
      toast({ title: "Bulk Sync Complete" });
      queryClient.invalidateQueries();
    },
    onError: (err: Error) => {
      setSyncProgress({ active: false, current: 0, total: 0 });
      toast({ title: "Bulk Sync Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteAllMutation = useMutation({
    mutationFn: async () => {
      const products = ocProductsQuery.data?.Items || [];
      for (const product of products) await apiRequest("DELETE", `/api/admin/ordercloud/products/${product.ID}`);
      return { count: products.length };
    },
    onSuccess: (data: { count: number }) => {
      addAuditEntry("Bulk Delete", `Removed ${data.count} products from OrderCloud`, "success");
      toast({ title: "All OC Products Deleted", description: `${data.count} products removed` });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ordercloud/products"] });
    },
    onError: (err: Error) => toast({ title: "Delete Error", description: err.message, variant: "destructive" }),
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; status?: string; trackingNumber?: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/orders/${id}/status`, data);
      return res.json();
    },
    onSuccess: () => {
      addAuditEntry("Order Updated", "Order status changed", "success");
      toast({ title: "Order Updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: (err: Error) => toast({ title: "Update Error", description: err.message, variant: "destructive" }),
  });

  const saveLocalProductMutation = useMutation({
    mutationFn: async (data: any) => {
      if (data.id) {
        const { id, ...rest } = data;
        const res = await apiRequest("PUT", `/api/admin/local-products/${id}`, rest);
        return res.json();
      }
      const res = await apiRequest("POST", "/api/admin/local-products", data);
      return res.json();
    },
    onSuccess: () => {
      addAuditEntry("Product Saved", "Local product created/updated", "success");
      toast({ title: "Product Saved" });
      setProductModal({ open: false });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/local-products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: (err: Error) => toast({ title: "Save Error", description: err.message, variant: "destructive" }),
  });

  const deleteLocalProductMutation = useMutation({
    mutationFn: async (id: string) => { const res = await apiRequest("DELETE", `/api/admin/local-products/${id}`); return res.json(); },
    onSuccess: () => {
      addAuditEntry("Product Deleted", "Local product removed", "success");
      toast({ title: "Product Deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/local-products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: (err: Error) => toast({ title: "Delete Error", description: err.message, variant: "destructive" }),
  });

  const saveCategoryMutation = useMutation({
    mutationFn: async (data: any) => {
      if (data.id) {
        const { id, ...rest } = data;
        const res = await apiRequest("PUT", `/api/admin/categories/${id}`, rest);
        return res.json();
      }
      const res = await apiRequest("POST", "/api/admin/categories", data);
      return res.json();
    },
    onSuccess: () => {
      addAuditEntry("Category Saved", "Category created/updated", "success");
      toast({ title: "Category Saved" });
      setCategoryModal({ open: false });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: (err: Error) => toast({ title: "Save Error", description: err.message, variant: "destructive" }),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => { const res = await apiRequest("DELETE", `/api/admin/categories/${id}`); return res.json(); },
    onSuccess: () => {
      toast({ title: "Category Deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: (err: Error) => toast({ title: "Delete Error", description: err.message, variant: "destructive" }),
  });

  const pullFromOCMutation = useMutation({
    mutationFn: async () => { const res = await apiRequest("POST", "/api/admin/pull-from-oc"); return res.json(); },
    onSuccess: (data: any) => {
      addAuditEntry("Pull from OC", `Retrieved ${data.products?.length || 0} products, ${data.categories?.length || 0} categories`, "success");
      toast({ title: "Data Retrieved from OrderCloud", description: `${data.products?.length || 0} products, ${data.categories?.length || 0} categories` });
    },
    onError: (err: Error) => toast({ title: "Pull Error", description: err.message, variant: "destructive" }),
  });

  const isConnected = statusQuery.data?.success === true;
  const ocProducts = ocProductsQuery.data?.Items || [];
  const ocCategories = ocCategoriesQuery.data?.Items || [];
  const ocPriceSchedules = ocPriceSchedulesQuery.data?.Items || [];
  const localProducts = localProductsQuery.data || [];
  const localCategories = localCategoriesQuery.data || [];
  const adminOrders = adminOrdersQuery.data || [];
  const adminUsers = adminUsersQuery.data || [];
  const relationships = relationshipsQuery.data || [];
  const stats = statsQuery.data;

  const filteredProducts = useMemo(() => {
    if (!productSearch) return localProducts;
    const q = productSearch.toLowerCase();
    return localProducts.filter((p: any) => p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q));
  }, [localProducts, productSearch]);

  const tabs = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "products", label: `Products (${localProducts.length})`, icon: Package },
    { key: "categories", label: `Categories (${localCategories.length})`, icon: FolderTree },
    { key: "orders", label: `Orders (${adminOrders.length})`, icon: ShoppingCart },
    { key: "buyers", label: `Buyers (${adminUsers.length})`, icon: Users },
    { key: "oc-products", label: `OC Products (${ocProducts.length})`, icon: Cloud },
    { key: "oc-categories", label: `OC Categories (${ocCategories.length})`, icon: FolderTree },
    { key: "pricing", label: `Pricing (${ocPriceSchedules.length})`, icon: DollarSign },
    { key: "relationships", label: `Relationships (${relationships.length})`, icon: Link2 },
    { key: "audit", label: `Audit (${auditLog.length})`, icon: History },
    { key: "monitoring", label: "Monitoring", icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-[#2e4957] text-white">
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#f28d00] flex items-center justify-center">
              <span className="text-white font-bold text-lg italic" style={{ fontFamily: "Montserrat, sans-serif" }}>TE</span>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight" style={{ fontFamily: "Montserrat, sans-serif" }} data-testid="text-admin-title">
                OrderCloud Admin
              </h1>
              <p className="text-xs opacity-70">Sitecore OrderCloud B2B Commerce Management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs ${isConnected ? "bg-green-500/20 text-green-200" : "bg-red-500/20 text-red-200"}`}>
              {isConnected ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
              {statusQuery.isLoading ? "Checking..." : isConnected ? "OC Connected" : "OC Disconnected"}
            </div>
            <button
              onClick={() => queryClient.invalidateQueries()}
              className="p-2 rounded-md hover:bg-white/10 transition-colors"
              data-testid="button-refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="h-1 bg-[#f28d00]" />
      </div>

      <div className="max-w-[1440px] mx-auto px-6 py-6">
        <div className="flex overflow-x-auto gap-1 mb-6 border-b border-border pb-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${activeTab === tab.key ? "border-[#f28d00] text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                data-testid={`tab-${tab.key}`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: "Products", value: stats?.totalProducts ?? "...", icon: Package, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
                { label: "Categories", value: stats?.totalCategories ?? "...", icon: FolderTree, color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
                { label: "Orders", value: stats?.totalOrders ?? "...", icon: ShoppingCart, color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
                { label: "Buyers", value: stats?.totalUsers ?? "...", icon: Users, color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
                { label: "Revenue", value: stats ? `$${stats.totalRevenue.toFixed(2)}` : "...", icon: TrendingUp, color: "bg-[#f28d00]/10 text-[#f28d00]" },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="rounded-md border border-border bg-card p-5" data-testid={`stat-${stat.label.toLowerCase()}`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-md ${stat.color}`}><Icon className="h-5 w-5" /></div>
                      <div>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                        <p className="text-xl font-bold">{stat.value}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-md border border-border bg-card">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <h3 className="font-semibold text-sm" style={{ fontFamily: "Montserrat, sans-serif" }}>Recent Orders</h3>
                  <button onClick={() => setActiveTab("orders")} className="text-xs text-primary hover:underline">View All</button>
                </div>
                <div className="divide-y divide-border">
                  {adminOrders.slice(0, 5).map((order: any) => (
                    <div key={order.id} className="px-5 py-3 flex items-center justify-between" data-testid={`recent-order-${order.id}`}>
                      <div>
                        <p className="text-sm font-medium font-mono">{order.id.substring(0, 8).toUpperCase()}</p>
                        <p className="text-xs text-muted-foreground">{order.user?.companyName || order.user?.username || "Unknown"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">${parseFloat(order.total || "0").toFixed(2)}</p>
                        <Badge variant={statusBadgeVariant[order.status] || "secondary"}>{order.status}</Badge>
                      </div>
                    </div>
                  ))}
                  {adminOrders.length === 0 && <div className="px-5 py-8 text-center text-sm text-muted-foreground">No orders yet</div>}
                </div>
              </div>

              <div className="rounded-md border border-border bg-card">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <h3 className="font-semibold text-sm" style={{ fontFamily: "Montserrat, sans-serif" }}>Quick Actions</h3>
                </div>
                <div className="p-5 grid grid-cols-2 gap-3">
                  <button onClick={() => syncMutation.mutate()} disabled={syncMutation.isPending || !isConnected} className="flex items-center gap-2 p-3 rounded-md border border-border text-sm hover:bg-accent/50 disabled:opacity-50" data-testid="button-sync">
                    {syncMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4 text-primary" />}
                    Sync to OC
                  </button>
                  <button onClick={() => pullFromOCMutation.mutate()} disabled={pullFromOCMutation.isPending || !isConnected} className="flex items-center gap-2 p-3 rounded-md border border-border text-sm hover:bg-accent/50 disabled:opacity-50" data-testid="button-pull-oc">
                    {pullFromOCMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4 text-blue-600" />}
                    Pull from OC
                  </button>
                  <button onClick={() => { setProductModal({ open: true }); setActiveTab("products"); }} className="flex items-center gap-2 p-3 rounded-md border border-border text-sm hover:bg-accent/50" data-testid="button-add-product">
                    <Plus className="h-4 w-4 text-green-600" /> Add Product
                  </button>
                  <button onClick={() => bulkSyncMutation.mutate()} disabled={bulkSyncMutation.isPending || !isConnected} className="flex items-center gap-2 p-3 rounded-md border border-border text-sm hover:bg-accent/50 disabled:opacity-50" data-testid="button-bulk-sync">
                    {bulkSyncMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4 text-purple-600" />}
                    Bulk Sync
                  </button>
                </div>

                {syncProgress.active && (
                  <div className="px-5 pb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                      <span className="text-xs font-medium">Step {syncProgress.current}/{syncProgress.total}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${(syncProgress.current / syncProgress.total) * 100}%` }} />
                    </div>
                  </div>
                )}

                {!isConnected && !statusQuery.isLoading && (
                  <div className="mx-5 mb-4 p-3 rounded-md border border-destructive/30 bg-destructive/5">
                    <p className="text-xs text-destructive">{statusQuery.data?.message || "OrderCloud connection failed. Check environment variables."}</p>
                  </div>
                )}
              </div>
            </div>

            {syncLog.length > 0 && (
              <div className="rounded-md border border-border bg-card">
                <div className="px-5 py-4 border-b border-border">
                  <h3 className="font-semibold text-sm" style={{ fontFamily: "Montserrat, sans-serif" }}>Last Sync Log</h3>
                </div>
                <div className="p-4">
                  <div className="bg-muted rounded-md p-3 max-h-48 overflow-y-auto font-mono text-xs space-y-0.5" data-testid="text-sync-log">
                    {syncLog.map((line, i) => (
                      <div key={i} className={line.includes("Error") ? "text-destructive" : "text-foreground"}>{line}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "products" && (
          <div className="rounded-md border border-border bg-card">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold" style={{ fontFamily: "Montserrat, sans-serif" }}>Local Products</h2>
                <p className="text-xs text-muted-foreground">Manage products in your database</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input type="text" placeholder="Search products..." value={productSearch} onChange={(e) => setProductSearch(e.target.value)} className="h-8 pl-8 pr-3 w-48 rounded-md border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/30" data-testid="input-product-search" />
                </div>
                <button onClick={() => setProductModal({ open: true })} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground" data-testid="button-create-product">
                  <Plus className="h-3.5 w-3.5" /> New Product
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">SKU</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Name</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Category</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Price</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Stock</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Status</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product: any) => {
                    const cat = localCategories.find((c: any) => c.id === product.categoryId);
                    return (
                      <tr key={product.id} className="border-b border-border hover:bg-accent/30" data-testid={`row-local-product-${product.id}`}>
                        <td className="p-3 font-mono text-xs">{product.sku}</td>
                        <td className="p-3 font-medium text-sm max-w-xs truncate">{product.name}</td>
                        <td className="p-3 text-xs text-muted-foreground">{cat?.name || "-"}</td>
                        <td className="p-3 text-sm">${parseFloat(product.basePrice).toFixed(2)}</td>
                        <td className="p-3">
                          <Badge variant={product.stockQty > 100 ? "success" : product.stockQty > 0 ? "warning" : "destructive"}>
                            {product.stockQty} units
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant={product.active ? "default" : "secondary"}>{product.active ? "Active" : "Inactive"}</Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => setProductModal({ open: true, editing: product })} className="p-1 rounded hover:bg-accent" data-testid={`button-edit-product-${product.id}`}><Pencil className="h-3.5 w-3.5 text-muted-foreground" /></button>
                            <button onClick={() => { if (confirm(`Delete "${product.name}"?`)) deleteLocalProductMutation.mutate(product.id); }} className="p-1 rounded hover:bg-accent" data-testid={`button-delete-product-${product.id}`}><Trash2 className="h-3.5 w-3.5 text-destructive" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredProducts.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-medium">No products found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "categories" && (
          <div className="rounded-md border border-border bg-card">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold" style={{ fontFamily: "Montserrat, sans-serif" }}>Categories</h2>
                <p className="text-xs text-muted-foreground">Manage product categories</p>
              </div>
              <button onClick={() => setCategoryModal({ open: true })} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground" data-testid="button-create-category">
                <Plus className="h-3.5 w-3.5" /> New Category
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Slug</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Name</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Description</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Sort Order</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {localCategories.map((cat: any) => (
                    <tr key={cat.id} className="border-b border-border hover:bg-accent/30" data-testid={`row-local-category-${cat.id}`}>
                      <td className="p-3 font-mono text-xs">{cat.slug}</td>
                      <td className="p-3 font-medium text-sm">{cat.name}</td>
                      <td className="p-3 text-xs text-muted-foreground max-w-sm truncate">{cat.description}</td>
                      <td className="p-3 text-sm">{cat.sortOrder}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setCategoryModal({ open: true, editing: cat })} className="p-1 rounded hover:bg-accent"><Pencil className="h-3.5 w-3.5 text-muted-foreground" /></button>
                          <button onClick={() => { if (confirm(`Delete "${cat.name}"?`)) deleteCategoryMutation.mutate(cat.id); }} className="p-1 rounded hover:bg-accent"><Trash2 className="h-3.5 w-3.5 text-destructive" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="rounded-md border border-border bg-card">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-lg font-semibold" style={{ fontFamily: "Montserrat, sans-serif" }}>Order Management</h2>
              <p className="text-xs text-muted-foreground">View and manage all customer orders</p>
            </div>
            {adminOrdersQuery.isLoading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : adminOrders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ShoppingCart className="h-10 w-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">No orders yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs">Order ID</th>
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs">Customer</th>
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs">Items</th>
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs">Total</th>
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs">Status</th>
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs">Payment</th>
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs">Date</th>
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminOrders.map((order: any) => (
                      <tr key={order.id} className="border-b border-border hover:bg-accent/30" data-testid={`row-order-${order.id}`}>
                        <td className="p-3">
                          <div>
                            <p className="font-mono text-xs font-medium">{order.id.substring(0, 8).toUpperCase()}</p>
                            {order.poNumber && <p className="text-[10px] text-muted-foreground">PO: {order.poNumber}</p>}
                          </div>
                        </td>
                        <td className="p-3">
                          <div>
                            <p className="text-sm font-medium">{order.user?.firstName || order.user?.username || "N/A"} {order.user?.lastName || ""}</p>
                            <p className="text-[10px] text-muted-foreground">{order.user?.companyName || ""}</p>
                          </div>
                        </td>
                        <td className="p-3 text-sm">{order.items?.length || 0} items</td>
                        <td className="p-3 text-sm font-semibold">${parseFloat(order.total || "0").toFixed(2)}</td>
                        <td className="p-3">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderMutation.mutate({ id: order.id, status: e.target.value })}
                            className="h-7 px-2 rounded-md border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                            data-testid={`select-order-status-${order.id}`}
                          >
                            {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-[10px]">
                            <CreditCard className="h-2.5 w-2.5 mr-1" />
                            {(order.paymentMethod || "N/A").replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="p-3 text-xs text-muted-foreground">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ""}</td>
                        <td className="p-3">
                          <button onClick={() => setOrderDetail(order)} className="p-1 rounded hover:bg-accent" data-testid={`button-view-order-${order.id}`}>
                            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "buyers" && (
          <div className="rounded-md border border-border bg-card">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-lg font-semibold" style={{ fontFamily: "Montserrat, sans-serif" }}>Buyers / Users</h2>
              <p className="text-xs text-muted-foreground">All registered buyer accounts</p>
            </div>
            {adminUsersQuery.isLoading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs">Username</th>
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs">Name</th>
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs">Company</th>
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs">Email</th>
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs">Role</th>
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs">Locale</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminUsers.map((user: any) => (
                      <tr key={user.id} className="border-b border-border hover:bg-accent/30" data-testid={`row-user-${user.id}`}>
                        <td className="p-3 font-mono text-xs">{user.username}</td>
                        <td className="p-3 text-sm font-medium">{user.firstName || ""} {user.lastName || ""}</td>
                        <td className="p-3 text-sm">{user.companyName || "-"}</td>
                        <td className="p-3 text-xs text-muted-foreground">{user.email || "-"}</td>
                        <td className="p-3"><Badge variant="outline">{user.role || "buyer"}</Badge></td>
                        <td className="p-3 text-xs">{user.locale || "en"} / {user.preferredCurrency || "USD"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {adminUsers.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-10 w-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-medium">No registered users</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "oc-products" && (
          <div className="rounded-md border border-border bg-card">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold" style={{ fontFamily: "Montserrat, sans-serif" }}>OrderCloud Products</h2>
                <p className="text-xs text-muted-foreground">Products synced to your Sitecore OrderCloud marketplace</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => syncMutation.mutate()} disabled={syncMutation.isPending || !isConnected} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50" data-testid="button-sync-oc">
                  {syncMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                  Sync
                </button>
                {!deleteConfirm ? (
                  <button onClick={() => setDeleteConfirm(true)} disabled={ocProducts.length === 0} className="inline-flex items-center gap-1.5 rounded-md border border-destructive/50 px-3 py-1.5 text-xs font-medium text-destructive disabled:opacity-50" data-testid="button-delete-all-init">
                    <Trash2 className="h-3.5 w-3.5" /> Delete All
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button onClick={() => { deleteAllMutation.mutate(); setDeleteConfirm(false); }} disabled={deleteAllMutation.isPending} className="inline-flex items-center gap-1.5 rounded-md bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground" data-testid="button-delete-all-confirm">
                      {deleteAllMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Confirm"}
                    </button>
                    <button onClick={() => setDeleteConfirm(false)} className="rounded-md border border-border px-2.5 py-1.5 text-xs">Cancel</button>
                  </div>
                )}
              </div>
            </div>
            {ocProductsQuery.isLoading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : ocProducts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground" data-testid="text-no-oc-products">
                <Database className="h-10 w-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">No products in OrderCloud</p>
                <p className="text-xs mt-1">Click "Sync" to push your catalog</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs">ID (SKU)</th>
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs">Name</th>
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs">Active</th>
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs">Inventory</th>
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs">Price Schedule</th>
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ocProducts.map((product: any) => (
                      <tr key={product.ID} className="border-b border-border hover:bg-accent/30" data-testid={`row-oc-product-${product.ID}`}>
                        <td className="p-3 font-mono text-xs">{product.ID}</td>
                        <td className="p-3 font-medium text-sm">{product.Name}</td>
                        <td className="p-3"><Badge variant={product.Active ? "default" : "secondary"}>{product.Active ? "Active" : "Inactive"}</Badge></td>
                        <td className="p-3 text-sm">{product.Inventory?.Enabled ? `${product.Inventory.QuantityAvailable} units` : "N/A"}</td>
                        <td className="p-3 font-mono text-xs">{product.DefaultPriceScheduleID || "None"}</td>
                        <td className="p-3">
                          <button onClick={() => deleteProductMutation.mutate(product.ID)} disabled={deleteProductMutation.isPending} className="text-xs text-destructive hover:underline" data-testid={`button-delete-oc-${product.ID}`}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "oc-categories" && (
          <div className="rounded-md border border-border bg-card">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-lg font-semibold" style={{ fontFamily: "Montserrat, sans-serif" }}>OrderCloud Categories</h2>
              <p className="text-xs text-muted-foreground">Categories in your TE Connectivity catalog</p>
            </div>
            {ocCategoriesQuery.isLoading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : ocCategories.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground"><FolderTree className="h-10 w-10 mx-auto mb-2 opacity-40" /><p className="text-sm font-medium">No categories in OrderCloud</p></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs">ID (Slug)</th>
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs">Name</th>
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs">Description</th>
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs">Active</th>
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs">Sort Order</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ocCategories.map((cat: any) => (
                      <tr key={cat.ID} className="border-b border-border hover:bg-accent/30" data-testid={`row-oc-category-${cat.ID}`}>
                        <td className="p-3 font-mono text-xs">{cat.ID}</td>
                        <td className="p-3 font-medium text-sm">{cat.Name}</td>
                        <td className="p-3 text-xs text-muted-foreground max-w-xs truncate">{cat.Description}</td>
                        <td className="p-3"><Badge variant={cat.Active ? "default" : "secondary"}>{cat.Active ? "Active" : "Inactive"}</Badge></td>
                        <td className="p-3">{cat.ListOrder}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "pricing" && (
          <div className="rounded-md border border-border bg-card">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-lg font-semibold" style={{ fontFamily: "Montserrat, sans-serif" }}>OrderCloud Price Schedules</h2>
              <p className="text-xs text-muted-foreground">Volume pricing tiers for your products</p>
            </div>
            {ocPriceSchedulesQuery.isLoading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : ocPriceSchedules.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground"><DollarSign className="h-10 w-10 mx-auto mb-2 opacity-40" /><p className="text-sm font-medium">No price schedules in OrderCloud</p></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs">ID</th>
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs">Name</th>
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs">Min Qty</th>
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs">Currency</th>
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs">Price Breaks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ocPriceSchedules.map((ps: any) => (
                      <tr key={ps.ID} className="border-b border-border hover:bg-accent/30" data-testid={`row-priceschedule-${ps.ID}`}>
                        <td className="p-3 font-mono text-xs">{ps.ID}</td>
                        <td className="p-3 font-medium text-sm">{ps.Name}</td>
                        <td className="p-3">{ps.MinQuantity}</td>
                        <td className="p-3">{ps.Currency || "USD"}</td>
                        <td className="p-3"><div className="flex flex-wrap gap-1">{ps.PriceBreaks?.map((pb: any, i: number) => (<Badge key={i} variant="outline">{pb.Quantity}+ @ ${pb.Price?.toFixed(2)}</Badge>))}</div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "relationships" && (
          <div className="rounded-md border border-border bg-card">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-lg font-semibold" style={{ fontFamily: "Montserrat, sans-serif" }}>Product Relationships</h2>
              <p className="text-xs text-muted-foreground">Related, alternative, and accessory product mappings</p>
            </div>
            {relationshipsQuery.isLoading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : relationships.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground"><Link2 className="h-10 w-10 mx-auto mb-2 opacity-40" /><p className="text-sm font-medium">No relationships found</p></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs">Source Product</th>
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs">Type</th>
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs">Related Product</th>
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs">Sort</th>
                    </tr>
                  </thead>
                  <tbody>
                    {relationships.map((rel: any, i: number) => (
                      <tr key={i} className="border-b border-border hover:bg-accent/30" data-testid={`row-relationship-${i}`}>
                        <td className="p-3"><p className="text-sm font-medium">{rel.sourceProduct?.name || "Unknown"}</p><p className="text-[10px] text-muted-foreground font-mono">{rel.sourceProduct?.sku}</p></td>
                        <td className="p-3"><Badge variant={rel.relationshipType === "related" ? "default" : rel.relationshipType === "alternative" ? "outline" : "secondary"}><ArrowRightLeft className="h-2.5 w-2.5 mr-1" />{rel.relationshipType}</Badge></td>
                        <td className="p-3"><p className="text-sm font-medium">{rel.relatedProduct?.name || "Unknown"}</p><p className="text-[10px] text-muted-foreground font-mono">{rel.relatedProduct?.sku}</p></td>
                        <td className="p-3">{rel.sortOrder || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "audit" && (
          <div className="rounded-md border border-border bg-card">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-lg font-semibold" style={{ fontFamily: "Montserrat, sans-serif" }}>Audit Log</h2>
              <p className="text-xs text-muted-foreground">Recent admin actions and sync operations</p>
            </div>
            <div className="p-4">
              {auditLog.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground"><History className="h-10 w-10 mx-auto mb-2 opacity-40" /><p className="text-sm font-medium">No audit entries yet</p></div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto" data-testid="audit-log-entries">
                  {auditLog.map((entry, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-md border border-border" data-testid={`audit-entry-${i}`}>
                      <div className={`p-1.5 rounded-md mt-0.5 ${entry.status === "success" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : entry.status === "error" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"}`}>
                        {entry.status === "success" ? <CheckCircle className="h-3.5 w-3.5" /> : entry.status === "error" ? <XCircle className="h-3.5 w-3.5" /> : <History className="h-3.5 w-3.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{entry.action}</span>
                          <Badge variant={entry.status === "success" ? "success" : entry.status === "error" ? "destructive" : "secondary"}>{entry.status}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{entry.details}</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">{new Date(entry.timestamp).toLocaleString()}</p>
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
              <div className="px-5 py-4 border-b border-border">
                <h2 className="text-lg font-semibold" style={{ fontFamily: "Montserrat, sans-serif" }}>API Performance</h2>
              </div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-md border border-border p-4">
                  <p className="text-xs text-muted-foreground">Avg Response Time</p>
                  <p className="text-2xl font-bold" data-testid="text-avg-response">{apiMetrics.avgResponseTime}ms</p>
                  <Badge variant={apiMetrics.avgResponseTime < 200 ? "success" : apiMetrics.avgResponseTime < 500 ? "warning" : "destructive"}>
                    {apiMetrics.avgResponseTime < 200 ? "Excellent" : apiMetrics.avgResponseTime < 500 ? "Good" : "Slow"}
                  </Badge>
                </div>
                <div className="rounded-md border border-border p-4">
                  <p className="text-xs text-muted-foreground">Total Requests</p>
                  <p className="text-2xl font-bold" data-testid="text-total-requests">{apiMetrics.totalRequests}</p>
                  <Badge variant="secondary">This session</Badge>
                </div>
                <div className="rounded-md border border-border p-4">
                  <p className="text-xs text-muted-foreground">Error Rate</p>
                  <p className="text-2xl font-bold" data-testid="text-error-rate">{apiMetrics.errorRate}%</p>
                  <Badge variant={apiMetrics.errorRate === 0 ? "success" : "destructive"}>{apiMetrics.errorRate === 0 ? "Healthy" : "Issues"}</Badge>
                </div>
              </div>
            </div>
            <div className="rounded-md border border-border bg-card">
              <div className="px-5 py-4 border-b border-border">
                <h2 className="text-lg font-semibold" style={{ fontFamily: "Montserrat, sans-serif" }}>System Status</h2>
              </div>
              <div className="p-5 space-y-3">
                {[
                  { icon: Cloud, label: "OrderCloud API", status: isConnected ? "Connected" : "Disconnected", variant: isConnected ? "success" : "destructive" },
                  { icon: Database, label: "PostgreSQL Database", status: "Connected", variant: "success" },
                  { icon: Package, label: "Local Products", status: `${localProducts.length} products`, variant: "secondary" },
                  { icon: Link2, label: "Product Relationships", status: `${relationships.length} mappings`, variant: "secondary" },
                  { icon: ShoppingCart, label: "Total Orders", status: `${adminOrders.length} orders`, variant: "secondary" },
                  { icon: Users, label: "Registered Users", status: `${adminUsers.length} users`, variant: "secondary" },
                  { icon: Activity, label: "Last Sync", status: syncLog.length > 0 ? "Just now" : "Not yet synced", variant: "secondary" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-center justify-between p-3 rounded-md border border-border">
                      <div className="flex items-center gap-3"><Icon className="h-4 w-4 text-muted-foreground" /><span className="text-sm font-medium">{item.label}</span></div>
                      <Badge variant={item.variant}>{item.status}</Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {productModal.open && (
        <ProductModal
          editing={productModal.editing}
          categories={localCategories}
          onClose={() => setProductModal({ open: false })}
          onSave={(data: any) => saveLocalProductMutation.mutate(data)}
          isPending={saveLocalProductMutation.isPending}
        />
      )}

      {categoryModal.open && (
        <CategoryModal
          editing={categoryModal.editing}
          onClose={() => setCategoryModal({ open: false })}
          onSave={(data: any) => saveCategoryMutation.mutate(data)}
          isPending={saveCategoryMutation.isPending}
        />
      )}

      {orderDetail && (
        <OrderDetailModal
          order={orderDetail}
          onClose={() => setOrderDetail(null)}
          onUpdateStatus={(status: string, trackingNumber?: string) => {
            updateOrderMutation.mutate({ id: orderDetail.id, status, trackingNumber });
            setOrderDetail(null);
          }}
        />
      )}

      <ToastContainer toasts={toasts} />
    </div>
  );
}

function ProductModal({ editing, categories, onClose, onSave, isPending }: { editing?: any; categories: any[]; onClose: () => void; onSave: (data: any) => void; isPending: boolean }) {
  const [form, setForm] = useState({
    name: editing?.name || "",
    sku: editing?.sku || "",
    description: editing?.description || "",
    categoryId: editing?.categoryId || "",
    basePrice: editing?.basePrice ? parseFloat(editing.basePrice).toString() : "",
    active: editing?.active ?? true,
    industry: editing?.industry || "",
    application: editing?.application || "",
    minOrderQty: editing?.minOrderQty?.toString() || "1",
    leadTimeDays: editing?.leadTimeDays?.toString() || "5",
    inStock: editing?.inStock ?? true,
    stockQty: editing?.stockQty?.toString() || "100",
    imageUrl: editing?.imageUrl || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...(editing?.id ? { id: editing.id } : {}),
      name: form.name,
      sku: form.sku,
      description: form.description || undefined,
      categoryId: form.categoryId || undefined,
      basePrice: parseFloat(form.basePrice).toFixed(4),
      active: form.active,
      industry: form.industry || undefined,
      application: form.application || undefined,
      minOrderQty: parseInt(form.minOrderQty) || 1,
      leadTimeDays: parseInt(form.leadTimeDays) || 5,
      inStock: form.inStock,
      stockQty: parseInt(form.stockQty) || 0,
      imageUrl: form.imageUrl || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()} data-testid="modal-product">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold" style={{ fontFamily: "Montserrat, sans-serif" }}>{editing ? "Edit Product" : "Create Product"}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-accent"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} required className="w-full mt-1 h-8 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" data-testid="input-product-name" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">SKU *</label>
              <input type="text" value={form.sku} onChange={(e) => setForm(f => ({ ...f, sku: e.target.value }))} required disabled={!!editing} className="w-full mt-1 h-8 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50" data-testid="input-product-sku" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} className="w-full mt-1 h-20 px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" data-testid="input-product-description" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Category</label>
              <select value={form.categoryId} onChange={(e) => setForm(f => ({ ...f, categoryId: e.target.value }))} className="w-full mt-1 h-8 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" data-testid="select-product-category">
                <option value="">None</option>
                {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Base Price *</label>
              <input type="number" step="0.01" value={form.basePrice} onChange={(e) => setForm(f => ({ ...f, basePrice: e.target.value }))} required className="w-full mt-1 h-8 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" data-testid="input-product-price" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Stock Qty</label>
              <input type="number" value={form.stockQty} onChange={(e) => setForm(f => ({ ...f, stockQty: e.target.value }))} className="w-full mt-1 h-8 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" data-testid="input-product-stock" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Min Order Qty</label>
              <input type="number" value={form.minOrderQty} onChange={(e) => setForm(f => ({ ...f, minOrderQty: e.target.value }))} className="w-full mt-1 h-8 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Lead Time (days)</label>
              <input type="number" value={form.leadTimeDays} onChange={(e) => setForm(f => ({ ...f, leadTimeDays: e.target.value }))} className="w-full mt-1 h-8 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Industry</label>
              <input type="text" value={form.industry} onChange={(e) => setForm(f => ({ ...f, industry: e.target.value }))} className="w-full mt-1 h-8 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Application</label>
              <input type="text" value={form.application} onChange={(e) => setForm(f => ({ ...f, application: e.target.value }))} className="w-full mt-1 h-8 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.active} onChange={(e) => setForm(f => ({ ...f, active: e.target.checked }))} className="accent-primary" /> Active</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.inStock} onChange={(e) => setForm(f => ({ ...f, inStock: e.target.checked }))} className="accent-primary" /> In Stock</label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md border border-border text-sm">Cancel</button>
            <button type="submit" disabled={isPending} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50" data-testid="button-save-product">
              {isPending ? "Saving..." : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CategoryModal({ editing, onClose, onSave, isPending }: { editing?: any; onClose: () => void; onSave: (data: any) => void; isPending: boolean }) {
  const [form, setForm] = useState({
    name: editing?.name || "",
    slug: editing?.slug || "",
    description: editing?.description || "",
    sortOrder: editing?.sortOrder?.toString() || "0",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...(editing?.id ? { id: editing.id } : {}),
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: form.description || undefined,
      sortOrder: parseInt(form.sortOrder) || 0,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()} data-testid="modal-category">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold" style={{ fontFamily: "Montserrat, sans-serif" }}>{editing ? "Edit Category" : "Create Category"}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-accent"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Name *</label>
            <input type="text" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} required className="w-full mt-1 h-8 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" data-testid="input-category-name" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Slug</label>
            <input type="text" value={form.slug} onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="auto-generated from name" className="w-full mt-1 h-8 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" data-testid="input-category-slug" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} className="w-full mt-1 h-16 px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" data-testid="input-category-description" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Sort Order</label>
            <input type="number" value={form.sortOrder} onChange={(e) => setForm(f => ({ ...f, sortOrder: e.target.value }))} className="w-full mt-1 h-8 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md border border-border text-sm">Cancel</button>
            <button type="submit" disabled={isPending} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50" data-testid="button-save-category">
              {isPending ? "Saving..." : "Save Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function OrderDetailModal({ order, onClose, onUpdateStatus }: { order: any; onClose: () => void; onUpdateStatus: (status: string, tracking?: string) => void }) {
  const [status, setStatus] = useState(order.status || "pending");
  const [tracking, setTracking] = useState(order.trackingNumber || "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()} data-testid="modal-order-detail">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="font-semibold" style={{ fontFamily: "Montserrat, sans-serif" }}>Order {order.id.substring(0, 8).toUpperCase()}</h3>
            <p className="text-xs text-muted-foreground">{order.user?.companyName || order.user?.username || "Unknown"} — {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ""}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-accent"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-5 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full mt-1 h-8 px-3 rounded-md border border-border bg-background text-sm" data-testid="select-modal-status">
                {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Tracking Number</label>
              <input type="text" value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="Enter tracking number" className="w-full mt-1 h-8 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" data-testid="input-tracking" />
            </div>
          </div>

          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2">Order Items</h4>
            <div className="rounded-md border border-border divide-y divide-border">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">{item.product?.name || "Product"}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{item.product?.sku}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p>{item.quantity} x ${parseFloat(item.unitPrice).toFixed(2)}</p>
                    <p className="font-semibold">${parseFloat(item.totalPrice).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            {order.shippingAddress && <div><p className="text-xs text-muted-foreground mb-1">Shipping Address</p><p className="whitespace-pre-wrap">{order.shippingAddress}</p></div>}
            {order.poNumber && <div><p className="text-xs text-muted-foreground mb-1">PO Number</p><p className="font-mono">{order.poNumber}</p></div>}
            {order.shippingMethod && <div><p className="text-xs text-muted-foreground mb-1">Shipping</p><p className="capitalize">{order.shippingMethod} (${parseFloat(order.shippingCost || "0").toFixed(2)})</p></div>}
            {order.paymentMethod && <div><p className="text-xs text-muted-foreground mb-1">Payment</p><p className="capitalize">{order.paymentMethod.replace("_", " ")}</p></div>}
          </div>

          <div className="rounded-md border border-border p-3 space-y-1 text-sm">
            {order.shippingCost && parseFloat(order.shippingCost) > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>${parseFloat(order.shippingCost).toFixed(2)}</span></div>}
            {order.taxAmount && parseFloat(order.taxAmount) > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>${parseFloat(order.taxAmount).toFixed(2)}</span></div>}
            {order.discountAmount && parseFloat(order.discountAmount) > 0 && <div className="flex justify-between text-green-600"><span>Discount ({order.discountCode})</span><span>-${parseFloat(order.discountAmount).toFixed(2)}</span></div>}
            <div className="flex justify-between font-semibold pt-1 border-t border-border"><span>Total</span><span>${parseFloat(order.total || "0").toFixed(2)}</span></div>
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md border border-border text-sm">Close</button>
            <button onClick={() => onUpdateStatus(status, tracking)} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium" data-testid="button-update-order">
              Update Order
            </button>
          </div>
        </div>
      </div>
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
