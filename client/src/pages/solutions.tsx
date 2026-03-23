import { Link, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BatteryCharging, Server, Factory, Box, ChevronRight } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations";
import type { Product } from "@shared/schema";

const solutionsData: Record<string, {
  title: string;
  headline: string;
  description: string;
  icon: typeof BatteryCharging;
  color: string;
  challenges: string[];
  industryFilter: string;
}> = {
  transportation: {
    title: "Transportation Solutions",
    headline: "Powering the Future of Mobility",
    description: "From EV battery systems to autonomous driving platforms, TE Connectivity delivers harsh-environment connectivity that the automotive industry depends on. Our solutions are engineered for the extreme demands of modern transportation — high voltage, high vibration, mission-critical reliability.",
    icon: BatteryCharging,
    color: "#f28d00",
    challenges: [
      "EV battery system reliability at high voltages",
      "Autonomous sensor connectivity in extreme temperatures",
      "Charging infrastructure for next-gen EV platforms",
      "Powertrain electrification across commercial vehicles",
    ],
    industryFilter: "Automotive",
  },
  industrial: {
    title: "Industrial Solutions",
    headline: "Connecting the Smart Factory",
    description: "Factory automation, energy infrastructure, aerospace systems, and medical devices all demand connectivity that never fails. TE provides the sensors, connectors, and power components that keep critical industrial systems running — from the factory floor to the operating room.",
    icon: Factory,
    color: "#2e4957",
    challenges: [
      "Grid modernization for renewable energy integration",
      "Robotics connectivity in high-vibration environments",
      "Harsh-environment sensing for predictive maintenance",
      "Medical device reliability in mission-critical applications",
    ],
    industryFilter: "Industrial Automation",
  },
  communications: {
    title: "Communications Solutions",
    headline: "The Backbone of Intelligent Systems",
    description: "AI-driven data centers are reshaping power and connectivity demands. TE delivers the high-speed, high-density solutions that hyperscalers need — from power distribution to signal integrity at speeds that keep pace with exponential compute growth.",
    icon: Server,
    color: "#167a87",
    challenges: [
      "AI compute density driving unprecedented power demands",
      "High-speed signal integrity at 400G+ data rates",
      "Thermal management in dense rack configurations",
      "Edge compute connectivity for 5G infrastructure",
    ],
    industryFilter: "Data Communications",
  },
};

export default function Solutions() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug || "transportation";
  const solution = solutionsData[slug];

  const { data: productsData } = useQuery<{ products: Product[]; total: number }>({
    queryKey: ["/api/products", { industry: solution?.industryFilter }],
    queryFn: async () => {
      const res = await fetch(`/api/products?industry=${encodeURIComponent(solution?.industryFilter || "")}&limit=6`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!solution,
  });

  if (!solution) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-heading font-bold mb-4">Solution Not Found</h1>
        <Link href="/">
          <Button data-testid="button-back-home">Back to Home</Button>
        </Link>
      </div>
    );
  }

  const SolutionIcon = solution.icon;
  const relevantProducts = productsData?.products || [];

  return (
    <div className="min-h-screen">
      <section className="relative bg-[#2e4957] text-white py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#04215d]/40 via-transparent to-[#167a87]/20" />
        <div className="relative max-w-[1400px] mx-auto px-4">
          <FadeIn>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${solution.color}30` }}>
                <SolutionIcon className="h-6 w-6" style={{ color: solution.color }} />
              </div>
              <Badge className="bg-white/10 text-white/80 border-white/20 font-heading text-xs tracking-wider uppercase" data-testid="badge-solution-type">
                {solution.title}
              </Badge>
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-heading font-bold leading-tight mb-6" data-testid="text-solution-headline">
              {solution.headline}
            </h1>
            <p className="text-lg text-white/75 max-w-3xl leading-relaxed mb-8" data-testid="text-solution-description">
              {solution.description}
            </p>
            <Link href="/products">
              <Button size="lg" className="bg-[#f28d00] text-white font-heading" data-testid="button-browse-products">
                Browse {solution.title.split(" ")[0]} Products <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </FadeIn>
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-4 py-16">
        <FadeIn>
          <h2 className="text-2xl font-heading font-bold mb-2" data-testid="text-challenges-title">Key Challenges We Solve</h2>
          <p className="text-muted-foreground mb-8">Engineering solutions for the toughest connectivity problems.</p>
        </FadeIn>
        <StaggerContainer staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {solution.challenges.map((challenge, i) => (
            <StaggerItem key={i}>
              <Card className="p-6 hover-elevate" data-testid={`card-challenge-${i}`}>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: `${solution.color}15` }}>
                    <span className="text-sm font-heading font-bold" style={{ color: solution.color }}>{i + 1}</span>
                  </div>
                  <p className="text-sm font-medium leading-relaxed">{challenge}</p>
                </div>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {relevantProducts.length > 0 && (
        <section className="bg-card border-y">
          <div className="max-w-[1400px] mx-auto px-4 py-16">
            <FadeIn>
              <div className="flex items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-heading font-bold mb-1" data-testid="text-products-title">Related Products</h2>
                  <p className="text-muted-foreground text-sm">Products engineered for {solution.title.toLowerCase().replace(" solutions", "")} applications.</p>
                </div>
                <Link href={`/products?industry=${encodeURIComponent(solution.industryFilter)}`}>
                  <Button variant="ghost" size="sm" data-testid="link-view-all-products">
                    View All <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </FadeIn>
            <StaggerContainer staggerDelay={0.08} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relevantProducts.map((product) => (
                <StaggerItem key={product.id}>
                  <Link href={`/products/${product.id}`}>
                    <Card className="hover-elevate cursor-pointer h-full" data-testid={`card-product-${product.id}`}>
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
                        <Badge variant="secondary" className="text-[10px]">{product.industry}</Badge>
                      </div>
                    </Card>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      )}

      <section className="max-w-[1400px] mx-auto px-4 py-16">
        <FadeIn className="text-center">
          <h2 className="text-2xl font-heading font-bold mb-4">Explore Other Solutions</h2>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {Object.entries(solutionsData)
              .filter(([key]) => key !== slug)
              .map(([key, sol]) => (
                <Link key={key} href={`/solutions/${key}`}>
                  <Button variant="outline" className="font-heading gap-2" data-testid={`link-solution-${key}`}>
                    <sol.icon className="h-4 w-4" />
                    {sol.title}
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </Link>
              ))}
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
