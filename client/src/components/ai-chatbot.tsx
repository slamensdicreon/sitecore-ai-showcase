import { useState, useRef, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MessageCircle, X, Send, Sparkles, Bot, User, ExternalLink } from "lucide-react";
import { useLocation } from "wouter";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  links?: { label: string; href: string }[];
};

const PRODUCT_CATALOG = [
  { name: "AMPSEAL 16 Series 23-Pin Plug", sku: "776087-1", id: "eba11c6f-8cbd-49d3-ba94-c3af933b99d7", category: "connectors", keywords: ["sealed", "automotive", "waterproof", "23-pin", "plug", "ampseal"] },
  { name: "DEUTSCH DT 12-Pin Connector", sku: "DT06-12S-CE06", id: "2bab8836-e591-4085-86f4-664d9929f610", category: "connectors", keywords: ["deutsch", "12-pin", "sealed", "automotive", "rugged"] },
  { name: "M12 Circular Connector 8-Pos", sku: "T4171110008-001", id: "d7cf998a-d4c8-46a0-a537-c53b0d5932d3", category: "connectors", keywords: ["m12", "circular", "ethernet", "industrial", "d-coded"] },
  { name: "PCB Power Relay 30A", sku: "T9AS1D12-12", id: "ac84d700-671d-447f-b256-859197a58c7c", category: "relays", keywords: ["relay", "pcb", "power", "30a", "hvac"] },
  { name: "Contactor Relay 4-Pole", sku: "ICS-V16A-4C-24", id: "3a3f0f1f-227a-4130-8bd1-7da554b7f83c", category: "relays", keywords: ["contactor", "din", "rail", "motor", "4-pole"] },
  { name: "Vibration Sensor 100mV/g", sku: "805M1-0100", id: "a1798fdd-6bc7-4237-b726-4d477bbdc085", category: "sensors", keywords: ["vibration", "accelerometer", "piezo", "monitoring"] },
  { name: "Pressure Transducer 0-100 PSI", sku: "U5374-000005-100PG", id: "19c59901-3d49-4872-9887-cf14373d85e4", category: "sensors", keywords: ["pressure", "transducer", "4-20ma", "hydraulic"] },
  { name: "RTD Pt100 Temperature Sensor", sku: "NB-PTCO-152", id: "8ff1bb0b-6207-45b9-9213-3b40b49eb11c", category: "sensors", keywords: ["temperature", "rtd", "pt100", "thermocouple"] },
  { name: "Cat6A Ethernet Patch Cable", sku: "CAT6A-S-10-BL", id: "826730f0-86d6-4ea2-81c8-0f64ab16d606", category: "cables", keywords: ["ethernet", "cat6a", "cable", "patch", "network"] },
  { name: "Silicone Multi-Conductor Cable", sku: "SIL-18-4C-300V", id: "bd502571-2858-46b0-83ac-a32c6c01bfa3", category: "cables", keywords: ["silicone", "high-temp", "cable", "multi-conductor"] },
  { name: "DIN Rail Terminal Block", sku: "XBUT10-FT-BG", id: "bc0aa592-b046-4089-8355-9d9f1602f60e", category: "terminals", keywords: ["terminal", "din", "rail", "block", "spring"] },
  { name: "PCB Screw Terminal Block", sku: "OSTB-1200503", id: "0350587b-f586-463c-8e06-a2aedde29955", category: "terminals", keywords: ["terminal", "pcb", "screw", "through-hole"] },
  { name: "Automotive Blade Fuse 15A", sku: "FBF-15A-100PK", id: "656fbdad-4b27-4a70-8e90-4de3ef6e4e53", category: "protection", keywords: ["fuse", "blade", "automotive", "15a"] },
  { name: "TVS Diode Array USB 3.0", sku: "SESD0402Q2UG-0024-098", id: "29a26273-ee36-4708-b8fe-8a819c6214a3", category: "protection", keywords: ["tvs", "diode", "esd", "usb", "protection"] },
];

function findProducts(query: string) {
  const lower = query.toLowerCase();
  const words = lower.split(/\s+/);
  return PRODUCT_CATALOG.filter(p => {
    const searchable = `${p.name} ${p.sku} ${p.category} ${p.keywords.join(" ")}`.toLowerCase();
    return words.some(w => searchable.includes(w));
  }).slice(0, 3);
}

