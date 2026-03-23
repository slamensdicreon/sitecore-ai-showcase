import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BatteryCharging, Server, Factory, ArrowRight, ChevronRight,
  Lightbulb, Award, Globe, Users, MapPin, Wrench, DollarSign,
  Cpu, Zap, Shield, TrendingUp
} from "lucide-react";
import { motion } from "framer-motion";
import {
  FadeIn, StaggerContainer, StaggerItem, AnimatedCounter, ConnectivityMotif
} from "@/components/animations";

const megaTrends = [
  {
    title: "Electrification",
    subtitle: "Powering the transition to electric everything",
    description: "From EV battery systems to renewable energy grids, TE connectivity solutions enable the reliable flow of power across next-generation electrical architectures. Our high-voltage connectors and power distribution products are designed into platforms that will be in production for 10–20 years.",
    stat: "40%",
    statLabel: "growth in EV connector demand",
    icon: BatteryCharging,
    color: "#f28d00",
    href: "/solutions/transportation",
  },
  {
    title: "AI Infrastructure",
    subtitle: "The backbone of intelligent systems",
    description: "Hyperscale data centers require unprecedented power density and high-speed connectivity. TE delivers both — from high-speed I/O connectors rated for 112 Gbps PAM4 to liquid cooling interconnects that manage the thermal loads of next-gen GPU clusters.",
    stat: "3x",
    statLabel: "data center power demand by 2030",
    icon: Server,
    color: "#167a87",
    href: "/solutions/communications",
  },
  {
    title: "Industrial Automation",
    subtitle: "Connecting the smart factory",
    description: "Robotics, smart manufacturing, and factory automation demand connectivity that survives extreme heat, vibration, and continuous operation. TE's industrial sensors, M12 connectors, and DIN-rail terminal blocks form the nervous system of Industry 4.0.",
    stat: "90K+",
    statLabel: "employees across 140 countries",
    icon: Factory,
    color: "#2e4957",
    href: "/solutions/industrial",
  },
];

const authorityStats = [
  { value: 18, prefix: "$", suffix: "B+", label: "Annual Revenue", icon: DollarSign },
  { value: 140, prefix: "", suffix: "+", label: "Countries Served", icon: MapPin },
  { value: 8000, prefix: "", suffix: "+", label: "Engineers Worldwide", icon: Wrench },
  { value: 90000, prefix: "", suffix: "+", label: "Global Employees", icon: Users },
];

const engineeringPillars = [
  {
    title: "Co-Design Partnership",
    description: "We work alongside OEM engineering teams from concept through production, embedding our connectivity expertise into your system architecture before the first prototype.",
    icon: Cpu,
    stat: "70%",
    statLabel: "of products manufactured where they're sold",
  },
  {
    title: "Harsh-Environment Mastery",
    description: "From -55°C Arctic installations to 200°C engine bays, our products are tested beyond spec. IP67/IP69K ratings, vibration resistance, and chemical compatibility are standard.",
    icon: Shield,
    stat: "25+",
    statLabel: "years average product design-in lifecycle",
  },
  {
    title: "Scale Without Compromise",
    description: "Local-for-local manufacturing means rapid delivery with global quality standards. Our 140-country footprint reduces supply chain risk while maintaining Tier 1 consistency.",
    icon: Globe,
    stat: "100+",
    statLabel: "manufacturing sites worldwide",
  },
  {
    title: "Innovation Pipeline",
    description: "With over $600M in annual R&D investment and 8,000+ engineers, we file thousands of patents annually — turning materials science breakthroughs into production-ready products.",
    icon: Lightbulb,
    stat: "$600M+",
    statLabel: "annual R&D investment",
  },
];

const recognitions = [
  "Fortune 500 company",
  "S&P 500 constituent",
  "Named to Dow Jones Sustainability Index",
  "ISO 9001, ISO 14001, IATF 16949 certified globally",
  "UL, CSA, VDE, and CCC agency approvals",
  "Active member of IPC, SAE, IEEE standards bodies",
];

