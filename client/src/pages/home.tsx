import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Zap, Shield, Globe, TrendingUp, Box, Cpu } from "lucide-react";
import type { Category, Product } from "@shared/schema";

const industryIcons: Record<string, typeof Zap> = {
  "Connectors": Box,
  "Sensors": Cpu,
  "Relays": Zap,
  "Wire & Cable": Globe,
  "Circuit Protection": Shield,
  "Terminal Blocks": TrendingUp,
};

export default function Home() {
  const { data: categories, isLoading: catsLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: productsData, isLoading: prodsLoading } = useQuery<{ products: Product[]; total: number }>({
    queryKey: ["/api/products"],
  });

  return (
    <div className="min-h-screen">
      <section className="relative bg-foreground/95 text-background overflow-visible">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/10" />
        <div className="relative max-w-[1400px] mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl">
            <Badge variant="secondary" className="mb-4">OrderCloud B2B Commerce</Badge>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
              Engineering Your Connected Future
            </h1>
            <p className="text-lg md:text-xl opacity-80 mb-8 leading-relaxed">
              Discover 14,000+ electronic components. Industrial-grade connectors, sensors, relays, and more with volume pricing and fast delivery.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <Link href="/products">
                <Button size="lg" data-testid="button-browse-products">
                  Browse Catalog
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="bg-transparent border-background/30 text-background" data-testid="button-create-account">
                  Create B2B Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-4 py-12">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-semibold mb-1">Product Categories</h2>
            <p className="text-muted-foreground text-sm">Browse by product family</p>
          </div>
          <Link href="/products">
            <Button variant="ghost" size="sm" data-testid="link-view-all-categories">
              View All <ArrowRight className="ml-1 h-3 w-3" />
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
                    <Card className="p-5 hover-elevate cursor-pointer h-full" data-testid={`card-category-${cat.slug}`}>
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm mb-1">{cat.name}</h3>
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
              <h2 className="text-2xl font-semibold mb-1">Featured Products</h2>
              <p className="text-muted-foreground text-sm">Popular items from our catalog</p>
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
                          <span className="font-semibold text-sm">
                            ${parseFloat(product.basePrice).toFixed(2)}
                          </span>
                          {product.inStock && (
                            <Badge variant="secondary" className="text-[10px]">In Stock</Badge>
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
        <h2 className="text-2xl font-semibold mb-8 text-center">Why OrderCloud for B2B</h2>
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
              <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t bg-card">
        <div className="max-w-[1400px] mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-3">Products</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>Connectors</li>
                <li>Sensors</li>
                <li>Relays</li>
                <li>Wire & Cable</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Solutions</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>Automotive</li>
                <li>Industrial</li>
                <li>Data Communications</li>
                <li>Aerospace</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Resources</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>Technical Support</li>
                <li>Datasheets</li>
                <li>CAD Models</li>
                <li>Application Notes</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Account</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>My Orders</li>
                <li>Parts Lists</li>
                <li>Quote Requests</li>
                <li>Support Tickets</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t text-xs text-muted-foreground text-center">
            TE Connectivity OrderCloud B2B Demo. Powered by Sitecore OrderCloud.
          </div>
        </div>
      </footer>
    </div>
  );
}
