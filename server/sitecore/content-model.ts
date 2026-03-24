export const TEMPLATE_IDS = {
  PAGE: "{76036F5E-CBCE-46D1-AF0A-4143F9B557AA}",
  FOLDER: "{A87A00B1-E6DB-45AB-8B54-636FEC3B5523}",
  DATASOURCE_FOLDER: "{56776E93-EC70-4244-B93B-CAE1F743E4FA}",
};

export const SITE_ROOT = "/sitecore/content/nxp/nxp";
export const TEMPLATES_ROOT = "/sitecore/templates/Project/nxp";
export const RENDERINGS_ROOT = "/sitecore/layout/Renderings/Project/build/NovaTech";
export const MEDIA_ROOT = "/sitecore/media library/Project/nxp";
export const DATA_ROOT = `${SITE_ROOT}/Home/Data`;
export const HOME_PATH = `${SITE_ROOT}/Home`;

export interface TemplateField {
  name: string;
  type: "Single-Line Text" | "Multi-Line Text" | "Rich Text" | "Image" | "General Link" | "Checkbox" | "Integer" | "Number" | "Droptree" | "Droplink" | "Multilist";
  section?: string;
  shared?: boolean;
  unversioned?: boolean;
  standardValue?: string;
}

export interface ComponentTemplate {
  name: string;
  path: string;
  icon?: string;
  fields: TemplateField[];
  variants?: ComponentVariant[];
}

export interface ComponentVariant {
  name: string;
  description: string;
  cssClass: string;
}

export interface RenderingDefinition {
  name: string;
  path: string;
  componentName: string;
  placeholders?: string[];
  datasourceTemplate?: string;
  datasourceLocation?: string;
  allowedPlaceholders?: string[];
  variants?: ComponentVariant[];
}

