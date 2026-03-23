import { Link, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BatteryCharging, Server, Factory, Shield, Zap,
  ChevronRight, ArrowRight, ArrowLeft, Box, Cable,
  Thermometer, Gauge, Radio, CircuitBoard,
  CheckCircle2, Layers
} from "lucide-react";
import { motion } from "framer-motion";
import {
  FadeIn, StaggerContainer, StaggerItem, ConnectivityMotif
} from "@/components/animations";
import type { Product } from "@shared/schema";

interface ApplicationData {
  slug: string;
  title: string;
  shortDescription: string;
  icon: typeof Zap;
  industry: string;
  industrySlug: string;
  color: string;
  applicationFilter: string;
  challenge: string;
  systemDescription: string;
  whyItMatters: string;
  keySpecs: string[];
}

const applicationsData: ApplicationData[] = [
  {
    slug: "powertrain-systems",
    title: "EV Powertrain Systems",
    shortDescription: "High-voltage connectors and power distribution for electric vehicle powertrains.",
    icon: BatteryCharging,
    industry: "Transportation",
    industrySlug: "transportation",
    color: "#f28d00",
    applicationFilter: "Powertrain Systems",
    challenge: "Electric vehicle powertrains operate at 400–800V with peak currents exceeding 500A. Every connector in the high-voltage path must maintain consistent contact resistance across millions of thermal cycles, continuous vibration, and 15+ years of service life. A single failed connection can trigger thermal runaway — the most feared failure mode in EV engineering.",
    systemDescription: "TE's powertrain connectivity system spans the entire high-voltage architecture: from cell-to-pack interconnects inside the battery module, through the DC busbar to the inverter, and from the inverter to the motor. Each connection is engineered as part of a unified system — matched impedance, coordinated thermal management, and consistent IP6K9K sealing throughout.",
    whyItMatters: "OEMs don't buy connectors — they buy confidence that their powertrain will survive 300,000 miles of real-world abuse. TE's automotive qualification testing exceeds industry standards, with accelerated aging protocols that simulate 20 years of operation in months.",
    keySpecs: ["400–800V rated", "IP6K9K sealed", "-40°C to +150°C", "500A+ peak current"],
  },
  {
    slug: "engine-harness",
    title: "Engine & Wiring Harness",
    shortDescription: "Environmentally sealed connector assemblies for automotive underhood environments.",
    icon: Cable,
    industry: "Transportation",
    industrySlug: "transportation",
    color: "#f28d00",
    applicationFilter: "Engine Harness",
    challenge: "Underhood wiring harnesses face a brutal combination of engine heat, road salt, vibration, and petroleum-based fluids. Connectors must seal against pressurized washdown while maintaining reliable electrical contact across extreme temperature swings.",
    systemDescription: "The DEUTSCH DT connector family provides a complete sealed interconnect system with thermoplastic housings, integrated rear wire seals, and secondary locking wedges. The system is designed for field serviceability — technicians can replace individual pins without replacing the entire harness.",
    whyItMatters: "Warranty claims from connector failures in automotive harnesses cost OEMs billions annually. TE's DEUTSCH DT system has a proven track record across millions of vehicles, with IP67/IP69K ratings that exceed the harshest underhood conditions.",
    keySpecs: ["IP67/IP69K rated", "-55°C to +125°C", "13A per contact", "Field-serviceable pins"],
  },
  {
    slug: "electrical-distribution",
    title: "Circuit Protection & Distribution",
    shortDescription: "Fuses, overcurrent protection, and power distribution for automotive electrical systems.",
    icon: Shield,
    industry: "Transportation",
    industrySlug: "transportation",
    color: "#f28d00",
    applicationFilter: "Electrical Distribution",
    challenge: "Modern vehicles contain 100+ electrical circuits, each requiring precise overcurrent protection. As vehicles electrify, the mix of 12V, 48V, and high-voltage circuits creates complex distribution architectures that must be protected without adding weight or cost.",
    systemDescription: "TE's automotive circuit protection portfolio includes blade fuses, high-current fuse links, and electronic protection modules. The system is designed for cascaded protection — each level coordinates with upstream and downstream devices to ensure the right fuse blows at the right time.",
    whyItMatters: "A blown fuse is a nuisance. A fuse that doesn't blow is a fire hazard. TE's fuse technology uses precisely calibrated zinc alloy elements with SAE J1284 compliance, providing predictable overcurrent response across the full operating temperature range.",
    keySpecs: ["SAE J1284 compliant", "1000A interrupt rating", "Visual blow indication", "Temperature-stable response"],
  },
  {
    slug: "network-infrastructure",
    title: "Data Center Networking",
    shortDescription: "High-speed cabling and connectivity for data center network infrastructure.",
    icon: Server,
    industry: "Communications",
    industrySlug: "communications",
    color: "#167a87",
    applicationFilter: "Network Infrastructure",
    challenge: "AI workloads demand east-west bandwidth that dwarfs traditional data center traffic patterns. Spine-leaf architectures require thousands of high-speed links, each maintaining signal integrity at 400G and beyond. Every dB of insertion loss matters when you're running 100,000 cables through a single facility.",
    systemDescription: "TE's structured cabling system includes Cat6A copper, OM4/OM5 fiber, and pre-terminated trunk cables designed for rapid deployment. The system supports top-of-rack, middle-of-row, and end-of-row configurations with consistent channel performance verified by factory testing.",
    whyItMatters: "Data center downtime costs hyperscalers $100,000+ per minute. TE's cabling systems are factory-tested and certified, eliminating the field termination variability that causes intermittent link failures — the hardest failures to diagnose.",
    keySpecs: ["Cat 6A / 500 MHz", "10 Gbps copper", "S/FTP shielding", "LSZH jacket"],
  },
  {
    slug: "condition-monitoring",
    title: "Condition Monitoring & Predictive Maintenance",
    shortDescription: "Vibration, temperature, and pressure sensors for industrial predictive maintenance.",
    icon: Gauge,
    industry: "Industrial",
    industrySlug: "industrial",
    color: "#2e4957",
    applicationFilter: "Condition Monitoring",
    challenge: "Unplanned downtime in manufacturing costs an average of $260,000 per hour. Condition monitoring sensors must detect the earliest signs of bearing wear, shaft misalignment, or thermal degradation — often measuring vibrations smaller than a human hair — while operating reliably in factory environments with EMI, dust, and temperature extremes.",
    systemDescription: "TE's condition monitoring platform combines piezoelectric accelerometers with IEPE signal conditioning, providing a sensor-to-gateway measurement chain. The accelerometers use ceramic sensing elements for long-term stability, with frequency response from 2 Hz to 10 kHz covering the full range of rotating machinery diagnostics.",
    whyItMatters: "The difference between a $500 bearing replacement during a planned shutdown and a $250,000 catastrophic failure is often a single vibration sensor detecting a 0.1g change in acceleration signature weeks before failure.",
    keySpecs: ["100 mV/g sensitivity", "2–10,000 Hz range", "-40°C to +121°C", "IEPE output"],
  },
  {
    slug: "motor-control",
    title: "Motor Control & Switching",
    shortDescription: "Contactor relays and switching devices for industrial motor control circuits.",
    icon: Factory,
    industry: "Industrial",
    industrySlug: "industrial",
    color: "#2e4957",
    applicationFilter: "Motor Control",
    challenge: "Industrial motors consume 70% of all electricity used in manufacturing. Motor control circuits must handle high inrush currents, continuous cycling, and electromagnetic interference while fitting into increasingly compact DIN rail enclosures.",
    systemDescription: "TE's contactor relay platform provides compact 4-pole switching for motor control, lighting, and HVAC applications. The 45mm-wide DIN rail modules combine 2NO + 2NC contact configurations with 10A rated current, supporting both AC and DC coil voltages for universal compatibility.",
    whyItMatters: "With 10 million mechanical operations life rating, TE contactor relays deliver the durability that industrial OEMs need for applications where relay replacement requires production shutdown.",
    keySpecs: ["10A @ 250VAC", "10M operations life", "DIN rail mount", "2NO + 2NC contacts"],
  },
  {
    slug: "process-control",
    title: "Process Control & Temperature Sensing",
    shortDescription: "RTD temperature sensors and transducers for industrial process automation.",
    icon: Thermometer,
    industry: "Industrial",
    industrySlug: "industrial",
    color: "#2e4957",
    applicationFilter: "Process Control",
    challenge: "Process control applications demand temperature measurement accuracy better than ±0.3°C across a range from cryogenic to +500°C. Sensors must survive thermal shock, chemical exposure, and continuous immersion while maintaining Class A accuracy over years of operation.",
    systemDescription: "TE's Pt100 RTD sensor assemblies use platinum resistance elements in 316 stainless steel sheaths with spring-loaded bayonet fittings for rapid installation and removal. The 3-wire configuration compensates for lead resistance, ensuring measurement accuracy even with long cable runs.",
    whyItMatters: "In food processing, pharmaceutical manufacturing, and chemical plants, a 1°C temperature error can mean the difference between a product that meets specification and one that must be scrapped. TE's Class A sensors provide the accuracy that keeps processes in control.",
    keySpecs: ["Class A accuracy", "-50°C to +500°C", "316 SS sheath", "3-wire compensation"],
  },
  {
    slug: "panel-wiring",
    title: "Industrial Panel Wiring",
    shortDescription: "DIN rail terminal blocks and PCB connectors for industrial control panels.",
    icon: CircuitBoard,
    industry: "Industrial",
    industrySlug: "industrial",
    color: "#2e4957",
    applicationFilter: "Panel Wiring",
    challenge: "Industrial control panels must accommodate dozens of circuits in confined spaces while maintaining safe clearance distances and supporting tool-free wiring for faster installation. Spring-cage connections must provide gas-tight joints that resist vibration loosening over decades of service.",
    systemDescription: "TE's terminal block platform includes feed-through, ground, fuse, and disconnect variants on a common 35mm DIN rail mounting system. The spring-cage connection mechanism provides tool-free wire insertion with test point access, enabling commissioning and troubleshooting without disconnecting circuits.",
    whyItMatters: "Panel builders spend 60% of assembly time on wiring. TE's spring-cage terminal blocks reduce wiring time by up to 50% compared to screw-type connections, while providing more reliable gas-tight connections that resist vibration loosening.",
    keySpecs: ["57A / 800V rated", "10mm² capacity", "Spring cage", "Tool-free wiring"],
  },
  {
    slug: "esd-protection",
    title: "ESD & Circuit Protection",
    shortDescription: "TVS diode arrays and surge protection for sensitive electronic interfaces.",
    icon: Shield,
    industry: "Cross-Industry",
    industrySlug: "industrial",
    color: "#f28d00",
    applicationFilter: "ESD Protection",
    challenge: "High-speed data interfaces like USB 3.0, HDMI, and Thunderbolt operate at signaling rates where even picofarads of parasitic capacitance degrade signal integrity. ESD protection devices must clamp transient voltages in nanoseconds while adding minimal capacitance to the signal path.",
    systemDescription: "TE's TVS diode arrays use silicon-based technology in ultra-compact 0402 DFN packages, providing bidirectional ESD clamping with just 0.25 pF of capacitance. The devices protect against 15 kV contact discharge per IEC 61000-4-2 while maintaining signal integrity at USB 3.0 SuperSpeed data rates.",
    whyItMatters: "A single ESD event can permanently damage a USB 3.0 transceiver IC costing $5-50. TE's TVS arrays cost $0.45 and prevent warranty returns that cost $50-500 per unit in handling, shipping, and replacement.",
    keySpecs: ["0.25 pF capacitance", "15 kV ESD rating", "0402 DFN package", "5V working voltage"],
  },
  {
    slug: "hvac-control",
    title: "HVAC & Building Control",
    shortDescription: "PCB relays for HVAC systems, power supplies, and building automation.",
    icon: Zap,
    industry: "Industrial",
    industrySlug: "industrial",
    color: "#2e4957",
    applicationFilter: "HVAC Control",
    challenge: "HVAC relays must switch high-current loads (up to 30A at 240VAC) millions of times over a 20-year service life while maintaining consistent contact resistance and minimal power consumption. The relays must also meet stringent flammability and safety standards for building applications.",
    systemDescription: "TE's PCB power relay platform delivers 30A switching capacity in a compact flange-mount package with 1.6W coil power. The Class F insulation system and 2500 VAC dielectric strength provide the safety margins required for UL/cUL recognized HVAC applications.",
    whyItMatters: "HVAC systems cycle thousands of times per year. A relay failure in a rooftop unit can mean emergency service calls costing $500-2000, plus tenant complaints and potential liability. TE's 100,000-operation life rating provides reliable service across the equipment's full lifecycle.",
    keySpecs: ["30A @ 240VAC", "100K operations", "UL/cUL recognized", "1.6W coil power"],
  },
  {
    slug: "ethernet-communication",
    title: "Industrial Ethernet",
    shortDescription: "M12 circular connectors for Industrial Ethernet and factory networks.",
    icon: Radio,
    industry: "Industrial",
    industrySlug: "industrial",
    color: "#2e4957",
    applicationFilter: "Ethernet Communication",
    challenge: "Factory networks must deliver IT-grade Ethernet performance in OT environments — operating through oil mist, vibration, washdown, and electromagnetic interference. Standard RJ45 connectors fail within months in these conditions.",
    systemDescription: "TE's M12 D-coded connector system brings Cat 5e Ethernet performance to IP67-rated industrial environments. The circular bayonet locking mechanism prevents vibration-induced disconnection, while the EMI-shielded metal housing maintains signal integrity in electrically noisy factory settings.",
    whyItMatters: "A dropped Ethernet packet in a factory network can mean a missed PLC cycle, causing product defects or safety system failures. TE's M12 connectors maintain 100 Mbps performance through conditions that destroy standard IT connectors.",
    keySpecs: ["100 Mbps", "IP67 sealed", "D-coded 8-pos", "-40°C to +85°C"],
  },
  {
    slug: "hydraulic-systems",
    title: "Hydraulic Pressure Measurement",
    shortDescription: "Pressure transducers for hydraulic and pneumatic system monitoring.",
    icon: Gauge,
    industry: "Industrial",
    industrySlug: "industrial",
    color: "#2e4957",
    applicationFilter: "Hydraulic Systems",
    challenge: "Hydraulic systems operate at pressures up to 10,000 PSI with pressure spikes that can exceed 3x the static rating. Pressure transducers must survive these spikes, resist hydraulic fluid degradation, and maintain 0.25% accuracy over years of continuous operation.",
    systemDescription: "TE's media-isolated pressure transducers use a stainless steel diaphragm to protect the silicon sensing element from direct media contact. The 4-20mA analog output provides noise-immune signal transmission over long cable runs, compatible with any industrial PLC or SCADA system.",
    whyItMatters: "Hydraulic system failures in heavy machinery can cause catastrophic equipment damage and safety incidents. Early detection of pressure anomalies through continuous monitoring prevents failures that cost $50,000-500,000 in equipment damage and lost production.",
    keySpecs: ["0.25% accuracy", "3x burst pressure", "4-20mA output", "1/4 NPT mount"],
  },
];

