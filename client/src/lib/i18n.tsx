import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";

export type Locale = "en" | "de" | "zh";
export type Currency = "USD" | "EUR" | "CNY";

const EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,
  CNY: 7.24,
};

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "$",
  EUR: "€",
  CNY: "¥",
};

const translations: Record<Locale, Record<string, string>> = {
  en: {
    "nav.products": "All Products",
    "nav.connectors": "Connectors",
    "nav.sensors": "Sensors",
    "nav.relays": "Relays",
    "nav.wireCable": "Wire & Cable",
    "nav.circuitProtection": "Circuit Protection",
    "nav.terminalBlocks": "Terminal Blocks",
    "hero.badge": "OrderCloud B2B Commerce",
    "hero.title": "Engineering Your Connected Future",
    "hero.subtitle": "Discover 14,000+ electronic components. Industrial-grade connectors, sensors, relays, and more with volume pricing and fast delivery.",
    "hero.browse": "Browse Catalog",
    "hero.account": "Create B2B Account",
    "categories.title": "Product Categories",
    "categories.subtitle": "Browse by product family",
    "featured.title": "Featured Products",
    "featured.subtitle": "Popular items from our catalog",
    "cart.title": "Shopping Cart",
    "cart.empty": "Your cart is empty",
    "cart.subtotal": "Subtotal",
    "cart.shipping": "Shipping",
    "cart.tax": "Tax",
    "cart.discount": "Discount",
    "cart.total": "Total",
    "cart.checkout": "Proceed to Checkout",
    "cart.continue": "Continue Shopping",
    "checkout.title": "Checkout",
    "checkout.shipping": "Shipping Information",
    "checkout.payment": "Payment Method",
    "checkout.review": "Review Order",
    "checkout.place": "Place Order",
    "checkout.address": "Street Address",
    "checkout.city": "City",
    "checkout.state": "State / Province",
    "checkout.postal": "Postal Code",
    "checkout.country": "Country",
    "checkout.shippingMethod": "Shipping Method",
    "checkout.standard": "Standard (Free, 5-7 days)",
    "checkout.express": "Express ($15, 2-3 days)",
    "checkout.nextday": "Next Day ($35, 1 day)",
    "checkout.discountCode": "Discount Code",
    "checkout.apply": "Apply",
    "checkout.creditCard": "Credit Card",
    "checkout.paypal": "PayPal",
    "checkout.purchaseOrder": "Purchase Order",
    "checkout.poNumber": "PO Number",
    "checkout.notes": "Order Notes",
    "product.addToCart": "Add to Cart",
    "product.inStock": "In Stock",
    "product.limited": "Limited Stock",
    "product.backorder": "Backorder",
    "product.contactSales": "Contact Sales",
    "product.available": "Available",
    "product.unitPrice": "Unit Price",
    "product.volume": "Volume Pricing",
    "product.related": "Related Products",
    "product.alternatives": "Alternative Products",
    "product.accessories": "Accessories",
    "product.distributors": "Check Availability at Distributors",
    "product.specs": "Specifications",
    "product.details": "Product Details",
    "product.docs": "Documentation",
    "product.quickAdd": "Quick Add by Part #",
    "orders.title": "My Orders",
    "orders.empty": "No orders yet",
    "orders.track": "Track Shipment",
    "orders.cancel": "Cancel Order",
    "orders.reorder": "Reorder",
    "orders.history": "Status History",
    "auth.signIn": "Sign In",
    "auth.signOut": "Sign Out",
    "auth.register": "Register",
    "persona.engineer": "Engineer",
    "persona.purchaser": "Purchaser",
    "ai.recommended": "AI Recommended For You",
    "ai.alsoBought": "Customers Also Bought",
    "ai.badge": "AI-Powered",
    "tagline": "Every Connection Counts",
    "vat": "VAT",
    "viewAll": "View All",
  },
  de: {
    "nav.products": "Alle Produkte",
    "nav.connectors": "Steckverbinder",
    "nav.sensors": "Sensoren",
    "nav.relays": "Relais",
    "nav.wireCable": "Kabel & Leitungen",
    "nav.circuitProtection": "Schaltungsschutz",
    "nav.terminalBlocks": "Reihenklemmen",
    "hero.badge": "OrderCloud B2B-Commerce",
    "hero.title": "Ihre vernetzte Zukunft gestalten",
    "hero.subtitle": "Entdecken Sie über 14.000 elektronische Komponenten. Industrielle Steckverbinder, Sensoren, Relais und mehr mit Mengenrabatten.",
    "hero.browse": "Katalog durchsuchen",
    "hero.account": "B2B-Konto erstellen",
    "categories.title": "Produktkategorien",
    "categories.subtitle": "Nach Produktfamilie durchsuchen",
    "featured.title": "Empfohlene Produkte",
    "featured.subtitle": "Beliebte Artikel aus unserem Katalog",
    "cart.title": "Warenkorb",
    "cart.empty": "Ihr Warenkorb ist leer",
    "cart.subtotal": "Zwischensumme",
    "cart.shipping": "Versand",
    "cart.tax": "MwSt.",
    "cart.discount": "Rabatt",
    "cart.total": "Gesamt",
    "cart.checkout": "Zur Kasse",
    "cart.continue": "Weiter einkaufen",
    "checkout.title": "Kasse",
    "checkout.shipping": "Versandinformationen",
    "checkout.payment": "Zahlungsmethode",
    "checkout.review": "Bestellung prüfen",
    "checkout.place": "Bestellung aufgeben",
    "checkout.address": "Straße",
    "checkout.city": "Stadt",
    "checkout.state": "Bundesland",
    "checkout.postal": "PLZ",
    "checkout.country": "Land",
    "checkout.shippingMethod": "Versandart",
    "checkout.standard": "Standard (Kostenlos, 5-7 Tage)",
    "checkout.express": "Express (15€, 2-3 Tage)",
    "checkout.nextday": "Nächster Tag (35€, 1 Tag)",
    "checkout.discountCode": "Rabattcode",
    "checkout.apply": "Anwenden",
    "checkout.creditCard": "Kreditkarte",
    "checkout.paypal": "PayPal",
    "checkout.purchaseOrder": "Bestellschein",
    "checkout.poNumber": "Bestellnummer",
    "checkout.notes": "Bestellnotizen",
    "product.addToCart": "In den Warenkorb",
    "product.inStock": "Auf Lager",
    "product.limited": "Begrenzt verfügbar",
    "product.backorder": "Nachbestellung",
    "product.contactSales": "Vertrieb kontaktieren",
    "product.available": "Verfügbar",
    "product.unitPrice": "Stückpreis",
    "product.volume": "Mengenrabatte",
    "product.related": "Verwandte Produkte",
    "product.alternatives": "Alternative Produkte",
    "product.accessories": "Zubehör",
    "product.distributors": "Verfügbarkeit bei Distributoren prüfen",
    "product.specs": "Spezifikationen",
    "product.details": "Produktdetails",
    "product.docs": "Dokumentation",
    "product.quickAdd": "Schnellzugang nach Teilenr.",
    "orders.title": "Meine Bestellungen",
    "orders.empty": "Noch keine Bestellungen",
    "orders.track": "Sendung verfolgen",
    "orders.cancel": "Bestellung stornieren",
    "orders.reorder": "Nachbestellen",
    "orders.history": "Statusverlauf",
    "auth.signIn": "Anmelden",
    "auth.signOut": "Abmelden",
    "auth.register": "Registrieren",
    "persona.engineer": "Ingenieur",
    "persona.purchaser": "Einkäufer",
    "ai.recommended": "KI-Empfehlungen für Sie",
    "ai.alsoBought": "Kunden kauften auch",
    "ai.badge": "KI-gestützt",
    "tagline": "Jede Verbindung zählt",
    "vat": "MwSt.",
    "viewAll": "Alle anzeigen",
  },
  zh: {
    "nav.products": "所有产品",
    "nav.connectors": "连接器",
    "nav.sensors": "传感器",
    "nav.relays": "继电器",
    "nav.wireCable": "电线电缆",
    "nav.circuitProtection": "电路保护",
    "nav.terminalBlocks": "端子排",
    "hero.badge": "OrderCloud B2B商务",
    "hero.title": "构建您的互联未来",
    "hero.subtitle": "探索14,000+电子元器件。工业级连接器、传感器、继电器等，享受批量定价和快速交付。",
    "hero.browse": "浏览目录",
    "hero.account": "创建B2B账户",
    "categories.title": "产品类别",
    "categories.subtitle": "按产品系列浏览",
    "featured.title": "推荐产品",
    "featured.subtitle": "目录中的热门商品",
    "cart.title": "购物车",
    "cart.empty": "购物车为空",
    "cart.subtotal": "小计",
    "cart.shipping": "运费",
    "cart.tax": "税费",
    "cart.discount": "折扣",
    "cart.total": "总计",
    "cart.checkout": "结算",
    "cart.continue": "继续购物",
    "checkout.title": "结账",
    "checkout.shipping": "收货信息",
    "checkout.payment": "支付方式",
    "checkout.review": "确认订单",
    "checkout.place": "提交订单",
    "checkout.address": "街道地址",
    "checkout.city": "城市",
    "checkout.state": "省份",
    "checkout.postal": "邮编",
    "checkout.country": "国家",
    "checkout.shippingMethod": "配送方式",
    "checkout.standard": "标准配送（免费，5-7天）",
    "checkout.express": "快速配送（¥109，2-3天）",
    "checkout.nextday": "次日达（¥254，1天）",
    "checkout.discountCode": "折扣码",
    "checkout.apply": "使用",
    "checkout.creditCard": "信用卡",
    "checkout.paypal": "PayPal",
    "checkout.purchaseOrder": "采购订单",
    "checkout.poNumber": "采购订单号",
    "checkout.notes": "订单备注",
    "product.addToCart": "加入购物车",
    "product.inStock": "有库存",
    "product.limited": "库存有限",
    "product.backorder": "缺货预订",
    "product.contactSales": "联系销售",
    "product.available": "可用",
    "product.unitPrice": "单价",
    "product.volume": "批量定价",
    "product.related": "相关产品",
    "product.alternatives": "替代产品",
    "product.accessories": "配件",
    "product.distributors": "查看分销商库存",
    "product.specs": "技术规格",
    "product.details": "产品详情",
    "product.docs": "技术文档",
    "product.quickAdd": "按零件号快速添加",
    "orders.title": "我的订单",
    "orders.empty": "暂无订单",
    "orders.track": "追踪物流",
    "orders.cancel": "取消订单",
    "orders.reorder": "再次订购",
    "orders.history": "状态历史",
    "auth.signIn": "登录",
    "auth.signOut": "退出",
    "auth.register": "注册",
    "persona.engineer": "工程师",
    "persona.purchaser": "采购员",
    "ai.recommended": "AI为您推荐",
    "ai.alsoBought": "其他客户还购买了",
    "ai.badge": "AI驱动",
    "tagline": "每一个连接都很重要",
    "vat": "增值税",
    "viewAll": "查看全部",
  },
};

