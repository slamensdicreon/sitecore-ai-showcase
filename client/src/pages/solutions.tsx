import { Link, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight, BatteryCharging, Server, Factory, Box, ChevronRight,
  Zap, Shield, Cpu, Thermometer, Gauge, Radio, Cable,
  CheckCircle2, Target, Layers, CircuitBoard
} from "lucide-react";
import { motion } from "framer-motion";
import ReactPlayer from "react-player";
import { useState, useRef } from "react";
import {
  FadeIn, SlideUp, StaggerContainer, StaggerItem,
  AnimatedCounter, ConnectivityMotif
} from "@/components/animations";
import type { Product } from "@shared/schema";

interface SystemApproach {
  title: string;
  description: string;
  icon: typeof Zap;
}

interface ProofPoint {
  value: number;
  prefix?: string;
  suffix: string;
  label: string;
}

interface ApplicationExample {
  name: string;
  description: string;
  icon: typeof Zap;
}

interface SolutionPageData {
  title: string;
  headline: string;
  subheadline: string;
  description: string;
  icon: typeof BatteryCharging;
  heroColor: string;
  accentColor: string;
  videoUrl: string;
  industryFilter: string;
  narrativeTitle: string;
  narrativeBody: string;
  challenges: { title: string; description: string; icon: typeof Zap }[];
  systemApproaches: SystemApproach[];
  proofPoints: ProofPoint[];
  applicationExamples: ApplicationExample[];
  ctaTitle: string;
  ctaDescription: string;
}