const industryGroups = [
  { key: "Transportation", label: "Transportation", color: "#f28d00", icon: BatteryCharging, slug: "transportation" },
  { key: "Communications", label: "Communications", color: "#167a87", icon: Server, slug: "communications" },
  { key: "Industrial", label: "Industrial", color: "#2e4957", icon: Factory, slug: "industrial" },
  { key: "Cross-Industry", label: "Cross-Industry", color: "#f28d00", icon: Shield, slug: "industrial" },
];

function ApplicationDetailView({ app }: { app: ApplicationData }) {
  const { formatPrice } = useI18n();
  const { data: productsData, isLoading } = useQuery<{ products: Product[]; total: number }>({
    queryKey: ["/api/products", { application: app.applicationFilter }],
    queryFn: async () => {
      const res = await fetch(`/api/products?application=${encodeURIComponent(app.applicationFilter)}&limit=10`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const products = productsData?.products || [];
  const AppIcon = app.icon;

  return (
    <div className="min-h-screen">
      <section className="relative bg-[#2e4957] text-white py-16 md:py-24 overflow-hidden" data-testid="section-app-hero">
        <div className="absolute inset-0 bg-gradient-to-br from-[#04215d]/40 via-transparent to-[#167a87]/20" />
        <motion.div
          className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: `${app.color}08` }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="relative max-w-[1400px] mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link href="/applications">
              <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10 mb-6 -ml-2" data-testid="button-back">
                <ArrowLeft className="h-4 w-4 mr-2" /> All Applications
              </Button>
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${app.color}30` }}>
                <AppIcon className="h-6 w-6" style={{ color: app.color }} />
              </div>
              <Badge className="bg-white/10 text-white/80 border-white/20 font-heading text-xs tracking-wider uppercase" data-testid="badge-industry">
                {app.industry}
              </Badge>
            </div>
            <h1 className="text-3xl md:text-5xl font-heading font-bold leading-tight mb-4" data-testid="text-app-title">
              {app.title}
            </h1>
            <p className="text-lg text-white/75 max-w-3xl leading-relaxed mb-8" data-testid="text-app-description">
              {app.shortDescription}
            </p>
            <ConnectivityMotif className="w-40" />
          </motion.div>
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-4 py-16 md:py-20" data-testid="section-challenge">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <FadeIn>
            <p className="font-heading font-semibold text-sm tracking-wider uppercase mb-3" style={{ color: app.color }}>
              The Challenge
            </p>
            <h2 className="text-2xl md:text-3xl font-heading font-bold mb-6 leading-tight" data-testid="text-challenge-title">
              Why This Application Is Demanding
            </h2>
            <p className="text-muted-foreground leading-relaxed" data-testid="text-challenge-body">
              {app.challenge}
            </p>
          </FadeIn>

          <FadeIn delay={0.15}>
            <p className="font-heading font-semibold text-sm tracking-wider uppercase mb-3" style={{ color: app.color }}>
              The TE Approach
            </p>
            <h2 className="text-2xl md:text-3xl font-heading font-bold mb-6 leading-tight" data-testid="text-system-title">
              System-Level Solution
            </h2>
            <p className="text-muted-foreground leading-relaxed" data-testid="text-system-body">
              {app.systemDescription}
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="bg-card border-y" data-testid="section-why">
        <div className="max-w-[1400px] mx-auto px-4 py-16">
          <FadeIn>
            <div className="max-w-3xl mx-auto text-center">
              <p className="font-heading font-semibold text-sm tracking-wider uppercase mb-3" style={{ color: app.color }}>
                Why It Matters
              </p>
              <p className="text-lg leading-relaxed text-muted-foreground" data-testid="text-why-body">
                {app.whyItMatters}
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="flex items-center justify-center gap-3 flex-wrap mt-8">
              {app.keySpecs.map((spec, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="px-4 py-2 text-sm font-heading"
                  data-testid={`badge-spec-${i}`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-2" style={{ color: app.color }} />
                  {spec}
                </Badge>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-4 py-16 md:py-20" data-testid="section-products">
        <FadeIn>
          <div className="flex items-center justify-between gap-4 mb-10">
            <div>
              <p className="font-heading font-semibold text-sm tracking-wider uppercase mb-2" style={{ color: app.color }}>
                Products for This Application
              </p>
              <h2 className="text-2xl md:text-3xl font-heading font-bold mb-1" data-testid="text-products-title">
                TE Products That Solve This
              </h2>
              <p className="text-muted-foreground text-sm">
                Real catalog products engineered for {app.title.toLowerCase()} applications.
              </p>
            </div>
            <Link href={`/products?application=${encodeURIComponent(app.applicationFilter)}`}>
              <Button variant="outline" className="font-heading gap-2" data-testid="link-view-all">
                View in Catalog <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </FadeIn>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-4">
                <Skeleton className="aspect-[4/3] rounded-md mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-3 w-2/3" />
              </Card>
            ))}
          </div>
        ) : products.length > 0 ? (
          <StaggerContainer staggerDelay={0.08} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((product) => (
              <StaggerItem key={product.id}>
                <Link href={`/products/${product.id}`}>
                  <Card className="hover-elevate cursor-pointer h-full group" data-testid={`card-product-${product.id}`}>
                    <div className="p-3">
                      <div className="aspect-[4/3] rounded-md bg-accent/50 flex items-center justify-center">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-2/3 h-2/3 object-contain" />
                        ) : (
                          <Box className="h-12 w-12 text-muted-foreground/30" />
                        )}
                      </div>
                    </div>
                    <div className="px-3 pb-4">
                      <p className="text-[10px] text-muted-foreground mb-1 font-mono">{product.sku}</p>
                      <h3 className="text-sm font-medium mb-2 line-clamp-2 leading-snug group-hover:text-[#f28d00] transition-colors">{product.name}</h3>
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-sm">{formatPrice(parseFloat(product.basePrice))}</span>
                        <div className="flex items-center gap-1">
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
              </StaggerItem>
            ))}
          </StaggerContainer>
        ) : (
          <Card className="p-8 text-center">
            <Box className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No products currently in catalog for this application filter.</p>
          </Card>
        )}
      </section>

      <section className="border-t py-16" data-testid="section-related">
        <div className="max-w-[1400px] mx-auto px-4">
          <FadeIn className="text-center mb-8">
            <h2 className="text-2xl font-heading font-bold mb-2">Related Applications</h2>
            <p className="text-muted-foreground">Explore other applications in {app.industry}.</p>
          </FadeIn>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {applicationsData
              .filter(a => a.industry === app.industry && a.slug !== app.slug)
              .slice(0, 4)
              .map(related => {
                const RelIcon = related.icon;
                return (
                  <Link key={related.slug} href={`/applications/${related.slug}`}>
                    <Button variant="outline" className="font-heading gap-2 h-11" data-testid={`link-app-${related.slug}`}>
                      <RelIcon className="h-4 w-4" />
                      {related.title}
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </Link>
                );
              })}
            <Link href={`/solutions/${app.industrySlug}`}>
              <Button variant="outline" className="font-heading gap-2 h-11" data-testid="link-solution">
                <Layers className="h-4 w-4" />
                {app.industry} Solutions
                <ChevronRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function ApplicationsLanding() {
  const grouped = industryGroups.map(group => ({
    ...group,
    apps: applicationsData.filter(a => a.industry === group.key),
  })).filter(g => g.apps.length > 0);

  return (
    <div className="min-h-screen">
      <section className="relative bg-[#2e4957] text-white py-16 md:py-24 overflow-hidden" data-testid="section-hero">
        <div className="absolute inset-0 bg-gradient-to-br from-[#04215d]/40 via-transparent to-[#167a87]/20" />
        <motion.div
          className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-[#f28d00]/5 blur-3xl"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="relative max-w-[1400px] mx-auto px-4">
          <FadeIn>
            <Badge className="mb-4 bg-white/10 text-white/80 border-white/20 font-heading text-xs tracking-wider uppercase" data-testid="badge-applications">
              Applications
            </Badge>
            <h1 className="text-3xl md:text-5xl font-heading font-bold leading-tight mb-4" data-testid="text-applications-title">
              From Challenge to Solution to Product
            </h1>
            <p className="text-lg text-white/75 max-w-2xl leading-relaxed mb-8" data-testid="text-applications-subtitle">
              Each application tells the story of a specific engineering challenge, how TE's system-level
              thinking addresses it, and which products make the solution tangible. This is where
              connectivity meets context.
            </p>
            <ConnectivityMotif className="w-48" />
          </FadeIn>
        </div>
      </section>

      {grouped.map((group, groupIdx) => {
        const GroupIcon = group.icon;
        return (
          <section
            key={group.key}
            className={groupIdx % 2 === 0 ? "py-16 md:py-20 bg-background" : "py-16 md:py-20 bg-card border-y"}
            data-testid={`section-group-${group.key.toLowerCase()}`}
          >
            <div className="max-w-[1400px] mx-auto px-4">
              <FadeIn>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${group.color}12` }}>
                    <GroupIcon className="h-5 w-5" style={{ color: group.color }} />
                  </div>
                  <Link href={`/solutions/${group.slug}`}>
                    <Badge
                      className="cursor-pointer hover:opacity-80 transition-opacity font-heading text-xs tracking-wider uppercase"
                      style={{ backgroundColor: `${group.color}15`, color: group.color, borderColor: `${group.color}30` }}
                      data-testid={`badge-group-${group.key.toLowerCase()}`}
                    >
                      {group.label} Applications
                    </Badge>
                  </Link>
                </div>
              </FadeIn>

              <StaggerContainer staggerDelay={0.08} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
                {group.apps.map((app) => {
                  const AppIcon = app.icon;
                  return (
                    <StaggerItem key={app.slug}>
                      <Link href={`/applications/${app.slug}`}>
                        <Card className="hover-elevate cursor-pointer h-full group relative overflow-hidden" data-testid={`card-app-${app.slug}`}>
                          <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: app.color }} />
                          <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div
                                className="w-12 h-12 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
                                style={{ backgroundColor: `${app.color}12` }}
                              >
                                <AppIcon className="h-6 w-6" style={{ color: app.color }} />
                              </div>
                              <Badge variant="secondary" className="text-[10px]">{app.industry}</Badge>
                            </div>
                            <h3 className="text-lg font-heading font-bold mb-2 group-hover:text-[#f28d00] transition-colors" data-testid={`text-app-title-${app.slug}`}>
                              {app.title}
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                              {app.shortDescription}
                            </p>
                            <div className="flex items-center text-sm font-heading font-medium" style={{ color: app.color }}>
                              Explore Application <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </Card>
                      </Link>
                    </StaggerItem>
                  );
                })}
              </StaggerContainer>
            </div>
          </section>
        );
      })}

      <section className="py-16 bg-background" data-testid="section-explore">
        <div className="max-w-[1400px] mx-auto px-4 text-center">
          <FadeIn>
            <h2 className="text-2xl font-heading font-bold mb-4">Explore by Industry</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              See the full industry story — from market trends to system architecture to product catalog.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link href="/solutions/transportation">
                <Button variant="outline" className="font-heading gap-2 h-11" data-testid="link-solutions-transportation">
                  <BatteryCharging className="h-4 w-4" /> Transportation Solutions <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
              <Link href="/solutions/industrial">
                <Button variant="outline" className="font-heading gap-2 h-11" data-testid="link-solutions-industrial">
                  <Factory className="h-4 w-4" /> Industrial Solutions <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
              <Link href="/solutions/communications">
                <Button variant="outline" className="font-heading gap-2 h-11" data-testid="link-solutions-communications">
                  <Server className="h-4 w-4" /> Communications Solutions <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}

export default function Applications() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  if (slug) {
    const app = applicationsData.find(a => a.slug === slug);
    if (!app) {
      return (
        <div className="max-w-[1400px] mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-heading font-bold mb-4" data-testid="text-not-found">Application Not Found</h1>
          <p className="text-muted-foreground mb-6">The application you're looking for doesn't exist.</p>
          <Link href="/applications">
            <Button data-testid="button-back">Back to Applications</Button>
          </Link>
        </div>
      );
    }
    return <ApplicationDetailView app={app} />;
  }

  return <ApplicationsLanding />;
}