export const componentTemplates: ComponentTemplate[] = [
  {
    name: "Hero Banner",
    path: `${TEMPLATES_ROOT}/Hero Banner`,
    fields: [
      { name: "Badge Text", type: "Single-Line Text", section: "Content" },
      { name: "Title", type: "Single-Line Text", section: "Content" },
      { name: "Title Accent", type: "Single-Line Text", section: "Content" },
      { name: "Subtitle", type: "Multi-Line Text", section: "Content" },
      { name: "Primary CTA Text", type: "Single-Line Text", section: "CTA" },
      { name: "Primary CTA Link", type: "General Link", section: "CTA" },
      { name: "Secondary CTA Text", type: "Single-Line Text", section: "CTA" },
      { name: "Secondary CTA Link", type: "General Link", section: "CTA" },
      { name: "Background Video URL", type: "Single-Line Text", section: "Media" },
      { name: "Background Image", type: "Image", section: "Media" },
      { name: "Show Connectivity Motif", type: "Checkbox", section: "Display" },
    ],
    variants: [
      { name: "Default", description: "Full-width manifesto hero with video background", cssClass: "" },
      { name: "Compact", description: "Shorter hero without video, solid background", cssClass: "hero--compact" },
      { name: "Split", description: "Two-column hero with content left, media right", cssClass: "hero--split" },
    ],
  },
  {
    name: "Mega Trends",
    path: `${TEMPLATES_ROOT}/Mega Trends`,
    fields: [
      { name: "Section Label", type: "Single-Line Text", section: "Content" },
      { name: "Heading", type: "Single-Line Text", section: "Content" },
      { name: "Description", type: "Multi-Line Text", section: "Content" },
    ],
  },
  {
    name: "Mega Trend Card",
    path: `${TEMPLATES_ROOT}/Mega Trend Card`,
    fields: [
      { name: "Title", type: "Single-Line Text", section: "Content" },
      { name: "Subtitle", type: "Single-Line Text", section: "Content" },
      { name: "Description", type: "Multi-Line Text", section: "Content" },
      { name: "Stat Value", type: "Single-Line Text", section: "Content" },
      { name: "Stat Label", type: "Single-Line Text", section: "Content" },
      { name: "Icon Name", type: "Single-Line Text", section: "Display" },
      { name: "Accent Color", type: "Single-Line Text", section: "Display" },
      { name: "Link", type: "General Link", section: "CTA" },
    ],
  },
  {
    name: "Solution Pathways",
    path: `${TEMPLATES_ROOT}/Solution Pathways`,
    fields: [
      { name: "Section Label", type: "Single-Line Text", section: "Content" },
      { name: "Heading", type: "Single-Line Text", section: "Content" },
      { name: "Description", type: "Multi-Line Text", section: "Content" },
    ],
    variants: [
      { name: "Default", description: "Dark background with question cards", cssClass: "" },
      { name: "Light", description: "Light background variant", cssClass: "pathways--light" },
    ],
  },
  {
    name: "Solution Pathway Card",
    path: `${TEMPLATES_ROOT}/Solution Pathway Card`,
    fields: [
      { name: "Question", type: "Single-Line Text", section: "Content" },
      { name: "Context", type: "Multi-Line Text", section: "Content" },
      { name: "Industry Label", type: "Single-Line Text", section: "Content" },
      { name: "Link", type: "General Link", section: "CTA" },
    ],
  },
  {
    name: "Authority Stats",
    path: `${TEMPLATES_ROOT}/Authority Stats`,
    fields: [
      { name: "Section Label", type: "Single-Line Text", section: "Content" },
      { name: "Heading", type: "Single-Line Text", section: "Content" },
      { name: "Description", type: "Multi-Line Text", section: "Content" },
      { name: "CTA Heading", type: "Single-Line Text", section: "CTA" },
      { name: "CTA Description", type: "Multi-Line Text", section: "CTA" },
      { name: "CTA Link Text", type: "Single-Line Text", section: "CTA" },
      { name: "CTA Link", type: "General Link", section: "CTA" },
    ],
    variants: [
      { name: "Default", description: "Light background with bottom CTA banner", cssClass: "" },
      { name: "Dark", description: "Dark slate background", cssClass: "authority--dark" },
    ],
  },
  {
    name: "Stat Item",
    path: `${TEMPLATES_ROOT}/Stat Item`,
    fields: [
      { name: "Value", type: "Integer", section: "Content" },
      { name: "Prefix", type: "Single-Line Text", section: "Content" },
      { name: "Suffix", type: "Single-Line Text", section: "Content" },
      { name: "Label", type: "Single-Line Text", section: "Content" },
      { name: "Icon Name", type: "Single-Line Text", section: "Display" },
    ],
  },
  {
    name: "Solution Hero",
    path: `${TEMPLATES_ROOT}/Solution Hero`,
    fields: [
      { name: "Industry Label", type: "Single-Line Text", section: "Content" },
      { name: "Title", type: "Single-Line Text", section: "Content" },
      { name: "Subtitle", type: "Multi-Line Text", section: "Content" },
      { name: "Background Video URL", type: "Single-Line Text", section: "Media" },
      { name: "Background Image", type: "Image", section: "Media" },
      { name: "Accent Color", type: "Single-Line Text", section: "Display" },
    ],
    variants: [
      { name: "Default", description: "Full-width hero with ambient video", cssClass: "" },
      { name: "Minimal", description: "Condensed header without video", cssClass: "solution-hero--minimal" },
    ],
  },
  {
    name: "Solution Narrative",
    path: `${TEMPLATES_ROOT}/Solution Narrative`,
    fields: [
      { name: "Section Label", type: "Single-Line Text", section: "Content" },
      { name: "Heading", type: "Single-Line Text", section: "Content" },
      { name: "Lead Text", type: "Multi-Line Text", section: "Content" },
      { name: "Body", type: "Rich Text", section: "Content" },
    ],
    variants: [
      { name: "Default", description: "Standard narrative block", cssClass: "" },
      { name: "Accent Left", description: "With colored left border accent", cssClass: "narrative--accent-left" },
      { name: "Two Column", description: "Two-column layout with aside", cssClass: "narrative--two-col" },
    ],
  },
  {
    name: "Challenge Card",
    path: `${TEMPLATES_ROOT}/Challenge Card`,
    fields: [
      { name: "Title", type: "Single-Line Text", section: "Content" },
      { name: "Description", type: "Multi-Line Text", section: "Content" },
      { name: "Icon Name", type: "Single-Line Text", section: "Display" },
    ],
  },
  {
    name: "Product Discovery",
    path: `${TEMPLATES_ROOT}/Product Discovery`,
    fields: [
      { name: "Section Label", type: "Single-Line Text", section: "Content" },
      { name: "Heading", type: "Single-Line Text", section: "Content" },
      { name: "Description", type: "Multi-Line Text", section: "Content" },
      { name: "Industry Filter", type: "Single-Line Text", section: "Data" },
      { name: "Application Filter", type: "Single-Line Text", section: "Data" },
      { name: "Max Products", type: "Integer", section: "Data", standardValue: "6" },
      { name: "CTA Text", type: "Single-Line Text", section: "CTA" },
      { name: "CTA Link", type: "General Link", section: "CTA" },
    ],
    variants: [
      { name: "Default", description: "Grid layout with product cards", cssClass: "" },
      { name: "Carousel", description: "Horizontal scrolling carousel", cssClass: "discovery--carousel" },
      { name: "Compact", description: "Condensed list view", cssClass: "discovery--compact" },
    ],
  },
  {
    name: "Proof Point Counter",
    path: `${TEMPLATES_ROOT}/Proof Point Counter`,
    fields: [
      { name: "Section Label", type: "Single-Line Text", section: "Content" },
      { name: "Heading", type: "Single-Line Text", section: "Content" },
    ],
  },
  {
    name: "Proof Point Item",
    path: `${TEMPLATES_ROOT}/Proof Point Item`,
    fields: [
      { name: "Value", type: "Single-Line Text", section: "Content" },
      { name: "Label", type: "Single-Line Text", section: "Content" },
      { name: "Description", type: "Multi-Line Text", section: "Content" },
    ],
  },
  {
    name: "Cross Navigation",
    path: `${TEMPLATES_ROOT}/Cross Navigation`,
    fields: [
      { name: "Heading", type: "Single-Line Text", section: "Content" },
      { name: "Description", type: "Multi-Line Text", section: "Content" },
    ],
  },
  {
    name: "Cross Nav Link",
    path: `${TEMPLATES_ROOT}/Cross Nav Link`,
    fields: [
      { name: "Title", type: "Single-Line Text", section: "Content" },
      { name: "Description", type: "Multi-Line Text", section: "Content" },
      { name: "Link", type: "General Link", section: "CTA" },
      { name: "Icon Name", type: "Single-Line Text", section: "Display" },
      { name: "Accent Color", type: "Single-Line Text", section: "Display" },
    ],
  },
  {
    name: "Rich Text Block",
    path: `${TEMPLATES_ROOT}/Rich Text Block`,
    fields: [
      { name: "Content", type: "Rich Text", section: "Content" },
    ],
    variants: [
      { name: "Default", description: "Standard rich text", cssClass: "" },
      { name: "Narrow", description: "Max-width constrained for readability", cssClass: "rte--narrow" },
      { name: "Full Width", description: "Full container width", cssClass: "rte--full" },
    ],
  },
];

