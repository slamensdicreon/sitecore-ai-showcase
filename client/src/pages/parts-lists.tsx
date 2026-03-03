import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ListChecks, Plus, Trash2, Box, ShoppingCart } from "lucide-react";
import { useState } from "react";
import type { PartsList, PartsListItem, Product } from "@shared/schema";

type PartsListItemWithProduct = PartsListItem & { product?: Product };

function PartsListDetail({ list }: { list: PartsList }) {
  const { toast } = useToast();

  const { data: items, isLoading } = useQuery<PartsListItemWithProduct[]>({
    queryKey: ["/api/parts-lists", list.id, "items"],
  });

  const removeItemMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/parts-list-items/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parts-lists", list.id, "items"] });
    },
  });

  const addAllToCartMutation = useMutation({
    mutationFn: async () => {
      if (!items) return;
      for (const item of items) {
        await apiRequest("POST", "/api/cart", { productId: item.productId, quantity: item.quantity || 1 });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({ title: "All items added to cart" });
    },
  });

  if (isLoading) {
    return <Skeleton className="h-20" />;
  }

  if (!items || items.length === 0) {
    return (
      <p className="text-xs text-muted-foreground py-2">No items in this list. Browse products to add items.</p>
    );
  }

  return (
    <div className="space-y-2 mt-3">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-3 py-2 border-t" data-testid={`parts-list-item-${item.id}`}>
          <div className="w-10 h-10 rounded-md bg-accent/50 flex items-center justify-center flex-shrink-0">
            {item.product?.imageUrl ? (
              <img src={item.product.imageUrl} alt="" className="w-7 h-7 object-contain" />
            ) : (
              <Box className="h-4 w-4 text-muted-foreground/30" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <Link href={`/products/${item.productId}`}>
              <p className="text-sm font-medium cursor-pointer">{item.product?.name}</p>
            </Link>
            <p className="text-[10px] text-muted-foreground font-mono">{item.product?.sku}</p>
          </div>
          <span className="text-xs text-muted-foreground">Qty: {item.quantity}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeItemMutation.mutate(item.id)}
            data-testid={`button-remove-list-item-${item.id}`}
          >
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </Button>
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        onClick={() => addAllToCartMutation.mutate()}
        disabled={addAllToCartMutation.isPending}
        className="mt-2"
        data-testid={`button-add-all-to-cart-${list.id}`}
      >
        <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
        Add All to Cart
      </Button>
    </div>
  );
}

export default function PartsListsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newListName, setNewListName] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: lists, isLoading } = useQuery<PartsList[]>({
    queryKey: ["/api/parts-lists"],
    enabled: !!user,
  });

  const createListMutation = useMutation({
    mutationFn: (name: string) => apiRequest("POST", "/api/parts-lists", { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parts-lists"] });
      setNewListName("");
      toast({ title: "Parts list created" });
    },
  });

  const deleteListMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/parts-lists/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parts-lists"] });
      toast({ title: "Parts list deleted" });
    },
  });

  if (!user) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 py-16 text-center">
        <ListChecks className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="font-heading font-semibold mb-2">Sign in to manage parts lists</h2>
        <Link href="/login"><Button>Sign In</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
        <Link href="/">Home</Link>
        <span>/</span>
        <span className="text-foreground">My Parts Lists</span>
      </div>

      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-xl font-heading font-semibold" data-testid="text-parts-lists-title">My Parts Lists</h1>
      </div>

      <div className="max-w-2xl">
        <Card className="p-4 mb-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newListName.trim()) createListMutation.mutate(newListName.trim());
            }}
            className="flex items-center gap-3"
          >
            <Input
              placeholder="New list name..."
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              className="flex-1"
              data-testid="input-new-list-name"
            />
            <Button type="submit" disabled={!newListName.trim() || createListMutation.isPending} data-testid="button-create-list">
              <Plus className="h-4 w-4 mr-1" />
              Create
            </Button>
          </form>
        </Card>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-4"><Skeleton className="h-6 w-48" /></Card>
            ))}
          </div>
        ) : !lists || lists.length === 0 ? (
          <div className="text-center py-12">
            <ListChecks className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No parts lists yet. Create one above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lists.map((list) => (
              <Card key={list.id} className="p-4" data-testid={`card-parts-list-${list.id}`}>
                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={() => setExpandedId(expandedId === list.id ? null : list.id)}
                    className="flex items-center gap-3 text-left flex-1"
                    data-testid={`button-expand-list-${list.id}`}
                  >
                    <ListChecks className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="text-sm font-medium">{list.name}</h3>
                      <p className="text-[10px] text-muted-foreground">
                        Created {list.createdAt ? new Date(list.createdAt).toLocaleDateString() : ""}
                      </p>
                    </div>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteListMutation.mutate(list.id)}
                    data-testid={`button-delete-list-${list.id}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                {expandedId === list.id && <PartsListDetail list={list} />}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
