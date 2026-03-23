import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight, Zap, Shield, Globe, TrendingUp, Box, Cpu, Sparkles,
  BatteryCharging, Server, Factory, ChevronRight,
  Users, MapPin, Wrench, DollarSign, Play
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  FadeIn, StaggerContainer, StaggerItem,
  AnimatedCounter, ConnectivityMotif
} from "@/components/animations";
import type { Category, Product } from "@shared/schema";

const industryIcons: Record<string, typeof Zap> = {
  "Connectors": Box,
  "Sensors": Cpu,
  "Relays": Zap,
  "Wire & Cable": Globe,
  "Circuit Protection": Shield,
  "Terminal Blocks": TrendingUp,
};

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

function HeroVideoBackground() {
  const [videoFailed, setVideoFailed] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const prefersReducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const showVideo = !videoFailed && !prefersReducedMotion && !isPaused;

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#04215d]/90 via-[#2e4957]/85 to-[#167a87]/70 z-10" />
      {!videoFailed && !prefersReducedMotion && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${showVideo ? "opacity-100" : "opacity-0"}`}
          onError={() => setVideoFailed(true)}
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-circuit-board-with-neon-lights-close-up-view-77488-large.mp4" type="video/mp4" />
        </video>
      )}
      <div className={`absolute inset-0 transition-opacity duration-500 ${showVideo ? "opacity-0" : "opacity-100"}`}>
        <div className="absolute inset-0 bg-[#2e4957]" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        {!prefersReducedMotion && (
          <>
            <motion.div
              className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-[#f28d00]/5 blur-3xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full bg-[#167a87]/8 blur-3xl"
              animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
          </>
        )}
      </div>
      {!videoFailed && !prefersReducedMotion && (
        <button
          onClick={() => {
            setIsPaused(!isPaused);
            if (videoRef.current) {
              isPaused ? videoRef.current.play() : videoRef.current.pause();
            }
          }}
          className="absolute bottom-6 right-6 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white/60 text-xs hover:bg-white/20 transition-colors"
          data-testid="button-toggle-video"
        >
          <Play className="h-3 w-3" />
          {isPaused ? "Play Video" : "Pause"}
        </button>
      )}
    </div>
  );
}

function AnimatedConnectivitySVG() {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 overflow-hidden h-20">
      <svg viewBox="0 0 1400 80" className="w-full h-full" preserveAspectRatio="none" aria-hidden="true">
        <motion.line
          x1="0" y1="20" x2="1400" y2="20"
          stroke="#f28d00" strokeWidth="3" strokeLinecap="round" opacity="0.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
        />
        <motion.line
          x1="0" y1="40" x2="1100" y2="40"
          stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.12"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 0.8, ease: "easeInOut" }}
        />
        <motion.line
          x1="0" y1="60" x2="800" y2="60"
          stroke="#167a87" strokeWidth="3" strokeLinecap="round" opacity="0.35"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 1.1, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
}

const megaTrends = [
  {
    title: "Electrification",
    subtitle: "Powering the transition to electric everything",
    description: "From EV battery systems to renewable energy grids, TE connectivity solutions enable the reliable flow of power across next-generation electrical architectures.",
    stat: "40%",
    statLabel: "growth in EV connector demand",
    icon: BatteryCharging,
    color: "#f28d00",
    href: "/solutions/transportation",
  },
  {
    title: "AI Infrastructure",
    subtitle: "The backbone of intelligent systems",
    description: "Hyperscale data centers require unprecedented power density and high-speed connectivity. TE delivers both — enabling AI compute at scale.",
    stat: "3x",
    statLabel: "data center power demand by 2030",
    icon: Server,
    color: "#167a87",
    href: "/solutions/communications",
  },
  {
    title: "Industrial Automation",
    subtitle: "Connecting the smart factory",
    description: "Robotics, smart manufacturing, and factory automation demand connectivity that survives heat, vibration, and continuous operation. That's where TE thrives.",
    stat: "90K+",
    statLabel: "employees across 140 countries",
    icon: Factory,
    color: "#2e4957",
    href: "/solutions/industrial",
  },
];

const solutionPathways = [
  {
    question: "How do I improve EV charging reliability?",
    context: "High-voltage connectors and thermal management solutions engineered for the harshest automotive environments.",
    href: "/solutions/transportation",
    industry: "Transportation",
  },
  {
    question: "How do I scale AI data center infrastructure?",
    context: "High-speed, high-density connectivity solutions that handle the power and signal demands of next-gen AI compute.",
    href: "/solutions/communications",
    industry: "Communications",
  },
  {
    question: "How do I modernize energy grid systems?",
    context: "Utility-grade connectors, sensors, and power distribution solutions for smart grid and renewable energy infrastructure.",
    href: "/solutions/industrial",
    industry: "Industrial",
  },
  {
    question: "How do I ensure signal integrity in harsh environments?",
    context: "Connectors and sensors rated for extreme temperatures, vibration, and mission-critical reliability across industries.",
    href: "/products",
    industry: "Cross-Industry",
  },
];

const authorityStats = [
  { value: 18, prefix: "$", suffix: "B+", label: "Annual Revenue", icon: DollarSign },
  { value: 140, prefix: "", suffix: "+", label: "Countries Served", icon: MapPin },
  { value: 8000, prefix: "", suffix: "+", label: "Engineers Worldwide", icon: Wrench },
  { value: 90000, prefix: "", suffix: "+", label: "Global Employees", icon: Users },
];

export default function Home() {
  const { t, formatPrice } = useI18n();
  const { user } = useAuth();
  const recentIds = useRecentlyViewed();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.3]);

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
      <motion.section ref={heroRef} className="relative min-h-[85vh] flex items-center text-white overflow-hidden" style={{ opacity: heroOpacity }}>
        <HeroVideoBackground />
        <AnimatedConnectivitySVG />

        <div className="relative z-20 max-w-[1400px] mx-auto px-4 py-20 md:py-32 w-full">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Badge className="mb-6 bg-[#f28d00]/20 text-[#f28d00] border-[#f28d00]/30 backdrop-blur-sm font-heading text-xs tracking-wider uppercase" data-testid="badge-hero">
                The Infrastructure Behind What Matters
              </Badge>
            </motion.div>

            <motion.h1
              className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold leading-[1.05] mb-6 tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
              data-testid="text-hero-title"
            >
              Every Connection
              <br />
              <span className="text-[#f28d00]">Counts</span>
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-white/70 mb-10 leading-relaxed max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              data-testid="text-hero-subtitle"
            >
              TE Connectivity is the invisible infrastructure powering electrification,
              AI, and industrial automation at global scale. We don't just connect
              components — we enable the systems that power the world.
            </motion.p>

            <motion.div
              className="flex items-center gap-4 flex-wrap"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <Link href="/solutions/transportation">
                <Button
                  size="lg"
                  className="bg-[#f28d00] hover:bg-[#e07d00] text-white font-heading text-base px-8 h-12"
                  data-testid="button-explore-solutions"
                >
                  Explore Solutions
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/products">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/5 border-white/20 text-white hover:bg-white/10 font-heading text-base px-8 h-12 backdrop-blur-sm"
                  data-testid="button-browse-catalog"
                >
                  Browse Catalog
                </Button>
              </Link>
            </motion.div>

            <motion.div
              className="mt-12 pt-8 border-t border-white/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.2 }}
            >
              <ConnectivityMotif className="w-48" />
            </motion.div>
          </div>
        </div>
      </motion.section>

      <section className="relative bg-background py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" width="30" height="30" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>

        <div className="max-w-[1400px] mx-auto px-4 relative">
          <FadeIn className="text-center mb-16">
            <p className="text-[#f28d00] font-heading font-semibold text-sm tracking-wider uppercase mb-3" data-testid="text-megatrends-label">
              Where We Create Impact
            </p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4" data-testid="text-megatrends-title">
              Positioned at the Intersection of
              <br className="hidden md:block" />
              Three Mega-Trends
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-base leading-relaxed">
              TE Connectivity is uniquely positioned where electrification, artificial intelligence,
              and industrial automation converge — benefiting from every single one simultaneously.
            </p>
          </FadeIn>

          <StaggerContainer staggerDelay={0.15} className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {megaTrends.map((trend) => (
              <StaggerItem key={trend.title}>
                <Link href={trend.href}>
                  <Card className="hover-elevate cursor-pointer h-full group relative overflow-hidden" data-testid={`card-megatrend-${trend.title.toLowerCase().replace(/\s+/g, '-')}`}>
                    <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: trend.color }} />
                    <div className="p-6 md:p-8">
                      <div
                        className="w-14 h-14 rounded-lg flex items-center justify-center mb-5 transition-transform group-hover:scale-110"
                        style={{ backgroundColor: `${trend.color}15` }}
                      >
                        <trend.icon className="h-7 w-7" style={{ color: trend.color }} />
                      </div>
                      <h3 className="text-xl font-heading font-bold mb-1">{trend.title}</h3>
                      <p className="text-sm text-muted-foreground font-medium mb-3">{trend.subtitle}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-6">{trend.description}</p>
                      <div className="pt-4 border-t border-border/50">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-heading font-bold" style={{ color: trend.color }}>{trend.stat}</span>
                          <span className="text-xs text-muted-foreground">{trend.statLabel}</span>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center text-sm font-heading font-medium group-hover:gap-2 transition-all" style={{ color: trend.color }}>
                        Learn More <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Card>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <section className="bg-[#2e4957] text-white py-20 md:py-24 relative overflow-hidden">
        <motion.div
          className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-[#f28d00]/5 blur-3xl"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="max-w-[1400px] mx-auto px-4 relative">
          <FadeIn className="text-center mb-14">
            <p className="text-[#f28d00] font-heading font-semibold text-sm tracking-wider uppercase mb-3" data-testid="text-pathways-label">
              Start With Your Challenge
            </p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4" data-testid="text-pathways-title">
              What Problem Are You Solving?
            </h2>
            <p className="text-white/75 max-w-xl mx-auto">
              We don't just sell components. We help you solve engineering challenges
              at the system level.
            </p>
          </FadeIn>

          <StaggerContainer staggerDelay={0.12} className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 max-w-4xl mx-auto">
            {solutionPathways.map((pathway, i) => (
              <StaggerItem key={i}>
                <Link href={pathway.href}>
                  <div
                    className="group cursor-pointer rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                    data-testid={`card-pathway-${i}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <Badge className="bg-[#f28d00]/20 text-[#f28d00] border-[#f28d00]/30 text-[10px]">
                        {pathway.industry}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-[#f28d00] group-hover:translate-x-1 transition-all" />
                    </div>
                    <h3 className="text-lg font-heading font-semibold mb-2 group-hover:text-[#f28d00] transition-colors">
                      "{pathway.question}"
                    </h3>
                    <p className="text-sm text-white/70 leading-relaxed">
                      {pathway.context}
                    </p>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <section className="py-20 md:py-24 bg-background relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4">
          <FadeIn className="text-center mb-16">
            <p className="text-[#f28d00] font-heading font-semibold text-sm tracking-wider uppercase mb-3" data-testid="text-authority-label">
              Global Scale, Engineering Precision
            </p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4" data-testid="text-authority-title">
              The Nervous System of Modern Industry
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              TE Connectivity is a Tier 1 backbone player across multiple industries.
              Once our products are designed into a system, they stay for 10–20+ years.
              That's not a supplier relationship — that's partnership.
            </p>
          </FadeIn>

          <StaggerContainer staggerDelay={0.1} className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-10 max-w-4xl mx-auto mb-16">
            {authorityStats.map((stat) => (
              <StaggerItem key={stat.label} className="text-center">
                <div className="w-12 h-12 rounded-lg bg-[#2e4957]/8 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="h-6 w-6 text-[#2e4957] dark:text-[#167a87]" />
                </div>
                <div className="text-3xl md:text-4xl font-heading font-bold text-[#2e4957] dark:text-foreground mb-1">
                  <AnimatedCounter
                    target={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                  />
                </div>
                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <FadeIn delay={0.3}>
            <div className="bg-[#2e4957] rounded-xl p-8 md:p-12 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#167a87]/20 to-transparent" />
              <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="flex-1">
                  <h3 className="text-xl md:text-2xl font-heading font-bold mb-2">
                    Engineering-Led. Co-Design Model.
                  </h3>
                  <p className="text-white/75 leading-relaxed">
                    With 8,000+ engineers and a local-for-local manufacturing model where ~70% of products are
                    produced where they're sold, TE reduces supply chain risk while delivering deep OEM integration.
                  </p>
                </div>
                <Link href="/products">
                  <Button
                    size="lg"
                    className="bg-[#f28d00] hover:bg-[#e07d00] text-white font-heading whitespace-nowrap"
                    data-testid="button-explore-products"
                  >
                    Explore Products <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {user && aiRecommended.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-4 py-10">
          <FadeIn>
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="h-5 w-5 text-[#f28d00]" />
              <h2 className="text-xl font-heading font-semibold">{t("ai.recommended")}</h2>
              <Badge variant="secondary" className="text-[9px] bg-[#f28d00]/10 text-[#f28d00]" data-testid="badge-ai">
                {t("ai.badge")}
              </Badge>
            </div>
          </FadeIn>
          <StaggerContainer staggerDelay={0.08} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {aiRecommended.map((product) => (
              <StaggerItem key={product.id}>
                <Link href={`/products/${product.id}`}>
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
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>
      )}

      <section className="max-w-[1400px] mx-auto px-4 py-12">
        <FadeIn>
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
        </FadeIn>

        <StaggerContainer staggerDelay={0.08} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  <StaggerItem key={cat.id}>
                    <Link href={`/products?categorySlug=${cat.slug}`}>
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
                  </StaggerItem>
                );
              })}
        </StaggerContainer>
      </section>

      <section className="bg-card border-y">
        <div className="max-w-[1400px] mx-auto px-4 py-12">
          <FadeIn>
            <div className="flex items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-heading font-semibold mb-1">{t("featured.title")}</h2>
                <p className="text-muted-foreground text-sm">{t("featured.subtitle")}</p>
              </div>
            </div>
          </FadeIn>

          <StaggerContainer staggerDelay={0.08} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {prodsLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="p-4">
                    <Skeleton className="aspect-square rounded-md mb-3" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-3 w-2/3" />
                  </Card>
                ))
              : productsData?.products.slice(0, 4).map((product) => (
                  <StaggerItem key={product.id}>
                    <Link href={`/products/${product.id}`}>
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
                  </StaggerItem>
                ))}
          </StaggerContainer>
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-4 py-12">
        <FadeIn>
          <h2 className="text-2xl font-heading font-semibold mb-8 text-center">Why OrderCloud for B2B</h2>
        </FadeIn>
        <StaggerContainer staggerDelay={0.12} className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <StaggerItem key={item.title} className="text-center">
              <div className="w-12 h-12 rounded-md bg-[#2e4957]/10 dark:bg-[#2e4957]/30 flex items-center justify-center mx-auto mb-4">
                <item.icon className="h-6 w-6 text-[#2e4957] dark:text-[#167a87]" />
              </div>
              <h3 className="font-heading font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      <footer className="bg-[#2e4957] text-white">
        <div className="max-w-[1400px] mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
            <div>
              <h4 className="font-heading font-semibold mb-3 text-[#f28d00]">Products</h4>
              <ul className="space-y-2 opacity-75">
                <li><Link href="/products?categorySlug=connectors" className="hover:opacity-100 transition-opacity">Connectors</Link></li>
                <li><Link href="/products?categorySlug=sensors" className="hover:opacity-100 transition-opacity">Sensors</Link></li>
                <li><Link href="/products?categorySlug=relays" className="hover:opacity-100 transition-opacity">Relays</Link></li>
                <li><Link href="/products?categorySlug=wire-cable" className="hover:opacity-100 transition-opacity">Wire & Cable</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading font-semibold mb-3 text-[#f28d00]">Solutions</h4>
              <ul className="space-y-2 opacity-75">
                <li><Link href="/solutions/transportation" className="hover:opacity-100 transition-opacity">Transportation</Link></li>
                <li><Link href="/solutions/industrial" className="hover:opacity-100 transition-opacity">Industrial</Link></li>
                <li><Link href="/solutions/communications" className="hover:opacity-100 transition-opacity">Communications</Link></li>
                <li><Link href="/applications" className="hover:opacity-100 transition-opacity">Applications</Link></li>
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
                <li><Link href="/orders" className="hover:opacity-100 transition-opacity">My Orders</Link></li>
                <li><Link href="/parts-lists" className="hover:opacity-100 transition-opacity">Parts Lists</Link></li>
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
                <span className="text-xs opacity-60">TE Connectivity — Every Connection Counts</span>
              </div>
              <span className="text-[10px] opacity-40 font-heading tracking-widest uppercase">{t("tagline")}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