export const placeholderSettings = [
  {
    name: "headless-main",
    displayName: "Main Content",
    allowedComponents: [
      "Hero Banner", "Mega Trends", "Solution Pathways", "Authority Stats",
      "Solution Hero", "Solution Narrative", "Product Discovery",
      "Proof Point Counter", "Cross Navigation", "Rich Text Block",
    ],
  },
  {
    name: "headless-header",
    displayName: "Header",
    allowedComponents: [],
  },
  {
    name: "headless-footer",
    displayName: "Footer",
    allowedComponents: [],
  },
];

export const renderingDefinitions: RenderingDefinition[] = componentTemplates
  .filter(t => !["Mega Trend Card", "Solution Pathway Card", "Stat Item", "Challenge Card",
    "Proof Point Item", "Cross Nav Link"].includes(t.name))
  .map(t => ({
    name: t.name,
    path: `${RENDERINGS_ROOT}/${t.name}`,
    componentName: t.name.replace(/\s+/g, ""),
    datasourceTemplate: t.path,
    datasourceLocation: DATA_ROOT,
    allowedPlaceholders: ["headless-main"],
    variants: t.variants,
  }));

export interface PageDefinition {
  name: string;
  path: string;
  displayName: string;
  route: string;
  components: PageComponentInstance[];
}

