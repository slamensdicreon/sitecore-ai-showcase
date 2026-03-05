import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Box, Truck, CreditCard, FileText, ArrowRight, ArrowLeft, Tag, Check } from "lucide-react";
import { useState } from "react";
import type { CartItem, Product } from "@shared/schema";

type PricedCartItem = CartItem & { product?: Product; unitPrice: number; totalPrice: number };

const SHIPPING_COSTS: Record<string, number> = { standard: 0, express: 15, nextday: 35 };
const TAX_RATE = 0.0825;

const COUNTRIES = ["United States", "Germany", "China", "Canada", "United Kingdom", "France", "Japan", "South Korea", "Mexico", "Brazil"];

export default function Checkout() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t, formatPrice, convertPrice, currency } = useI18n();
  const [, navigate] = useLocation();
  const [step, setStep] = useState(0);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [discountInfo, setDiscountInfo] = useState<{ code: string; percentage: number } | null>(null);
  const [discountInput, setDiscountInput] = useState("");
  const [addressValidated, setAddressValidated] = useState(false);

  const { data: cartItems, isLoading } = useQuery<PricedCartItem[]>({
    queryKey: ["/api/cart"],
    enabled: !!user,
  });

  const form = useForm({
    defaultValues: {
      streetAddress: "",
      city: "",
      stateProvince: "",
      postalCode: "",
      country: "United States",
      shippingMethod: "standard",
      paymentMethod: "purchase_order",
      poNumber: "",
      notes: "",
    },
  });

  const watchShippingMethod = form.watch("shippingMethod");
  const watchPaymentMethod = form.watch("paymentMethod");

  const subtotal = cartItems?.reduce((sum, item) => sum + (item.totalPrice || 0), 0) || 0;
  const shippingCost = SHIPPING_COSTS[watchShippingMethod] || 0;
  const taxLabel = currency === "EUR" ? t("vat") : t("cart.tax");
  const taxAmount = subtotal * TAX_RATE;
  const discountAmount = discountInfo ? subtotal * (discountInfo.percentage / 100) : 0;
  const total = subtotal + shippingCost + taxAmount - discountAmount;

  const validateDiscountMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await apiRequest("POST", "/api/orders/validate-discount", { code });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.valid) {
        setDiscountInfo({ code: data.code, percentage: data.percentage });
        toast({ title: `Discount applied: ${data.percentage}% off` });
      } else {
        toast({ title: "Invalid discount code", variant: "destructive" });
      }
    },
  });

  const placeOrderMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/orders", data),
    onSuccess: async (res) => {
      const order = await res.json();
      setOrderId(order.id);
      setOrderPlaced(true);
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "Order placed successfully!" });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to place order", description: err.message, variant: "destructive" });
    },
  });

  const handlePlaceOrder = () => {
    const values = form.getValues();
    placeOrderMutation.mutate({
      ...values,
      discountCode: discountInfo?.code || undefined,
      shippingAddress: `${values.streetAddress}, ${values.city}, ${values.stateProvince} ${values.postalCode}, ${values.country}`,
    });
  };

  const handleAddressBlur = () => {
    const { streetAddress, city, postalCode } = form.getValues();
    if (streetAddress && city && postalCode) {
      setTimeout(() => setAddressValidated(true), 800);
    }
  };

  const steps = [
    { label: t("checkout.shipping"), icon: Truck },
    { label: t("checkout.shippingMethod"), icon: Truck },
    { label: t("checkout.payment"), icon: CreditCard },
    { label: t("checkout.review"), icon: FileText },
  ];

  if (orderPlaced) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-[#8fb838]/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-8 w-8 text-[#6a8a2a] dark:text-[#8fb838]" />
        </div>
        <h1 className="text-2xl font-heading font-bold mb-2">Order Confirmed</h1>
        <p className="text-muted-foreground mb-2">Your order has been submitted for processing.</p>
        <p className="text-xs text-muted-foreground font-mono mb-6">Order ID: {orderId}</p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/orders"><Button data-testid="button-view-orders">View Orders</Button></Link>
          <Link href="/products"><Button variant="outline" data-testid="button-continue-shopping-confirm">{t("cart.continue")}</Button></Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 py-16 text-center">
        <h2 className="font-heading font-semibold mb-2">{t("auth.signIn")} to checkout</h2>
        <Link href="/login"><Button data-testid="button-checkout-signin">{t("auth.signIn")}</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/cart">{t("cart.title")}</Link>
        <span>/</span>
        <span className="text-foreground">{t("checkout.title")}</span>
      </div>

      <h1 className="text-xl font-heading font-semibold mb-4" data-testid="text-checkout-title">{t("checkout.title")}</h1>

      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {steps.map((s, i) => {
          const StepIcon = s.icon;
          return (
            <div key={i} className="flex items-center gap-2">
              <button
                onClick={() => i <= step && setStep(i)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${i === step ? "bg-[#f28d00] text-white" : i < step ? "bg-[#8fb838]/20 text-[#6a8a2a]" : "bg-accent text-muted-foreground"}`}
                data-testid={`step-${i}`}
              >
                {i < step ? <Check className="h-3 w-3" /> : <StepIcon className="h-3 w-3" />}
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < steps.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Form {...form}>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              {step === 0 && (
                <Card className="p-5">
                  <h3 className="font-heading font-semibold mb-4">{t("checkout.shipping")}</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="streetAddress"
                      rules={{ required: "Street address is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("checkout.address")}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input placeholder="123 Main Street" {...field} onBlur={handleAddressBlur} data-testid="input-street-address" />
                              {addressValidated && <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8fb838]" />}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        rules={{ required: "City is required" }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("checkout.city")}</FormLabel>
                            <FormControl>
                              <Input placeholder="City" {...field} onBlur={handleAddressBlur} data-testid="input-city" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="stateProvince"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("checkout.state")}</FormLabel>
                            <FormControl>
                              <Input placeholder="State" {...field} data-testid="input-state" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="postalCode"
                        rules={{ required: "Postal code is required" }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("checkout.postal")}</FormLabel>
                            <FormControl>
                              <Input placeholder="12345" {...field} onBlur={handleAddressBlur} data-testid="input-postal-code" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("checkout.country")}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-country">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {COUNTRIES.map((c) => (
                                  <SelectItem key={c} value={c}>{c}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button type="button" onClick={async () => { const valid = await form.trigger(["streetAddress", "city", "postalCode", "country"]); if (valid) setStep(1); }} data-testid="button-next-shipping">
                      Next <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </Card>
              )}

              {step === 1 && (
                <Card className="p-5">
                  <h3 className="font-heading font-semibold mb-4">{t("checkout.shippingMethod")}</h3>
                  <FormField
                    control={form.control}
                    name="shippingMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="space-y-3">
                            {[
                              { value: "standard", label: t("checkout.standard"), cost: 0 },
                              { value: "express", label: t("checkout.express"), cost: 15 },
                              { value: "nextday", label: t("checkout.nextday"), cost: 35 },
                            ].map((opt) => (
                              <label
                                key={opt.value}
                                className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors ${field.value === opt.value ? "border-[#f28d00] bg-[#f28d00]/5" : "hover:bg-accent/50"}`}
                                data-testid={`shipping-${opt.value}`}
                              >
                                <input
                                  type="radio"
                                  value={opt.value}
                                  checked={field.value === opt.value}
                                  onChange={() => field.onChange(opt.value)}
                                  className="accent-[#f28d00]"
                                />
                                <Truck className="h-4 w-4 text-muted-foreground" />
                                <span className="flex-1 text-sm">{opt.label}</span>
                                <span className="text-sm font-medium">{opt.cost === 0 ? "Free" : formatPrice(opt.cost)}</span>
                              </label>
                            ))}
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-between mt-4">
                    <Button type="button" variant="outline" onClick={() => setStep(0)} data-testid="button-back-address">
                      <ArrowLeft className="mr-1 h-3 w-3" /> Back
                    </Button>
                    <Button type="button" onClick={() => { if (form.getValues("shippingMethod")) setStep(2); }} data-testid="button-next-payment">
                      Next <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </Card>
              )}

              {step === 2 && (
                <Card className="p-5">
                  <h3 className="font-heading font-semibold mb-4">{t("checkout.payment")}</h3>
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="space-y-3">
                            {[
                              { value: "credit_card", label: t("checkout.creditCard"), icon: CreditCard },
                              { value: "paypal", label: t("checkout.paypal"), icon: CreditCard },
                              { value: "purchase_order", label: t("checkout.purchaseOrder"), icon: FileText },
                            ].map((opt) => (
                              <label
                                key={opt.value}
                                className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors ${field.value === opt.value ? "border-[#f28d00] bg-[#f28d00]/5" : "hover:bg-accent/50"}`}
                                data-testid={`payment-${opt.value}`}
                              >
                                <input
                                  type="radio"
                                  value={opt.value}
                                  checked={field.value === opt.value}
                                  onChange={() => field.onChange(opt.value)}
                                  className="accent-[#f28d00]"
                                />
                                <opt.icon className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{opt.label}</span>
                              </label>
                            ))}
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {watchPaymentMethod === "credit_card" && (
                    <div className="mt-4 p-4 bg-accent/50 rounded-md space-y-3">
                      <p className="text-xs text-muted-foreground">Demo credit card form</p>
                      <Input placeholder="4242 4242 4242 4242" data-testid="input-card-number" />
                      <div className="grid grid-cols-2 gap-3">
                        <Input placeholder="MM/YY" data-testid="input-card-expiry" />
                        <Input placeholder="CVC" data-testid="input-card-cvc" />
                      </div>
                    </div>
                  )}

                  {watchPaymentMethod === "purchase_order" && (
                    <div className="mt-4">
                      <FormField
                        control={form.control}
                        name="poNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("checkout.poNumber")}</FormLabel>
                            <FormControl>
                              <Input placeholder="PO-2024-001" {...field} data-testid="input-po-number" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t">
                    <label className="text-sm font-medium mb-2 block">{t("checkout.discountCode")}</label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                          placeholder="TE10, VOLUME20"
                          value={discountInput}
                          onChange={(e) => setDiscountInput(e.target.value)}
                          className="pl-9"
                          data-testid="input-discount-code"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => validateDiscountMutation.mutate(discountInput)}
                        disabled={!discountInput.trim() || validateDiscountMutation.isPending}
                        data-testid="button-apply-discount"
                      >
                        {t("checkout.apply")}
                      </Button>
                    </div>
                    {discountInfo && (
                      <p className="text-xs text-[#8fb838] mt-1 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        {discountInfo.code}: {discountInfo.percentage}% off
                      </p>
                    )}
                  </div>

                  <div className="mt-4">
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("checkout.notes")} (Optional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Special instructions..." {...field} data-testid="input-notes" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-between mt-4">
                    <Button type="button" variant="outline" onClick={() => setStep(1)} data-testid="button-back-shipping">
                      <ArrowLeft className="mr-1 h-3 w-3" /> Back
                    </Button>
                    <Button type="button" onClick={() => setStep(3)} data-testid="button-next-review">
                      {t("checkout.review")} <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </Card>
              )}

              {step === 3 && (
                <Card className="p-5">
                  <h3 className="font-heading font-semibold mb-4">{t("checkout.review")}</h3>
                  <div className="space-y-4 text-sm">
                    <div className="p-3 bg-accent/50 rounded-md">
                      <p className="text-xs font-medium text-muted-foreground mb-1">{t("checkout.shipping")}</p>
                      <p>{form.getValues("streetAddress")}, {form.getValues("city")}, {form.getValues("stateProvince")} {form.getValues("postalCode")}</p>
                      <p>{form.getValues("country")}</p>
                    </div>
                    <div className="p-3 bg-accent/50 rounded-md">
                      <p className="text-xs font-medium text-muted-foreground mb-1">{t("checkout.shippingMethod")}</p>
                      <p>{watchShippingMethod === "standard" ? t("checkout.standard") : watchShippingMethod === "express" ? t("checkout.express") : t("checkout.nextday")}</p>
                    </div>
                    <div className="p-3 bg-accent/50 rounded-md">
                      <p className="text-xs font-medium text-muted-foreground mb-1">{t("checkout.payment")}</p>
                      <p>{watchPaymentMethod === "credit_card" ? t("checkout.creditCard") : watchPaymentMethod === "paypal" ? t("checkout.paypal") : t("checkout.purchaseOrder")}</p>
                      {form.getValues("poNumber") && <p className="text-xs text-muted-foreground">PO: {form.getValues("poNumber")}</p>}
                    </div>

                    <div className="space-y-2 pt-2">
                      {cartItems?.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-accent/50 flex items-center justify-center flex-shrink-0">
                            {item.product?.imageUrl ? (
                              <img src={item.product.imageUrl} alt="" className="w-6 h-6 object-contain" />
                            ) : (
                              <Box className="h-3 w-3 text-muted-foreground/30" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{item.product?.name}</p>
                            <p className="text-[10px] text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                          <span className="text-xs font-medium">{formatPrice(item.totalPrice || 0)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between mt-6">
                    <Button type="button" variant="outline" onClick={() => setStep(2)} data-testid="button-back-payment">
                      <ArrowLeft className="mr-1 h-3 w-3" /> Back
                    </Button>
                    <Button
                      type="button"
                      onClick={handlePlaceOrder}
                      disabled={placeOrderMutation.isPending}
                      className="bg-[#f28d00] hover:bg-[#d97d00]"
                      data-testid="button-place-order"
                    >
                      {placeOrderMutation.isPending ? "Processing..." : `${t("checkout.place")} - ${formatPrice(total)}`}
                    </Button>
                  </div>
                </Card>
              )}
            </form>
          </Form>
        </div>

        <div>
          <Card className="p-5 sticky top-24">
            <h3 className="font-heading font-semibold mb-4">{t("checkout.review")}</h3>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
              </div>
            ) : (
              <div className="space-y-3 mb-4">
                {cartItems?.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-accent/50 flex items-center justify-center flex-shrink-0">
                      {item.product?.imageUrl ? (
                        <img src={item.product.imageUrl} alt="" className="w-7 h-7 object-contain" />
                      ) : (
                        <Box className="h-4 w-4 text-muted-foreground/30" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{item.product?.name}</p>
                      <p className="text-[10px] text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-xs font-medium">{formatPrice(item.totalPrice || 0)}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="border-t pt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">{t("cart.subtotal")}</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">{t("cart.shipping")}</span>
                <span>{shippingCost === 0 ? "Free" : formatPrice(shippingCost)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">{taxLabel}</span>
                <span>{formatPrice(taxAmount)}</span>
              </div>
              {discountInfo && (
                <div className="flex justify-between gap-4 text-[#8fb838]">
                  <span>{t("cart.discount")} ({discountInfo.code})</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between gap-4 font-semibold pt-2 border-t">
                <span>{t("cart.total")}</span>
                <span data-testid="text-checkout-total">{formatPrice(total)}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
