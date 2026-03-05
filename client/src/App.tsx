import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { I18nProvider } from "@/lib/i18n";
import { Header } from "@/components/header";
import { AIChatbot } from "@/components/ai-chatbot";
import Home from "@/pages/home";
import Products from "@/pages/products";
import ProductDetail from "@/pages/product-detail";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import Orders from "@/pages/orders";
import OrderDetailPage from "@/pages/order-detail";
import PartsListsPage from "@/pages/parts-lists";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/products" component={Products} />
      <Route path="/products/:id" component={ProductDetail} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/orders" component={Orders} />
      <Route path="/orders/:id" component={OrderDetailPage} />
      <Route path="/parts-lists" component={PartsListsPage} />
      <Route path="/login" component={Login} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { data: featureFlags } = useQuery<Record<string, boolean>>({
    queryKey: ["/api/feature-flags"],
    staleTime: 30000,
  });
  const chatbotEnabled = featureFlags?.ai_chatbot !== false;

  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <Router />
        </main>
      </div>
      {chatbotEnabled && <AIChatbot />}
      <Toaster />
    </AuthProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <I18nProvider>
          <AppContent />
        </I18nProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
