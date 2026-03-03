import { Link, useLocation, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Box, Filter, Grid3X3, List, Search } from "lucide-react";
import { useState, useMemo } from "react";
import type { Category, Product } from "@shared/schema";

export default function Products() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const categorySlug = params.get("categorySlug") || "";
  const searchParam = params.get("search") || "";
  const [, navigate] = useLocation();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  const [localSearch, setLocalSearch] = useState(searchParam);

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const selectedCategory = useMemo(() => {
    if (!categorySlug || !categories) return null;
    return categories.find((c) => c.slug === categorySlug) || null;
  }, [categorySlug, categories]);

  const queryParams = useMemo(() => {
    const p = new URLSearchParams();
    if (selectedCategory) p.set("categoryId", selectedCategory.id);
    if (searchParam) p.set("search", searchParam);
    if (industryFilter && industryFilter !== "all") p.set("industry", industryFilter);
    p.set("limit", "50");
    return p.toString();
  }, [selectedCategory, searchParam, industryFilter]);

  const { data: productsData, isLoading } = useQuery<{ products: Product[]; total: number }>({
    queryKey: ["/api/products?" + queryParams],
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearch.trim()) {
      navigate(`/products?search=${encodeURIComponent(localSearch.trim())}`);
    } else {
      navigate("/products");
    }
  };

  const industries = useMemo(() => {
    if (!productsData) return [];
    const set = new Set(productsData.products.map((p) => p.industry).filter(Boolean));
    return Array.from(set) as string[];
  }, [productsData]);

  const pageTitle = selectedCategory ? selectedCategory.name : searchParam ? `Results for "${searchParam}"` : "All Products";

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
        <Link href="/" data-testid="breadcrumb-home">Home</Link>
        <span>/</span>
        <Link href="/products" data-testid="breadcrumb-products">Products</Link>
        {selectedCategory && (
          <>
            <span>/</span>
            <span className="text-foreground">{selectedCategory.name}</span>
          </>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-56 flex-shrink-0">
          <h3 className="font-heading font-semibold text-sm mb-3">Categories</h3>
          <div className="space-y-1">
            <Link href="/products">
              <div className={`text-sm py-1.5 px-2 rounded-md cursor-pointer ${!categorySlug ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground"}`} data-testid="filter-all">
                All Products
              </div>
            </Link>
            {categories?.map((cat) => (
              <Link key={cat.id} href={`/products?categorySlug=${cat.slug}`}>
                <div className={`text-sm py-1.5 px-2 rounded-md cursor-pointer ${categorySlug === cat.slug ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground"}`} data-testid={`filter-category-${cat.slug}`}>
                  {cat.name}
                </div>
              </Link>
            ))}
          </div>

          {industries.length > 0 && (
            <div className="mt-6">
              <h3 className="font-heading font-semibold text-sm mb-3">Industry</h3>
              <Select value={industryFilter} onValueChange={setIndustryFilter}>
                <SelectTrigger className="h-8 text-xs" data-testid="select-industry">
                  <SelectValue placeholder="All Industries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {industries.map((ind) => (
                    <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </aside>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h1 className="text-xl font-heading font-semibold" data-testid="text-page-title">{pageTitle}</h1>
              {productsData && (
                <p className="text-xs text-muted-foreground mt-1" data-testid="text-product-count">
                  {productsData.total} product{productsData.total !== 1 ? "s" : ""} found
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <form onSubmit={handleSearch} className="hidden sm:block">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="search"
                    placeholder="Filter results..."
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    className="h-8 pl-8 pr-3 w-48 rounded-md border text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                    data-testid="input-filter"
                  />
                </div>
              </form>
              <div className="flex border rounded-md">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 ${viewMode === "grid" ? "bg-accent" : ""}`}
                  data-testid="button-grid-view"
                >
                  <Grid3X3 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 ${viewMode === "list" ? "bg-accent" : ""}`}
                  data-testid="button-list-view"
                >
                  <List className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4" : "space-y-3"}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="p-4">
                  <Skeleton className="aspect-square rounded-md mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-3 w-2/3" />
                </Card>
              ))}
            </div>
          ) : productsData?.products.length === 0 ? (
            <div className="text-center py-16">
              <Filter className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-heading font-semibold mb-1">No products found</h3>
              <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {productsData?.products.map((product) => (
                <Link key={product.id} href={`/products/${product.id}`}>
                  <Card className="hover-elevate cursor-pointer h-full" data-testid={`card-product-${product.id}`}>
                    <div className="p-3">
                      <div className="aspect-[4/3] rounded-md bg-accent/50 flex items-center justify-center">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-2/3 h-2/3 object-contain" />
                        ) : (
                          <Box className="h-10 w-10 text-muted-foreground/30" />
                        )}
                      </div>
                    </div>
                    <div className="px-3 pb-4">
                      <p className="text-[10px] text-muted-foreground font-mono mb-1">{product.sku}</p>
                      <h3 className="text-sm font-medium mb-2 line-clamp-2 leading-snug">{product.name}</h3>
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-sm">${parseFloat(product.basePrice).toFixed(2)}</span>
                        <div className="flex items-center gap-1">
                          {product.industry && <Badge variant="secondary" className="text-[10px]">{product.industry}</Badge>}
                          {product.inStock ? (
                            <Badge variant="secondary" className="text-[10px] bg-[#8fb838]/10 text-[#6a8a2a] dark:text-[#8fb838]">In Stock</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px]">Lead Time</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {productsData?.products.map((product) => (
                <Link key={product.id} href={`/products/${product.id}`}>
                  <Card className="hover-elevate cursor-pointer" data-testid={`row-product-${product.id}`}>
                    <div className="flex items-center gap-4 p-3">
                      <div className="w-20 h-20 rounded-md bg-accent/50 flex items-center justify-center flex-shrink-0">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-14 h-14 object-contain" />
                        ) : (
                          <Box className="h-8 w-8 text-muted-foreground/30" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-muted-foreground font-mono">{product.sku}</p>
                        <h3 className="text-sm font-medium mb-1">{product.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-1">{product.description}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-semibold text-sm">${parseFloat(product.basePrice).toFixed(2)}</div>
                        <div className="flex items-center gap-1 mt-1 justify-end">
                          {product.inStock ? (
                            <Badge variant="secondary" className="text-[10px] bg-[#8fb838]/10 text-[#6a8a2a] dark:text-[#8fb838]">In Stock</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px]">Lead Time</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