type I18nContextType = {
  locale: Locale;
  currency: Currency;
  setLocale: (l: Locale) => void;
  setCurrency: (c: Currency) => void;
  t: (key: string) => string;
  formatPrice: (usdPrice: number) => string;
  convertPrice: (usdPrice: number) => number;
  currencySymbol: string;
};

const I18nContext = createContext<I18nContextType | null>(null);

function detectDefaults(): { locale: Locale; currency: Currency } {
  const stored = {
    locale: localStorage.getItem("te_locale") as Locale | null,
    currency: localStorage.getItem("te_currency") as Currency | null,
  };
  if (stored.locale && stored.currency) return stored as { locale: Locale; currency: Currency };

  const browserLang = navigator.language.toLowerCase();
  let locale: Locale = "en";
  let currency: Currency = "USD";
  if (browserLang.startsWith("de")) { locale = "de"; currency = "EUR"; }
  else if (browserLang.startsWith("zh")) { locale = "zh"; currency = "CNY"; }
  else if (browserLang.startsWith("fr") || browserLang.startsWith("es") || browserLang.startsWith("it")) { currency = "EUR"; }

  return {
    locale: stored.locale || locale,
    currency: stored.currency || currency,
  };
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const defaults = detectDefaults();
  const [locale, setLocaleState] = useState<Locale>(defaults.locale);
  const [currency, setCurrencyState] = useState<Currency>(defaults.currency);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("te_locale", l);
  }, []);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem("te_currency", c);
  }, []);

  const t = useCallback((key: string): string => {
    return translations[locale]?.[key] || translations.en[key] || key;
  }, [locale]);

  const convertPrice = useCallback((usdPrice: number): number => {
    return usdPrice * EXCHANGE_RATES[currency];
  }, [currency]);

  const formatPrice = useCallback((usdPrice: number): string => {
    const converted = usdPrice * EXCHANGE_RATES[currency];
    const sym = CURRENCY_SYMBOLS[currency];
    return `${sym}${converted.toFixed(2)}`;
  }, [currency]);

  const currencySymbol = CURRENCY_SYMBOLS[currency];

  return (
    <I18nContext.Provider value={{ locale, currency, setLocale, setCurrency, t, formatPrice, convertPrice, currencySymbol }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export { EXCHANGE_RATES, CURRENCY_SYMBOLS };
