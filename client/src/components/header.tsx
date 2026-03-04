import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ShoppingCart, User, Search, Menu, Package, ListChecks, LogOut, ChevronDown, Settings } from "lucide-react";
import { useState } from "react";
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

export function Header() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: cartItems } = useQuery<(CartItem & { product?: Product })[]>({
    queryKey: ["/api/cart"],
    enabled: !!user,
  });

  const cartCount = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background">
      <div className="bg-[#2e4957] text-white">
        <div className="max-w-[1400px] mx-auto px-4 flex items-center justify-between gap-2 h-8 text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="hidden sm:inline opacity-90 font-heading tracking-wide text-[10px] uppercase">Every Connection Counts</span>
            <span className="opacity-40">|</span>
            <span className="opacity-80">EN / USD</span>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            {user ? (
              <span className="opacity-80">{user.companyName || user.username}</span>
            ) : (
              <Link href="/login" className="opacity-80 hover:opacity-100 transition-opacity" data-testid="link-login-top">
                Sign In / Register
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

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search by part number, keyword, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-4 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                data-testid="input-search"
              />
            </div>
          </form>

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
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => navigate("/orders")} data-testid="menu-orders">
                      <Package className="h-4 w-4 mr-2" />
                      My Orders
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/parts-lists")} data-testid="menu-parts-lists">
                      <ListChecks className="h-4 w-4 mr-2" />
                      My Parts Lists
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/admin")} data-testid="menu-admin">
                      <Settings className="h-4 w-4 mr-2" />
                      OrderCloud Admin
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => logout()} data-testid="menu-logout">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link href="/login">
                <Button size="sm" data-testid="button-sign-in">Sign In</Button>
              </Link>
            )}
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-1 pb-2 -mt-1">
          <Link href="/products">
            <Button variant="ghost" size="sm" className="text-xs font-heading" data-testid="nav-products">
              All Products
            </Button>
          </Link>
          <Link href="/products?categorySlug=connectors">
            <Button variant="ghost" size="sm" className="text-xs font-heading" data-testid="nav-connectors">
              Connectors
            </Button>
          </Link>
          <Link href="/products?categorySlug=sensors">
            <Button variant="ghost" size="sm" className="text-xs font-heading" data-testid="nav-sensors">
              Sensors
            </Button>
          </Link>
          <Link href="/products?categorySlug=relays">
            <Button variant="ghost" size="sm" className="text-xs font-heading" data-testid="nav-relays">
              Relays
            </Button>
          </Link>
          <Link href="/products?categorySlug=wire-cable">
            <Button variant="ghost" size="sm" className="text-xs font-heading" data-testid="nav-wire-cable">
              Wire & Cable
            </Button>
          </Link>
          <Link href="/products?categorySlug=circuit-protection">
            <Button variant="ghost" size="sm" className="text-xs font-heading" data-testid="nav-circuit-protection">
              Circuit Protection
            </Button>
          </Link>
          <Link href="/products?categorySlug=terminal-blocks">
            <Button variant="ghost" size="sm" className="text-xs font-heading" data-testid="nav-terminal-blocks">
              Terminal Blocks
            </Button>
          </Link>
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
          {["connectors", "sensors", "relays", "wire-cable", "circuit-protection", "terminal-blocks"].map((slug) => (
            <Link key={slug} href={`/products?categorySlug=${slug}`} onClick={() => setMobileMenuOpen(false)}>
              <div className="py-2 text-sm capitalize font-heading">{slug.replace("-", " & ")}</div>
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
