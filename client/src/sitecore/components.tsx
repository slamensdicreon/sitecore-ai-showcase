import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BatteryCharging, Server, Factory, ArrowRight, ChevronRight,
  DollarSign, MapPin, Wrench, Users, Zap, Shield, Globe, Cpu,
  Lightbulb, Box, TrendingUp
} from "lucide-react";
import { motion } from "framer-motion";
import {
  FadeIn, StaggerContainer, StaggerItem, AnimatedCounter, ConnectivityMotif
} from "@/components/animations";
import { Text, RichText, getFieldValue, getLinkHref } from "./fields";
import { useIsEditing } from "./context";
import { registerComponents, type SitecoreComponentProps } from "./component-registry";
import type { FieldValue, LinkFieldValue } from "./types";
import type { Product } from "@shared/schema";

const iconMap: Record<string, typeof Zap> = {
  BatteryCharging, Server, Factory, DollarSign, MapPin, Wrench, Users,
  Zap, Shield, Globe, Cpu, Lightbulb, Box, TrendingUp,
};

function getIcon(name?: string) {
  if (!name) return Zap;
  return iconMap[name] || Zap;
}

function ScHeroBanner({ fields, variant }: SitecoreComponentProps) {
  const isEditing = useIsEditing();
  const badgeText = fields["Badge Text"] as FieldValue;
  const title = fields["Title"] as FieldValue;
  const titleAccent = fields["Title Accent"] as FieldValue;
  const subtitle = fields["Subtitle"] as FieldValue;
  const primaryCtaText = fields["Primary CTA Text"] as FieldValue;
  const primaryCtaLink = fields["Primary CTA Link"] as LinkFieldValue;
  const secondaryCtaText = fields["Secondary CTA Text"] as FieldValue;
  const secondaryCtaLink = fields["Secondary CTA Link"] as LinkFieldValue;
  const showMotif = fields["Show Connectivity Motif"] as FieldValue;

  const isCompact = variant === "hero--compact";

  return (
    <section className={`relative ${isCompact ? "min-h-[50vh]" : "min-h-[85vh]"} flex items-center text-white overflow-hidden`}>
      <div className="absolute inset-0 bg-gradient-to-br from-[#04215d]/90 via-[#2e4957]/85 to-[#167a87]/70 z-10" />
      <div className="absolute inset-0 bg-[#2e4957]" />

      <div className="relative z-20 max-w-[1400px] mx-auto px-4 py-20 md:py-32 w-full">
        <div className="max-w-3xl">
          {badgeText?.value && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
              <Badge className="mb-6 bg-[#f28d00]/20 text-[#f28d00] border-[#f28d00]/30 backdrop-blur-sm font-heading text-xs tracking-wider uppercase" data-testid="badge-hero">
                <Text field={badgeText} tag="span" editable={isEditing} />
              </Badge>
            </motion.div>
          )}

          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold leading-[1.05] mb-6 tracking-tight"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
            data-testid="text-hero-title"
          >
            <Text field={title} tag="span" editable={isEditing} />
            {titleAccent?.value && (
              <>
                <br />
                <span className="text-[#f28d00]">
                  <Text field={titleAccent} tag="span" editable={isEditing} />
                </span>
              </>
            )}
          </motion.h1>

          <motion.div
            className="text-lg md:text-xl text-white/70 mb-10 leading-relaxed max-w-2xl"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }}
            data-testid="text-hero-subtitle"
          >
            <Text field={subtitle} tag="p" editable={isEditing} />
          </motion.div>

          <motion.div
            className="flex items-center gap-4 flex-wrap"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.8 }}
          >
            {primaryCtaText?.value && (
              <Link href={getLinkHref(primaryCtaLink)}>
                <Button size="lg" className="bg-[#f28d00] hover:bg-[#e07d00] text-white font-heading text-base px-8 h-12" data-testid="button-hero-primary">
                  {getFieldValue(primaryCtaText)}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            )}
            {secondaryCtaText?.value && (
              <Link href={getLinkHref(secondaryCtaLink)}>
                <Button size="lg" variant="outline" className="bg-white/5 border-white/20 text-white hover:bg-white/10 font-heading text-base px-8 h-12 backdrop-blur-sm" data-testid="button-hero-secondary">
                  {getFieldValue(secondaryCtaText)}
                </Button>
              </Link>
            )}
          </motion.div>

          {showMotif?.value === "1" && (
            <motion.div className="mt-12 pt-8 border-t border-white/10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1.2 }}>
              <ConnectivityMotif className="w-48" />
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}

function ScMegaTrends({ fields, rendering }: SitecoreComponentProps) {
  const isEditing = useIsEditing();
  const sectionLabel = fields["Section Label"] as FieldValue;
  const heading = fields["Heading"] as FieldValue;
  const description = fields["Description"] as FieldValue;

  const { data: children } = useQuery<any[]>({
    queryKey: [`/api/sitecore/children?path=${encodeURIComponent(rendering.dataSource)}`],
    enabled: !!rendering.dataSource,
  });

  const cards = children || [];

  return (
    <section className="relative bg-background py-20 md:py-28 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 relative">
        <FadeIn className="text-center mb-16">
          <p className="text-[#f28d00] font-heading font-semibold text-sm tracking-wider uppercase mb-3" data-testid="text-megatrends-label">
            <Text field={sectionLabel} tag="span" editable={isEditing} />
          </p>
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4" data-testid="text-megatrends-title">
            <Text field={heading} tag="span" editable={isEditing} />
          </h2>
          <div className="text-muted-foreground max-w-2xl mx-auto text-base leading-relaxed">
            <Text field={description} tag="p" editable={isEditing} />
          </div>
        </FadeIn>

        {cards.length > 0 && (
          <StaggerContainer staggerDelay={0.15} className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {cards.map((card: any, i: number) => {
              const Icon = getIcon(card.fields?.["Icon Name"]?.value);
              const color = card.fields?.["Accent Color"]?.value || "#f28d00";
              const href = card.fields?.["Link"]?.value?.href || "#";
              return (
                <StaggerItem key={card.id || i}>
                  <Link href={href}>
                    <Card className="hover-elevate cursor-pointer h-full group relative overflow-hidden" data-testid={`card-megatrend-${i}`}>
                      <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: color }} />
                      <div className="p-6 md:p-8">
                        <div className="w-14 h-14 rounded-lg flex items-center justify-center mb-5 transition-transform group-hover:scale-110" style={{ backgroundColor: `${color}15` }}>
                          <Icon className="h-7 w-7" style={{ color }} />
                        </div>
                        <h3 className="text-xl font-heading font-bold mb-1">{card.fields?.["Title"]?.value}</h3>
                        <p className="text-sm text-muted-foreground font-medium mb-3">{card.fields?.["Subtitle"]?.value}</p>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-6">{card.fields?.["Description"]?.value}</p>
                        <div className="pt-4 border-t border-border/50">
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-heading font-bold" style={{ color }}>{card.fields?.["Stat Value"]?.value}</span>
                            <span className="text-xs text-muted-foreground">{card.fields?.["Stat Label"]?.value}</span>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm font-heading font-medium group-hover:gap-2 transition-all" style={{ color }}>
                          Learn More <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </Card>
                  </Link>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        )}

        {isEditing && cards.length === 0 && (
          <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-12 text-center">
            <p className="text-muted-foreground">Add Mega Trend Card items as children of this datasource</p>
          </div>
        )}
      </div>
    </section>
  );
}

function ScSolutionPathways({ fields, rendering, variant }: SitecoreComponentProps) {
  const isEditing = useIsEditing();
  const sectionLabel = fields["Section Label"] as FieldValue;
  const heading = fields["Heading"] as FieldValue;
  const description = fields["Description"] as FieldValue;
  const isLight = variant === "pathways--light";

  const { data: children } = useQuery<any[]>({
    queryKey: [`/api/sitecore/children?path=${encodeURIComponent(rendering.dataSource)}`],
    enabled: !!rendering.dataSource,
  });

  const cards = children || [];

  return (
    <section className={`${isLight ? "bg-background" : "bg-[#2e4957] text-white"} py-20 md:py-24 relative overflow-hidden`}>
      <div className="max-w-[1400px] mx-auto px-4 relative">
        <FadeIn className="text-center mb-14">
          <p className="text-[#f28d00] font-heading font-semibold text-sm tracking-wider uppercase mb-3" data-testid="text-pathways-label">
            <Text field={sectionLabel} tag="span" editable={isEditing} />
          </p>
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4" data-testid="text-pathways-title">
            <Text field={heading} tag="span" editable={isEditing} />
          </h2>
          <div className={isLight ? "text-muted-foreground" : "text-white/75"}>
            <Text field={description} tag="p" className="max-w-xl mx-auto" editable={isEditing} />
          </div>
        </FadeIn>

        {cards.length > 0 && (
          <StaggerContainer staggerDelay={0.12} className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 max-w-4xl mx-auto">
            {cards.map((card: any, i: number) => {
              const href = card.fields?.["Link"]?.value?.href || "#";
              return (
                <StaggerItem key={card.id || i}>
                  <Link href={href}>
                    <div className={`group cursor-pointer rounded-lg border p-6 transition-all duration-300 ${
                      isLight
                        ? "border-border bg-muted/30 hover:bg-muted/60"
                        : "border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/20"
                    }`} data-testid={`card-pathway-${i}`}>
                      <div className="flex items-start justify-between mb-3">
                        <Badge className="bg-[#f28d00]/20 text-[#f28d00] border-[#f28d00]/30 text-[10px]">
                          {card.fields?.["Industry Label"]?.value}
                        </Badge>
                        <ChevronRight className={`h-4 w-4 group-hover:translate-x-1 transition-all ${
                          isLight ? "text-muted-foreground group-hover:text-[#f28d00]" : "text-white/30 group-hover:text-[#f28d00]"
                        }`} />
                      </div>
                      <h3 className={`text-lg font-heading font-semibold mb-2 group-hover:text-[#f28d00] transition-colors`}>
                        "{card.fields?.["Question"]?.value}"
                      </h3>
                      <p className={`text-sm leading-relaxed ${isLight ? "text-muted-foreground" : "text-white/70"}`}>
                        {card.fields?.["Context"]?.value}
                      </p>
                    </div>
                  </Link>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        )}
      </div>
    </section>
  );
}

function ScAuthorityStats({ fields, rendering, variant }: SitecoreComponentProps) {
  const isEditing = useIsEditing();
  const sectionLabel = fields["Section Label"] as FieldValue;
  const heading = fields["Heading"] as FieldValue;
  const description = fields["Description"] as FieldValue;
  const ctaHeading = fields["CTA Heading"] as FieldValue;
  const ctaDescription = fields["CTA Description"] as FieldValue;
  const ctaLinkText = fields["CTA Link Text"] as FieldValue;
  const ctaLink = fields["CTA Link"] as LinkFieldValue;
  const isDark = variant === "authority--dark";

  const { data: children } = useQuery<any[]>({
    queryKey: [`/api/sitecore/children?path=${encodeURIComponent(rendering.dataSource)}`],
    enabled: !!rendering.dataSource,
  });

  const stats = children || [];

  return (
    <section className={`py-20 md:py-24 ${isDark ? "bg-[#2e4957] text-white" : "bg-background"} relative overflow-hidden`}>
      <div className="max-w-[1400px] mx-auto px-4">
        <FadeIn className="text-center mb-16">
          <p className="text-[#f28d00] font-heading font-semibold text-sm tracking-wider uppercase mb-3" data-testid="text-authority-label">
            <Text field={sectionLabel} tag="span" editable={isEditing} />
          </p>
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4" data-testid="text-authority-title">
            <Text field={heading} tag="span" editable={isEditing} />
          </h2>
          <div className={`max-w-2xl mx-auto leading-relaxed ${isDark ? "text-white/75" : "text-muted-foreground"}`}>
            <Text field={description} tag="p" editable={isEditing} />
          </div>
        </FadeIn>

        {stats.length > 0 && (
          <StaggerContainer staggerDelay={0.1} className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-10 max-w-4xl mx-auto mb-16">
            {stats.map((stat: any, i: number) => {
              const Icon = getIcon(stat.fields?.["Icon Name"]?.value);
              const val = parseInt(stat.fields?.["Value"]?.value || "0");
              const prefix = stat.fields?.["Prefix"]?.value || "";
              const suffix = stat.fields?.["Suffix"]?.value || "";
              return (
                <StaggerItem key={stat.id || i} className="text-center">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 ${isDark ? "bg-white/5" : "bg-[#2e4957]/8 dark:bg-white/5"}`}>
                    <Icon className={`h-6 w-6 ${isDark ? "text-[#167a87]" : "text-[#2e4957] dark:text-[#167a87]"}`} />
                  </div>
                  <div className={`text-3xl md:text-4xl font-heading font-bold mb-1 ${isDark ? "text-white" : "text-[#2e4957] dark:text-foreground"}`}>
                    <AnimatedCounter target={val} prefix={prefix} suffix={suffix} />
                  </div>
                  <p className={`text-sm font-medium ${isDark ? "text-white/70" : "text-muted-foreground"}`}>{stat.fields?.["Label"]?.value}</p>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        )}

        {ctaHeading?.value && (
          <FadeIn delay={0.3}>
            <div className="bg-[#2e4957] rounded-xl p-8 md:p-12 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#167a87]/20 to-transparent" />
              <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="flex-1">
                  <h3 className="text-xl md:text-2xl font-heading font-bold mb-2">
                    <Text field={ctaHeading} tag="span" editable={isEditing} />
                  </h3>
                  <div className="text-white/75 leading-relaxed">
                    <Text field={ctaDescription} tag="p" editable={isEditing} />
                  </div>
                </div>
                <Link href={getLinkHref(ctaLink)}>
                  <Button size="lg" className="bg-[#f28d00] hover:bg-[#e07d00] text-white font-heading whitespace-nowrap" data-testid="button-authority-cta">
                    {getFieldValue(ctaLinkText)} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </FadeIn>
        )}
      </div>
    </section>
  );
}

function ScSolutionHero({ fields, variant }: SitecoreComponentProps) {
  const isEditing = useIsEditing();
  const industryLabel = fields["Industry Label"] as FieldValue;
  const title = fields["Title"] as FieldValue;
  const subtitle = fields["Subtitle"] as FieldValue;
  const accentColor = getFieldValue(fields["Accent Color"] as FieldValue) || "#f28d00";
  const isMinimal = variant === "solution-hero--minimal";

  return (
    <section className={`relative ${isMinimal ? "py-16" : "min-h-[60vh] flex items-center"} text-white overflow-hidden`}>
      <div className="absolute inset-0 bg-gradient-to-br from-[#04215d]/90 via-[#2e4957]/85 to-[#167a87]/70 z-10" />
      <div className="absolute inset-0 bg-[#2e4957]" />

      <div className="relative z-20 max-w-[1400px] mx-auto px-4 py-16 md:py-24 w-full">
        <div className="max-w-3xl">
          <Badge className="mb-4 border-white/20 bg-white/10 font-heading text-xs tracking-wider uppercase" style={{ color: accentColor }} data-testid="badge-solution-industry">
            <Text field={industryLabel} tag="span" editable={isEditing} />
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold leading-[1.08] mb-6" data-testid="text-solution-title">
            <Text field={title} tag="span" editable={isEditing} />
          </h1>
          <div className="text-lg md:text-xl text-white/70 max-w-2xl leading-relaxed" data-testid="text-solution-subtitle">
            <Text field={subtitle} tag="p" editable={isEditing} />
          </div>
          <div className="mt-8">
            <ConnectivityMotif className="w-48" />
          </div>
        </div>
      </div>
    </section>
  );
}

function ScSolutionNarrative({ fields, variant }: SitecoreComponentProps) {
  const isEditing = useIsEditing();
  const sectionLabel = fields["Section Label"] as FieldValue;
  const heading = fields["Heading"] as FieldValue;
  const leadText = fields["Lead Text"] as FieldValue;
  const body = fields["Body"] as FieldValue;
  const isTwoCol = variant === "narrative--two-col";
  const isAccentLeft = variant === "narrative--accent-left";

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="max-w-[1400px] mx-auto px-4">
        <FadeIn>
          <div className={isAccentLeft ? "border-l-4 border-[#f28d00] pl-8" : ""}>
            <p className="text-[#f28d00] font-heading font-semibold text-sm tracking-wider uppercase mb-3" data-testid="text-narrative-label">
              <Text field={sectionLabel} tag="span" editable={isEditing} />
            </p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6" data-testid="text-narrative-heading">
              <Text field={heading} tag="span" editable={isEditing} />
            </h2>
          </div>
          <div className={isTwoCol ? "grid grid-cols-1 md:grid-cols-2 gap-8 mt-8" : "mt-8 max-w-3xl"}>
            <div className="text-lg text-muted-foreground leading-relaxed" data-testid="text-narrative-lead">
              <Text field={leadText} tag="p" editable={isEditing} />
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none" data-testid="text-narrative-body">
              <RichText field={body} editable={isEditing} />
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function ScProductDiscovery({ fields, variant }: SitecoreComponentProps) {
  const isEditing = useIsEditing();
  const { formatPrice } = useI18n();
  const sectionLabel = fields["Section Label"] as FieldValue;
  const heading = fields["Heading"] as FieldValue;
  const description = fields["Description"] as FieldValue;
  const industryFilter = getFieldValue(fields["Industry Filter"] as FieldValue) || "";
  const applicationFilter = getFieldValue(fields["Application Filter"] as FieldValue) || "";
  const maxProducts = parseInt(getFieldValue(fields["Max Products"] as FieldValue) || "6");
  const ctaText = fields["CTA Text"] as FieldValue;
  const ctaLink = fields["CTA Link"] as LinkFieldValue;

  const queryParams = new URLSearchParams();
  if (industryFilter) queryParams.set("industry", industryFilter);
  if (applicationFilter) queryParams.set("application", applicationFilter);
  queryParams.set("limit", String(maxProducts));

  const { data: productsData, isLoading } = useQuery<{ products: Product[]; total: number }>({
    queryKey: [`/api/products?${queryParams.toString()}`],
  });

  const products = productsData?.products || [];
  const isCarousel = variant === "discovery--carousel";
  const isCompactList = variant === "discovery--compact";

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="max-w-[1400px] mx-auto px-4">
        <FadeIn className="text-center mb-12">
          <p className="text-[#f28d00] font-heading font-semibold text-sm tracking-wider uppercase mb-3" data-testid="text-discovery-label">
            <Text field={sectionLabel} tag="span" editable={isEditing} />
          </p>
          <h2 className="text-2xl md:text-3xl font-heading font-bold mb-3" data-testid="text-discovery-heading">
            <Text field={heading} tag="span" editable={isEditing} />
          </h2>
          <div className="text-muted-foreground max-w-xl mx-auto">
            <Text field={description} tag="p" editable={isEditing} />
          </div>
        </FadeIn>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-muted/50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <StaggerContainer staggerDelay={0.08} className={
            isCarousel
              ? "flex gap-4 overflow-x-auto pb-4"
              : isCompactList
              ? "space-y-3"
              : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          }>
            {products.map((product) => (
              <StaggerItem key={product.id} className={isCarousel ? "min-w-[300px]" : ""}>
                <Link href={`/products/${product.id}`}>
                  <Card className="hover-elevate cursor-pointer h-full" data-testid={`card-product-${product.sku}`}>
                    <div className={isCompactList ? "p-4 flex items-center gap-4" : "p-5"}>
                      {!isCompactList && product.imageUrl && (
                        <div className="h-32 flex items-center justify-center mb-3 bg-muted/30 rounded-lg">
                          <img src={product.imageUrl} alt={product.name} className="h-24 w-auto object-contain" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-[10px] text-muted-foreground font-mono">{product.sku}</p>
                        <h4 className="text-sm font-heading font-semibold mt-0.5 line-clamp-2">{product.name}</h4>
                        {!isCompactList && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
                        )}
                      </div>
                      <div className={isCompactList ? "text-right" : "mt-3 flex items-center justify-between"}>
                        <span className="text-sm font-heading font-bold text-[#2e4957] dark:text-foreground">
                          {formatPrice(Number(product.basePrice))}
                        </span>
                        {!isCompactList && (
                          <Badge variant={product.inStock ? "secondary" : "destructive"} className="text-[9px]">
                            {product.inStock ? "In Stock" : "Lead Time"}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}

        {ctaText?.value && (
          <FadeIn delay={0.2} className="text-center mt-8">
            <Link href={getLinkHref(ctaLink)}>
              <Button className="bg-[#2e4957] hover:bg-[#1d3340] text-white font-heading" data-testid="button-discovery-cta">
                {getFieldValue(ctaText)} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </FadeIn>
        )}
      </div>
    </section>
  );
}

function ScCrossNavigation({ fields, rendering }: SitecoreComponentProps) {
  const isEditing = useIsEditing();
  const heading = fields["Heading"] as FieldValue;
  const description = fields["Description"] as FieldValue;

  const { data: children } = useQuery<any[]>({
    queryKey: [`/api/sitecore/children?path=${encodeURIComponent(rendering.dataSource)}`],
    enabled: !!rendering.dataSource,
  });

  const links = children || [];

  return (
    <section className="py-16 md:py-20 bg-background border-t">
      <div className="max-w-[1400px] mx-auto px-4">
        <FadeIn className="text-center mb-10">
          <h2 className="text-2xl font-heading font-bold mb-2" data-testid="text-crossnav-heading">
            <Text field={heading} tag="span" editable={isEditing} />
          </h2>
          <div className="text-muted-foreground">
            <Text field={description} tag="p" editable={isEditing} />
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {links.map((link: any, i: number) => {
            const Icon = getIcon(link.fields?.["Icon Name"]?.value);
            const color = link.fields?.["Accent Color"]?.value || "#2e4957";
            const href = link.fields?.["Link"]?.value?.href || "#";
            return (
              <Link key={link.id || i} href={href}>
                <Card className="hover-elevate cursor-pointer group" data-testid={`card-crossnav-${i}`}>
                  <div className="p-6 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}15` }}>
                      <Icon className="h-5 w-5" style={{ color }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-heading font-semibold text-sm group-hover:text-[#f28d00] transition-colors">{link.fields?.["Title"]?.value}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{link.fields?.["Description"]?.value}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-[#f28d00] group-hover:translate-x-1 transition-all" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ScRichTextBlock({ fields, variant }: SitecoreComponentProps) {
  const isEditing = useIsEditing();
  const content = fields["Content"] as FieldValue;
  const isNarrow = variant === "rte--narrow";
  const isFull = variant === "rte--full";

  return (
    <section className="py-12 md:py-16 bg-background">
      <div className={`${isFull ? "" : "max-w-[1400px]"} mx-auto px-4`}>
        <div className={`prose prose-lg dark:prose-invert ${isNarrow ? "max-w-2xl mx-auto" : "max-w-none"}`}>
          <RichText field={content} editable={isEditing} data-testid="text-rte-content" />
        </div>
      </div>
    </section>
  );
}

function ScProofPointCounter({ fields, rendering }: SitecoreComponentProps) {
  const isEditing = useIsEditing();
  const sectionLabel = fields["Section Label"] as FieldValue;
  const heading = fields["Heading"] as FieldValue;

  const { data: children } = useQuery<any[]>({
    queryKey: [`/api/sitecore/children?path=${encodeURIComponent(rendering.dataSource)}`],
    enabled: !!rendering.dataSource,
  });

  const items = children || [];

  return (
    <section className="py-16 md:py-20 bg-[#2e4957] text-white">
      <div className="max-w-[1400px] mx-auto px-4">
        <FadeIn className="text-center mb-12">
          <p className="text-[#f28d00] font-heading font-semibold text-sm tracking-wider uppercase mb-3">
            <Text field={sectionLabel} tag="span" editable={isEditing} />
          </p>
          <h2 className="text-2xl md:text-3xl font-heading font-bold">
            <Text field={heading} tag="span" editable={isEditing} />
          </h2>
        </FadeIn>

        {items.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {items.map((item: any, i: number) => (
              <div key={item.id || i} className="text-center">
                <div className="text-3xl md:text-4xl font-heading font-bold text-[#f28d00] mb-2">
                  {item.fields?.["Value"]?.value}
                </div>
                <div className="text-sm text-white/80 font-medium">{item.fields?.["Label"]?.value}</div>
                {item.fields?.["Description"]?.value && (
                  <p className="text-xs text-white/50 mt-1">{item.fields?.["Description"]?.value}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function initializeSitecoreComponents() {
  registerComponents({
    HeroBanner: ScHeroBanner,
    MegaTrends: ScMegaTrends,
    SolutionPathways: ScSolutionPathways,
    AuthorityStats: ScAuthorityStats,
    SolutionHero: ScSolutionHero,
    SolutionNarrative: ScSolutionNarrative,
    ProductDiscovery: ScProductDiscovery,
    CrossNavigation: ScCrossNavigation,
    RichTextBlock: ScRichTextBlock,
    ProofPointCounter: ScProofPointCounter,
  });
}
