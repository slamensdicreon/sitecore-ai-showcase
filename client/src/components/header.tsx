import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useI18n, type Locale, type Currency } from "@/lib/i18n";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  ShoppingCart, User, Search, Menu, Package, ListChecks, LogOut,
  ChevronDown, ChevronRight, Globe, Plus, Briefcase, Wrench, X,
  BatteryCharging, Server, Factory, Lightbulb, LayoutGrid, Layers
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import type { CartItem, Product } from "@shared/schema";

function TELogo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 48" className={className} aria-label="TE Connectivity">
      <rect x="0" y="0" width="48" height="48" rx="4" fill="#f28d00" />
      <text x="24" y="34" textAnchor="middle" fontFamily="Montserrat, Arial, sans-serif" fontWeight="800" fontStyle="italic" fontSize="28" fill="white">TE</text>
      <line x1="56" y1="14" x2="110" y2="14" stroke="#f28d00" strokeWidth="3" strokeLinecap="round" />
      <line x1="56" y1="24" x2="100" y2="24" stroke="#2e4957" strokeWidth="3" strokeLinecap="round" />
      <line x1="56" y1="34" x2="90" y2="34" stroke="#167a87" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

const LOCALE_LABELS: Record<Locale, string> = { en: "EN", de: "DE", zh: "中文" };
const CURRENCY_LABELS: Record<Currency, string> = { USD: "USD", EUR: "EUR", CNY: "CNY" };

const solutionsMenu = [
  {
    slug: "transportation",
    label: "Transportation",
    description: "EV powertrains, autonomous systems, and next-gen vehicle architectures",
    icon: BatteryCharging,
    color: "#f28d00",
  },
  {
    slug: "industrial",
    label: "Industrial",
    description: "Factory automation, robotics, energy management, and harsh-environment connectivity",
    icon: Factory,
    color: "#2e4957",
  },
  {
    slug: "communications",
    label: "Communications",
    description: "Data center infrastructure, 5G networks, and high-speed signal integrity",
    icon: Server,
    color: "#167a87",
  },
];

function SolutionsMegaMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute left-0 right-0 top-full z-50 border-b bg-background shadow-lg"
          data-testid="megamenu-solutions"
        >
          <div className="max-w-[1400px] mx-auto px-4 py-6">
            <div className="grid grid-cols-3 gap-4">
              {solutionsMenu.map((item) => (
                <Link
                  key={item.slug}
                  href={`/solutions/${item.slug}`}
                  onClick={onClose}
                >
                  <div
                    className="group flex items-start gap-4 rounded-lg p-4 hover:bg-muted/60 transition-colors cursor-pointer"
                    data-testid={`megamenu-${item.slug}`}
                  >
                    <div
                      className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${item.color}12` }}
                    >
                      <item.icon className="h-5 w-5" style={{ color: item.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-semibold text-sm">{item.label}</span>
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Discover how TE solves challenges across industries
              </p>
              <Link href="/applications" onClick={onClose}>
                <span className="text-xs font-heading font-medium text-[#167a87] hover:text-[#167a87]/80 flex items-center gap-1 transition-colors">
                  View All Applications <ChevronRight className="h-3 w-3" />
                </span>
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Header() {
  const { user, logout, setUser } = useAuth();
  const { locale, currency, setLocale, setCurrency, t } = useI18n();
  const [location, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [quickAddSku, setQuickAddSku] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [mobileSolutionsExpanded, setMobileSolutionsExpanded] = useState(false);
  const { toast } = useToast();
  const solutionsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { data: cartItems } = useQuery<(CartItem & { product?: Product })[]>({
    queryKey: ["/api/cart"],
    enabled: !!user,
  });

  const cartCount = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const quickAddMutation = useMutation({
    mutationFn: async (sku: string) => {
      const res = await fetch(`/api/products/sku/${encodeURIComponent(sku)}`);
      if (!res.ok) throw new Error("Part number not found");
      const product = await res.json();
      await apiRequest("POST", "/api/cart", { productId: product.id, quantity: 1 });
      return product;
    },
    onSuccess: (product: Product) => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({ title: t("product.addToCart"), description: `1x ${product.name} (${product.sku})` });
      setQuickAddSku("");
    },
    onError: (err: Error) => {
      const msg = err.message.includes("401") ? "Please sign in to add items to your cart" : "Please check the SKU and try again";
      toast({ title: err.message.includes("401") ? "Not signed in" : "Part number not found", description: msg, variant: "destructive" });
    },
  });

  const personaMutation = useMutation({
    mutationFn: (role: string) => apiRequest("PATCH", "/api/users/preferences", { role }),
    onSuccess: async (res) => {
      const data = await res.json();
      setUser(data);
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickAddSku.trim() && user) {
      quickAddMutation.mutate(quickAddSku.trim());
    }
  };

  const closeSolutionsMenu = useCallback(() => setSolutionsOpen(false), []);

  const handleSolutionsEnter = useCallback(() => {
    if (solutionsTimeoutRef.current) clearTimeout(solutionsTimeoutRef.current);
    setSolutionsOpen(true);
  }, []);

  const handleSolutionsLeave = useCallback(() => {
    solutionsTimeoutRef.current = setTimeout(() => setSolutionsOpen(false), 200);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setSolutionsOpen(false);
    setMobileSolutionsExpanded(false);
  }, [location]);

  const isActive = (path: string) => {
    if (path === "/products") return location === "/products" || location.startsWith("/products/");
    if (path === "/applications") return location === "/applications" || location.startsWith("/applications/");
    if (path === "/innovation") return location === "/innovation";
    if (path.startsWith("/solutions")) return location.startsWith("/solutions");
    return location === path;
  };

  const navLinkClasses = (path: string) =>
    `text-xs font-heading font-medium px-3 py-1.5 rounded-md transition-colors ${
      isActive(path)
        ? "bg-[#f28d00]/10 text-[#f28d00]"
        : "text-foreground/80 hover:text-foreground hover:bg-muted/60"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b bg-background">
      <div className="bg-[#2e4957] text-white">
        <div className="max-w-[1400px] mx-auto px-4 flex items-center justify-between gap-2 h-8 text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="hidden sm:inline opacity-90 font-heading tracking-wide text-[10px] uppercase">{t("tagline")}</span>
            <span className="opacity-40">|</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity" data-testid="button-locale-currency">
                  <Globe className="h-3 w-3" />
                  <span>{LOCALE_LABELS[locale]} / {CURRENCY_LABELS[currency]}</span>
                  <ChevronDown className="h-2.5 w-2.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuLabel className="text-xs">Language</DropdownMenuLabel>
                {(["en", "de", "zh"] as Locale[]).map((l) => (
                  <DropdownMenuItem
                    key={l}
                    onClick={() => setLocale(l)}
                    className={locale === l ? "bg-accent" : ""}
                    data-testid={`menu-locale-${l}`}
                  >
                    {l === "en" ? "English" : l === "de" ? "Deutsch" : "中文"}
                    {locale === l && <span className="ml-auto text-primary">✓</span>}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs">Currency</DropdownMenuLabel>
                {(["USD", "EUR", "CNY"] as Currency[]).map((c) => (
                  <DropdownMenuItem
                    key={c}
                    onClick={() => setCurrency(c)}
                    className={currency === c ? "bg-accent" : ""}
                    data-testid={`menu-currency-${c}`}
                  >
                    {c === "USD" ? "$ USD" : c === "EUR" ? "€ EUR" : "¥ CNY"}
                    {currency === c && <span className="ml-auto text-primary">✓</span>}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            {user ? (
              <span className="opacity-80">{user.companyName || user.username}</span>
            ) : (
              <Link href="/login" className="opacity-80 hover:opacity-100 transition-opacity" data-testid="link-login-top">
                {t("auth.signIn")} / {t("auth.register")}
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4">
        <div className="flex items-center justify-between gap-4 h-16">
          <div className="flex items-center gap-6">
            <button
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link href="/" data-testid="link-home-logo">
              <div className="flex items-center gap-2.5">
                <TELogo className="h-10 w-auto" />
                <div className="hidden sm:block">
                  <div className="font-heading font-semibold text-sm leading-tight text-[#424241] dark:text-foreground">connectivity</div>
                  <div className="text-[10px] text-muted-foreground leading-tight">OrderCloud B2B Demo</div>
                </div>
              </div>
            </Link>
          </div>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder={locale === "de" ? "Suche nach Teilenummer, Stichwort..." : locale === "zh" ? "按零件号、关键词搜索..." : "Search by part number, keyword..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-4 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                data-testid="input-search"
              />
            </div>
          </form>

          {user && (
            <form onSubmit={handleQuickAdd} className="hidden lg:flex items-center gap-1.5">
              <div className="relative">
                <Plus className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t("product.quickAdd")}
                  value={quickAddSku}
                  onChange={(e) => setQuickAddSku(e.target.value)}
                  className="h-8 pl-7 pr-2 w-40 rounded-md border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-[#f28d00]/30"
                  data-testid="input-quick-add"
                />
              </div>
              <Button
                type="submit"
                size="sm"
                variant="outline"
                className="h-8 text-xs px-2"
                disabled={quickAddMutation.isPending || !quickAddSku.trim()}
                data-testid="button-quick-add"
              >
                {quickAddMutation.isPending ? "..." : t("product.addToCart").split(" ")[0]}
              </Button>
            </form>
          )}

          <div className="flex items-center gap-1">
            {user ? (
              <>
                <Link href="/cart">
                  <Button variant="ghost" size="icon" className="relative" data-testid="button-cart">
                    <ShoppingCart className="h-5 w-5" />
                    {cartCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center text-[10px] px-1">
                        {cartCount}
                      </Badge>
                    )}
                  </Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-1" data-testid="button-user-menu">
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline text-xs">{user.firstName || user.username}</span>
                      {user.role && (
                        <Badge variant="secondary" className="text-[9px] ml-1">
                          {user.role === "engineer" ? <Wrench className="h-2.5 w-2.5 mr-0.5" /> : <Briefcase className="h-2.5 w-2.5 mr-0.5" />}
                          {user.role === "engineer" ? t("persona.engineer") : t("persona.purchaser")}
                        </Badge>
                      )}
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                      {user.companyName && <div className="font-medium text-foreground">{user.companyName}</div>}
                      {user.email && <div>{user.email}</div>}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-xs">Persona</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => personaMutation.mutate("engineer")}
                      className={user.role === "engineer" ? "bg-accent" : ""}
                      data-testid="menu-persona-engineer"
                    >
                      <Wrench className="h-4 w-4 mr-2" />
                      {t("persona.engineer")}
                      {user.role === "engineer" && <span className="ml-auto text-primary">✓</span>}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => personaMutation.mutate("purchaser")}
                      className={user.role === "purchaser" ? "bg-accent" : ""}
                      data-testid="menu-persona-purchaser"
                    >
                      <Briefcase className="h-4 w-4 mr-2" />
                      {t("persona.purchaser")}
                      {user.role === "purchaser" && <span className="ml-auto text-primary">✓</span>}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/orders")} data-testid="menu-orders">
                      <Package className="h-4 w-4 mr-2" />
                      {t("orders.title")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/parts-lists")} data-testid="menu-parts-lists">
                      <ListChecks className="h-4 w-4 mr-2" />
                      {locale === "de" ? "Meine Stücklisten" : locale === "zh" ? "我的零件清单" : "My Parts Lists"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => logout()} data-testid="menu-logout">
                      <LogOut className="h-4 w-4 mr-2" />
                      {t("auth.signOut")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link href="/login">
                <Button size="sm" data-testid="button-sign-in">{t("auth.signIn")}</Button>
              </Link>
            )}
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-1 pb-2 -mt-1 relative">
          <div
            className="relative"
            onMouseEnter={handleSolutionsEnter}
            onMouseLeave={handleSolutionsLeave}
          >
            <button
              className={`flex items-center gap-1 ${navLinkClasses("/solutions")}`}
              onClick={() => setSolutionsOpen(!solutionsOpen)}
              data-testid="nav-solutions"
            >
              <Layers className="h-3.5 w-3.5 mr-0.5" />
              {t("nav.solutions")}
              <ChevronDown className={`h-3 w-3 transition-transform ${solutionsOpen ? "rotate-180" : ""}`} />
            </button>
          </div>

          <Link href="/applications">
            <button className={navLinkClasses("/applications")} data-testid="nav-applications">
              <LayoutGrid className="h-3.5 w-3.5 mr-1 inline-block" />
              {t("nav.applications")}
            </button>
          </Link>

          <Link href="/products">
            <button className={navLinkClasses("/products")} data-testid="nav-products">
              {t("nav.products")}
            </button>
          </Link>

          <Link href="/innovation">
            <button className={navLinkClasses("/innovation")} data-testid="nav-innovation">
              <Lightbulb className="h-3.5 w-3.5 mr-1 inline-block" />
              {t("nav.innovation")}
            </button>
          </Link>
        </nav>
      </div>

      <div
        onMouseEnter={handleSolutionsEnter}
        onMouseLeave={handleSolutionsLeave}
      >
        <SolutionsMegaMenu open={solutionsOpen} onClose={closeSolutionsMenu} />
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="lg:hidden border-t bg-background overflow-hidden"
            data-testid="mobile-menu"
          >
            <div className="px-4 py-3 space-y-1">
              <form onSubmit={handleSearch} className="mb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="search"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-9 pl-9 pr-4 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    data-testid="input-search-mobile"
                  />
                </div>
              </form>

              <div>
                <button
                  className="w-full flex items-center justify-between py-2.5 px-3 text-sm font-heading font-medium rounded-md hover:bg-muted/60 transition-colors"
                  onClick={() => setMobileSolutionsExpanded(!mobileSolutionsExpanded)}
                  data-testid="mobile-nav-solutions"
                >
                  <span className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-[#167a87]" />
                    {t("nav.solutions")}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${mobileSolutionsExpanded ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {mobileSolutionsExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-6 pb-2 space-y-1">
                        {solutionsMenu.map((item) => (
                          <Link
                            key={item.slug}
                            href={`/solutions/${item.slug}`}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <div
                              className={`flex items-center gap-3 py-2 px-3 rounded-md text-sm transition-colors ${
                                location === `/solutions/${item.slug}`
                                  ? "bg-[#f28d00]/10 text-[#f28d00]"
                                  : "hover:bg-muted/60"
                              }`}
                              data-testid={`mobile-nav-solution-${item.slug}`}
                            >
                              <item.icon className="h-4 w-4" style={{ color: item.color }} />
                              <div>
                                <div className="font-medium">{item.label}</div>
                                <div className="text-[11px] text-muted-foreground">{item.description}</div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link href="/applications" onClick={() => setMobileMenuOpen(false)}>
                <div
                  className={`flex items-center gap-2 py-2.5 px-3 text-sm font-heading font-medium rounded-md transition-colors ${
                    isActive("/applications") ? "bg-[#f28d00]/10 text-[#f28d00]" : "hover:bg-muted/60"
                  }`}
                  data-testid="mobile-nav-applications"
                >
                  <LayoutGrid className="h-4 w-4 text-[#f28d00]" />
                  {t("nav.applications")}
                </div>
              </Link>

              <Link href="/products" onClick={() => setMobileMenuOpen(false)}>
                <div
                  className={`flex items-center gap-2 py-2.5 px-3 text-sm font-heading font-medium rounded-md transition-colors ${
                    isActive("/products") ? "bg-[#f28d00]/10 text-[#f28d00]" : "hover:bg-muted/60"
                  }`}
                  data-testid="mobile-nav-products"
                >
                  <Package className="h-4 w-4 text-[#2e4957]" />
                  {t("nav.products")}
                </div>
              </Link>

              <Link href="/innovation" onClick={() => setMobileMenuOpen(false)}>
                <div
                  className={`flex items-center gap-2 py-2.5 px-3 text-sm font-heading font-medium rounded-md transition-colors ${
                    isActive("/innovation") ? "bg-[#f28d00]/10 text-[#f28d00]" : "hover:bg-muted/60"
                  }`}
                  data-testid="mobile-nav-innovation"
                >
                  <Lightbulb className="h-4 w-4 text-[#167a87]" />
                  {t("nav.innovation")}
                </div>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
