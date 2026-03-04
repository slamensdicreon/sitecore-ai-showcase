import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle, RefreshCw, Upload, Database, Cloud, Package, FolderTree, DollarSign } from "lucide-react";

export default function AdminPage() {
  const { toast } = useToast();
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
    onSuccess: (data) => {
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

  return (
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
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isConnected ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                <Cloud className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Connection</p>
                <div className="flex items-center gap-1.5">
                  {statusQuery.isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isConnected ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-semibold text-green-700" data-testid="text-connection-status">Connected</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="font-semibold text-red-700" data-testid="text-connection-status">Disconnected</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">OC Products</p>
                <p className="text-2xl font-bold" data-testid="text-oc-product-count">
                  {ocProductsQuery.isLoading ? "..." : ocProducts.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
                <FolderTree className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">OC Categories</p>
                <p className="text-2xl font-bold" data-testid="text-oc-category-count">
                  {ocCategoriesQuery.isLoading ? "..." : ocCategories.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Price Schedules</p>
                <p className="text-2xl font-bold" data-testid="text-oc-price-count">
                  {ocPriceSchedulesQuery.isLoading ? "..." : ocPriceSchedules.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3 mb-8">
        <Button
          onClick={() => syncMutation.mutate()}
          disabled={syncMutation.isPending || !isConnected}
          className="gap-2"
          data-testid="button-sync"
        >
          {syncMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {syncMutation.isPending ? "Syncing..." : "Sync to OrderCloud"}
        </Button>

        <Button
          variant="outline"
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/ordercloud/status"] });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/ordercloud/products"] });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/ordercloud/categories"] });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/ordercloud/priceschedules"] });
          }}
          className="gap-2"
          data-testid="button-refresh"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {syncLog.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-heading">Sync Log</CardTitle>
            <CardDescription>Last sync operation results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted rounded-lg p-4 max-h-64 overflow-y-auto font-mono text-sm space-y-1" data-testid="text-sync-log">
              {syncLog.map((line, i) => (
                <div key={i} className={line.includes("Error") ? "text-destructive" : "text-foreground"}>
                  {line}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products" data-testid="tab-products">Products ({ocProducts.length})</TabsTrigger>
          <TabsTrigger value="categories" data-testid="tab-categories">Categories ({ocCategories.length})</TabsTrigger>
          <TabsTrigger value="pricing" data-testid="tab-pricing">Price Schedules ({ocPriceSchedules.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">OrderCloud Products</CardTitle>
              <CardDescription>Products synced to your Sitecore OrderCloud marketplace</CardDescription>
            </CardHeader>
            <CardContent>
              {ocProductsQuery.isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : ocProducts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground" data-testid="text-no-products">
                  <Database className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-heading font-semibold">No products in OrderCloud</p>
                  <p className="text-sm mt-1">Click "Sync to OrderCloud" to push your catalog</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID (SKU)</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead>Inventory</TableHead>
                      <TableHead>Price Schedule</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ocProducts.map((product: any) => (
                      <TableRow key={product.ID} data-testid={`row-product-${product.ID}`}>
                        <TableCell className="font-mono text-sm">{product.ID}</TableCell>
                        <TableCell className="font-medium">{product.Name}</TableCell>
                        <TableCell>
                          <Badge variant={product.Active ? "default" : "secondary"}>
                            {product.Active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {product.Inventory?.Enabled ? (
                            <span className="text-sm">{product.Inventory.QuantityAvailable} units</span>
                          ) : (
                            <span className="text-muted-foreground text-sm">N/A</span>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {product.DefaultPriceScheduleID || "None"}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => deleteProductMutation.mutate(product.ID)}
                            disabled={deleteProductMutation.isPending}
                            data-testid={`button-delete-${product.ID}`}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">OrderCloud Categories</CardTitle>
              <CardDescription>Categories in your TE Connectivity catalog</CardDescription>
            </CardHeader>
            <CardContent>
              {ocCategoriesQuery.isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : ocCategories.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground" data-testid="text-no-categories">
                  <FolderTree className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-heading font-semibold">No categories in OrderCloud</p>
                  <p className="text-sm mt-1">Click "Sync to OrderCloud" to push your catalog</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID (Slug)</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead>Sort Order</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ocCategories.map((cat: any) => (
                      <TableRow key={cat.ID} data-testid={`row-category-${cat.ID}`}>
                        <TableCell className="font-mono text-sm">{cat.ID}</TableCell>
                        <TableCell className="font-medium">{cat.Name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{cat.Description}</TableCell>
                        <TableCell>
                          <Badge variant={cat.Active ? "default" : "secondary"}>
                            {cat.Active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>{cat.ListOrder}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">OrderCloud Price Schedules</CardTitle>
              <CardDescription>Volume pricing tiers for your products</CardDescription>
            </CardHeader>
            <CardContent>
              {ocPriceSchedulesQuery.isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : ocPriceSchedules.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground" data-testid="text-no-prices">
                  <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-heading font-semibold">No price schedules in OrderCloud</p>
                  <p className="text-sm mt-1">Click "Sync to OrderCloud" to push your catalog</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Min Qty</TableHead>
                      <TableHead>Currency</TableHead>
                      <TableHead>Price Breaks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ocPriceSchedules.map((ps: any) => (
                      <TableRow key={ps.ID} data-testid={`row-priceschedule-${ps.ID}`}>
                        <TableCell className="font-mono text-sm">{ps.ID}</TableCell>
                        <TableCell className="font-medium">{ps.Name}</TableCell>
                        <TableCell>{ps.MinQuantity}</TableCell>
                        <TableCell>{ps.Currency || "USD"}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {ps.PriceBreaks?.map((pb: any, i: number) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {pb.Quantity}+ @ ${pb.Price?.toFixed(2)}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {!isConnected && !statusQuery.isLoading && (
        <Card className="mt-8 border-destructive/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <p className="font-semibold text-destructive font-heading">Connection Failed</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {statusQuery.data?.message || "Unable to connect to OrderCloud. Verify your ORDERCLOUD_CLIENT_ID, ORDERCLOUD_CLIENT_SECRET, and ORDERCLOUD_API_URL environment variables."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
