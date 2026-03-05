import { useState, useEffect, useMemo, useCallback } from "react";
import { QueryClientProvider, useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "./lib/queryClient";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Loader2, CheckCircle, XCircle, RefreshCw, Upload, Database, Cloud, Package,
  FolderTree, DollarSign, History, Link2, Trash2, ArrowRightLeft,
  LayoutDashboard, ShoppingCart, Users, Plus, Pencil, X, Search, Eye,
  CreditCard, TrendingUp, BarChart3, Download,
  AlertTriangle, Filter, Settings, Zap, Bot, Bell, Shield, FileDown,
  Globe, ChevronLeft, ChevronRight, ToggleLeft, ToggleRight,
  PanelLeftClose, PanelLeft, Menu,
} from "lucide-react";

const BLOK_COLORS = ["#5548D9", "#6987f9", "#16a34a", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"];
const ORDER_STATUSES = ["pending", "submitted", "processing", "shipped", "delivered", "cancelled"];
const statusBadgeVariant: Record<string, string> = {
  pending: "warning", submitted: "default", processing: "default",
  shipped: "success", delivered: "success", cancelled: "destructive",
};

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
        <div key={t.id} className={`rounded-lg border px-4 py-3 shadow-lg max-w-sm animate-in slide-in-from-right ${t.variant === "destructive" ? "border-destructive/30 bg-destructive/10 text-destructive" : "border-border bg-card text-card-foreground"}`}>
          <p className="font-medium text-sm">{t.title}</p>
          {t.description && <p className="text-xs opacity-70 mt-0.5">{t.description}</p>}
        </div>
      ))}
    </div>
  );
}

