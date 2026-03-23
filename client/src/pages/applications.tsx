import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BatteryCharging, Server, Factory, Cpu, Shield, Zap,
  ChevronRight, ArrowRight
} from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations";

const applications = [
  {
    title: "EV Battery Management",
    description: "High-voltage connectors and sensors for battery monitoring, thermal management, and charging systems.",
    icon: BatteryCharging,
    industry: "Transportation",
    color: "#f28d00",
    href: "/products?application=Powertrain+Systems",
  },
  {
    title: "AI Data Center Power",
    description: "High-density power distribution and high-speed connectivity for hyperscale AI compute infrastructure.",
    icon: Server,
    industry: "Communications",
    color: "#167a87",
    href: "/products?application=Network+Infrastructure",
  },
  {
    title: "Smart Grid Infrastructure",
    description: "Utility-grade connectors, sensors, and power components for grid modernization and renewable energy.",
    icon: Zap,
    industry: "Industrial",
    color: "#2e4957",
    href: "/products?application=Panel+Wiring",
  },
  {
    title: "Industrial Robotics",
    description: "Harsh-environment connectivity for robotic systems, motor control, and factory automation networks.",
    icon: Factory,
    industry: "Industrial",
    color: "#2e4957",
    href: "/products?application=Motor+Control",
  },
  {
    title: "Condition Monitoring",
    description: "Precision sensors for vibration, temperature, and pressure measurement in predictive maintenance systems.",
    icon: Cpu,
    industry: "Industrial",
    color: "#2e4957",
    href: "/products?application=Condition+Monitoring",
  },
  {
    title: "Circuit Protection",
    description: "ESD protection, surge suppression, and overcurrent devices for sensitive electronic systems.",
    icon: Shield,
    industry: "Cross-Industry",
    color: "#f28d00",
    href: "/products?application=ESD+Protection",
  },
];

export default function Applications() {
  return (
    <div className="min-h-screen">
      <section className="relative bg-[#2e4957] text-white py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#04215d]/40 via-transparent to-[#167a87]/20" />
        <div className="relative max-w-[1400px] mx-auto px-4">
          <FadeIn>
            <Badge className="mb-4 bg-white/10 text-white/80 border-white/20 font-heading text-xs tracking-wider uppercase" data-testid="badge-applications">
              Applications
            </Badge>
            <h1 className="text-3xl md:text-5xl font-heading font-bold leading-tight mb-4" data-testid="text-applications-title">
              From Challenge to Solution
            </h1>
            <p className="text-lg text-white/75 max-w-2xl leading-relaxed" data-testid="text-applications-subtitle">
              Discover how TE connectivity solutions address specific engineering challenges
              across industries — from EV battery systems to AI data center infrastructure.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-4 py-16">
        <StaggerContainer staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications.map((app, i) => (
            <StaggerItem key={i}>
              <Link href={app.href}>
                <Card className="hover-elevate cursor-pointer h-full group relative overflow-hidden" data-testid={`card-application-${i}`}>
                  <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: app.color }} />
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${app.color}15` }}>
                        <app.icon className="h-6 w-6" style={{ color: app.color }} />
                      </div>
                      <Badge variant="secondary" className="text-[10px]">{app.industry}</Badge>
                    </div>
                    <h3 className="text-lg font-heading font-bold mb-2 group-hover:text-[#f28d00] transition-colors">{app.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{app.description}</p>
                    <div className="flex items-center text-sm font-heading font-medium" style={{ color: app.color }}>
                      View Products <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Card>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      <section className="bg-card border-y">
        <div className="max-w-[1400px] mx-auto px-4 py-16 text-center">
          <FadeIn>
            <h2 className="text-2xl font-heading font-bold mb-4">Explore by Industry</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              See how TE Connectivity serves entire industries with comprehensive connectivity and sensor solutions.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link href="/solutions/transportation">
                <Button variant="outline" className="font-heading gap-2" data-testid="link-solutions-transportation">
                  <BatteryCharging className="h-4 w-4" /> Transportation <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
              <Link href="/solutions/industrial">
                <Button variant="outline" className="font-heading gap-2" data-testid="link-solutions-industrial">
                  <Factory className="h-4 w-4" /> Industrial <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
              <Link href="/solutions/communications">
                <Button variant="outline" className="font-heading gap-2" data-testid="link-solutions-communications">
                  <Server className="h-4 w-4" /> Communications <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