export default function Innovation() {
  return (
    <div className="min-h-screen">
      <section className="relative bg-[#2e4957] text-white py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="inno-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#inno-grid)" />
          </svg>
        </div>
        <motion.div
          className="absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full bg-[#f28d00]/5 blur-3xl"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#167a87]/8 blur-3xl"
          animate={{ scale: [1.1, 1, 1.1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="max-w-[1400px] mx-auto px-4 relative">
          <FadeIn>
            <Badge className="mb-6 bg-[#f28d00]/20 text-[#f28d00] border-[#f28d00]/30 font-heading text-xs tracking-wider uppercase" data-testid="badge-innovation-hero">
              Innovation & Engineering Authority
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold leading-[1.08] mb-6 max-w-3xl" data-testid="text-innovation-title">
              Engineering the
              <br />
              <span className="text-[#f28d00]">Connected Future</span>
            </h1>
            <p className="text-lg md:text-xl text-white/70 max-w-2xl leading-relaxed mb-8" data-testid="text-innovation-subtitle">
              TE Connectivity doesn't just respond to industry trends — we're positioned at the intersection of the three defining
              mega-trends of our time. When electrification, AI, and automation converge, TE is already there.
            </p>
            <ConnectivityMotif className="w-48" />
          </FadeIn>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-background relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="inno-dots" width="30" height="30" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#inno-dots)" />
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
              While most component manufacturers serve a single industry, TE benefits from all three simultaneously.
              That's not diversification — it's strategic positioning.
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
                        Explore Solutions <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Card>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <section className="py-20 md:py-24 bg-[#2e4957] text-white relative overflow-hidden">
        <motion.div
          className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-[#167a87]/10 blur-3xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="max-w-[1400px] mx-auto px-4 relative">
          <FadeIn className="text-center mb-16">
            <p className="text-[#f28d00] font-heading font-semibold text-sm tracking-wider uppercase mb-3" data-testid="text-authority-label">
              Global Scale, Engineering Precision
            </p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4" data-testid="text-authority-title">
              The Nervous System of Modern Industry
            </h2>
            <p className="text-white/75 max-w-2xl mx-auto leading-relaxed">
              TE Connectivity is a Tier 1 backbone player across multiple industries.
              Once our products are designed into a system, they stay for 10–20+ years.
              That's not a supplier relationship — that's partnership.
            </p>
          </FadeIn>

          <StaggerContainer staggerDelay={0.1} className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-10 max-w-4xl mx-auto">
            {authorityStats.map((stat) => (
              <StaggerItem key={stat.label} className="text-center">
                <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="h-6 w-6 text-[#f28d00]" />
                </div>
                <div className="text-3xl md:text-4xl font-heading font-bold text-white mb-1">
                  <AnimatedCounter
                    target={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                  />
                </div>
                <p className="text-sm text-white/70 font-medium">{stat.label}</p>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-background">
        <div className="max-w-[1400px] mx-auto px-4">
          <FadeIn className="text-center mb-16">
            <p className="text-[#167a87] font-heading font-semibold text-sm tracking-wider uppercase mb-3" data-testid="text-pillars-label">
              Why Engineers Choose TE
            </p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4" data-testid="text-pillars-title">
              Engineering-Led, Manufacturing-Backed
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              We don't just make components. We co-design solutions with OEM engineering teams,
              then manufacture them at scale with local-for-local precision.
            </p>
          </FadeIn>

          <StaggerContainer staggerDelay={0.12} className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {engineeringPillars.map((pillar, i) => (
              <StaggerItem key={pillar.title}>
                <Card className="h-full hover-elevate" data-testid={`card-pillar-${i}`}>
                  <div className="p-6 md:p-8">
                    <div className="flex items-start gap-5">
                      <div className="w-12 h-12 rounded-lg bg-[#167a87]/10 flex items-center justify-center shrink-0">
                        <pillar.icon className="h-6 w-6 text-[#167a87]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-heading font-bold mb-2">{pillar.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-4">{pillar.description}</p>
                        <div className="flex items-baseline gap-2 pt-3 border-t border-border/50">
                          <span className="text-xl font-heading font-bold text-[#2e4957] dark:text-foreground">{pillar.stat}</span>
                          <span className="text-xs text-muted-foreground">{pillar.statLabel}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-muted/30">
        <div className="max-w-[1400px] mx-auto px-4">
          <FadeIn>
            <div className="bg-background rounded-xl border p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-8 md:gap-12">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="h-5 w-5 text-[#f28d00]" />
                    <p className="text-[#f28d00] font-heading font-semibold text-sm tracking-wider uppercase" data-testid="text-recognition-label">
                      Industry Recognition
                    </p>
                  </div>
                  <h3 className="text-2xl font-heading font-bold mb-3" data-testid="text-recognition-title">
                    Trusted by the World's Leading OEMs
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    TE Connectivity's engineering standards and manufacturing quality are recognized
                    across every major industry we serve. Our certifications and memberships reflect
                    a commitment to reliability that spans decades.
                  </p>
                  <div className="space-y-2">
                    {recognitions.map((item, i) => (
                      <div key={i} className="flex items-center gap-2" data-testid={`text-recognition-${i}`}>
                        <div className="w-1.5 h-1.5 rounded-full bg-[#f28d00]" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="md:w-80 flex flex-col justify-center">
                  <div className="bg-[#2e4957] rounded-xl p-8 text-white text-center">
                    <TrendingUp className="h-10 w-10 text-[#f28d00] mx-auto mb-4" />
                    <div className="text-4xl font-heading font-bold mb-1">
                      <AnimatedCounter target={14000} suffix="+" />
                    </div>
                    <p className="text-white/70 text-sm mb-1">Patents Held Globally</p>
                    <div className="w-12 h-0.5 bg-[#f28d00] mx-auto mt-4 mb-4" />
                    <p className="text-xs text-white/50">
                      Continuous investment in materials science, miniaturization, and harsh-environment engineering
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-background">
        <div className="max-w-[1400px] mx-auto px-4">
          <FadeIn>
            <div className="bg-gradient-to-r from-[#2e4957] to-[#167a87] rounded-xl p-8 md:p-12 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#f28d00]/10 to-transparent" />
              <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="flex-1">
                  <h3 className="text-xl md:text-2xl font-heading font-bold mb-2" data-testid="text-cta-title">
                    Ready to Solve Your Next Engineering Challenge?
                  </h3>
                  <p className="text-white/75 leading-relaxed">
                    Start with your industry, your application, or dive straight into our catalog.
                    Every path leads to products engineered for reliability.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/solutions/transportation">
                    <Button
                      size="lg"
                      className="bg-[#f28d00] hover:bg-[#e07d00] text-white font-heading whitespace-nowrap"
                      data-testid="button-explore-solutions"
                    >
                      Explore Solutions <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/products">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white/30 text-white hover:bg-white/10 font-heading whitespace-nowrap"
                      data-testid="button-browse-catalog"
                    >
                      Browse Catalog
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