function Badge({ children, variant = "default", className = "" }: { children: React.ReactNode; variant?: string; className?: string }) {
  const base = "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap";
  const variants: Record<string, string> = {
    default: "bg-primary/10 text-primary",
    secondary: "bg-muted text-muted-foreground",
    outline: "border border-border text-foreground",
    destructive: "bg-destructive/10 text-destructive",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
  };
  return <span className={`${base} ${variants[variant] || variants.default} ${className}`}>{children}</span>;
}

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed ${checked ? "bg-primary" : "bg-muted-foreground/30"}`}
      data-testid="toggle-switch"
    >
      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${checked ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

function downloadCSV(data: any[], filename: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const csvContent = [headers.join(","), ...data.map(row => headers.map(h => {
    const val = row[h];
    const str = typeof val === "object" ? JSON.stringify(val) : String(val ?? "");
    return str.includes(",") || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
  }).join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = `${filename}.csv`; a.click();
  URL.revokeObjectURL(url);
}

function AdminDashboard() {
  const { toast, toasts } = useToast();
  const [syncLog, setSyncLog] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [productModal, setProductModal] = useState<{ open: boolean; editing?: any }>({ open: false });
  const [categoryModal, setCategoryModal] = useState<{ open: boolean; editing?: any }>({ open: false });
  const [orderDetail, setOrderDetail] = useState<any>(null);
  const [productSearch, setProductSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [auditCategoryFilter, setAuditCategoryFilter] = useState("all");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const persistAudit = useCallback((action: string, details: string, status: string = "info", category: string = "system") => {
    apiRequest("POST", "/api/admin/audit-log", { action, details, status, category }).catch(() => {});
  }, []);

  useEffect(() => { persistAudit("Dashboard Loaded", "Admin dashboard initialized", "info", "system"); }, []);

  const statsQuery = useQuery<{ totalProducts: number; totalCategories: number; totalOrders: number; totalUsers: number; totalRevenue: number }>({ queryKey: ["/api/admin/stats"] });
  const statusQuery = useQuery<{ success: boolean; message: string }>({ queryKey: ["/api/admin/ordercloud/status"] });
  const ocProductsQuery = useQuery<{ Items: any[]; Meta: any }>({ queryKey: ["/api/admin/ordercloud/products"], enabled: statusQuery.data?.success === true });
  const ocCategoriesQuery = useQuery<{ Items: any[]; Meta: any }>({ queryKey: ["/api/admin/ordercloud/categories"], enabled: statusQuery.data?.success === true });
  const ocPriceSchedulesQuery = useQuery<{ Items: any[]; Meta: any }>({ queryKey: ["/api/admin/ordercloud/priceschedules"], enabled: statusQuery.data?.success === true });
  const localProductsQuery = useQuery<any[]>({ queryKey: ["/api/admin/local-products"] });
  const localCategoriesQuery = useQuery<any[]>({ queryKey: ["/api/categories"] });
  const adminOrdersQuery = useQuery<any[]>({ queryKey: ["/api/admin/orders"] });
  const adminUsersQuery = useQuery<any[]>({ queryKey: ["/api/admin/users"] });
  const revenueQuery = useQuery<{ date: string; revenue: number; orderCount: number }[]>({ queryKey: ["/api/admin/analytics/revenue"] });
  const ordersByStatusQuery = useQuery<{ status: string; count: number }[]>({ queryKey: ["/api/admin/analytics/orders-by-status"] });
  const topProductsQuery = useQuery<{ productId: string; name: string; sku: string; totalQty: number; totalRevenue: number }[]>({ queryKey: ["/api/admin/analytics/top-products"] });
  const lowStockQuery = useQuery<any[]>({ queryKey: ["/api/admin/analytics/low-stock"] });
  const customerAnalyticsQuery = useQuery<{ byRole: Record<string, number>; byLocale: Record<string, number>; byCurrency: Record<string, number>; topBuyers: any[] }>({ queryKey: ["/api/admin/analytics/customers"] });
  const auditLogQuery = useQuery<{ entries: any[]; total: number }>({ queryKey: ["/api/admin/audit-log", auditCategoryFilter === "all" ? "" : `?category=${auditCategoryFilter}`] });
  const featureFlagsQuery = useQuery<any[]>({ queryKey: ["/api/admin/feature-flags"] });
  const ocBuyersQuery = useQuery<{ Items: any[]; Meta: any }>({ queryKey: ["/api/admin/ordercloud/buyers"], enabled: statusQuery.data?.success === true });
  const ocOrdersQuery = useQuery<{ Items: any[]; Meta: any }>({ queryKey: ["/api/admin/ordercloud/orders"], enabled: statusQuery.data?.success === true });
  const relationshipsQuery = useQuery<any[]>({
    queryKey: ["/api/admin/relationships"],
    queryFn: async () => {
      const products = localProductsQuery.data || [];
      const allRels: any[] = [];
      for (const product of products.slice(0, 14)) {
        try { const res = await fetch(`/api/products/${product.id}/related`); if (res.ok) { const data = await res.json(); if (Array.isArray(data)) data.forEach((r: any) => allRels.push({ ...r, sourceProduct: product })); } } catch {}
      }
      return allRels;
    },
    enabled: (localProductsQuery.data?.length ?? 0) > 0,
  });

  const syncMutation = useMutation({
    mutationFn: async () => { const res = await apiRequest("POST", "/api/admin/ordercloud/sync"); return res.json(); },
    onSuccess: (data: any) => {
      setSyncLog(data.details || []);
      persistAudit("Catalog Sync", data.message, data.success ? "success" : "error", "sync");
      toast({ title: data.success ? "Sync Complete" : "Sync Failed", description: data.message, variant: data.success ? "default" : "destructive" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ordercloud/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ordercloud/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ordercloud/priceschedules"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ordercloud/buyers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ordercloud/orders"] });
    },
    onError: (err: Error) => { toast({ title: "Sync Error", description: err.message, variant: "destructive" }); },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (sku: string) => { const res = await apiRequest("DELETE", `/api/admin/ordercloud/products/${sku}`); return res.json(); },
    onSuccess: () => { toast({ title: "Product Deleted" }); queryClient.invalidateQueries({ queryKey: ["/api/admin/ordercloud/products"] }); },
    onError: (err: Error) => toast({ title: "Delete Error", description: err.message, variant: "destructive" }),
  });

  const deleteAllMutation = useMutation({
    mutationFn: async () => { const products = ocProductsQuery.data?.Items || []; for (const p of products) await apiRequest("DELETE", `/api/admin/ordercloud/products/${p.ID}`); return { count: products.length }; },
    onSuccess: (data: { count: number }) => { toast({ title: "All OC Products Deleted", description: `${data.count} removed` }); queryClient.invalidateQueries({ queryKey: ["/api/admin/ordercloud/products"] }); },
    onError: (err: Error) => toast({ title: "Delete Error", description: err.message, variant: "destructive" }),
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; status?: string; trackingNumber?: string }) => { const res = await apiRequest("PATCH", `/api/admin/orders/${id}/status`, data); return res.json(); },
    onSuccess: () => { toast({ title: "Order Updated" }); queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] }); queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] }); queryClient.invalidateQueries({ queryKey: ["/api/admin/analytics/orders-by-status"] }); },
    onError: (err: Error) => toast({ title: "Update Error", description: err.message, variant: "destructive" }),
  });

  const saveLocalProductMutation = useMutation({
    mutationFn: async (data: any) => { if (data.id) { const { id, ...rest } = data; const res = await apiRequest("PUT", `/api/admin/local-products/${id}`, rest); return res.json(); } const res = await apiRequest("POST", "/api/admin/local-products", data); return res.json(); },
    onSuccess: () => { toast({ title: "Product Saved" }); setProductModal({ open: false }); queryClient.invalidateQueries({ queryKey: ["/api/admin/local-products"] }); queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] }); },
    onError: (err: Error) => toast({ title: "Save Error", description: err.message, variant: "destructive" }),
  });

  const deleteLocalProductMutation = useMutation({
    mutationFn: async (id: string) => { const res = await apiRequest("DELETE", `/api/admin/local-products/${id}`); return res.json(); },
    onSuccess: () => { toast({ title: "Product Deleted" }); queryClient.invalidateQueries({ queryKey: ["/api/admin/local-products"] }); queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] }); },
    onError: (err: Error) => toast({ title: "Delete Error", description: err.message, variant: "destructive" }),
  });

  const saveCategoryMutation = useMutation({
    mutationFn: async (data: any) => { if (data.id) { const { id, ...rest } = data; const res = await apiRequest("PUT", `/api/admin/categories/${id}`, rest); return res.json(); } const res = await apiRequest("POST", "/api/admin/categories", data); return res.json(); },
    onSuccess: () => { toast({ title: "Category Saved" }); setCategoryModal({ open: false }); queryClient.invalidateQueries({ queryKey: ["/api/categories"] }); queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] }); },
    onError: (err: Error) => toast({ title: "Save Error", description: err.message, variant: "destructive" }),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => { const res = await apiRequest("DELETE", `/api/admin/categories/${id}`); return res.json(); },
    onSuccess: () => { toast({ title: "Category Deleted" }); queryClient.invalidateQueries({ queryKey: ["/api/categories"] }); queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] }); },
    onError: (err: Error) => toast({ title: "Delete Error", description: err.message, variant: "destructive" }),
  });

  const pullFromOCMutation = useMutation({
    mutationFn: async () => { const res = await apiRequest("POST", "/api/admin/pull-from-oc"); return res.json(); },
    onSuccess: () => { toast({ title: "Data Retrieved" }); },
    onError: (err: Error) => toast({ title: "Pull Error", description: err.message, variant: "destructive" }),
  });

  const syncBuyersMutation = useMutation({
    mutationFn: async () => { const res = await apiRequest("POST", "/api/admin/ordercloud/sync-buyers"); return res.json(); },
    onSuccess: (data: any) => {
      toast({ title: data.success ? "Buyers Synced" : "Buyer Sync Failed", description: data.message, variant: data.success ? "default" : "destructive" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ordercloud/buyers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (err: Error) => toast({ title: "Buyer Sync Error", description: err.message, variant: "destructive" }),
  });

  const syncOrdersMutation = useMutation({
    mutationFn: async () => { const res = await apiRequest("POST", "/api/admin/ordercloud/sync-orders"); return res.json(); },
    onSuccess: (data: any) => {
      toast({ title: data.success ? "Orders Synced" : "Order Sync Failed", description: data.message, variant: data.success ? "default" : "destructive" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ordercloud/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
    },
    onError: (err: Error) => toast({ title: "Order Sync Error", description: err.message, variant: "destructive" }),
  });

  const toggleFeatureFlagMutation = useMutation({
    mutationFn: async ({ key, enabled }: { key: string; enabled: boolean }) => {
      const res = await apiRequest("PATCH", `/api/admin/feature-flags/${key}`, { enabled });
      return res.json();
    },
    onSuccess: (_: any, variables: { key: string; enabled: boolean }) => {
      toast({ title: `Feature ${variables.enabled ? "Enabled" : "Disabled"}`, description: variables.key.replace(/_/g, " ") });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/feature-flags"] });
      queryClient.invalidateQueries({ queryKey: ["/api/feature-flags"] });
    },
    onError: (err: Error) => toast({ title: "Toggle Error", description: err.message, variant: "destructive" }),
  });

  const isConnected = statusQuery.data?.success === true;
  const ocProducts = ocProductsQuery.data?.Items || [];
  const ocCategories = ocCategoriesQuery.data?.Items || [];
  const ocPriceSchedules = ocPriceSchedulesQuery.data?.Items || [];
  const ocBuyers = ocBuyersQuery.data?.Items || [];
  const ocOrders = ocOrdersQuery.data?.Items || [];
  const localProducts = localProductsQuery.data || [];
  const localCategories = localCategoriesQuery.data || [];
  const adminOrders = adminOrdersQuery.data || [];
  const adminUsers = adminUsersQuery.data || [];
  const relationships = relationshipsQuery.data || [];
  const stats = statsQuery.data;
  const revenueData = revenueQuery.data || [];
  const ordersByStatus = ordersByStatusQuery.data || [];
  const topProducts = topProductsQuery.data || [];
  const lowStockProducts = lowStockQuery.data || [];
  const customerAnalytics = customerAnalyticsQuery.data;
  const auditEntries = auditLogQuery.data?.entries || [];
  const featureFlags = featureFlagsQuery.data || [];

  const filteredProducts = useMemo(() => {
    if (!productSearch) return localProducts;
    const q = productSearch.toLowerCase();
    return localProducts.filter((p: any) => p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q));
  }, [localProducts, productSearch]);

  const filteredOrders = useMemo(() => {
    if (orderStatusFilter === "all") return adminOrders;
    return adminOrders.filter((o: any) => o.status === orderStatusFilter);
  }, [adminOrders, orderStatusFilter]);

  const roleDistribution = useMemo(() => {
    if (!customerAnalytics?.byRole) return [];
    return Object.entries(customerAnalytics.byRole).map(([name, value]) => ({ name, value }));
  }, [customerAnalytics]);

  const localeDistribution = useMemo(() => {
    if (!customerAnalytics?.byLocale) return [];
    return Object.entries(customerAnalytics.byLocale).map(([name, value]) => ({ name: name === "en" ? "English" : name === "de" ? "German" : name === "zh" ? "Chinese" : name, value }));
  }, [customerAnalytics]);

  const avgOrderValue = useMemo(() => {
    if (!adminOrders.length) return 0;
    const total = adminOrders.reduce((sum: number, o: any) => sum + parseFloat(o.total || "0"), 0);
    return total / adminOrders.length;
  }, [adminOrders]);

  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "analytics", label: "Analytics", icon: BarChart3 },
    { key: "products", label: "Products", icon: Package, count: localProducts.length },
    { key: "categories", label: "Categories", icon: FolderTree, count: localCategories.length },
    { key: "orders", label: "Orders", icon: ShoppingCart, count: adminOrders.length },
    { key: "buyers", label: "Buyers", icon: Users, count: adminUsers.length },
    { key: "oc-sync", label: "OC Sync", icon: Cloud },
    { key: "relationships", label: "Relationships", icon: Link2, count: relationships.length },
    { key: "audit", label: "Audit Log", icon: History },
    { key: "settings", label: "Settings", icon: Settings },
  ];

  const chartTooltipStyle = { background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 };

  const sidebarWidth = sidebarCollapsed ? 64 : 240;

  return (
    <div className="min-h-screen bg-background">
      {/* ─── SIDEBAR ──────────────────────────────────────────── */}
      <aside
        className="fixed top-0 left-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col z-40"
        style={{ width: sidebarWidth, transition: "width 200ms ease" }}
      >
        <div className={`h-14 flex items-center border-b border-sidebar-border shrink-0 ${sidebarCollapsed ? "justify-center px-2" : "px-5"}`}>
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">OC</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-sidebar-foreground leading-tight" data-testid="text-admin-title">OrderCloud Admin</p>
                <p className="text-[10px] text-muted-foreground leading-tight">Sitecore Commerce</p>
              </div>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">OC</span>
            </div>
          )}
        </div>

        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`w-full flex items-center gap-2.5 rounded-lg text-sm transition-colors ${sidebarCollapsed ? "justify-center p-2.5" : "px-3 py-2.5"} ${isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
                title={sidebarCollapsed ? item.label : undefined}
                data-testid={`tab-${item.key}`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    {item.count !== undefined && <span className="text-[10px] font-medium text-muted-foreground bg-muted rounded-full px-1.5 py-0.5">{item.count}</span>}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        <div className={`border-t border-sidebar-border p-2 shrink-0`}>
          <div className={`flex items-center gap-2 rounded-lg px-2 py-1.5 ${sidebarCollapsed ? "justify-center" : ""}`}>
            <div className={`h-2 w-2 rounded-full shrink-0 ${isConnected ? "bg-success" : "bg-destructive"}`} />
            {!sidebarCollapsed && <span className="text-xs text-muted-foreground">{isConnected ? "OC Connected" : "Disconnected"}</span>}
          </div>
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="w-full flex items-center justify-center gap-2 rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:bg-accent transition-colors mt-1" data-testid="button-toggle-sidebar">
            {sidebarCollapsed ? <PanelLeft className="h-4 w-4" /> : <><PanelLeftClose className="h-4 w-4" /><span>Collapse</span></>}
          </button>
        </div>
      </aside>

      {/* ─── MAIN CONTENT ──────────────────────────────────────────── */}
      <main
        className="min-h-screen overflow-x-hidden"
        style={{ marginLeft: sidebarWidth, transition: "margin-left 200ms ease" }}
      >
        <header className="h-14 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-8 sticky top-0 z-30">
          <h2 className="text-sm font-semibold capitalize">{activeTab === "oc-sync" ? "OrderCloud Sync" : activeTab.replace("-", " ")}</h2>
          <button onClick={() => queryClient.invalidateQueries()} className="p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors" data-testid="button-refresh"><RefreshCw className="h-4 w-4" /></button>
        </header>

        <div className="p-8 max-w-[1400px] mx-auto">

        {/* ─── DASHBOARD ──────────────────────────────────────────── */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[
                { label: "Products", value: stats?.totalProducts ?? "—", icon: Package, color: "text-primary" },
                { label: "Categories", value: stats?.totalCategories ?? "—", icon: FolderTree, color: "text-violet-500" },
                { label: "Orders", value: stats?.totalOrders ?? "—", icon: ShoppingCart, color: "text-warning" },
                { label: "Buyers", value: stats?.totalUsers ?? "—", icon: Users, color: "text-success" },
                { label: "Revenue", value: stats ? `$${stats.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "—", icon: TrendingUp, color: "text-primary" },
                { label: "Avg Order", value: `$${avgOrderValue.toFixed(2)}`, icon: DollarSign, color: "text-violet-500" },
                { label: "OC Synced", value: ocProducts.length, icon: Cloud, color: "text-muted-foreground" },
                { label: "Low Stock", value: lowStockProducts.length, icon: AlertTriangle, color: "text-warning" },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="rounded-xl border border-border bg-card p-5" data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</span>
                      <Icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                    <p className="text-2xl font-semibold">{stat.value}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-xl border border-border bg-card">
                <div className="px-6 py-4 border-b border-border"><h3 className="text-sm font-semibold">Revenue Trend</h3></div>
                <div className="p-6 h-[260px]">
                  {revenueData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueData}>
                        <defs><linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#5548D9" stopOpacity={0.2} /><stop offset="95%" stopColor="#5548D9" stopOpacity={0} /></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                        <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${v}`} />
                        <Tooltip contentStyle={chartTooltipStyle} formatter={(v: any) => [`$${Number(v).toFixed(2)}`, "Revenue"]} />
                        <Area type="monotone" dataKey="revenue" stroke="#5548D9" fill="url(#revGrad)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No revenue data yet</div>}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card">
                <div className="px-6 py-4 border-b border-border"><h3 className="text-sm font-semibold">Orders by Status</h3></div>
                <div className="p-6 h-[260px]">
                  {ordersByStatus.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={ordersByStatus} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3} dataKey="count" nameKey="status" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                          {ordersByStatus.map((_, i) => <Cell key={i} fill={BLOK_COLORS[i % BLOK_COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={chartTooltipStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No orders yet</div>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="rounded-xl border border-border bg-card">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Recent Orders</h3>
                  <button onClick={() => setActiveTab("orders")} className="text-xs text-primary hover:underline" data-testid="link-view-all-orders">View All</button>
                </div>
                <div className="divide-y divide-border pb-2">
                  {adminOrders.slice(0, 5).map((order: any) => (
                    <div key={order.id} className="px-6 py-3.5 flex items-center justify-between" data-testid={`recent-order-${order.id}`}>
                      <div><p className="text-sm font-medium font-mono">{order.id.substring(0, 8).toUpperCase()}</p><p className="text-xs text-muted-foreground">{order.user?.companyName || order.user?.username || "Unknown"}</p></div>
                      <div className="text-right"><p className="text-sm font-semibold">${parseFloat(order.total || "0").toFixed(2)}</p><Badge variant={statusBadgeVariant[order.status] || "secondary"}>{order.status}</Badge></div>
                    </div>
                  ))}
                  {adminOrders.length === 0 && <div className="px-6 py-10 text-center text-sm text-muted-foreground">No orders yet</div>}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card">
                <div className="px-6 py-4 border-b border-border"><h3 className="text-sm font-semibold">Top Products</h3></div>
                <div className="divide-y divide-border pb-2">
                  {topProducts.slice(0, 5).map((p, i) => (
                    <div key={p.productId} className="px-6 py-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5"><span className="text-xs font-bold text-muted-foreground w-5">#{i + 1}</span><div><p className="text-sm font-medium truncate max-w-[150px]">{p.name}</p><p className="text-[10px] text-muted-foreground font-mono">{p.sku}</p></div></div>
                      <div className="text-right"><p className="text-sm font-semibold">${p.totalRevenue.toFixed(2)}</p><p className="text-[10px] text-muted-foreground">{p.totalQty} units</p></div>
                    </div>
                  ))}
                  {topProducts.length === 0 && <div className="px-6 py-10 text-center text-sm text-muted-foreground">No sales data</div>}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card">
                <div className="px-6 py-4 border-b border-border flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-warning" /><h3 className="text-sm font-semibold">Low Stock</h3></div>
                <div className="divide-y divide-border pb-2">
                  {lowStockProducts.slice(0, 5).map((p: any) => (
                    <div key={p.id} className="px-6 py-3.5 flex items-center justify-between">
                      <div><p className="text-sm font-medium truncate max-w-[150px]">{p.name}</p><p className="text-[10px] text-muted-foreground font-mono">{p.sku}</p></div>
                      <Badge variant={p.stockQty <= 10 ? "destructive" : "warning"}>{p.stockQty} left</Badge>
                    </div>
                  ))}
                  {lowStockProducts.length === 0 && <div className="px-6 py-10 text-center text-sm text-muted-foreground"><CheckCircle className="h-5 w-5 mx-auto mb-1 text-success" /><p>All well-stocked</p></div>}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card">
              <div className="px-6 py-4 border-b border-border"><h3 className="text-sm font-semibold">Quick Actions</h3></div>
              <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Sync to OC", icon: Upload, action: () => syncMutation.mutate(), pending: syncMutation.isPending, disabled: !isConnected, testId: "button-sync" },
                  { label: "Pull from OC", icon: Download, action: () => pullFromOCMutation.mutate(), pending: pullFromOCMutation.isPending, disabled: !isConnected, testId: "button-pull-oc" },
                  { label: "Add Product", icon: Plus, action: () => { setProductModal({ open: true }); setActiveTab("products"); }, pending: false, disabled: false, testId: "button-add-product" },
                  { label: "Export Products", icon: FileDown, action: () => downloadCSV(localProducts.map((p: any) => ({ sku: p.sku, name: p.name, price: p.basePrice, stock: p.stockQty, active: p.active })), "products"), pending: false, disabled: false, testId: "button-export-products" },
                ].map((btn) => {
                  const Icon = btn.icon;
                  return (
                    <button key={btn.label} onClick={btn.action} disabled={btn.pending || btn.disabled} className="flex items-center gap-2.5 p-3.5 rounded-xl border border-border text-sm hover:bg-accent/60 disabled:opacity-40 transition-colors" data-testid={btn.testId}>
                      {btn.pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4 text-primary" />}
                      {btn.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ─── ANALYTICS ──────────────────────────────────────────── */}
        {activeTab === "analytics" && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div><h2 className="text-lg font-semibold">Business Analytics</h2><p className="text-xs text-muted-foreground mt-0.5">Revenue, product performance, and customer insights</p></div>
              <button onClick={() => { downloadCSV(topProducts, "top-products"); toast({ title: "Exported" }); }} className="inline-flex items-center gap-1.5 rounded-4xl border border-border px-4 py-2 text-xs font-medium hover:bg-accent/60 transition-colors whitespace-nowrap" data-testid="button-export-analytics"><FileDown className="h-3.5 w-3.5" /> Export Data</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-xl border border-border bg-card">
                <div className="px-6 py-4 border-b border-border"><h3 className="text-sm font-semibold">Top Products by Revenue</h3></div>
                <div className="p-6 h-[300px]">
                  {topProducts.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topProducts.slice(0, 8)} layout="vertical" margin={{ left: 100 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${v}`} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={95} />
                        <Tooltip contentStyle={chartTooltipStyle} formatter={(v: any) => [`$${Number(v).toFixed(2)}`, "Revenue"]} />
                        <Bar dataKey="totalRevenue" fill="#5548D9" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No data</div>}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card">
                <div className="px-6 py-4 border-b border-border"><h3 className="text-sm font-semibold">Units Sold</h3></div>
                <div className="p-6 h-[300px]">
                  {topProducts.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topProducts.slice(0, 8)} layout="vertical" margin={{ left: 100 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={95} />
                        <Tooltip contentStyle={chartTooltipStyle} />
                        <Bar dataKey="totalQty" fill="#6987f9" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No data</div>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="rounded-xl border border-border bg-card">
                <div className="px-6 py-4 border-b border-border"><h3 className="text-sm font-semibold">User Roles</h3></div>
                <div className="p-6 h-[240px]">
                  {roleDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart><Pie data={roleDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={75} paddingAngle={3} dataKey="value" nameKey="name" label={({ name, value }) => `${name} (${value})`} labelLine={false}>{roleDistribution.map((_, i) => <Cell key={i} fill={BLOK_COLORS[i % BLOK_COLORS.length]} />)}</Pie><Tooltip contentStyle={chartTooltipStyle} /></PieChart>
                    </ResponsiveContainer>
                  ) : <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No data</div>}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card">
                <div className="px-6 py-4 border-b border-border"><h3 className="text-sm font-semibold">Language Preferences</h3></div>
                <div className="p-6 h-[240px]">
                  {localeDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart><Pie data={localeDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={75} paddingAngle={3} dataKey="value" nameKey="name" label={({ name, value }) => `${name} (${value})`} labelLine={false}>{localeDistribution.map((_, i) => <Cell key={i} fill={BLOK_COLORS[(i + 3) % BLOK_COLORS.length]} />)}</Pie><Tooltip contentStyle={chartTooltipStyle} /></PieChart>
                    </ResponsiveContainer>
                  ) : <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No data</div>}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card">
                <div className="px-6 py-4 border-b border-border"><h3 className="text-sm font-semibold">Top Buyers</h3></div>
                <div className="divide-y divide-border pb-2">
                  {(customerAnalytics?.topBuyers || []).slice(0, 5).map((b: any) => (
                    <div key={b.userId} className="px-6 py-3.5 flex items-center justify-between">
                      <div><p className="text-sm font-medium">{b.companyName || b.username}</p><p className="text-[10px] text-muted-foreground">{b.orderCount} orders</p></div>
                      <p className="text-sm font-semibold">${b.totalSpent.toFixed(2)}</p>
                    </div>
                  ))}
                  {!customerAnalytics?.topBuyers?.length && <div className="px-6 py-10 text-center text-sm text-muted-foreground">No data</div>}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card">
              <div className="px-6 py-4 border-b border-border"><h3 className="text-sm font-semibold">Inventory by Category</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border bg-muted/50"><th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Category</th><th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Products</th><th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Total Stock</th><th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Avg Price</th></tr></thead>
                  <tbody>
                    {localCategories.map((cat: any) => {
                      const catProducts = localProducts.filter((p: any) => p.categoryId === cat.id);
                      const totalStock = catProducts.reduce((s: number, p: any) => s + (p.stockQty || 0), 0);
                      const avgPrice = catProducts.length ? catProducts.reduce((s: number, p: any) => s + parseFloat(p.basePrice || "0"), 0) / catProducts.length : 0;
                      return (<tr key={cat.id} className="border-b border-border hover:bg-accent/30 transition-colors"><td className="p-4 font-medium">{cat.name}</td><td className="p-4">{catProducts.length}</td><td className="p-4">{totalStock.toLocaleString()}</td><td className="p-4">${avgPrice.toFixed(2)}</td></tr>);
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── PRODUCTS ──────────────────────────────────────────── */}
        {activeTab === "products" && (
          <div className="rounded-xl border border-border bg-card">
            <div className="px-6 py-5 border-b border-border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div><h2 className="text-lg font-semibold">Products</h2><p className="text-xs text-muted-foreground mt-0.5">Manage your product catalog</p></div>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" /><input type="text" placeholder="Search..." value={productSearch} onChange={(e) => setProductSearch(e.target.value)} className="h-9 pl-9 pr-3 w-48 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/40" data-testid="input-product-search" /></div>
                  <button onClick={() => downloadCSV(localProducts.map((p: any) => ({ sku: p.sku, name: p.name, price: p.basePrice, stock: p.stockQty, active: p.active, category: localCategories.find((c: any) => c.id === p.categoryId)?.name || "" })), "products")} className="inline-flex items-center gap-1.5 rounded-4xl border border-border px-4 py-2 text-xs font-medium hover:bg-accent/60 transition-colors whitespace-nowrap" data-testid="button-export-csv"><FileDown className="h-3.5 w-3.5" /> CSV</button>
                  <button onClick={() => setProductModal({ open: true })} className="inline-flex items-center gap-1.5 rounded-4xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors whitespace-nowrap" data-testid="button-create-product"><Plus className="h-3.5 w-3.5" /> New Product</button>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">SKU</th>
                  <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Name</th>
                  <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Category</th>
                  <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Price</th>
                  <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Stock</th>
                  <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Tiers</th>
                  <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Status</th>
                  <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Actions</th>
                </tr></thead>
                <tbody>
                  {filteredProducts.map((product: any) => {
                    const cat = localCategories.find((c: any) => c.id === product.categoryId);
                    return (
                      <tr key={product.id} className="border-b border-border hover:bg-accent/30 transition-colors" data-testid={`row-local-product-${product.id}`}>
                        <td className="p-4 font-mono text-xs">{product.sku}</td>
                        <td className="p-4 font-medium max-w-xs truncate">{product.name}</td>
                        <td className="p-4 text-xs text-muted-foreground">{cat?.name || "—"}</td>
                        <td className="p-4">${parseFloat(product.basePrice).toFixed(2)}</td>
                        <td className="p-4"><Badge variant={product.stockQty > 100 ? "success" : product.stockQty > 0 ? "warning" : "destructive"}>{product.stockQty}</Badge></td>
                        <td className="p-4 text-xs text-muted-foreground">{product.priceBreaks?.length || 0}</td>
                        <td className="p-4"><Badge variant={product.active ? "default" : "secondary"}>{product.active ? "Active" : "Inactive"}</Badge></td>
                        <td className="p-4"><div className="flex items-center gap-1">
                          <button onClick={() => setProductModal({ open: true, editing: product })} className="p-1.5 rounded-lg hover:bg-accent transition-colors" data-testid={`button-edit-product-${product.id}`}><Pencil className="h-3.5 w-3.5 text-muted-foreground" /></button>
                          <button onClick={() => { if (confirm(`Delete "${product.name}"?`)) deleteLocalProductMutation.mutate(product.id); }} className="p-1.5 rounded-lg hover:bg-accent transition-colors" data-testid={`button-delete-product-${product.id}`}><Trash2 className="h-3.5 w-3.5 text-destructive" /></button>
                        </div></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredProducts.length === 0 && <div className="text-center py-16 text-muted-foreground"><Package className="h-8 w-8 mx-auto mb-2 opacity-30" /><p className="text-sm">No products found</p></div>}
            </div>
          </div>
        )}

        {/* ─── CATEGORIES ──────────────────────────────────────────── */}
        {activeTab === "categories" && (
          <div className="rounded-xl border border-border bg-card">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <div><h2 className="text-lg font-semibold">Categories</h2><p className="text-xs text-muted-foreground mt-0.5">Organize your product catalog</p></div>
              <button onClick={() => setCategoryModal({ open: true })} className="inline-flex items-center gap-1.5 rounded-4xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors" data-testid="button-create-category"><Plus className="h-3.5 w-3.5" /> New Category</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Slug</th>
                  <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Name</th>
                  <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Description</th>
                  <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Products</th>
                  <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Sort</th>
                  <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Actions</th>
                </tr></thead>
                <tbody>
                  {localCategories.map((cat: any) => {
                    const prodCount = localProducts.filter((p: any) => p.categoryId === cat.id).length;
                    return (
                      <tr key={cat.id} className="border-b border-border hover:bg-accent/30 transition-colors" data-testid={`row-local-category-${cat.id}`}>
                        <td className="p-4 font-mono text-xs">{cat.slug}</td>
                        <td className="p-4 font-medium">{cat.name}</td>
                        <td className="p-4 text-xs text-muted-foreground max-w-sm truncate">{cat.description}</td>
                        <td className="p-4"><Badge variant="outline">{prodCount}</Badge></td>
                        <td className="p-4">{cat.sortOrder}</td>
                        <td className="p-4"><div className="flex items-center gap-1">
                          <button onClick={() => setCategoryModal({ open: true, editing: cat })} className="p-1.5 rounded-lg hover:bg-accent transition-colors"><Pencil className="h-3.5 w-3.5 text-muted-foreground" /></button>
                          <button onClick={() => { if (confirm(`Delete "${cat.name}"?`)) deleteCategoryMutation.mutate(cat.id); }} className="p-1.5 rounded-lg hover:bg-accent transition-colors"><Trash2 className="h-3.5 w-3.5 text-destructive" /></button>
                        </div></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── ORDERS ──────────────────────────────────────────── */}
        {activeTab === "orders" && (
          <div className="rounded-xl border border-border bg-card">
            <div className="px-6 py-5 border-b border-border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div><h2 className="text-lg font-semibold">Orders</h2><p className="text-xs text-muted-foreground mt-0.5">Manage customer orders</p></div>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5"><Filter className="h-3.5 w-3.5 text-muted-foreground" /><select value={orderStatusFilter} onChange={(e) => setOrderStatusFilter(e.target.value)} className="h-9 px-3 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-ring/40" data-testid="select-order-filter"><option value="all">All Statuses</option>{ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                  <button onClick={() => downloadCSV(adminOrders.map((o: any) => ({ id: o.id, status: o.status, total: o.total, customer: o.user?.username, company: o.user?.companyName, date: o.createdAt, po: o.poNumber })), "orders")} className="inline-flex items-center gap-1.5 rounded-4xl border border-border px-4 py-2 text-xs font-medium hover:bg-accent/60 transition-colors whitespace-nowrap" data-testid="button-export-orders"><FileDown className="h-3.5 w-3.5" /> Export</button>
                </div>
              </div>
            </div>
            {adminOrdersQuery.isLoading ? <div className="flex items-center justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div> : filteredOrders.length === 0 ? <div className="text-center py-16 text-muted-foreground"><ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-30" /><p className="text-sm">No orders found</p></div> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border bg-muted/50">
                    <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Order</th>
                    <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Customer</th>
                    <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Items</th>
                    <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Total</th>
                    <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Status</th>
                    <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Risk</th>
                    <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Payment</th>
                    <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">OC Sync</th>
                    <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Date</th>
                    <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide"></th>
                  </tr></thead>
                  <tbody>
                    {filteredOrders.map((order: any) => {
                      const orderTotal = parseFloat(order.total || "0");
                      const riskLevel = orderTotal > 500 ? "high" : orderTotal > 100 ? "medium" : "low";
                      return (
                        <tr key={order.id} className="border-b border-border hover:bg-accent/30 transition-colors" data-testid={`row-order-${order.id}`}>
                          <td className="p-4"><div><p className="font-mono text-xs font-medium">{order.id.substring(0, 8).toUpperCase()}</p>{order.poNumber && <p className="text-[10px] text-muted-foreground">PO: {order.poNumber}</p>}</div></td>
                          <td className="p-4"><div><p className="text-sm font-medium">{order.user?.firstName || order.user?.username || "N/A"} {order.user?.lastName || ""}</p><p className="text-[10px] text-muted-foreground">{order.user?.companyName || ""}</p></div></td>
                          <td className="p-4">{order.items?.length || 0}</td>
                          <td className="p-4 font-semibold">${orderTotal.toFixed(2)}</td>
                          <td className="p-4"><select value={order.status} onChange={(e) => updateOrderMutation.mutate({ id: order.id, status: e.target.value })} className="h-7 px-2 rounded-md border border-border bg-background text-xs" data-testid={`select-order-status-${order.id}`}>{ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select></td>
                          <td className="p-4"><Badge variant={riskLevel === "high" ? "destructive" : riskLevel === "medium" ? "warning" : "success"} className="text-[10px]"><Shield className="h-2.5 w-2.5 mr-0.5" />{riskLevel}</Badge></td>
                          <td className="p-4"><Badge variant="outline" className="text-[10px]"><CreditCard className="h-2.5 w-2.5 mr-1" />{(order.paymentMethod || "N/A").replace("_", " ")}</Badge></td>
                          <td className="p-4">{order.ocOrderId ? <Badge variant="default" className="text-[10px]"><Cloud className="h-2.5 w-2.5 mr-1" />Synced</Badge> : <Badge variant="secondary" className="text-[10px]">Local</Badge>}</td>
                          <td className="p-4 text-xs text-muted-foreground">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ""}</td>
                          <td className="p-4"><button onClick={() => setOrderDetail(order)} className="p-1.5 rounded-lg hover:bg-accent transition-colors" data-testid={`button-view-order-${order.id}`}><Eye className="h-3.5 w-3.5 text-muted-foreground" /></button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ─── BUYERS ──────────────────────────────────────────── */}
        {activeTab === "buyers" && (
          <div className="rounded-xl border border-border bg-card">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <div><h2 className="text-lg font-semibold">Buyers</h2><p className="text-xs text-muted-foreground mt-0.5">Registered buyer accounts</p></div>
              <button onClick={() => downloadCSV(adminUsers.map((u: any) => ({ username: u.username, name: `${u.firstName || ""} ${u.lastName || ""}`.trim(), company: u.companyName, email: u.email, role: u.role, locale: u.locale })), "buyers")} className="inline-flex items-center gap-1.5 rounded-4xl border border-border px-4 py-2 text-xs font-medium hover:bg-accent/60 transition-colors"><FileDown className="h-3.5 w-3.5" /> Export</button>
            </div>
            {adminUsersQuery.isLoading ? <div className="flex items-center justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border bg-muted/50">
                    <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Username</th>
                    <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Name</th>
                    <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Company</th>
                    <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Email</th>
                    <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Role</th>
                    <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Locale</th>
                    <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Orders</th>
                    <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">OC Sync</th>
                  </tr></thead>
                  <tbody>
                    {adminUsers.map((user: any) => {
                      const userOrders = adminOrders.filter((o: any) => o.userId === user.id);
                      const totalSpent = userOrders.reduce((s: number, o: any) => s + parseFloat(o.total || "0"), 0);
                      return (
                        <tr key={user.id} className="border-b border-border hover:bg-accent/30 transition-colors" data-testid={`row-user-${user.id}`}>
                          <td className="p-4 font-mono text-xs">{user.username}</td>
                          <td className="p-4 font-medium">{user.firstName || ""} {user.lastName || ""}</td>
                          <td className="p-4">{user.companyName || "—"}</td>
                          <td className="p-4 text-xs text-muted-foreground">{user.email || "—"}</td>
                          <td className="p-4"><Badge variant="outline">{user.role || "buyer"}</Badge></td>
                          <td className="p-4 text-xs"><Globe className="inline h-3 w-3 mr-1 text-muted-foreground" />{user.locale || "en"} / {user.preferredCurrency || "USD"}</td>
                          <td className="p-4"><div><p className="text-xs font-medium">{userOrders.length} orders</p><p className="text-[10px] text-muted-foreground">${totalSpent.toFixed(2)}</p></div></td>
                          <td className="p-4">{user.ocBuyerId ? <Badge variant="default" className="text-[10px]"><Cloud className="h-2.5 w-2.5 mr-1" />Synced</Badge> : <Badge variant="secondary" className="text-[10px]">Local</Badge>}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {adminUsers.length === 0 && <div className="text-center py-16 text-muted-foreground"><Users className="h-8 w-8 mx-auto mb-2 opacity-30" /><p className="text-sm">No users</p></div>}
              </div>
            )}
          </div>
        )}

        {/* ─── OC SYNC ──────────────────────────────────────────── */}
        {activeTab === "oc-sync" && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between mb-3"><span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">API Status</span><Cloud className={`h-4 w-4 ${isConnected ? "text-success" : "text-destructive"}`} /></div>
                <p className="text-lg font-semibold">{isConnected ? "Connected" : "Disconnected"}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between mb-3"><span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">OC Products</span><Package className="h-4 w-4 text-muted-foreground" /></div>
                <p className="text-lg font-semibold">{ocProducts.length}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between mb-3"><span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Price Schedules</span><DollarSign className="h-4 w-4 text-muted-foreground" /></div>
                <p className="text-lg font-semibold">{ocPriceSchedules.length}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between mb-3"><span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">OC Buyers</span><Users className="h-4 w-4 text-muted-foreground" /></div>
                <p className="text-lg font-semibold" data-testid="text-oc-buyers-count">{ocBuyers.length}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between mb-3"><span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">OC Orders</span><ShoppingCart className="h-4 w-4 text-muted-foreground" /></div>
                <p className="text-lg font-semibold" data-testid="text-oc-orders-count">{ocOrders.length}</p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card">
              <div className="px-6 py-5 border-b border-border">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div><h2 className="text-lg font-semibold">OrderCloud Products</h2><p className="text-xs text-muted-foreground mt-0.5">Products synced to your OrderCloud marketplace</p></div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={() => syncMutation.mutate()} disabled={syncMutation.isPending || !isConnected} className="inline-flex items-center gap-1.5 rounded-4xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground disabled:opacity-40 hover:bg-primary/90 transition-colors whitespace-nowrap" data-testid="button-sync-oc">{syncMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />} Sync All</button>
                    <button onClick={() => syncBuyersMutation.mutate()} disabled={syncBuyersMutation.isPending || !isConnected} className="inline-flex items-center gap-1.5 rounded-4xl border border-border px-4 py-2 text-xs font-medium disabled:opacity-40 hover:bg-accent/60 transition-colors whitespace-nowrap" data-testid="button-sync-buyers">{syncBuyersMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Users className="h-3.5 w-3.5" />} Sync Buyers</button>
                    <button onClick={() => syncOrdersMutation.mutate()} disabled={syncOrdersMutation.isPending || !isConnected} className="inline-flex items-center gap-1.5 rounded-4xl border border-border px-4 py-2 text-xs font-medium disabled:opacity-40 hover:bg-accent/60 transition-colors whitespace-nowrap" data-testid="button-sync-orders">{syncOrdersMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShoppingCart className="h-3.5 w-3.5" />} Sync Orders</button>
                    <button onClick={() => pullFromOCMutation.mutate()} disabled={pullFromOCMutation.isPending || !isConnected} className="inline-flex items-center gap-1.5 rounded-4xl border border-border px-4 py-2 text-xs font-medium disabled:opacity-40 hover:bg-accent/60 transition-colors whitespace-nowrap" data-testid="button-pull-oc"><Download className="h-3.5 w-3.5" /> Pull</button>
                    {!deleteConfirm ? <button onClick={() => setDeleteConfirm(true)} disabled={ocProducts.length === 0} className="inline-flex items-center gap-1.5 rounded-4xl border border-destructive/30 px-4 py-2 text-xs font-medium text-destructive disabled:opacity-40 hover:bg-destructive/5 transition-colors whitespace-nowrap"><Trash2 className="h-3.5 w-3.5" /> Delete All</button> : <div className="flex items-center gap-2"><button onClick={() => { deleteAllMutation.mutate(); setDeleteConfirm(false); }} className="inline-flex items-center gap-1.5 rounded-4xl bg-destructive px-4 py-2 text-xs font-medium text-destructive-foreground whitespace-nowrap">Confirm</button><button onClick={() => setDeleteConfirm(false)} className="rounded-4xl border border-border px-3 py-2 text-xs whitespace-nowrap">Cancel</button></div>}
                  </div>
                </div>
              </div>
              {ocProductsQuery.isLoading ? <div className="flex items-center justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div> : ocProducts.length === 0 ? <div className="text-center py-16 text-muted-foreground"><Database className="h-8 w-8 mx-auto mb-2 opacity-30" /><p className="text-sm">No products in OrderCloud</p><p className="text-xs mt-1">Click "Sync All" to push your catalog</p></div> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border bg-muted/50"><th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">ID</th><th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Name</th><th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Active</th><th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Inventory</th><th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Price Schedule</th><th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide"></th></tr></thead>
                    <tbody>
                      {ocProducts.map((product: any) => (
                        <tr key={product.ID} className="border-b border-border hover:bg-accent/30 transition-colors" data-testid={`row-oc-product-${product.ID}`}>
                          <td className="p-4 font-mono text-xs">{product.ID}</td><td className="p-4 font-medium">{product.Name}</td><td className="p-4"><Badge variant={product.Active ? "default" : "secondary"}>{product.Active ? "Active" : "Inactive"}</Badge></td><td className="p-4">{product.Inventory?.Enabled ? `${product.Inventory.QuantityAvailable}` : "N/A"}</td><td className="p-4 font-mono text-xs">{product.DefaultPriceScheduleID || "—"}</td><td className="p-4"><button onClick={() => deleteProductMutation.mutate(product.ID)} disabled={deleteProductMutation.isPending} className="text-xs text-destructive hover:underline">Delete</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {ocCategories.length > 0 && (
              <div className="rounded-xl border border-border bg-card">
                <div className="px-6 py-4 border-b border-border"><h3 className="text-sm font-semibold">OC Categories ({ocCategories.length})</h3></div>
                <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-border bg-muted/50"><th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">ID</th><th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Name</th><th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Active</th><th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Sort</th></tr></thead><tbody>{ocCategories.map((cat: any) => (<tr key={cat.ID} className="border-b border-border hover:bg-accent/30 transition-colors"><td className="p-4 font-mono text-xs">{cat.ID}</td><td className="p-4">{cat.Name}</td><td className="p-4"><Badge variant={cat.Active ? "default" : "secondary"}>{cat.Active ? "Yes" : "No"}</Badge></td><td className="p-4">{cat.ListOrder}</td></tr>))}</tbody></table></div>
              </div>
            )}

            {ocPriceSchedules.length > 0 && (
              <div className="rounded-xl border border-border bg-card">
                <div className="px-6 py-4 border-b border-border"><h3 className="text-sm font-semibold">Price Schedules ({ocPriceSchedules.length})</h3></div>
                <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-border bg-muted/50"><th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">ID</th><th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Name</th><th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Currency</th><th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Price Breaks</th></tr></thead><tbody>{ocPriceSchedules.map((ps: any) => (<tr key={ps.ID} className="border-b border-border hover:bg-accent/30 transition-colors"><td className="p-4 font-mono text-xs">{ps.ID}</td><td className="p-4">{ps.Name}</td><td className="p-4">{ps.Currency || "USD"}</td><td className="p-4"><div className="flex flex-wrap gap-1">{ps.PriceBreaks?.map((pb: any, i: number) => (<Badge key={i} variant="outline">{pb.Quantity}+ @ ${pb.Price?.toFixed(2)}</Badge>))}</div></td></tr>))}</tbody></table></div>
              </div>
            )}

            <div className="rounded-xl border border-border bg-card">
              <div className="px-6 py-4 border-b border-border"><h3 className="text-sm font-semibold">OC Buyer Users ({ocBuyers.length})</h3></div>
              {ocBuyersQuery.isLoading ? <div className="flex items-center justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div> : ocBuyers.length === 0 ? <div className="text-center py-12 text-muted-foreground"><Users className="h-8 w-8 mx-auto mb-2 opacity-30" /><p className="text-sm">No buyer users in OrderCloud</p><p className="text-xs mt-1">Click "Sync Buyers" to push local users</p></div> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border bg-muted/50"><th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">ID</th><th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Username</th><th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Name</th><th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Email</th><th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Active</th></tr></thead>
                    <tbody>
                      {ocBuyers.map((buyer: any) => (
                        <tr key={buyer.ID} className="border-b border-border hover:bg-accent/30 transition-colors" data-testid={`row-oc-buyer-${buyer.ID}`}>
                          <td className="p-4 font-mono text-xs">{buyer.ID}</td><td className="p-4">{buyer.Username}</td><td className="p-4 font-medium">{buyer.FirstName} {buyer.LastName}</td><td className="p-4 text-muted-foreground">{buyer.Email}</td><td className="p-4"><Badge variant={buyer.Active ? "default" : "secondary"}>{buyer.Active ? "Active" : "Inactive"}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border bg-card">
              <div className="px-6 py-4 border-b border-border"><h3 className="text-sm font-semibold">OC Orders ({ocOrders.length})</h3></div>
              {ocOrdersQuery.isLoading ? <div className="flex items-center justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div> : ocOrders.length === 0 ? <div className="text-center py-12 text-muted-foreground"><ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-30" /><p className="text-sm">No orders in OrderCloud</p><p className="text-xs mt-1">Orders sync automatically when placed</p></div> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border bg-muted/50"><th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Order ID</th><th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Status</th><th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Buyer</th><th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Total</th><th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Submitted</th></tr></thead>
                    <tbody>
                      {ocOrders.map((order: any) => (
                        <tr key={order.ID} className="border-b border-border hover:bg-accent/30 transition-colors" data-testid={`row-oc-order-${order.ID}`}>
                          <td className="p-4 font-mono text-xs">{order.ID}</td><td className="p-4"><Badge variant={order.Status === "Open" ? "default" : order.Status === "Completed" ? "success" : "secondary"}>{order.Status}</Badge></td><td className="p-4">{order.FromUserID || "—"}</td><td className="p-4 font-medium">${(order.Total || 0).toFixed(2)}</td><td className="p-4 text-xs text-muted-foreground">{order.DateSubmitted ? new Date(order.DateSubmitted).toLocaleDateString() : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {syncLog.length > 0 && (
              <div className="rounded-xl border border-border bg-card">
                <div className="px-6 py-4 border-b border-border"><h3 className="text-sm font-semibold">Sync Log</h3></div>
                <div className="p-6"><div className="bg-muted rounded-lg p-4 max-h-48 overflow-y-auto font-mono text-xs space-y-0.5">{syncLog.map((line, i) => (<div key={i} className={line.includes("Error") ? "text-destructive" : "text-foreground"}>{line}</div>))}</div></div>
              </div>
            )}
          </div>
        )}

        {/* ─── RELATIONSHIPS ──────────────────────────────────────────── */}
        {activeTab === "relationships" && (
          <div className="rounded-xl border border-border bg-card">
            <div className="px-6 py-5 border-b border-border"><h2 className="text-lg font-semibold">Product Relationships</h2><p className="text-xs text-muted-foreground mt-0.5">Related, alternative, and accessory mappings</p></div>
            {relationshipsQuery.isLoading ? <div className="flex items-center justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div> : relationships.length === 0 ? <div className="text-center py-16 text-muted-foreground"><Link2 className="h-8 w-8 mx-auto mb-2 opacity-30" /><p className="text-sm">No relationships</p></div> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border bg-muted/50"><th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Source</th><th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Type</th><th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Related</th></tr></thead>
                  <tbody>{relationships.map((rel: any, i: number) => (<tr key={i} className="border-b border-border hover:bg-accent/30 transition-colors"><td className="p-4"><p className="font-medium">{rel.sourceProduct?.name || "?"}</p><p className="text-[10px] text-muted-foreground font-mono">{rel.sourceProduct?.sku}</p></td><td className="p-4"><Badge variant={rel.relationshipType === "related" ? "default" : rel.relationshipType === "alternative" ? "outline" : "secondary"}><ArrowRightLeft className="h-2.5 w-2.5 mr-1" />{rel.relationshipType}</Badge></td><td className="p-4"><p className="font-medium">{rel.relatedProduct?.name || "?"}</p><p className="text-[10px] text-muted-foreground font-mono">{rel.relatedProduct?.sku}</p></td></tr>))}</tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ─── AUDIT LOG ──────────────────────────────────────────── */}
        {activeTab === "audit" && (
          <div className="rounded-xl border border-border bg-card">
            <div className="px-6 py-5 border-b border-border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div><h2 className="text-lg font-semibold">Audit Log</h2><p className="text-xs text-muted-foreground mt-0.5">Persistent record of all admin actions</p></div>
                <div className="flex items-center gap-3 flex-wrap">
                  <select value={auditCategoryFilter} onChange={(e) => { setAuditCategoryFilter(e.target.value); queryClient.invalidateQueries({ queryKey: ["/api/admin/audit-log"] }); }} className="h-9 px-3 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-ring/40" data-testid="select-audit-filter"><option value="all">All Categories</option><option value="system">System</option><option value="product">Product</option><option value="order">Order</option><option value="category">Category</option><option value="sync">Sync</option></select>
                  <button onClick={() => downloadCSV(auditEntries.map((e: any) => ({ action: e.action, details: e.details, status: e.status, category: e.category, actor: e.actor, timestamp: e.createdAt })), "audit-log")} className="inline-flex items-center gap-1.5 rounded-4xl border border-border px-4 py-2 text-xs font-medium hover:bg-accent/60 transition-colors whitespace-nowrap"><FileDown className="h-3.5 w-3.5" /> Export</button>
                </div>
              </div>
            </div>
            {auditLogQuery.isLoading ? <div className="flex items-center justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div> : auditEntries.length === 0 ? <div className="text-center py-16 text-muted-foreground"><History className="h-8 w-8 mx-auto mb-2 opacity-30" /><p className="text-sm">No audit entries</p></div> : (
              <div className="divide-y divide-border max-h-[600px] overflow-y-auto" data-testid="audit-log-entries">
                {auditEntries.map((entry: any) => (
                  <div key={entry.id} className="px-6 py-4 flex items-start gap-3">
                    <div className={`p-1.5 rounded-lg mt-0.5 ${entry.status === "success" ? "bg-success/10 text-success" : entry.status === "error" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
                      {entry.status === "success" ? <CheckCircle className="h-3.5 w-3.5" /> : entry.status === "error" ? <XCircle className="h-3.5 w-3.5" /> : <History className="h-3.5 w-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2"><span className="font-medium text-sm">{entry.action}</span><Badge variant={entry.status === "success" ? "success" : entry.status === "error" ? "destructive" : "secondary"}>{entry.status}</Badge><Badge variant="outline" className="text-[10px]">{entry.category}</Badge></div>
                      <p className="text-xs text-muted-foreground mt-0.5">{entry.details}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">{entry.createdAt ? new Date(entry.createdAt).toLocaleString() : ""} — {entry.actor}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── SETTINGS ──────────────────────────────────────────── */}
        {activeTab === "settings" && (
          <div className="space-y-8">
            <div className="rounded-xl border border-border bg-card">
              <div className="px-6 py-5 border-b border-border"><h2 className="text-lg font-semibold">Integration Health</h2><p className="text-xs text-muted-foreground mt-0.5">Status of connected services</p></div>
              <div className="p-6 space-y-3">
                {[
                  { icon: Cloud, label: "Sitecore OrderCloud API", status: isConnected ? "Connected" : "Disconnected", ok: isConnected, detail: statusQuery.data?.message || "" },
                  { icon: Database, label: "PostgreSQL Database", status: "Connected", ok: true, detail: "Local persistence layer active" },
                  { icon: Globe, label: "i18n Translation Engine", status: "Active", ok: true, detail: "EN, DE, ZH — 3 languages" },
                  { icon: Shield, label: "Session Authentication", status: "Active", ok: true, detail: "Express sessions with trust proxy" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-accent/30 transition-colors">
                      <div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-muted"><Icon className="h-4 w-4 text-muted-foreground" /></div><div><span className="text-sm font-medium">{item.label}</span><p className="text-xs text-muted-foreground">{item.detail}</p></div></div>
                      <div className="flex items-center gap-2"><div className={`h-2 w-2 rounded-full ${item.ok ? "bg-success" : "bg-destructive"}`} /><span className="text-xs font-medium">{item.status}</span></div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card">
              <div className="px-6 py-5 border-b border-border flex items-center gap-2"><Bot className="h-4 w-4 text-primary" /><div><h2 className="text-lg font-semibold">AI Configuration</h2><p className="text-xs text-muted-foreground mt-0.5">Toggle AI features on and off across the storefront</p></div></div>
              <div className="p-6 space-y-3">
                {featureFlags.map((flag: any) => (
                  <div key={flag.key} className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-accent/30 transition-colors" data-testid={`feature-flag-${flag.key}`}>
                    <div className="flex-1 min-w-0 mr-4">
                      <p className="text-sm font-medium">{flag.key.replace(/_/g, " ").replace(/\bai\b/g, "AI").replace(/\b\w/g, (c: string) => c.toUpperCase())}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{flag.description}</p>
                    </div>
                    <Toggle
                      checked={flag.enabled}
                      onChange={(enabled) => toggleFeatureFlagMutation.mutate({ key: flag.key, enabled })}
                      disabled={toggleFeatureFlagMutation.isPending}
                    />
                  </div>
                ))}
                {featureFlags.length === 0 && <div className="text-center py-8 text-muted-foreground text-sm">No feature flags configured</div>}

                <div className="rounded-xl border border-border p-5 bg-muted/30 mt-4">
                  <div className="flex items-center gap-2 mb-3"><Shield className="h-4 w-4 text-primary" /><p className="text-sm font-semibold">AI Transparency & Governance</p></div>
                  <ul className="text-xs text-muted-foreground space-y-1.5">
                    <li>All AI-generated outputs are clearly labeled with an indicator</li>
                    <li>AI actions are recorded in the persistent audit log</li>
                    <li>Toggles above immediately affect the storefront — changes are persisted to the database</li>
                    <li>Data sources: browsing behavior, purchase history, user profile attributes</li>
                    <li>AI features can be enabled/disabled per feature via admin controls above</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card">
              <div className="px-6 py-5 border-b border-border flex items-center gap-2"><Bell className="h-4 w-4 text-primary" /><h2 className="text-lg font-semibold">Notification Templates</h2></div>
              <div className="p-6 space-y-3">
                {[
                  { event: "Order Received", channel: "Email", template: "order_confirmation", active: true },
                  { event: "Order Shipped", channel: "Email", template: "shipment_notification", active: true },
                  { event: "Order Delivered", channel: "Email", template: "delivery_confirmation", active: true },
                  { event: "Order Cancelled", channel: "Email", template: "cancellation_notice", active: true },
                  { event: "Backorder Alert", channel: "Email", template: "backorder_notification", active: true },
                  { event: "Low Stock Alert", channel: "Dashboard", template: "low_stock_alert", active: true },
                ].map((n) => (
                  <div key={n.event} className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-accent/30 transition-colors">
                    <div className="flex items-center gap-3"><Bell className="h-3.5 w-3.5 text-muted-foreground" /><div><p className="text-sm font-medium">{n.event}</p><p className="text-xs text-muted-foreground">{n.channel} — {n.template}</p></div></div>
                    <Badge variant={n.active ? "success" : "secondary"}>{n.active ? "Active" : "Inactive"}</Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card">
              <div className="px-6 py-5 border-b border-border"><h2 className="text-lg font-semibold">Export Center</h2><p className="text-xs text-muted-foreground mt-0.5">Download data as CSV files</p></div>
              <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Products", action: () => downloadCSV(localProducts.map((p: any) => ({ sku: p.sku, name: p.name, price: p.basePrice, stock: p.stockQty, active: p.active })), "products") },
                  { label: "Orders", action: () => downloadCSV(adminOrders.map((o: any) => ({ id: o.id, status: o.status, total: o.total, customer: o.user?.username, company: o.user?.companyName, date: o.createdAt })), "orders") },
                  { label: "Buyers", action: () => downloadCSV(adminUsers.map((u: any) => ({ username: u.username, company: u.companyName, email: u.email, role: u.role })), "buyers") },
                  { label: "Audit Log", action: () => downloadCSV(auditEntries.map((e: any) => ({ action: e.action, details: e.details, status: e.status, timestamp: e.createdAt })), "audit-log") },
                ].map((exp) => (
                  <button key={exp.label} onClick={() => { exp.action(); toast({ title: `${exp.label} Exported` }); }} className="flex items-center gap-2.5 p-3.5 rounded-xl border border-border text-sm hover:bg-accent/60 transition-colors"><FileDown className="h-4 w-4 text-muted-foreground" />{exp.label}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        </div>
      </main>

      {productModal.open && <ProductModal editing={productModal.editing} categories={localCategories} onClose={() => setProductModal({ open: false })} onSave={(data: any) => saveLocalProductMutation.mutate(data)} isPending={saveLocalProductMutation.isPending} />}
      {categoryModal.open && <CategoryModal editing={categoryModal.editing} onClose={() => setCategoryModal({ open: false })} onSave={(data: any) => saveCategoryMutation.mutate(data)} isPending={saveCategoryMutation.isPending} />}
      {orderDetail && <OrderDetailModal order={orderDetail} onClose={() => setOrderDetail(null)} onUpdateStatus={(status: string, trackingNumber?: string) => { updateOrderMutation.mutate({ id: orderDetail.id, status, trackingNumber }); setOrderDetail(null); }} />}
      <ToastContainer toasts={toasts} />
    </div>
  );
}

function ProductModal({ editing, categories, onClose, onSave, isPending }: { editing?: any; categories: any[]; onClose: () => void; onSave: (data: any) => void; isPending: boolean }) {
  const [form, setForm] = useState({ name: editing?.name || "", sku: editing?.sku || "", description: editing?.description || "", categoryId: editing?.categoryId || "", basePrice: editing?.basePrice ? parseFloat(editing.basePrice).toString() : "", active: editing?.active ?? true, industry: editing?.industry || "", application: editing?.application || "", minOrderQty: editing?.minOrderQty?.toString() || "1", leadTimeDays: editing?.leadTimeDays?.toString() || "5", inStock: editing?.inStock ?? true, stockQty: editing?.stockQty?.toString() || "100", imageUrl: editing?.imageUrl || "" });
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave({ ...(editing?.id ? { id: editing.id } : {}), name: form.name, sku: form.sku, description: form.description || undefined, categoryId: form.categoryId || undefined, basePrice: parseFloat(form.basePrice).toFixed(4), active: form.active, industry: form.industry || undefined, application: form.application || undefined, minOrderQty: parseInt(form.minOrderQty) || 1, leadTimeDays: parseInt(form.leadTimeDays) || 5, inStock: form.inStock, stockQty: parseInt(form.stockQty) || 0, imageUrl: form.imageUrl || undefined }); };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()} data-testid="modal-product">
        <div className="px-6 py-5 border-b border-border flex items-center justify-between"><h3 className="text-lg font-semibold">{editing ? "Edit Product" : "New Product"}</h3><button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent transition-colors"><X className="h-4 w-4" /></button></div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs font-medium text-muted-foreground block mb-1.5">Name *</label><input type="text" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} required className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/40" data-testid="input-product-name" /></div>
            <div><label className="text-xs font-medium text-muted-foreground block mb-1.5">SKU *</label><input type="text" value={form.sku} onChange={(e) => setForm(f => ({ ...f, sku: e.target.value }))} required disabled={!!editing} className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:opacity-50" data-testid="input-product-sku" /></div>
          </div>
          <div><label className="text-xs font-medium text-muted-foreground block mb-1.5">Description</label><textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} className="w-full h-20 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/40 resize-none" data-testid="input-product-description" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs font-medium text-muted-foreground block mb-1.5">Category</label><select value={form.categoryId} onChange={(e) => setForm(f => ({ ...f, categoryId: e.target.value }))} className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm" data-testid="select-product-category"><option value="">None</option>{categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div><label className="text-xs font-medium text-muted-foreground block mb-1.5">Base Price *</label><input type="number" step="0.01" value={form.basePrice} onChange={(e) => setForm(f => ({ ...f, basePrice: e.target.value }))} required className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/40" data-testid="input-product-price" /></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="text-xs font-medium text-muted-foreground block mb-1.5">Stock</label><input type="number" value={form.stockQty} onChange={(e) => setForm(f => ({ ...f, stockQty: e.target.value }))} className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm" data-testid="input-product-stock" /></div>
            <div><label className="text-xs font-medium text-muted-foreground block mb-1.5">Min Order</label><input type="number" value={form.minOrderQty} onChange={(e) => setForm(f => ({ ...f, minOrderQty: e.target.value }))} className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm" /></div>
            <div><label className="text-xs font-medium text-muted-foreground block mb-1.5">Lead Time</label><input type="number" value={form.leadTimeDays} onChange={(e) => setForm(f => ({ ...f, leadTimeDays: e.target.value }))} className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs font-medium text-muted-foreground block mb-1.5">Industry</label><input type="text" value={form.industry} onChange={(e) => setForm(f => ({ ...f, industry: e.target.value }))} className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm" /></div>
            <div><label className="text-xs font-medium text-muted-foreground block mb-1.5">Application</label><input type="text" value={form.application} onChange={(e) => setForm(f => ({ ...f, application: e.target.value }))} className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm" /></div>
          </div>
          <div className="flex items-center gap-6"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.active} onChange={(e) => setForm(f => ({ ...f, active: e.target.checked }))} className="accent-primary" /> Active</label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.inStock} onChange={(e) => setForm(f => ({ ...f, inStock: e.target.checked }))} className="accent-primary" /> In Stock</label></div>
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={onClose} className="px-5 py-2.5 rounded-4xl border border-border text-sm hover:bg-accent/60 transition-colors">Cancel</button><button type="submit" disabled={isPending} className="px-5 py-2.5 rounded-4xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors" data-testid="button-save-product">{isPending ? "Saving..." : "Save Product"}</button></div>
        </form>
      </div>
    </div>
  );
}

function CategoryModal({ editing, onClose, onSave, isPending }: { editing?: any; onClose: () => void; onSave: (data: any) => void; isPending: boolean }) {
  const [form, setForm] = useState({ name: editing?.name || "", slug: editing?.slug || "", description: editing?.description || "", sortOrder: editing?.sortOrder?.toString() || "0" });
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave({ ...(editing?.id ? { id: editing.id } : {}), name: form.name, slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), description: form.description || undefined, sortOrder: parseInt(form.sortOrder) || 0 }); };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()} data-testid="modal-category">
        <div className="px-6 py-5 border-b border-border flex items-center justify-between"><h3 className="text-lg font-semibold">{editing ? "Edit Category" : "New Category"}</h3><button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent transition-colors"><X className="h-4 w-4" /></button></div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div><label className="text-xs font-medium text-muted-foreground block mb-1.5">Name *</label><input type="text" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} required className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/40" data-testid="input-category-name" /></div>
          <div><label className="text-xs font-medium text-muted-foreground block mb-1.5">Slug</label><input type="text" value={form.slug} onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="auto-generated" className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/40" data-testid="input-category-slug" /></div>
          <div><label className="text-xs font-medium text-muted-foreground block mb-1.5">Description</label><textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} className="w-full h-16 px-3 py-2 rounded-lg border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring/40" data-testid="input-category-description" /></div>
          <div><label className="text-xs font-medium text-muted-foreground block mb-1.5">Sort Order</label><input type="number" value={form.sortOrder} onChange={(e) => setForm(f => ({ ...f, sortOrder: e.target.value }))} className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm" /></div>
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={onClose} className="px-5 py-2.5 rounded-4xl border border-border text-sm hover:bg-accent/60 transition-colors">Cancel</button><button type="submit" disabled={isPending} className="px-5 py-2.5 rounded-4xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors" data-testid="button-save-category">{isPending ? "Saving..." : "Save Category"}</button></div>
        </form>
      </div>
    </div>
  );
}

function OrderDetailModal({ order, onClose, onUpdateStatus }: { order: any; onClose: () => void; onUpdateStatus: (status: string, tracking?: string) => void }) {
  const [status, setStatus] = useState(order.status || "pending");
  const [tracking, setTracking] = useState(order.trackingNumber || "");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()} data-testid="modal-order-detail">
        <div className="px-6 py-5 border-b border-border flex items-center justify-between"><div><h3 className="text-lg font-semibold">Order {order.id.substring(0, 8).toUpperCase()}</h3><p className="text-xs text-muted-foreground">{order.user?.companyName || order.user?.username || "Unknown"} — {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ""}</p></div><button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent transition-colors"><X className="h-4 w-4" /></button></div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs font-medium text-muted-foreground block mb-1.5">Status</label><select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm" data-testid="select-modal-status">{ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
            <div><label className="text-xs font-medium text-muted-foreground block mb-1.5">Tracking Number</label><input type="text" value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="Enter tracking number" className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/40" data-testid="input-tracking" /></div>
          </div>
          <div><h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Items</h4><div className="rounded-xl border border-border divide-y divide-border">{order.items?.map((item: any) => (<div key={item.id} className="flex items-center justify-between px-4 py-3"><div><p className="text-sm font-medium">{item.product?.name || "Product"}</p><p className="text-[10px] text-muted-foreground font-mono">{item.product?.sku}</p></div><div className="text-right text-sm"><p>{item.quantity} x ${parseFloat(item.unitPrice).toFixed(2)}</p><p className="font-semibold">${parseFloat(item.totalPrice).toFixed(2)}</p></div></div>))}</div></div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {order.shippingAddress && <div><p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Shipping Address</p><p className="whitespace-pre-wrap">{order.shippingAddress}</p></div>}
            {order.poNumber && <div><p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">PO Number</p><p className="font-mono">{order.poNumber}</p></div>}
            {order.shippingMethod && <div><p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Shipping</p><p className="capitalize">{order.shippingMethod} (${parseFloat(order.shippingCost || "0").toFixed(2)})</p></div>}
            {order.paymentMethod && <div><p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Payment</p><p className="capitalize">{order.paymentMethod.replace("_", " ")}</p></div>}
          </div>
          <div className="rounded-xl border border-border p-4 space-y-1.5 text-sm">
            {order.shippingCost && parseFloat(order.shippingCost) > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>${parseFloat(order.shippingCost).toFixed(2)}</span></div>}
            {order.taxAmount && parseFloat(order.taxAmount) > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>${parseFloat(order.taxAmount).toFixed(2)}</span></div>}
            {order.discountAmount && parseFloat(order.discountAmount) > 0 && <div className="flex justify-between text-success"><span>Discount ({order.discountCode})</span><span>-${parseFloat(order.discountAmount).toFixed(2)}</span></div>}
            <div className="flex justify-between font-semibold pt-1.5 border-t border-border"><span>Total</span><span>${parseFloat(order.total || "0").toFixed(2)}</span></div>
          </div>
          <div className="flex justify-end gap-3"><button type="button" onClick={onClose} className="px-5 py-2.5 rounded-4xl border border-border text-sm hover:bg-accent/60 transition-colors">Close</button><button onClick={() => onUpdateStatus(status, tracking)} className="px-5 py-2.5 rounded-4xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors" data-testid="button-update-order">Update Order</button></div>
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
