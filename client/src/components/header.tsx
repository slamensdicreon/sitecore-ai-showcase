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
import { ShoppingCart, User, Search, Menu, Package, ListChecks, LogOut, ChevronDown, Globe, Zap, Plus, Briefcase, Wrench } from "lucide-react";
import { useState } from "react";
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

export function Header() {
  const { user, logout, setUser } = useAuth();
  const { locale, currency, setLocale, setCurrency, t } = useI18n();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [quickAddSku, setQuickAddSku] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast } = useToast();

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
    onError: () => {
      toast({ title: "Part number not found", description: "Please check the SKU and try again", variant: "destructive" });
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

  const navItems = [
    { href: "/products", label: t("nav.products"), testId: "nav-products" },
    { href: "/products?categorySlug=connectors", label: t("nav.connectors"), testId: "nav-connectors" },
    { href: "/products?categorySlug=sensors", label: t("nav.sensors"), testId: "nav-sensors" },
    { href: "/products?categorySlug=relays", label: t("nav.relays"), testId: "nav-relays" },
    { href: "/products?categorySlug=wire-cable", label: t("nav.wireCable"), testId: "nav-wire-cable" },
    { href: "/products?categorySlug=circuit-protection", label: t("nav.circuitProtection"), testId: "nav-circuit-protection" },
    { href: "/products?categorySlug=terminal-blocks", label: t("nav.terminalBlocks"), testId: "nav-terminal-blocks" },
  ];

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
              <Menu className="h-5 w-5" />
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

        <nav className="hidden lg:flex items-center gap-1 pb-2 -mt-1">
          {navItems.map((item) => (
            <Link key={item.testId} href={item.href}>
              <Button variant="ghost" size="sm" className="text-xs font-heading" data-testid={item.testId}>
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t bg-background px-4 py-3 space-y-2">
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
          {navItems.slice(1).map((item) => (
            <Link key={item.testId} href={item.href} onClick={() => setMobileMenuOpen(false)}>
              <div className="py-2 text-sm font-heading">{item.label}</div>
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
