import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Zap, Shield, Globe, TrendingUp, Box, Cpu, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import type { Category, Product } from "@shared/schema";

const industryIcons: Record<string, typeof Zap> = {
  "Connectors": Box,
  "Sensors": Cpu,
  "Relays": Zap,
  "Wire & Cable": Globe,
  "Circuit Protection": Shield,
  "Terminal Blocks": TrendingUp,
};

function ConnectivityLines({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 60" className={className} preserveAspectRatio="none" aria-hidden="true">
      <line x1="0" y1="15" x2="300" y2="15" stroke="#f28d00" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
      <line x1="0" y1="30" x2="240" y2="30" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" opacity="0.15" />
      <line x1="0" y1="45" x2="180" y2="45" stroke="#167a87" strokeWidth="4" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

function useRecentlyViewed() {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("te_recently_viewed") || "[]");
      setIds(stored.slice(0, 4));
    } catch {}
  }, []);
  return ids;
}

export default function Home() {
  const { t, formatPrice } = useI18n();
  const { user } = useAuth();
  const recentIds = useRecentlyViewed();

  const { data: categories, isLoading: catsLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: productsData, isLoading: prodsLoading } = useQuery<{ products: Product[]; total: number }>({
    queryKey: ["/api/products"],
  });

  const aiRecommended = productsData?.products
    .filter(p => !recentIds.includes(p.id))
    .slice(0, 4) || [];

  return (
    <div className="min-h-screen">
      <section className="relative bg-[#2e4957] text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#04215d]/40 via-transparent to-[#167a87]/20" />
        <div className="absolute bottom-0 left-0 right-0 h-16 opacity-50">
          <ConnectivityLines className="w-full h-full" />
        </div>
        <div className="relative max-w-[1400px] mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl">
            <Badge className="mb-4 bg-[#f28d00] text-white border-[#f28d00]">{t("hero.badge")}</Badge>
            <h1 className="text-3xl md:text-5xl font-heading font-bold leading-tight mb-4">
              {t("hero.title")}
            </h1>
            <p className="text-lg md:text-xl opacity-80 mb-8 leading-relaxed">
              {t("hero.subtitle")}
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <Link href="/products">
                <Button size="lg" className="bg-[#f28d00] text-white font-heading" data-testid="button-browse-products">
                  {t("hero.browse")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="bg-transparent border-white/30 text-white font-heading" data-testid="button-create-account">
                  {t("hero.account")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {user && aiRecommended.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-4 py-10">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-5 w-5 text-[#f28d00]" />
            <h2 className="text-xl font-heading font-semibold">{t("ai.recommended")}</h2>
            <Badge variant="secondary" className="text-[9px] bg-[#f28d00]/10 text-[#f28d00]" data-testid="badge-ai">
              {t("ai.badge")}
            </Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {aiRecommended.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`}>
                <Card className="hover-elevate cursor-pointer h-full" data-testid={`card-ai-product-${product.id}`}>
                  <div className="p-3">
                    <div className="aspect-square rounded-md bg-accent/50 flex items-center justify-center mb-3">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-3/4 h-3/4 object-contain" />
                      ) : (
                        <Box className="h-12 w-12 text-muted-foreground/30" />
                      )}
                    </div>
                  </div>
                  <div className="px-3 pb-4">
                    <p className="text-[10px] text-muted-foreground mb-1 font-mono">{product.sku}</p>
                    <h3 className="text-sm font-medium mb-2 line-clamp-2 leading-snug">{product.name}</h3>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sm text-[#f28d00]">
                        {formatPrice(parseFloat(product.basePrice))}
                      </span>
                      {product.inStock && (
                        <Badge variant="secondary" className="text-[10px] bg-[#8fb838]/10 text-[#6a8a2a] dark:text-[#8fb838]">{t("product.inStock")}</Badge>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="max-w-[1400px] mx-auto px-4 py-12">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-heading font-semibold mb-1">{t("categories.title")}</h2>
            <p className="text-muted-foreground text-sm">{t("categories.subtitle")}</p>
          </div>
          <Link href="/products">
            <Button variant="ghost" size="sm" data-testid="link-view-all-categories">
              {t("viewAll")} <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {catsLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="p-5">
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3 mt-1" />
                </Card>
              ))
            : categories?.map((cat) => {
                const Icon = industryIcons[cat.name] || Box;
                return (
                  <Link key={cat.id} href={`/products?categorySlug=${cat.slug}`}>
                    <Card className="p-5 hover-elevate cursor-pointer h-full group" data-testid={`card-category-${cat.slug}`}>
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-md bg-[#f28d00]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#f28d00]/20 transition-colors">
                          <Icon className="h-5 w-5 text-[#f28d00]" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-heading font-semibold text-sm mb-1">{cat.name}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-2">{cat.description}</p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
        </div>
      </section>

      <section className="bg-card border-y">
        <div className="max-w-[1400px] mx-auto px-4 py-12">
          <div className="flex items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-heading font-semibold mb-1">{t("featured.title")}</h2>
              <p className="text-muted-foreground text-sm">{t("featured.subtitle")}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {prodsLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="p-4">
                    <Skeleton className="aspect-square rounded-md mb-3" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-3 w-2/3" />
                  </Card>
                ))
              : productsData?.products.slice(0, 4).map((product) => (
                  <Link key={product.id} href={`/products/${product.id}`}>
                    <Card className="hover-elevate cursor-pointer h-full" data-testid={`card-product-${product.id}`}>
                      <div className="p-3">
                        <div className="aspect-square rounded-md bg-accent/50 flex items-center justify-center mb-3">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-3/4 h-3/4 object-contain"
                            />
                          ) : (
                            <Box className="h-12 w-12 text-muted-foreground/30" />
                          )}
                        </div>
                      </div>
                      <div className="px-3 pb-4">
                        <p className="text-[10px] text-muted-foreground mb-1 font-mono">{product.sku}</p>
                        <h3 className="text-sm font-medium mb-2 line-clamp-2 leading-snug">{product.name}</h3>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-sm text-[#f28d00]">
                            {formatPrice(parseFloat(product.basePrice))}
                          </span>
                          {product.inStock && (
                            <Badge variant="secondary" className="text-[10px] bg-[#8fb838]/10 text-[#6a8a2a] dark:text-[#8fb838]">{t("product.inStock")}</Badge>
                          )}
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
          </div>
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-4 py-12">
        <h2 className="text-2xl font-heading font-semibold mb-8 text-center">Why OrderCloud for B2B</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Volume Pricing",
              desc: "Automatic price breaks based on order quantity. The more you buy, the more you save with tier-based pricing schedules.",
              icon: TrendingUp,
            },
            {
              title: "Customer-Specific Catalogs",
              desc: "Personalized product catalogs and pricing tailored to your organization's purchasing agreements and contracts.",
              icon: Shield,
            },
            {
              title: "Streamlined Procurement",
              desc: "Parts lists, PO numbers, approval workflows, and order history designed for B2B purchasing teams.",
              icon: Globe,
            },
          ].map((item) => (
            <div key={item.title} className="text-center">
              <div className="w-12 h-12 rounded-md bg-[#2e4957]/10 dark:bg-[#2e4957]/30 flex items-center justify-center mx-auto mb-4">
                <item.icon className="h-6 w-6 text-[#2e4957] dark:text-[#167a87]" />
              </div>
              <h3 className="font-heading font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-[#2e4957] text-white">
        <div className="max-w-[1400px] mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
            <div>
              <h4 className="font-heading font-semibold mb-3 text-[#f28d00]">Products</h4>
              <ul className="space-y-2 opacity-75">
                <li>Connectors</li>
                <li>Sensors</li>
                <li>Relays</li>
                <li>Wire & Cable</li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading font-semibold mb-3 text-[#f28d00]">Solutions</h4>
              <ul className="space-y-2 opacity-75">
                <li>Automotive</li>
                <li>Industrial</li>
                <li>Data Communications</li>
                <li>Aerospace</li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading font-semibold mb-3 text-[#f28d00]">Resources</h4>
              <ul className="space-y-2 opacity-75">
                <li>Technical Support</li>
                <li>Datasheets</li>
                <li>CAD Models</li>
                <li>Application Notes</li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading font-semibold mb-3 text-[#f28d00]">Account</h4>
              <ul className="space-y-2 opacity-75">
                <li>My Orders</li>
                <li>Parts Lists</li>
                <li>Quote Requests</li>
                <li>Support Tickets</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-[#f28d00] flex items-center justify-center">
                  <span className="text-white font-bold text-xs italic font-heading">TE</span>
                </div>
                <span className="text-xs opacity-60">TE Connectivity OrderCloud B2B Demo</span>
              </div>
              <span className="text-[10px] opacity-40 font-heading tracking-widest uppercase">{t("tagline")}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