export interface PageComponentInstance {
  renderingName: string;
  placeholder: string;
  datasourceName: string;
  fields: Record<string, string>;
  children?: {
    templateName: string;
    items: { name: string; fields: Record<string, string> }[];
  };
  variant?: string;
}

export const pageDefinitions: PageDefinition[] = [
  {
    name: "Home",
    path: HOME_PATH,
    displayName: "Home",
    route: "/",
    components: [
      {
        renderingName: "Hero Banner",
        placeholder: "headless-main",
        datasourceName: "Home Hero",
        fields: {
          "Badge Text": "The Infrastructure Behind What Matters",
          "Title": "Every Connection",
          "Title Accent": "Counts",
          "Subtitle": "TE Connectivity is the invisible infrastructure powering electrification, AI, and industrial automation at global scale. We don't just connect components — we enable the systems that power the world.",
          "Primary CTA Text": "Explore Solutions",
          "Primary CTA Link": "<link linktype=\"internal\" url=\"/solutions/transportation\" />",
          "Secondary CTA Text": "Browse Catalog",
          "Secondary CTA Link": "<link linktype=\"internal\" url=\"/products\" />",
          "Background Video URL": "https://assets.mixkit.co/videos/preview/mixkit-circuit-board-with-neon-lights-close-up-view-77488-large.mp4",
          "Show Connectivity Motif": "1",
        },
      },
      {
        renderingName: "Mega Trends",
        placeholder: "headless-main",
        datasourceName: "Home Mega Trends",
        fields: {
          "Section Label": "Where We Create Impact",
          "Heading": "Positioned at the Intersection of Three Mega-Trends",
          "Description": "TE Connectivity is uniquely positioned where electrification, artificial intelligence, and industrial automation converge — benefiting from every single one simultaneously.",
        },
        children: {
          templateName: "Mega Trend Card",
          items: [
            {
              name: "Electrification",
              fields: {
                "Title": "Electrification",
                "Subtitle": "Powering the transition to electric everything",
                "Description": "From EV battery systems to renewable energy grids, TE connectivity solutions enable the reliable flow of power across next-generation electrical architectures.",
                "Stat Value": "40%",
                "Stat Label": "growth in EV connector demand",
                "Icon Name": "BatteryCharging",
                "Accent Color": "#f28d00",
                "Link": "<link linktype=\"internal\" url=\"/solutions/transportation\" />",
              },
            },
            {
              name: "AI Infrastructure",
              fields: {
                "Title": "AI Infrastructure",
                "Subtitle": "The backbone of intelligent systems",
                "Description": "Hyperscale data centers require unprecedented power density and high-speed connectivity. TE delivers both — enabling AI compute at scale.",
                "Stat Value": "3x",
                "Stat Label": "data center power demand by 2030",
                "Icon Name": "Server",
                "Accent Color": "#167a87",
                "Link": "<link linktype=\"internal\" url=\"/solutions/communications\" />",
              },
            },
            {
              name: "Industrial Automation",
              fields: {
                "Title": "Industrial Automation",
                "Subtitle": "Connecting the smart factory",
                "Description": "Robotics, smart manufacturing, and factory automation demand connectivity that survives heat, vibration, and continuous operation. That's where TE thrives.",
                "Stat Value": "90K+",
                "Stat Label": "employees across 140 countries",
                "Icon Name": "Factory",
                "Accent Color": "#2e4957",
                "Link": "<link linktype=\"internal\" url=\"/solutions/industrial\" />",
              },
            },
          ],
        },
      },
      {
        renderingName: "Solution Pathways",
        placeholder: "headless-main",
        datasourceName: "Home Solution Pathways",
        fields: {
          "Section Label": "Start With Your Challenge",
          "Heading": "What Problem Are You Solving?",
          "Description": "We don't just sell components. We help you solve engineering challenges at the system level.",
        },
        children: {
          templateName: "Solution Pathway Card",
          items: [
            {
              name: "EV Charging",
              fields: {
                "Question": "How do I improve EV charging reliability?",
                "Context": "High-voltage connectors and thermal management solutions engineered for the harshest automotive environments.",
                "Industry Label": "Transportation",
                "Link": "<link linktype=\"internal\" url=\"/solutions/transportation\" />",
              },
            },
            {
              name: "AI Data Center",
              fields: {
                "Question": "How do I scale AI data center infrastructure?",
                "Context": "High-speed, high-density connectivity solutions that handle the power and signal demands of next-gen AI compute.",
                "Industry Label": "Communications",
                "Link": "<link linktype=\"internal\" url=\"/solutions/communications\" />",
              },
            },
            {
              name: "Energy Grid",
              fields: {
                "Question": "How do I modernize energy grid systems?",
                "Context": "Utility-grade connectors, sensors, and power distribution solutions for smart grid and renewable energy infrastructure.",
                "Industry Label": "Industrial",
                "Link": "<link linktype=\"internal\" url=\"/solutions/industrial\" />",
              },
            },
            {
              name: "Signal Integrity",
              fields: {
                "Question": "How do I ensure signal integrity in harsh environments?",
                "Context": "Connectors and sensors rated for extreme temperatures, vibration, and mission-critical reliability across industries.",
                "Industry Label": "Cross-Industry",
                "Link": "<link linktype=\"internal\" url=\"/products\" />",
              },
            },
          ],
        },
      },
      {
        renderingName: "Authority Stats",
        placeholder: "headless-main",
        datasourceName: "Home Authority Stats",
        fields: {
          "Section Label": "Global Scale, Engineering Precision",
          "Heading": "The Nervous System of Modern Industry",
          "Description": "TE Connectivity is a Tier 1 backbone player across multiple industries. Once our products are designed into a system, they stay for 10–20+ years. That's not a supplier relationship — that's partnership.",
          "CTA Heading": "Engineering-Led. Co-Design Model.",
          "CTA Description": "With 8,000+ engineers and a local-for-local manufacturing model where ~70% of products are produced where they're sold, TE reduces supply chain risk while delivering deep OEM integration.",
          "CTA Link Text": "Explore Products",
          "CTA Link": "<link linktype=\"internal\" url=\"/products\" />",
        },
        children: {
          templateName: "Stat Item",
          items: [
            { name: "Revenue", fields: { "Value": "18", "Prefix": "$", "Suffix": "B+", "Label": "Annual Revenue", "Icon Name": "DollarSign" } },
            { name: "Countries", fields: { "Value": "140", "Prefix": "", "Suffix": "+", "Label": "Countries Served", "Icon Name": "MapPin" } },
            { name: "Engineers", fields: { "Value": "8000", "Prefix": "", "Suffix": "+", "Label": "Engineers Worldwide", "Icon Name": "Wrench" } },
            { name: "Employees", fields: { "Value": "90000", "Prefix": "", "Suffix": "+", "Label": "Global Employees", "Icon Name": "Users" } },
          ],
        },
      },
    ],
  },
  {
    name: "Transportation",
    path: `${SITE_ROOT}/Home/Solutions/Transportation`,
    displayName: "Transportation Solutions",
    route: "/solutions/transportation",
    components: [
      {
        renderingName: "Solution Hero",
        placeholder: "headless-main",
        datasourceName: "Transportation Hero",
        fields: {
          "Industry Label": "Transportation Solutions",
          "Title": "Powering the Vehicles of Tomorrow",
          "Subtitle": "From internal combustion to full electrification, TE Connectivity is engineering the transition. Our connectors, sensors, and harness solutions are designed into platforms that will define mobility for the next two decades.",
          "Background Video URL": "https://assets.mixkit.co/videos/preview/mixkit-car-electric-engine-close-up-4883-large.mp4",
          "Accent Color": "#f28d00",
        },
      },
      {
        renderingName: "Solution Narrative",
        placeholder: "headless-main",
        datasourceName: "Transportation Narrative",
        fields: {
          "Section Label": "The TE Advantage",
          "Heading": "Why the World's Leading OEMs Choose TE",
          "Lead Text": "In automotive, second-best isn't an option. Every connector, every sensor, every harness must perform flawlessly across millions of miles.",
          "Body": "<p>TE Connectivity's automotive portfolio spans the full vehicle architecture — from high-voltage battery connectors rated for 800V platforms to miniaturized sensor assemblies that survive 150°C underhood environments.</p><p>Our engineering-first approach means we co-design with OEM teams from concept through production validation, ensuring our products are optimized for each platform's unique requirements.</p>",
        },
        variant: "Accent Left",
      },
      {
        renderingName: "Product Discovery",
        placeholder: "headless-main",
        datasourceName: "Transportation Products",
        fields: {
          "Section Label": "Featured Products",
          "Heading": "Transportation Connectivity Solutions",
          "Description": "Explore our automotive and transportation product portfolio",
          "Industry Filter": "Automotive",
          "Max Products": "6",
          "CTA Text": "View Full Catalog",
          "CTA Link": "<link linktype=\"internal\" url=\"/products?industry=Automotive\" />",
        },
      },
      {
        renderingName: "Cross Navigation",
        placeholder: "headless-main",
        datasourceName: "Transportation Cross Nav",
        fields: {
          "Heading": "Explore Other Industries",
          "Description": "TE Connectivity serves multiple industries with the same engineering excellence.",
        },
        children: {
          templateName: "Cross Nav Link",
          items: [
            { name: "Industrial", fields: { "Title": "Industrial Solutions", "Description": "Factory automation, robotics, and harsh-environment connectivity", "Link": "<link linktype=\"internal\" url=\"/solutions/industrial\" />", "Icon Name": "Factory", "Accent Color": "#2e4957" } },
            { name: "Communications", fields: { "Title": "Communications Solutions", "Description": "Data center, 5G, and high-speed network infrastructure", "Link": "<link linktype=\"internal\" url=\"/solutions/communications\" />", "Icon Name": "Server", "Accent Color": "#167a87" } },
          ],
        },
      },
    ],
  },
  {
    name: "Industrial",
    path: `${SITE_ROOT}/Home/Solutions/Industrial`,
    displayName: "Industrial Solutions",
    route: "/solutions/industrial",
    components: [
      {
        renderingName: "Solution Hero",
        placeholder: "headless-main",
        datasourceName: "Industrial Hero",
        fields: {
          "Industry Label": "Industrial Solutions",
          "Title": "The Backbone of Industry 4.0",
          "Subtitle": "Smart factories, predictive maintenance, and industrial IoT demand connectivity that performs in the harshest environments. TE delivers the sensors, connectors, and terminal blocks that make Industry 4.0 real.",
          "Background Video URL": "https://assets.mixkit.co/videos/preview/mixkit-robotic-arm-in-a-factory-close-up-38910-large.mp4",
          "Accent Color": "#2e4957",
        },
      },
      {
        renderingName: "Solution Narrative",
        placeholder: "headless-main",
        datasourceName: "Industrial Narrative",
        fields: {
          "Section Label": "Engineered for Extremes",
          "Heading": "Where Reliability Is Non-Negotiable",
          "Lead Text": "Industrial environments punish weak links. TE products are engineered to survive vibration, chemicals, extreme temperatures, and decades of continuous operation.",
          "Body": "<p>From M12 circular connectors with IP67 protection for factory-floor Ethernet to DIN rail terminal blocks rated for 800V, TE's industrial portfolio covers every layer of the automation stack.</p><p>Our sensor technologies — including piezoelectric vibration sensors for condition monitoring and RTD assemblies for process control — provide the data backbone for predictive maintenance strategies.</p>",
        },
      },
      {
        renderingName: "Product Discovery",
        placeholder: "headless-main",
        datasourceName: "Industrial Products",
        fields: {
          "Section Label": "Featured Products",
          "Heading": "Industrial Automation Solutions",
          "Description": "Explore our industrial connectivity and sensor portfolio",
          "Industry Filter": "Industrial Automation",
          "Max Products": "9",
          "CTA Text": "View Full Catalog",
          "CTA Link": "<link linktype=\"internal\" url=\"/products?industry=Industrial+Automation\" />",
        },
      },
      {
        renderingName: "Cross Navigation",
        placeholder: "headless-main",
        datasourceName: "Industrial Cross Nav",
        fields: {
          "Heading": "Explore Other Industries",
          "Description": "TE Connectivity serves multiple industries with the same engineering excellence.",
        },
        children: {
          templateName: "Cross Nav Link",
          items: [
            { name: "Transportation", fields: { "Title": "Transportation Solutions", "Description": "EV powertrains, autonomous systems, and vehicle connectivity", "Link": "<link linktype=\"internal\" url=\"/solutions/transportation\" />", "Icon Name": "BatteryCharging", "Accent Color": "#f28d00" } },
            { name: "Communications", fields: { "Title": "Communications Solutions", "Description": "Data center, 5G, and high-speed network infrastructure", "Link": "<link linktype=\"internal\" url=\"/solutions/communications\" />", "Icon Name": "Server", "Accent Color": "#167a87" } },
          ],
        },
      },
    ],
  },
  {
    name: "Communications",
    path: `${SITE_ROOT}/Home/Solutions/Communications`,
    displayName: "Communications Solutions",
    route: "/solutions/communications",
    components: [
      {
        renderingName: "Solution Hero",
        placeholder: "headless-main",
        datasourceName: "Communications Hero",
        fields: {
          "Industry Label": "Communications Solutions",
          "Title": "Enabling the Connected World",
          "Subtitle": "From hyperscale data centers to 5G base stations, TE provides the high-speed, high-density connectivity that modern communications infrastructure demands.",
          "Background Video URL": "https://assets.mixkit.co/videos/preview/mixkit-servers-in-a-data-center-close-up-38894-large.mp4",
          "Accent Color": "#167a87",
        },
      },
      {
        renderingName: "Solution Narrative",
        placeholder: "headless-main",
        datasourceName: "Communications Narrative",
        fields: {
          "Section Label": "Built for Bandwidth",
          "Heading": "Where Speed Meets Density",
          "Lead Text": "AI workloads are driving unprecedented demand for power and signal density. TE's data center portfolio is purpose-built for the next generation of compute.",
          "Body": "<p>Our high-speed I/O connectors support data rates up to 112 Gbps PAM4, while our power distribution solutions handle the thermal and electrical demands of GPU-dense AI infrastructure.</p><p>From structured cabling with Cat 6A performance to fiber optic connectivity for long-haul data transport, TE provides end-to-end solutions for modern networks.</p>",
        },
        variant: "Two Column",
      },
      {
        renderingName: "Product Discovery",
        placeholder: "headless-main",
        datasourceName: "Communications Products",
        fields: {
          "Section Label": "Featured Products",
          "Heading": "Communications Infrastructure Solutions",
          "Description": "Explore our data center and networking portfolio",
          "Industry Filter": "Data Communications",
          "Max Products": "6",
          "CTA Text": "View Full Catalog",
          "CTA Link": "<link linktype=\"internal\" url=\"/products?industry=Data+Communications\" />",
        },
      },
      {
        renderingName: "Cross Navigation",
        placeholder: "headless-main",
        datasourceName: "Communications Cross Nav",
        fields: {
          "Heading": "Explore Other Industries",
          "Description": "TE Connectivity serves multiple industries with the same engineering excellence.",
        },
        children: {
          templateName: "Cross Nav Link",
          items: [
            { name: "Transportation", fields: { "Title": "Transportation Solutions", "Description": "EV powertrains, autonomous systems, and vehicle connectivity", "Link": "<link linktype=\"internal\" url=\"/solutions/transportation\" />", "Icon Name": "BatteryCharging", "Accent Color": "#f28d00" } },
            { name: "Industrial", fields: { "Title": "Industrial Solutions", "Description": "Factory automation, robotics, and harsh-environment connectivity", "Link": "<link linktype=\"internal\" url=\"/solutions/industrial\" />", "Icon Name": "Factory", "Accent Color": "#2e4957" } },
          ],
        },
      },
    ],
  },
];