function generateResponse(query: string, user: any): { content: string; links?: { label: string; href: string }[] } {
  const lower = query.toLowerCase();

  if (lower.includes("order") && (lower.includes("status") || lower.includes("track") || lower.includes("where"))) {
    if (user) {
      return {
        content: "You can check your order status and tracking information on the My Orders page. Each order shows real-time status updates and tracking numbers when available.",
        links: [{ label: "View My Orders", href: "/orders" }],
      };
    }
    return { content: "Please sign in to check your order status. Once logged in, you can view all your orders, tracking information, and status history.", links: [{ label: "Sign In", href: "/login" }] };
  }

  if (lower.includes("connector") || lower.includes("waterproof") || lower.includes("sealed")) {
    const matches = findProducts(query);
    if (matches.length > 0) {
      return {
        content: `I found ${matches.length} connector${matches.length > 1 ? "s" : ""} that might work for you. Our sealed connectors are rated IP67 or higher for demanding environments.`,
        links: matches.map(m => ({ label: `${m.name} (${m.sku})`, href: `/products/${m.id}` })),
      };
    }
    return { content: "We have a wide range of sealed and waterproof connectors. Let me show you our connector catalog.", links: [{ label: "Browse Connectors", href: "/products?categorySlug=connectors" }] };
  }

  if (lower.includes("sensor") || lower.includes("temperature") || lower.includes("pressure") || lower.includes("vibration")) {
    const matches = findProducts(query);
    if (matches.length > 0) {
      return {
        content: `Here are some sensors that match your needs. All our sensors come with calibration certificates and technical documentation.`,
        links: matches.map(m => ({ label: `${m.name} (${m.sku})`, href: `/products/${m.id}` })),
      };
    }
    return { content: "We offer temperature, pressure, and vibration sensors for industrial applications.", links: [{ label: "Browse Sensors", href: "/products?categorySlug=sensors" }] };
  }

  if (lower.includes("relay") || lower.includes("switch") || lower.includes("contactor")) {
    const matches = findProducts(query);
    return {
      content: "We carry PCB relays and contactor relays for various switching applications. Here are some options:",
      links: matches.length > 0 ? matches.map(m => ({ label: `${m.name} (${m.sku})`, href: `/products/${m.id}` })) : [{ label: "Browse Relays", href: "/products?categorySlug=relays" }],
    };
  }

  if (lower.includes("cable") || lower.includes("wire") || lower.includes("ethernet")) {
    const matches = findProducts(query);
    return {
      content: "We have Ethernet cables, silicone high-temp cables, and more for various applications.",
      links: matches.length > 0 ? matches.map(m => ({ label: `${m.name} (${m.sku})`, href: `/products/${m.id}` })) : [{ label: "Browse Cables", href: "/products?categorySlug=wire-cable" }],
    };
  }

  if (lower.includes("discount") || lower.includes("coupon") || lower.includes("promo")) {
    return { content: "We have volume pricing available on all products - the more you order, the lower the unit price. You can also use discount codes at checkout. Try codes like TE10 for 10% off or VOLUME20 for 20% off!" };
  }

  if (lower.includes("ship") || lower.includes("delivery") || lower.includes("freight")) {
    return { content: "We offer three shipping options: Standard (Free, 5-7 days), Express ($15, 2-3 days), and Next Day ($35, 1 day). Shipping is calculated at checkout based on your selected method." };
  }

  if (lower.includes("part") || lower.includes("sku") || lower.includes("number")) {
    return { content: "You can quickly add items by part number using the 'Quick Add' field in the header bar. Just type the TE part number and hit Enter to add it directly to your cart!" };
  }

  const matches = findProducts(query);
  if (matches.length > 0) {
    return {
      content: `I found some products that might be what you're looking for:`,
      links: matches.map(m => ({ label: `${m.name} (${m.sku})`, href: `/products/${m.id}` })),
    };
  }

  return {
    content: "I can help you find products, check order status, learn about shipping options, and more. Try asking me about specific product types like connectors, sensors, or cables, or ask about your order status!",
    links: [{ label: "Browse All Products", href: "/products" }],
  };
}

export function AIChatbot() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm the TE Connectivity AI assistant. I can help you find products, check order status, and answer questions about our catalog. What can I help you with?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = generateResponse(userMsg.content, user);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.content,
        links: response.links,
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 600);
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#f28d00] text-white shadow-lg hover:bg-[#d97d00] transition-all flex items-center justify-center group"
          data-testid="button-chatbot-open"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#167a87] flex items-center justify-center">
            <Sparkles className="h-2.5 w-2.5 text-white" />
          </span>
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)]" data-testid="chatbot-panel">
          <Card className="flex flex-col h-[500px] max-h-[70vh] shadow-2xl overflow-hidden">
            <div className="bg-[#2e4957] text-white p-3 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#f28d00] flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">TE AI Assistant</p>
                  <Badge variant="secondary" className="text-[8px] bg-white/20 text-white border-0">
                    <Sparkles className="h-2 w-2 mr-0.5" />
                    {t("ai.badge")}
                  </Badge>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} data-testid="button-chatbot-close">
                <X className="h-4 w-4 opacity-60 hover:opacity-100" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-accent/20">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}>
                  {msg.role === "assistant" && (
                    <div className="w-6 h-6 rounded-full bg-[#167a87] flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="h-3 w-3 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[80%] ${msg.role === "user" ? "bg-[#f28d00] text-white" : "bg-background border"} rounded-lg p-2.5`}>
                    <p className="text-xs leading-relaxed">{msg.content}</p>
                    {msg.links && msg.links.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {msg.links.map((link, i) => (
                          <button
                            key={i}
                            onClick={() => { navigate(link.href); setIsOpen(false); }}
                            className="flex items-center gap-1 text-[10px] text-[#167a87] hover:underline w-full text-left"
                            data-testid={`chatbot-link-${i}`}
                          >
                            <ExternalLink className="h-2.5 w-2.5 flex-shrink-0" />
                            {link.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="h-3 w-3" />
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#167a87] flex items-center justify-center flex-shrink-0">
                    <Bot className="h-3 w-3 text-white" />
                  </div>
                  <div className="bg-background border rounded-lg p-2.5">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-2.5 border-t flex-shrink-0 bg-background">
              <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about products, orders..."
                  className="flex-1 h-8 px-3 rounded-md border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-[#f28d00]/30"
                  data-testid="input-chatbot"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!input.trim() || isTyping}
                  className="h-8 w-8 p-0 bg-[#f28d00] hover:bg-[#d97d00]"
                  data-testid="button-chatbot-send"
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </form>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