const solutionsData: Record<string, SolutionPageData> = {
  transportation: {
    title: "Transportation Solutions",
    headline: "Powering the Future of Mobility",
    subheadline: "Electrification. Autonomy. Connectivity.",
    description: "From EV battery systems to autonomous driving platforms, TE delivers harsh-environment connectivity that the automotive industry depends on — engineered for high voltage, extreme vibration, and mission-critical reliability.",
    icon: BatteryCharging,
    heroColor: "#f28d00",
    accentColor: "#e07d00",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-electric-car-charging-point-in-an-underground-parking-47719-large.mp4",
    industryFilter: "Automotive",
    narrativeTitle: "The Automotive Industry Is Being Reinvented",
    narrativeBody: "The global shift to electric vehicles isn't just a powertrain swap — it's a complete re-architecture of the automobile. Every EV requires 3x more connectivity than an ICE vehicle: high-voltage battery interconnects, thermal management sensors, charging port assemblies, and kilometers of specialized harness. TE Connectivity sits at the center of this transformation, providing the critical components that make electrification safe, reliable, and scalable.",
    challenges: [
      {
        title: "High-Voltage Battery Safety",
        description: "EV battery packs operate at 400-800V, requiring connectors rated for extreme voltage with zero tolerance for arc flash or thermal runaway propagation.",
        icon: Zap,
      },
      {
        title: "Autonomous Sensor Integration",
        description: "LiDAR, radar, and camera systems demand high-speed data connectors that maintain signal integrity under constant vibration and temperature cycling from -40°C to +150°C.",
        icon: Cpu,
      },
      {
        title: "Charging Infrastructure Scale",
        description: "DC fast charging at 350kW+ requires connectors that handle massive current loads with minimal resistance while withstanding thousands of mate/unmate cycles.",
        icon: BatteryCharging,
      },
      {
        title: "Commercial Vehicle Electrification",
        description: "Heavy-duty trucks and buses face even harsher operating conditions — higher voltages, greater vibration, and extreme duty cycles that push connector technology to its limits.",
        icon: Shield,
      },
    ],
    systemApproaches: [
      {
        title: "Battery-to-Wheel Architecture",
        description: "Integrated connector systems from cell-to-pack, pack-to-chassis, and chassis-to-motor — designed as a cohesive system, not individual components.",
        icon: Layers,
      },
      {
        title: "Thermal Management Loop",
        description: "Temperature sensors, coolant connectors, and thermal interface materials working together to maintain optimal battery performance and longevity.",
        icon: Thermometer,
      },
      {
        title: "Sealed Harsh-Environment Design",
        description: "IP6K9K-rated connector families that survive salt spray, stone impact, underbody pressure washing, and 15+ years of real-world service life.",
        icon: Shield,
      },
    ],
    proofPoints: [
      { value: 40, suffix: "%", label: "Growth in EV connector demand YoY" },
      { value: 800, suffix: "V", label: "Maximum voltage rating" },
      { value: 25, suffix: "+", label: "Years in automotive connectivity" },
      { value: 150, prefix: "", suffix: "°C", label: "Maximum operating temperature" },
    ],
    applicationExamples: [
      { name: "Battery Pack Interconnects", description: "High-voltage busbars and cell-to-pack connectors for EV battery modules", icon: BatteryCharging },
      { name: "ADAS Sensor Harnesses", description: "Shielded cable assemblies for radar, LiDAR, and camera systems", icon: Cpu },
      { name: "EV Charging Inlets", description: "CCS and NACS-compatible charging connectors for vehicles and infrastructure", icon: Zap },
      { name: "Powertrain Systems", description: "Motor connectors, inverter interfaces, and high-current distribution", icon: CircuitBoard },
    ],
    ctaTitle: "Ready to Engineer Your Next EV Platform?",
    ctaDescription: "Our automotive engineering team partners with OEMs at the earliest design stages. Let's co-design the connectivity architecture for your next vehicle platform.",
  },
  industrial: {
    title: "Industrial Solutions",
    headline: "Connecting the Smart Factory",
    subheadline: "Automation. Energy. Reliability.",
    description: "Factory automation, energy infrastructure, aerospace, and medical devices all demand connectivity that never fails. TE provides the sensors, connectors, and power components that keep critical industrial systems running.",
    icon: Factory,
    heroColor: "#2e4957",
    accentColor: "#1d3640",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-industrial-robot-arm-in-a-factory-41788-large.mp4",
    industryFilter: "Industrial Automation",
    narrativeTitle: "Industry 4.0 Demands a New Kind of Connectivity",
    narrativeBody: "The convergence of OT and IT networks, the rise of collaborative robotics, and the push toward predictive maintenance are fundamentally changing what industrial connectivity must deliver. Sensors must be smarter. Connectors must survive harsher environments for longer. And everything must communicate in real-time. TE's industrial portfolio is built for this moment — ruggedized, intelligent, and designed for decades of continuous operation.",
    challenges: [
      {
        title: "Grid Modernization",
        description: "Renewable energy integration demands utility-grade connectors and sensors that maintain reliability across distributed generation, storage, and smart grid control systems.",
        icon: Zap,
      },
      {
        title: "Robotics & Automation",
        description: "Collaborative robots and automated assembly lines require connectors that withstand millions of flex cycles, continuous vibration, and rapid mate/unmate during tool changes.",
        icon: Factory,
      },
      {
        title: "Predictive Maintenance",
        description: "Condition monitoring sensors must detect vibration anomalies, temperature drift, and pressure changes with laboratory precision in factory-floor environments.",
        icon: Gauge,
      },
      {
        title: "Harsh-Environment Reliability",
        description: "Oil & gas, mining, and heavy machinery applications expose connectors to extreme temperatures, corrosive chemicals, and constant mechanical stress.",
        icon: Shield,
      },
    ],
    systemApproaches: [
      {
        title: "Sensor-to-Cloud Architecture",
        description: "From piezoelectric vibration sensors to Industrial Ethernet connectors, providing the complete signal chain from physical measurement to cloud analytics.",
        icon: Layers,
      },
      {
        title: "Power Distribution Systems",
        description: "DIN rail terminal blocks, contactor relays, and circuit protection devices designed to work as integrated power management solutions.",
        icon: CircuitBoard,
      },
      {
        title: "IP67+ Connectivity Platform",
        description: "M12, M8, and custom circular connectors with industrial Ethernet capability, field-installable options, and guaranteed performance in washdown environments.",
        icon: Shield,
      },
    ],
    proofPoints: [
      { value: 10, suffix: "M+", label: "Mechanical life (operations)" },
      { value: 500, suffix: "°C", label: "Max sensor temperature range" },
      { value: 50, suffix: "+", label: "Years of industrial experience" },
      { value: 800, suffix: "V", label: "Terminal block voltage rating" },
    ],
    applicationExamples: [
      { name: "Condition Monitoring", description: "Accelerometers and vibration sensors for predictive maintenance programs", icon: Gauge },
      { name: "Motor Control", description: "Contactor relays, terminal blocks, and power distribution for motor circuits", icon: Factory },
      { name: "Process Control", description: "RTD temperature sensors and pressure transducers for process automation", icon: Thermometer },
      { name: "Panel Wiring", description: "DIN rail terminal blocks and PCB connectors for industrial control panels", icon: Cable },
    ],
    ctaTitle: "Engineering Reliability Into Every Connection",
    ctaDescription: "With local manufacturing in 140+ countries and a co-design engineering model, TE delivers industrial connectivity solutions that match your exact application requirements.",
  },
  communications: {
    title: "Communications Solutions",
    headline: "The Backbone of Intelligent Systems",
    subheadline: "AI Compute. High-Speed Data. Edge Networks.",
    description: "AI-driven data centers are reshaping power and connectivity demands. TE delivers high-speed, high-density solutions that hyperscalers need — from power distribution to signal integrity at speeds that keep pace with exponential compute growth.",
    icon: Server,
    heroColor: "#167a87",
    accentColor: "#0f5f6b",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-data-center-servers-rack-blinking-3136-large.mp4",
    industryFilter: "Data Communications",
    narrativeTitle: "AI Is Rewriting the Rules of Data Center Design",
    narrativeBody: "The explosion of large language models and generative AI has created a step-function increase in compute density, power consumption, and cooling requirements. A single AI training cluster can consume as much power as a small city. This isn't an incremental change — it's a fundamental re-architecture of data center connectivity, and TE is at the center of it. Our solutions enable the power delivery, signal integrity, and thermal management that make AI at scale possible.",
    challenges: [
      {
        title: "AI Power Density",
        description: "GPU-dense racks now consume 40-100kW per cabinet, requiring power connectors and distribution systems that were unimaginable five years ago.",
        icon: Zap,
      },
      {
        title: "High-Speed Signal Integrity",
        description: "400G and 800G optical transceivers demand connector systems with sub-millimeter precision and insertion loss budgets measured in fractions of a dB.",
        icon: Radio,
      },
      {
        title: "Thermal Management",
        description: "Liquid cooling is becoming standard for AI workloads. Connectors must handle chilled water, dielectric fluids, and rear-door heat exchangers without leaks — ever.",
        icon: Thermometer,
      },
      {
        title: "Edge & 5G Infrastructure",
        description: "Distributed compute at the edge requires hardened, compact connectivity that performs in telecom cabinets, cell towers, and street-level enclosures.",
        icon: Radio,
      },
    ],
    systemApproaches: [
      {
        title: "Rack-Level Power Architecture",
        description: "From facility power entry to GPU power delivery — integrated busbar, PDU connector, and board-level power solutions designed as a unified system.",
        icon: Layers,
      },
      {
        title: "High-Speed Interconnect Platform",
        description: "PCIe Gen5/Gen6, CXL, and Ethernet-capable connector families with consistent impedance control and signal integrity from backplane to front panel.",
        icon: CircuitBoard,
      },
      {
        title: "Thermal Interface Solutions",
        description: "Liquid cooling connectors, thermal pads, and heat sink attachment systems that maintain thermal performance over thousands of thermal cycles.",
        icon: Thermometer,
      },
    ],
    proofPoints: [
      { value: 800, suffix: "G", label: "Maximum supported data rate" },
      { value: 100, suffix: "kW", label: "Per-rack power delivery" },
      { value: 10, suffix: "B+", label: "Data center connectors shipped" },
      { value: 25, suffix: "+", label: "Years in data communications" },
    ],
    applicationExamples: [
      { name: "Network Infrastructure", description: "Cat6A cabling, fiber optic connectors, and structured cabling for data center networks", icon: Cable },
      { name: "Power Distribution", description: "High-current PDU connectors, busbars, and power entry modules for server racks", icon: Zap },
      { name: "Optical Transceivers", description: "High-speed connector interfaces for QSFP-DD and OSFP optical modules", icon: Radio },
      { name: "Edge Compute", description: "Ruggedized connectivity for micro data centers and 5G base station equipment", icon: Server },
    ],
    ctaTitle: "Designing for the Next Generation of Compute",
    ctaDescription: "TE's data communications team works directly with hyperscalers, ODMs, and network equipment manufacturers to co-design the connectivity that powers AI at scale.",
  },
};

function SolutionHero({ solution }: { solution: SolutionPageData }) {
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const playerRef = useRef<ReactPlayer>(null);
  const prefersReducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const showVideo = videoReady && !videoFailed && !prefersReducedMotion;
  const SolutionIcon = solution.icon;

  return (
    <section className="relative min-h-[70vh] flex items-center text-white overflow-hidden" data-testid="section-hero">
      <div className="absolute inset-0 bg-gradient-to-br from-[#04215d]/90 via-[#2e4957]/85 to-[#167a87]/70 z-10" />
      {!prefersReducedMotion && !videoFailed && (
        <div className="absolute inset-0 [&>div]:!w-full [&>div]:!h-full">
          <ReactPlayer
            ref={playerRef}
            url={solution.videoUrl}
            playing
            loop
            muted
            playsinline
            width="100%"
            height="100%"
            className={`transition-opacity duration-700 ${showVideo ? "opacity-100" : "opacity-0"}`}
            onReady={() => setVideoReady(true)}
            onError={() => setVideoFailed(true)}
            config={{
              file: {
                attributes: {
                  style: { objectFit: "cover", width: "100%", height: "100%" },
                },
              },
            }}
          />
        </div>
      )}
      {!showVideo && (
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[#2e4957]" />
          {!prefersReducedMotion && (
            <>
              <motion.div
                className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl"
                style={{ backgroundColor: `${solution.heroColor}08` }}
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
      )}

      <div className="relative z-20 max-w-[1400px] mx-auto px-4 py-20 md:py-28 w-full">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${solution.heroColor}30` }}>
              <SolutionIcon className="h-6 w-6" style={{ color: solution.heroColor }} />
            </div>
            <Badge className="bg-white/10 text-white/80 border-white/20 font-heading text-xs tracking-wider uppercase" data-testid="badge-solution-type">
              {solution.title}
            </Badge>
          </motion.div>

          <motion.p
            className="text-sm font-heading font-semibold tracking-wider uppercase mb-4"
            style={{ color: solution.heroColor }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            data-testid="text-subheadline"
          >
            {solution.subheadline}
          </motion.p>

          <motion.h1
            className="text-3xl md:text-5xl lg:text-6xl font-heading font-bold leading-[1.08] mb-6 tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
            data-testid="text-solution-headline"
          >
            {solution.headline}
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-white/75 mb-10 leading-relaxed max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            data-testid="text-solution-description"
          >
            {solution.description}
          </motion.p>

          <motion.div
            className="flex items-center gap-4 flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Link href={`/products?industry=${encodeURIComponent(solution.industryFilter)}`}>
              <Button
                size="lg"
                className="bg-[#f28d00] hover:bg-[#e07d00] text-white font-heading text-base px-8 h-12"
                data-testid="button-browse-products"
              >
                Browse Products <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/applications">
              <Button
                size="lg"
                variant="outline"
                className="bg-white/5 border-white/20 text-white hover:bg-white/10 font-heading text-base px-8 h-12 backdrop-blur-sm"
                data-testid="button-view-applications"
              >
                View Applications
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
    </section>
  );
}

function NarrativeSection({ solution }: { solution: SolutionPageData }) {
  return (
    <section className="py-20 md:py-28 bg-background relative overflow-hidden" data-testid="section-narrative">
      <div className="absolute inset-0 opacity-[0.02]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="sol-dots" width="30" height="30" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#sol-dots)" />
        </svg>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 relative">
        <FadeIn className="max-w-3xl mb-16">
          <p className="font-heading font-semibold text-sm tracking-wider uppercase mb-3" style={{ color: solution.heroColor }} data-testid="text-narrative-label">
            Industry Context
          </p>
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6 leading-tight" data-testid="text-narrative-title">
            {solution.narrativeTitle}
          </h2>
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed" data-testid="text-narrative-body">
            {solution.narrativeBody}
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <p className="font-heading font-semibold text-sm tracking-wider uppercase mb-3" style={{ color: solution.heroColor }}>
            Key Challenges
          </p>
          <h3 className="text-2xl font-heading font-bold mb-8" data-testid="text-challenges-title">
            The Engineering Problems That Define This Industry
          </h3>
        </FadeIn>

        <StaggerContainer staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {solution.challenges.map((challenge, i) => {
            const ChallengeIcon = challenge.icon;
            return (
              <StaggerItem key={i}>
                <Card className="p-6 hover-elevate h-full group" data-testid={`card-challenge-${i}`}>
                  <div className="flex items-start gap-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${solution.heroColor}12` }}
                    >
                      <ChallengeIcon className="h-5 w-5" style={{ color: solution.heroColor }} />
                    </div>
                    <div>
                      <h4 className="text-base font-heading font-bold mb-2">{challenge.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{challenge.description}</p>
                    </div>
                  </div>
                </Card>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}

function SystemApproachSection({ solution }: { solution: SolutionPageData }) {
  return (
    <section className="bg-[#2e4957] text-white py-20 md:py-24 relative overflow-hidden" data-testid="section-system">
      <motion.div
        className="absolute -top-20 -right-20 w-96 h-96 rounded-full blur-3xl"
        style={{ backgroundColor: `${solution.heroColor}08` }}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="max-w-[1400px] mx-auto px-4 relative">
        <FadeIn className="text-center mb-14">
          <p className="font-heading font-semibold text-sm tracking-wider uppercase mb-3" style={{ color: solution.heroColor }} data-testid="text-system-label">
            How TE Solves This
          </p>
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4" data-testid="text-system-title">
            System-Level Thinking, Not Just Components
          </h2>
          <p className="text-white/75 max-w-2xl mx-auto leading-relaxed">
            We don't sell individual parts in isolation. We design connectivity architectures
            that work as integrated systems — reducing risk, accelerating time-to-market,
            and ensuring long-term reliability.
          </p>
        </FadeIn>

        <StaggerContainer staggerDelay={0.15} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {solution.systemApproaches.map((approach, i) => {
            const ApproachIcon = approach.icon;
            return (
              <StaggerItem key={i}>
                <div className="group rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm p-8 hover:bg-white/10 hover:border-white/20 transition-all duration-300 h-full" data-testid={`card-system-${i}`}>
                  <div
                    className="w-14 h-14 rounded-lg flex items-center justify-center mb-6 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${solution.heroColor}20` }}
                  >
                    <ApproachIcon className="h-7 w-7" style={{ color: solution.heroColor }} />
                  </div>
                  <h3 className="text-lg font-heading font-bold mb-3">{approach.title}</h3>
                  <p className="text-sm text-white/70 leading-relaxed">{approach.description}</p>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}

function ProofPointsSection({ solution }: { solution: SolutionPageData }) {
  return (
    <section className="py-20 md:py-24 bg-background" data-testid="section-proof">
      <div className="max-w-[1400px] mx-auto px-4">
        <FadeIn className="text-center mb-14">
          <p className="font-heading font-semibold text-sm tracking-wider uppercase mb-3" style={{ color: solution.heroColor }}>
            By The Numbers
          </p>
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4" data-testid="text-proof-title">
            Proven Performance at Scale
          </h2>
        </FadeIn>

        <StaggerContainer staggerDelay={0.1} className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-10 max-w-4xl mx-auto mb-16">
          {solution.proofPoints.map((point, i) => (
            <StaggerItem key={i} className="text-center">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${solution.heroColor}10` }}
              >
                <Target className="h-6 w-6" style={{ color: solution.heroColor }} />
              </div>
              <div className="text-3xl md:text-4xl font-heading font-bold mb-1" style={{ color: solution.heroColor }}>
                <AnimatedCounter
                  target={point.value}
                  prefix={point.prefix || ""}
                  suffix={point.suffix}
                />
              </div>
              <p className="text-sm text-muted-foreground font-medium" data-testid={`text-proof-${i}`}>{point.label}</p>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <FadeIn delay={0.2}>
          <h3 className="text-xl font-heading font-bold mb-6 text-center" data-testid="text-applications-title">Application Examples</h3>
        </FadeIn>
        <StaggerContainer staggerDelay={0.08} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {solution.applicationExamples.map((app, i) => {
            const AppIcon = app.icon;
            return (
              <StaggerItem key={i}>
                <Card className="p-5 hover-elevate h-full group" data-testid={`card-app-${i}`}>
                  <div
                    className="w-10 h-10 rounded-md flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${solution.heroColor}12` }}
                  >
                    <AppIcon className="h-5 w-5" style={{ color: solution.heroColor }} />
                  </div>
                  <h4 className="text-sm font-heading font-bold mb-1">{app.name}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{app.description}</p>
                </Card>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}

function ProductDiscoverySection({ solution }: { solution: SolutionPageData }) {
  const { formatPrice } = useI18n();
  const { data: productsData, isLoading } = useQuery<{ products: Product[]; total: number }>({
    queryKey: ["/api/products", { industry: solution.industryFilter }],
    queryFn: async () => {
      const res = await fetch(`/api/products?industry=${encodeURIComponent(solution.industryFilter)}&limit=6`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const products = productsData?.products || [];

  if (isLoading) {
    return (
      <section className="bg-card border-y py-16" data-testid="section-products">
        <div className="max-w-[1400px] mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-4">
                <Skeleton className="aspect-square rounded-md mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-3 w-2/3" />
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="bg-card border-y py-16 md:py-20" data-testid="section-products">
      <div className="max-w-[1400px] mx-auto px-4">
        <FadeIn>
          <div className="flex items-center justify-between gap-4 mb-10">
            <div>
              <p className="font-heading font-semibold text-sm tracking-wider uppercase mb-2" style={{ color: solution.heroColor }}>
                Product Discovery
              </p>
              <h2 className="text-2xl md:text-3xl font-heading font-bold mb-1" data-testid="text-products-title">
                Products for {solution.title.replace(" Solutions", "")}
              </h2>
              <p className="text-muted-foreground text-sm">
                {productsData?.total || 0} products engineered for {solution.title.toLowerCase().replace(" solutions", "")} applications.
              </p>
            </div>
            <Link href={`/products?industry=${encodeURIComponent(solution.industryFilter)}`}>
              <Button variant="outline" className="font-heading gap-2" data-testid="link-view-all-products">
                View All Products <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </FadeIn>

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
                        {product.application && (
                          <Badge variant="secondary" className="text-[10px]">{product.application}</Badge>
                        )}
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
      </div>
    </section>
  );
}

function CTASection({ solution }: { solution: SolutionPageData }) {
  return (
    <section className="py-16 md:py-20" data-testid="section-cta">
      <div className="max-w-[1400px] mx-auto px-4">
        <FadeIn>
          <div className="bg-[#2e4957] rounded-xl p-8 md:p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#167a87]/20 to-transparent" />
            <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex-1">
                <h3 className="text-xl md:text-2xl font-heading font-bold mb-2" data-testid="text-cta-title">
                  {solution.ctaTitle}
                </h3>
                <p className="text-white/75 leading-relaxed" data-testid="text-cta-description">
                  {solution.ctaDescription}
                </p>
              </div>
              <Link href={`/products?industry=${encodeURIComponent(solution.industryFilter)}`}>
                <Button
                  size="lg"
                  className="bg-[#f28d00] hover:bg-[#e07d00] text-white font-heading whitespace-nowrap"
                  data-testid="button-cta-products"
                >
                  Explore Products <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function CrossNavigation({ currentSlug }: { currentSlug: string }) {
  return (
    <section className="border-t py-16" data-testid="section-cross-nav">
      <div className="max-w-[1400px] mx-auto px-4">
        <FadeIn className="text-center">
          <h2 className="text-2xl font-heading font-bold mb-2">Explore Other Solutions</h2>
          <p className="text-muted-foreground mb-8">See how TE serves other major industries.</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {Object.entries(solutionsData)
              .filter(([key]) => key !== currentSlug)
              .map(([key, sol]) => {
                const NavIcon = sol.icon;
                return (
                  <Link key={key} href={`/solutions/${key}`}>
                    <Button variant="outline" className="font-heading gap-2 h-11" data-testid={`link-solution-${key}`}>
                      <NavIcon className="h-4 w-4" />
                      {sol.title}
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </Link>
                );
              })}
            <Link href="/applications">
              <Button variant="outline" className="font-heading gap-2 h-11" data-testid="link-applications">
                <CheckCircle2 className="h-4 w-4" />
                All Applications
                <ChevronRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export default function Solutions() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug || "transportation";
  const solution = solutionsData[slug];

  if (!solution) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-heading font-bold mb-4" data-testid="text-not-found">Solution Not Found</h1>
        <p className="text-muted-foreground mb-6">The solution page you're looking for doesn't exist.</p>
        <Link href="/">
          <Button data-testid="button-back-home">Back to Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SolutionHero solution={solution} />
      <NarrativeSection solution={solution} />
      <SystemApproachSection solution={solution} />
      <ProofPointsSection solution={solution} />
      <ProductDiscoverySection solution={solution} />
      <CTASection solution={solution} />
      <CrossNavigation currentSlug={slug} />
    </div>
  );
}
