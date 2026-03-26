import { useState, useRef, useEffect, useCallback } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MessageCircle, X, Send, Sparkles, Bot, User, ExternalLink, FileText, Wrench, Search, ChevronRight, CheckCircle2, AlertTriangle } from "lucide-react";
import { useLocation } from "wouter";

type ProductCard = {
  name: string;
  sku: string;
  id: string;
  specs: Record<string, string>;
  highlight?: string;
};

type TroubleshootingStep = {
  step: number;
  title: string;
  detail: string;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  links?: { label: string; href: string }[];
  productCards?: ProductCard[];
  troubleshootingSteps?: TroubleshootingStep[];
  suggestions?: string[];
  disambiguation?: string[];
};

type UseCase = "product-discovery" | "technical-support" | null;

type ConversationState = {
  useCase: UseCase;
  industry: string | null;
  application: string | null;
  attributes: Record<string, string>;
  skippedQuestions: string[];
  narrowedProducts: CatalogProduct[];
  currentProduct: CatalogProduct | null;
  step: number;
  techSupportType: "datasheet" | "troubleshoot" | "installation" | "compatibility" | null;
};

type CatalogProduct = {
  name: string;
  sku: string;
  id: string;
  category: string;
  keywords: string[];
  industry: string[];
  application: string[];
  voltage: string;
  pinCount: number;
  ipRating: string;
  tempRange: string;
  specs: Record<string, string>;
  commonIssues: { problem: string; steps: TroubleshootingStep[] }[];
  installationTips: string[];
  datasheetUrl: string;
  cadUrl: string;
};

const ENHANCED_CATALOG: CatalogProduct[] = [
  {
    name: "AMPSEAL 16 Series 23-Pin Plug",
    sku: "776087-1",
    id: "eba11c6f-8cbd-49d3-ba94-c3af933b99d7",
    category: "connectors",
    keywords: ["sealed", "automotive", "waterproof", "23-pin", "plug", "ampseal", "ev", "battery", "powertrain", "high-voltage", "underhood"],
    industry: ["automotive", "ev", "electric vehicle", "transportation", "heavy equipment"],
    application: ["powertrain", "battery management", "bms", "engine harness", "underhood", "high-voltage distribution"],
    voltage: "400V AC",
    pinCount: 23,
    ipRating: "IP6K9K",
    tempRange: "-40C to +150C",
    specs: { "Pin Count": "23", "Wire Range": "22-16 AWG", "Current Rating": "17.5A", "Voltage Rating": "400V AC", "IP Rating": "IP6K9K", "Operating Temp": "-40°C to +150°C", "Mating Cycles": "25 minimum", "Vibration": "High vibration rated" },
    commonIssues: [
      {
        problem: "connector not seating fully",
        steps: [
          { step: 1, title: "Check CPA (Connector Position Assurance)", detail: "Ensure the CPA clip is in the pre-staged position before mating. The CPA should slide freely before connection." },
          { step: 2, title: "Inspect terminal seating", detail: "Verify all terminals are fully seated with an audible click. Use the AMPSEAL extraction tool (part #1-1579007-0) to reseat any loose terminals." },
          { step: 3, title: "Verify wire seal alignment", detail: "Check that the rear wire seal grommets are properly aligned and not pinched. Misaligned seals can prevent full connector engagement." },
          { step: 4, title: "Apply mating force evenly", detail: "Push the connector halves together with steady, even force. You should hear/feel a distinct click when the latch engages. Typical mating force is 45N." },
        ],
      },
      {
        problem: "water ingress",
        steps: [
          { step: 1, title: "Inspect seal condition", detail: "Remove the connector and visually inspect the interfacial seal and wire seals for cuts, tears, or deformation." },
          { step: 2, title: "Check for unused cavities", detail: "All unused cavities must have cavity plugs (part #776093-1) installed. Missing plugs break the seal envelope." },
          { step: 3, title: "Verify wire gauge compatibility", detail: "Ensure wire gauges match the seal range (22-16 AWG). Undersized wires won't seal properly." },
          { step: 4, title: "Test seal integrity", detail: "Perform a pressure-decay test at 35 kPa. Acceptable leak rate is < 10 cc/min." },
        ],
      },
    ],
    installationTips: [
      "Use TE's AMPSEAL crimping tool (part #2-1579004-3) for consistent crimp quality. Hand crimping is not recommended.",
      "Apply a thin layer of dielectric grease on the interfacial seal for easier mating and improved moisture resistance.",
      "Route cables with a drip loop to prevent water from tracking along wires into the connector.",
      "Torque header mounting screws to 0.8-1.0 Nm for proper panel sealing.",
    ],
    datasheetUrl: "https://www.te.com/usa-en/product-776087-1.datasheet.pdf",
    cadUrl: "https://www.te.com/usa-en/product-776087-1.cad.html",
  },
  {
    name: "DEUTSCH DT 12-Pin Connector",
    sku: "DT06-12S-CE06",
    id: "2bab8836-e591-4085-86f4-664d9929f610",
    category: "connectors",
    keywords: ["deutsch", "12-pin", "sealed", "automotive", "rugged", "dt", "mil-spec", "military"],
    industry: ["automotive", "military", "defense", "heavy equipment", "agriculture", "marine"],
    application: ["engine harness", "body wiring", "lighting", "sensor connections", "rugged environments"],
    voltage: "75V DC",
    pinCount: 12,
    ipRating: "IP67/IP69K",
    tempRange: "-55C to +125C",
    specs: { "Pin Count": "12", "Wire Range": "20-16 AWG", "Current Rating": "13A per contact", "Voltage Rating": "75V DC", "IP Rating": "IP67/IP69K", "Operating Temp": "-55°C to +125°C", "Housing Material": "Nylon 6/6", "Contact Plating": "Nickel w/ Gold Flash" },
    commonIssues: [
      {
        problem: "contact retention failure",
        steps: [
          { step: 1, title: "Check secondary lock (wedgelock)", detail: "The DT series uses a wedgelock as a secondary lock. Ensure the wedgelock (part# W12S for 12-pin socket) is fully inserted — it should sit flush with the connector face." },
          { step: 2, title: "Verify crimp quality", detail: "Inspect the crimp zone. The crimp barrel should show defined crimp indentations. Use TE's HDT-48-00 crimp tool with the appropriate positioner." },
          { step: 3, title: "Test terminal insertion", detail: "Insert the contact until you hear a definitive click. Tug gently to verify retention. Minimum retention force should be 22N." },
          { step: 4, title: "Replace damaged contacts", detail: "Use the DEUTSCH extraction tool (part# 0411-204-1605) to remove contacts without damaging the housing cavity." },
        ],
      },
      {
        problem: "connector not locking",
        steps: [
          { step: 1, title: "Inspect latch mechanism", detail: "Check that the side latches on the plug are not cracked or deformed. Cracked latches require housing replacement." },
          { step: 2, title: "Clean connector interface", detail: "Remove any debris or corrosion from the mating interface. Use isopropyl alcohol and a lint-free cloth." },
          { step: 3, title: "Check for cross-threading", detail: "For threaded DT variants, ensure the coupling nut threads are clean and not cross-threaded. Re-engage at the correct angle." },
          { step: 4, title: "Verify correct mating pair", detail: "Confirm you're mating a DT06 (socket) with a DT04 (pin header). Mismatched series won't latch properly." },
        ],
      },
    ],
    installationTips: [
      "Always install the wedgelock last, after all contacts are inserted and verified.",
      "Use the correct crimp tool: HDT-48-00 with positioner for size 16 contacts (20-16 AWG).",
      "Strip wire insulation to exactly 5mm (3/16\") for optimal crimp performance.",
      "Apply Nyogel 760G to the connector interface for enhanced moisture protection in marine applications.",
    ],
    datasheetUrl: "https://www.te.com/usa-en/product-DT06-12S-CE06.datasheet.pdf",
    cadUrl: "https://www.te.com/usa-en/product-DT06-12S-CE06.cad.html",
  },
  {
    name: "M12 Circular Connector 8-Pos D-Coded",
    sku: "T4171110008-001",
    id: "d7cf998a-d4c8-46a0-a537-c53b0d5932d3",
    category: "connectors",
    keywords: ["m12", "circular", "ethernet", "industrial", "d-coded", "profinet", "automation", "factory"],
    industry: ["industrial automation", "factory automation", "manufacturing", "robotics", "food and beverage"],
    application: ["ethernet communication", "profinet", "ethercat", "io-link", "plc connections", "sensor networks"],
    voltage: "30V DC",
    pinCount: 8,
    ipRating: "IP67",
    tempRange: "-40C to +85C",
    specs: { "Pin Count": "8", "Coding": "D-Coded", "Data Rate": "100 Mbps", "IP Rating": "IP67", "Operating Temp": "-40°C to +85°C", "Cable OD": "4-8mm", "Mounting": "Panel Mount" },
    commonIssues: [
      {
        problem: "connector not locking",
        steps: [
          { step: 1, title: "Inspect the locking ring threads", detail: "The M12 coupling nut has fine-pitch threads. Check for cross-threading by attempting to hand-tighten. If it binds, back off completely and re-engage." },
          { step: 2, title: "Check the D-coding alignment", detail: "D-coded connectors have an asymmetric key. The key must align with the receptacle slot before the coupling nut engages. Rotate gently until the key seats." },
          { step: 3, title: "Verify torque specification", detail: "Hand-tighten the coupling nut, then torque to 0.6 Nm using the appropriate tool. Over-torquing can damage the threads." },
          { step: 4, title: "Inspect O-ring seal", detail: "If the connector wobbles even when tightened, the O-ring may be missing or damaged. Replace with the correct M12 O-ring (inner diameter 9.5mm)." },
        ],
      },
      {
        problem: "intermittent connection",
        steps: [
          { step: 1, title: "Verify cable shield continuity", detail: "Use a multimeter to check shield continuity. The D-coded M12 connector requires proper shield termination for reliable data transmission." },
          { step: 2, title: "Check pin contact alignment", detail: "Inspect the pins for bending or contamination. Even slight pin deformation can cause intermittent contact. Use compressed air to clean." },
          { step: 3, title: "Test at the network layer", detail: "Run a ping test to monitor packet loss. If packet loss exceeds 0.1%, the physical connection needs attention." },
          { step: 4, title: "Replace cable assembly", detail: "If the above steps don't resolve the issue, the cable may have an internal break. Replace the cable assembly and retest." },
        ],
      },
    ],
    installationTips: [
      "Always use D-coded M12 connectors for Ethernet applications — A-coded connectors are for sensor signals only.",
      "For panel-mount applications, ensure the cutout is 12.0-12.2mm and use the supplied flat washer and locknut.",
      "Keep cable runs under 100m for reliable 100 Mbps performance per IEEE 802.3 specifications.",
      "Use shielded cable assemblies in environments with high EMI (near VFDs, servo drives, or welding equipment).",
    ],
    datasheetUrl: "https://www.te.com/usa-en/product-T4171110008-001.datasheet.pdf",
    cadUrl: "https://www.te.com/usa-en/product-T4171110008-001.cad.html",
  },
  {
    name: "PCB Power Relay 30A",
    sku: "T9AS1D12-12",
    id: "ac84d700-671d-447f-b256-859197a58c7c",
    category: "relays",
    keywords: ["relay", "pcb", "power", "30a", "hvac", "switching", "coil"],
    industry: ["industrial automation", "hvac", "building automation", "appliance"],
    application: ["hvac control", "power switching", "motor starting", "heater control", "lighting control"],
    voltage: "240V AC",
    pinCount: 4,
    ipRating: "N/A",
    tempRange: "-40C to +70C",
    specs: { "Contact Config": "SPST-NO", "Contact Rating": "30A @ 240VAC", "Coil Voltage": "12 VDC", "Coil Power": "1.6W", "Dielectric Strength": "2500 VAC", "Life": "100,000 ops" },
    commonIssues: [
      {
        problem: "relay not energizing",
        steps: [
          { step: 1, title: "Measure coil voltage", detail: "Verify 12 VDC (±10%) is present across the coil terminals. Voltage below 9.6V may not reliably energize the relay." },
          { step: 2, title: "Check coil resistance", detail: "Measure coil resistance with power removed. Expected value is ~90 ohms. Open circuit (infinite resistance) indicates a burned coil." },
          { step: 3, title: "Inspect solder joints", detail: "Check PCB solder joints under magnification. Cold solder joints or hairline cracks can cause intermittent coil energization." },
          { step: 4, title: "Verify flyback diode", detail: "Ensure a flyback diode is installed across the coil (cathode to positive). Missing diodes can cause coil damage from inductive spikes." },
        ],
      },
    ],
    installationTips: [
      "Always use a flyback diode (1N4004 or equivalent) across the DC coil to suppress inductive voltage spikes.",
      "Maintain minimum PCB trace width of 3mm for 30A load paths. Use 2oz copper or heavier.",
      "Mount the relay on the component side of the PCB with adequate ventilation — relay temperature affects contact life.",
    ],
    datasheetUrl: "https://www.te.com/usa-en/product-T9AS1D12-12.datasheet.pdf",
    cadUrl: "https://www.te.com/usa-en/product-T9AS1D12-12.cad.html",
  },
  {
    name: "Contactor Relay 4-Pole",
    sku: "ICS-V16A-4C-24",
    id: "3a3f0f1f-227a-4130-8bd1-7da554b7f83c",
    category: "relays",
    keywords: ["contactor", "din", "rail", "motor", "4-pole"],
    industry: ["industrial automation", "building automation", "hvac"],
    application: ["motor control", "lighting control", "pump control", "fan control"],
    voltage: "250V AC",
    pinCount: 4,
    ipRating: "IP20",
    tempRange: "-25C to +50C",
    specs: { "Poles": "4 (2NO + 2NC)", "Contact Rating": "10A @ 250VAC", "Coil Voltage": "24 VAC/DC", "Mounting": "DIN Rail (35mm)", "Width": "45mm", "Mechanical Life": "10M ops" },
    commonIssues: [],
    installationTips: [
      "Mount on standard 35mm DIN rail. Ensure rail is securely fastened and grounded.",
      "Use the appropriate wire ferrules for the screw terminals — bare stranded wire can cause unreliable connections.",
    ],
    datasheetUrl: "https://www.te.com/usa-en/product-ICS-V16A-4C-24.datasheet.pdf",
    cadUrl: "https://www.te.com/usa-en/product-ICS-V16A-4C-24.cad.html",
  },
  {
    name: "Vibration Sensor 100mV/g",
    sku: "805M1-0100",
    id: "a1798fdd-6bc7-4237-b726-4d477bbdc085",
    category: "sensors",
    keywords: ["vibration", "accelerometer", "piezo", "monitoring", "predictive", "maintenance"],
    industry: ["industrial automation", "manufacturing", "energy", "oil and gas"],
    application: ["condition monitoring", "predictive maintenance", "machine health", "vibration analysis"],
    voltage: "24V DC",
    pinCount: 2,
    ipRating: "IP67",
    tempRange: "-40C to +121C",
    specs: { "Sensitivity": "100 mV/g", "Frequency Range": "2-10,000 Hz", "Dynamic Range": "80g peak", "Operating Temp": "-40°C to +121°C", "Output": "2-wire IEPE", "Mounting": "1/4-28 UNF stud", "Weight": "50g" },
    commonIssues: [
      {
        problem: "noisy signal",
        steps: [
          { step: 1, title: "Check mounting torque", detail: "Ensure the sensor is mounted with 1.5-2.5 Nm torque on the stud mount. Loose mounting introduces mechanical noise." },
          { step: 2, title: "Verify cable shield grounding", detail: "The cable shield should be grounded at the data acquisition end only. Double-grounding creates ground loops." },
          { step: 3, title: "Inspect mounting surface", detail: "The mounting surface must be flat and clean. Use a thin layer of mounting grease (silicone-based) for frequencies above 2 kHz." },
        ],
      },
    ],
    installationTips: [
      "Mount on a flat, clean surface. Surface roughness should be less than 1.6 µm Ra for optimal high-frequency response.",
      "Use stud mounting for permanent installations — adhesive or magnetic mounts reduce usable frequency range.",
      "Route sensor cables away from power cables and VFDs to minimize electromagnetic interference.",
    ],
    datasheetUrl: "https://www.te.com/usa-en/product-805M1-0100.datasheet.pdf",
    cadUrl: "https://www.te.com/usa-en/product-805M1-0100.cad.html",
  },
  {
    name: "Pressure Transducer 0-100 PSI",
    sku: "U5374-000005-100PG",
    id: "19c59901-3d49-4872-9887-cf14373d85e4",
    category: "sensors",
    keywords: ["pressure", "transducer", "4-20ma", "hydraulic", "pneumatic"],
    industry: ["industrial automation", "oil and gas", "hydraulics", "process control"],
    application: ["hydraulic systems", "pneumatic systems", "process monitoring", "pump control"],
    voltage: "10-30V DC",
    pinCount: 3,
    ipRating: "IP65",
    tempRange: "-40C to +125C",
    specs: { "Range": "0-100 PSI", "Output": "4-20mA", "Accuracy": "±0.25% FSO", "Burst Pressure": "3x rated", "Connection": "1/4 NPT Male", "Supply Voltage": "10-30 VDC" },
    commonIssues: [
      {
        problem: "inaccurate readings",
        steps: [
          { step: 1, title: "Check for pressure spikes", detail: "Install a snubber fitting if the system has rapid pressure fluctuations. Spikes can damage the sensing element over time." },
          { step: 2, title: "Verify zero offset", detail: "Vent the sensor to atmosphere and check the 4mA zero point. Drift > 1% indicates potential membrane damage." },
          { step: 3, title: "Inspect for leaks", detail: "Apply thread sealant (PTFE tape or pipe dope) to the 1/4 NPT connection. Tighten to 15-20 ft-lbs." },
        ],
      },
    ],
    installationTips: [
      "Use PTFE thread tape (3-4 wraps) on the NPT threads. Do not use liquid sealant that could block the pressure port.",
      "Mount with the sensing element pointing downward when measuring liquid pressure to prevent air pockets.",
      "Install a gauge tee or isolation valve for easy removal and recalibration without depressurizing the system.",
    ],
    datasheetUrl: "https://www.te.com/usa-en/product-U5374-000005-100PG.datasheet.pdf",
    cadUrl: "https://www.te.com/usa-en/product-U5374-000005-100PG.cad.html",
  },
  {
    name: "RTD Pt100 Temperature Sensor",
    sku: "NB-PTCO-152",
    id: "8ff1bb0b-6207-45b9-9213-3b40b49eb11c",
    category: "sensors",
    keywords: ["temperature", "rtd", "pt100", "thermocouple", "process", "hvac"],
    industry: ["industrial automation", "food and beverage", "pharmaceutical", "hvac", "process control"],
    application: ["process control", "hvac monitoring", "oven control", "freeze protection"],
    voltage: "N/A",
    pinCount: 3,
    ipRating: "IP67",
    tempRange: "-50C to +500C",
    specs: { "Type": "Pt100 RTD", "Accuracy": "Class A (IEC 60751)", "Temp Range": "-50°C to +500°C", "Sheath Material": "316 SS", "Sheath Diameter": "6mm", "Lead Wires": "3-wire", "Response Time": "< 5 sec" },
    commonIssues: [],
    installationTips: [
      "Use 3-wire connection to compensate for lead resistance. For highest accuracy, use 4-wire connection with compatible transmitter.",
      "Ensure the sensing element is fully immersed in the medium. Minimum immersion depth is 10x the sheath diameter (60mm).",
    ],
    datasheetUrl: "https://www.te.com/usa-en/product-NB-PTCO-152.datasheet.pdf",
    cadUrl: "https://www.te.com/usa-en/product-NB-PTCO-152.cad.html",
  },
  {
    name: "Cat6A Ethernet Patch Cable",
    sku: "CAT6A-S-10-BL",
    id: "826730f0-86d6-4ea2-81c8-0f64ab16d606",
    category: "cables",
    keywords: ["ethernet", "cat6a", "cable", "patch", "network", "data center"],
    industry: ["data communications", "it infrastructure", "data center"],
    application: ["network infrastructure", "server connections", "ip cameras", "poe devices"],
    voltage: "N/A",
    pinCount: 8,
    ipRating: "N/A",
    tempRange: "-20C to +75C",
    specs: { "Category": "Cat 6A", "Length": "10 ft (3m)", "Shielding": "S/FTP", "Performance": "500 MHz / 10 Gbps", "Jacket": "LSZH", "Color": "Blue" },
    commonIssues: [],
    installationTips: [
      "Maintain minimum bend radius of 4x cable diameter to prevent pair damage.",
      "Do not exceed 100m channel length including patch cables for Cat 6A performance.",
    ],
    datasheetUrl: "https://www.te.com/usa-en/product-CAT6A-S-10-BL.datasheet.pdf",
    cadUrl: "https://www.te.com/usa-en/product-CAT6A-S-10-BL.cad.html",
  },
  {
    name: "Silicone Multi-Conductor Cable",
    sku: "SIL-18-4C-300V",
    id: "bd502571-2858-46b0-83ac-a32c6c01bfa3",
    category: "cables",
    keywords: ["silicone", "high-temp", "cable", "multi-conductor", "flexible"],
    industry: ["industrial automation", "aerospace", "appliance", "food and beverage"],
    application: ["high-temp wiring", "oven wiring", "kiln wiring", "flexible connections"],
    voltage: "300V",
    pinCount: 4,
    ipRating: "N/A",
    tempRange: "-60C to +200C",
    specs: { "Gauge": "18 AWG", "Conductors": "4", "Voltage Rating": "300V", "Insulation": "Silicone Rubber", "Temp Rating": "-60°C to +200°C", "UL Rating": "UL 3239" },
    commonIssues: [],
    installationTips: [
      "Use silicone-compatible cable glands. Standard nylon glands may not grip the soft silicone jacket properly.",
      "Avoid routing near sharp edges — silicone insulation is softer than PVC and more susceptible to mechanical damage.",
    ],
    datasheetUrl: "https://www.te.com/usa-en/product-SIL-18-4C-300V.datasheet.pdf",
    cadUrl: "https://www.te.com/usa-en/product-SIL-18-4C-300V.cad.html",
  },
  {
    name: "DIN Rail Terminal Block",
    sku: "XBUT10-FT-BG",
    id: "bc0aa592-b046-4089-8355-9d9f1602f60e",
    category: "terminals",
    keywords: ["terminal", "din", "rail", "block", "spring", "feed-through"],
    industry: ["industrial automation", "building automation", "energy"],
    application: ["panel wiring", "power distribution", "field wiring"],
    voltage: "800V",
    pinCount: 2,
    ipRating: "IP20",
    tempRange: "-40C to +105C",
    specs: { "Cross Section": "10 mm² (8 AWG)", "Current Rating": "57A", "Voltage Rating": "800V", "Connection": "Spring cage", "Mounting": "35mm DIN rail" },
    commonIssues: [],
    installationTips: [
      "Use end plates and end brackets to secure terminal blocks on the DIN rail.",
      "Label each terminal with ferrule markers for easy identification during maintenance.",
    ],
    datasheetUrl: "https://www.te.com/usa-en/product-XBUT10-FT-BG.datasheet.pdf",
    cadUrl: "https://www.te.com/usa-en/product-XBUT10-FT-BG.cad.html",
  },
  {
    name: "PCB Screw Terminal Block",
    sku: "OSTB-1200503",
    id: "0350587b-f586-463c-8e06-a2aedde29955",
    category: "terminals",
    keywords: ["terminal", "pcb", "screw", "through-hole"],
    industry: ["industrial automation", "consumer electronics"],
    application: ["pcb interconnect", "field wiring", "control boards"],
    voltage: "300V",
    pinCount: 12,
    ipRating: "N/A",
    tempRange: "-40C to +105C",
    specs: { "Positions": "12", "Pitch": "5.0mm", "Wire Range": "28-12 AWG", "Current Rating": "15A", "Voltage Rating": "300V", "Mounting": "Through-hole" },
    commonIssues: [],
    installationTips: [
      "Use wire ferrules for stranded wire connections to prevent stray strands.",
      "Torque screws to 0.5-0.6 Nm — over-tightening can crack the housing.",
    ],
    datasheetUrl: "https://www.te.com/usa-en/product-OSTB-1200503.datasheet.pdf",
    cadUrl: "https://www.te.com/usa-en/product-OSTB-1200503.cad.html",
  },
  {
    name: "Automotive Blade Fuse 15A",
    sku: "FBF-15A-100PK",
    id: "656fbdad-4b27-4a70-8e90-4de3ef6e4e53",
    category: "protection",
    keywords: ["fuse", "blade", "automotive", "15a", "circuit protection"],
    industry: ["automotive", "marine", "rv"],
    application: ["electrical distribution", "accessory circuits", "lighting protection"],
    voltage: "32V DC",
    pinCount: 2,
    ipRating: "N/A",
    tempRange: "-40C to +85C",
    specs: { "Rating": "15A @ 32V DC", "Type": "Standard blade (ATO)", "Element": "Zinc alloy", "Pack Qty": "100", "Compliance": "SAE J1284" },
    commonIssues: [],
    installationTips: [
      "Match fuse amperage to wire gauge — 15A fuses should protect 14 AWG or larger wire.",
      "Check fuse holder contacts for corrosion or loose fit. Loose contacts cause heating and premature failure.",
    ],
    datasheetUrl: "https://www.te.com/usa-en/product-FBF-15A-100PK.datasheet.pdf",
    cadUrl: "https://www.te.com/usa-en/product-FBF-15A-100PK.cad.html",
  },
  {
    name: "TVS Diode Array USB 3.0",
    sku: "SESD0402Q2UG-0024-098",
    id: "29a26273-ee36-4708-b8fe-8a819c6214a3",
    category: "protection",
    keywords: ["tvs", "diode", "esd", "usb", "protection", "consumer"],
    industry: ["consumer electronics", "data communications", "medical devices"],
    application: ["esd protection", "usb ports", "data line protection", "hdmi protection"],
    voltage: "5V",
    pinCount: 4,
    ipRating: "N/A",
    tempRange: "-65C to +150C",
    specs: { "Working Voltage": "5V", "Clamping Voltage": "9.8V @ 1A", "Capacitance": "0.25 pF", "ESD Rating": "15 kV (contact)", "Package": "0402 DFN", "Channels": "2" },
    commonIssues: [],
    installationTips: [
      "Place TVS diode as close to the connector as possible for maximum ESD protection effectiveness.",
      "Ensure PCB layout has a low-impedance ground connection to the TVS ground pad.",
    ],
    datasheetUrl: "https://www.te.com/usa-en/product-SESD0402Q2UG-0024-098.datasheet.pdf",
    cadUrl: "https://www.te.com/usa-en/product-SESD0402Q2UG-0024-098.cad.html",
  },
];

function createInitialState(): ConversationState {
  return {
    useCase: null,
    industry: null,
    application: null,
    attributes: {},
    skippedQuestions: [],
    narrowedProducts: [],
    currentProduct: null,
    step: 0,
    techSupportType: null,
  };
}

function extractIndustry(text: string): string | null {
  const lower = text.toLowerCase();
  const industries: Record<string, string[]> = {
    "automotive": ["automotive", "vehicle", "car", "truck", "auto"],
    "ev": ["ev", "electric vehicle", "battery management", "bms", "electric car", "hybrid"],
    "industrial automation": ["industrial", "factory", "manufacturing", "automation", "plc", "scada"],
    "aerospace": ["aerospace", "aircraft", "aviation", "flight"],
    "military": ["military", "defense", "mil-spec", "tactical"],
    "marine": ["marine", "boat", "ship", "offshore", "subsea"],
    "heavy equipment": ["heavy equipment", "construction", "mining", "off-highway", "excavator", "bulldozer"],
    "data communications": ["data center", "networking", "telecom", "it infrastructure", "server"],
    "hvac": ["hvac", "heating", "cooling", "ventilation", "air conditioning", "climate"],
    "food and beverage": ["food", "beverage", "dairy", "brewing", "bottling", "washdown"],
    "medical devices": ["medical", "healthcare", "hospital", "diagnostic"],
    "consumer electronics": ["consumer", "smartphone", "laptop", "tablet", "wearable"],
    "energy": ["energy", "solar", "wind", "power generation", "grid"],
    "oil and gas": ["oil", "gas", "petroleum", "refinery", "pipeline"],
    "robotics": ["robot", "cobot", "robotic"],
    "agriculture": ["agriculture", "farming", "tractor", "precision agriculture"],
  };
  for (const [industry, keywords] of Object.entries(industries)) {
    if (keywords.some(k => lower.includes(k))) return industry;
  }
  return null;
}

function extractApplication(text: string): string | null {
  const lower = text.toLowerCase();
  const apps: Record<string, string[]> = {
    "powertrain": ["powertrain", "engine", "transmission", "drivetrain", "motor control"],
    "battery management": ["battery", "bms", "battery management", "cell monitoring", "soc"],
    "sensor connections": ["sensor", "measurement", "monitoring", "instrumentation"],
    "ethernet communication": ["ethernet", "profinet", "ethercat", "network", "communication", "data"],
    "lighting": ["lighting", "led", "headlight", "taillight", "lamp"],
    "hvac control": ["hvac", "heating", "cooling", "thermostat", "climate control"],
    "condition monitoring": ["vibration", "condition monitoring", "predictive maintenance", "machine health"],
    "hydraulic systems": ["hydraulic", "pneumatic", "fluid power"],
    "panel wiring": ["panel", "cabinet", "enclosure", "wiring"],
    "esd protection": ["esd", "surge", "protection", "tvs", "transient"],
  };
  for (const [app, keywords] of Object.entries(apps)) {
    if (keywords.some(k => lower.includes(k))) return app;
  }
  return null;
}

function extractAttributes(text: string): Record<string, string> {
  const lower = text.toLowerCase();
  const attrs: Record<string, string> = {};

  const voltageMatch = lower.match(/(\d+)\s*v(?:olt|ac|dc|\b)/);
  if (voltageMatch) attrs.voltage = voltageMatch[0].toUpperCase();

  const pinRangeMatch = lower.match(/(\d+)\s*[-–]\s*(\d+)\s*pin/);
  const pinPlusMatch = lower.match(/(\d+)\s*\+\s*pin/);
  const pinExactMatch = lower.match(/(\d+)\s*(?:-?\s*)?pin/);
  if (pinRangeMatch) {
    attrs.pinCount = pinRangeMatch[2];
  } else if (pinPlusMatch) {
    attrs.pinCount = pinPlusMatch[1];
  } else if (pinExactMatch) {
    attrs.pinCount = pinExactMatch[1];
  }

  if (/ip\s*6[7-9]|ip\s*6k9k|waterproof|sealed|submersible/.test(lower)) attrs.ipRating = "sealed";
  if (/ip\s*20|indoor|dry/.test(lower)) attrs.ipRating = "indoor";

  if (/high[\s-]*temp|150|200|underhood|engine bay|exhaust/.test(lower)) attrs.tempRange = "high";
  if (/extended|\+125|125°/.test(lower)) attrs.tempRange = "extended";
  if (/standard|\+85|85°/.test(lower)) attrs.tempRange = "standard";
  if (/cryo|sub[\s-]*zero|\-40|\-55|cold/.test(lower)) attrs.tempRange = "extreme-cold";

  if (/vibration|shock|rough|rugged|underhood/.test(lower)) attrs.environment = "high-vibration";
  if (/heat|hot|thermal/.test(lower)) attrs.environment = attrs.environment ? attrs.environment + ", high-temp" : "high-temp";

  if (/pcb|board[\s-]*mount|through[\s-]*hole|smd/.test(lower)) attrs.mounting = "pcb";
  if (/panel[\s-]*mount/.test(lower)) attrs.mounting = "panel";
  if (/din[\s-]*rail/.test(lower)) attrs.mounting = "din-rail";

  const currentMatch = lower.match(/(\d+)\s*a(?:mp)?/);
  if (currentMatch && !voltageMatch) attrs.currentRating = currentMatch[0].toUpperCase();

  return attrs;
}

function filterProducts(state: ConversationState): CatalogProduct[] {
  let products = [...ENHANCED_CATALOG];

  if (state.industry) {
    const ind = state.industry.toLowerCase();
    const industryMatches = products.filter(p => p.industry.some(i => i.includes(ind) || ind.includes(i)));
    if (industryMatches.length > 0) products = industryMatches;
  }

  if (state.application) {
    const app = state.application.toLowerCase();
    const appMatches = products.filter(p => p.application.some(a => a.includes(app) || app.includes(a)));
    if (appMatches.length > 0) products = appMatches;
  }

  if (state.attributes.voltage) {
    const voltNum = parseInt(state.attributes.voltage);
    if (!isNaN(voltNum)) {
      const voltMatches = products.filter(p => {
        const pVolt = parseInt(p.voltage);
        return !isNaN(pVolt) && pVolt >= voltNum;
      });
      if (voltMatches.length > 0) products = voltMatches;
    }
  }

  if (state.attributes.pinCount) {
    const pinNum = parseInt(state.attributes.pinCount);
    if (!isNaN(pinNum)) {
      const pinMatches = products.filter(p => p.pinCount >= pinNum);
      if (pinMatches.length > 0) products = pinMatches;
    }
  }

  if (state.attributes.ipRating === "sealed") {
    const sealedMatches = products.filter(p => /IP6|IP69/.test(p.ipRating));
    if (sealedMatches.length > 0) products = sealedMatches;
  }

  if (state.attributes.tempRange === "high") {
    const highTempMatches = products.filter(p => {
      const match = p.tempRange.match(/\+(\d+)C/);
      return match && parseInt(match[1]) >= 125;
    });
    if (highTempMatches.length > 0) products = highTempMatches;
  }

  if (state.attributes.environment?.includes("high-vibration")) {
    const vibMatches = products.filter(p =>
      p.keywords.some(k => ["vibration", "rugged", "underhood"].includes(k)) ||
      p.specs["Vibration"] !== undefined
    );
    if (vibMatches.length > 0) products = vibMatches;
  }

  return products;
}

function findProductByName(text: string): CatalogProduct | null {
  const lower = text.toLowerCase();
  for (const p of ENHANCED_CATALOG) {
    if (lower.includes(p.sku.toLowerCase())) return p;
    const nameWords = p.name.toLowerCase().split(/\s+/);
    const matchCount = nameWords.filter(w => lower.includes(w)).length;
    if (matchCount >= 2) return p;
    if (p.keywords.filter(k => lower.includes(k)).length >= 2) return p;
  }
  const singleKeywordMatch = ENHANCED_CATALOG.find(p =>
    p.keywords.some(k => k.length > 3 && lower.includes(k) && !["sealed", "cable", "power", "block"].includes(k))
  );
  return singleKeywordMatch || null;
}

function detectTechSupportType(text: string): "datasheet" | "troubleshoot" | "installation" | "compatibility" | null {
  const lower = text.toLowerCase();
  if (/datasheet|data\s*sheet|spec\s*sheet|pdf|documentation|specs|specifications/.test(lower)) return "datasheet";
  if (/cad|3d\s*model|step\s*file|drawing|dimension/.test(lower)) return "datasheet";
  if (/troubleshoot|problem|issue|not working|broken|fail|error|won't|doesn't|can't|isn't|aren't|wasn't|not locking|not seating|loose|stuck|intermittent|noise|leak|water ingress|no signal|bad connection/.test(lower)) return "troubleshoot";
  if (/install|mount|crimp|wire|assemble|connect|torque|how to|setup|set up/.test(lower)) return "installation";
  if (/compatible|compatibility|alternative|substitute|replace|cross[\s-]*reference|equivalent|work with/.test(lower)) return "compatibility";
  return null;
}

function detectProblem(text: string, product: CatalogProduct): { problem: string; steps: TroubleshootingStep[] } | null {
  const lower = text.toLowerCase();
  for (const issue of product.commonIssues) {
    const problemWords = issue.problem.split(/\s+/);
    if (problemWords.some(w => lower.includes(w))) return issue;
  }
  if (product.commonIssues.length > 0) return product.commonIssues[0];
  return null;
}

type ResponseResult = {
  content: string;
  links?: { label: string; href: string }[];
  productCards?: ProductCard[];
  troubleshootingSteps?: TroubleshootingStep[];
  suggestions?: string[];
  disambiguation?: string[];
  stateUpdates?: Partial<ConversationState>;
};

function processMessage(text: string, state: ConversationState, user: any): ResponseResult {
  const lower = text.toLowerCase();

  if (lower.includes("start over") || lower.includes("reset") || lower.includes("new conversation")) {
    return {
      content: "No problem! Let's start fresh. What can I help you with today?",
      suggestions: ["Find a product", "Technical support", "Browse catalog"],
      stateUpdates: createInitialState(),
    };
  }

  if ((lower === "find a product" || lower === "product discovery" || lower.includes("looking for") || lower.includes("need a") || lower.includes("find me")) && !state.useCase) {
    return {
      content: "I'd love to help you find the right product! Tell me about your project — what industry are you working in, and what's the application? The more detail you share, the better I can narrow things down.",
      suggestions: ["EV battery management system", "Industrial factory automation", "Automotive engine harness", "HVAC control system"],
      stateUpdates: { useCase: "product-discovery", step: 1 },
    };
  }

  if ((lower === "technical support" || lower === "tech support" || lower.includes("help with") || lower.includes("having trouble") || lower.includes("issue with")) && !state.useCase) {
    return {
      content: "I can help with technical support! What product are you working with? You can mention the product name, part number, or describe what you're trying to do.",
      suggestions: ["DEUTSCH DT connector", "AMPSEAL 16 connector", "M12 circular connector", "Pressure transducer"],
      stateUpdates: { useCase: "technical-support", step: 1 },
    };
  }

  if (lower.includes("order") && (lower.includes("status") || lower.includes("track") || lower.includes("where"))) {
    if (user) {
      return {
        content: "You can check your order status and tracking information on the My Orders page.",
        links: [{ label: "View My Orders", href: "/orders" }],
        suggestions: ["Find a product", "Technical support"],
      };
    }
    return {
      content: "Please sign in to check your order status.",
      links: [{ label: "Sign In", href: "/login" }],
      suggestions: ["Find a product", "Technical support"],
    };
  }

  if (state.useCase === "product-discovery") {
    return handleProductDiscovery(text, state, lower);
  }

  if (state.useCase === "technical-support") {
    return handleTechnicalSupport(text, state, lower);
  }

  const industry = extractIndustry(text);
  const application = extractApplication(text);
  const techType = detectTechSupportType(text);
  const product = findProductByName(text);

  if (product && techType) {
    return handleTechnicalSupport(text, { ...state, useCase: "technical-support", currentProduct: product, techSupportType: techType }, lower);
  }

  if (industry || application || (lower.includes("need") && (lower.includes("connector") || lower.includes("sensor") || lower.includes("relay") || lower.includes("cable")))) {
    const newState: Partial<ConversationState> = { useCase: "product-discovery", step: 1 };
    if (industry) newState.industry = industry;
    if (application) newState.application = application;
    const attrs = extractAttributes(text);
    if (Object.keys(attrs).length > 0) newState.attributes = { ...state.attributes, ...attrs };
    return handleProductDiscovery(text, { ...state, ...newState } as ConversationState, lower);
  }

  if (product) {
    return {
      content: `I found the **${product.name}** (${product.sku}). Would you like help finding similar products, or do you need technical support for this product?`,
      links: [{ label: `View ${product.name}`, href: `/products/${product.id}` }],
      productCards: [{
        name: product.name,
        sku: product.sku,
        id: product.id,
        specs: Object.fromEntries(Object.entries(product.specs).slice(0, 4)),
      }],
      suggestions: ["Find similar products", "Technical support for this product", "View datasheet"],
      stateUpdates: { currentProduct: product },
    };
  }

  if (lower.includes("discount") || lower.includes("coupon") || lower.includes("promo")) {
    return {
      content: "We offer volume pricing on all products — the more you order, the lower the unit price. You can also use discount codes at checkout. Try codes like TE10 for 10% off or VOLUME20 for 20% off!",
      suggestions: ["Find a product", "Technical support"],
    };
  }

  if (lower.includes("ship") || lower.includes("delivery") || lower.includes("freight")) {
    return {
      content: "We offer three shipping options: Standard (Free, 5-7 days), Express ($15, 2-3 days), and Next Day ($35, 1 day). Shipping is calculated at checkout.",
      suggestions: ["Find a product", "Technical support"],
    };
  }

  return {
    content: "I can help you in two ways: **Product Discovery** — tell me about your application and I'll guide you to the right product, or **Technical Support** — get datasheets, troubleshooting help, and installation guidance for specific products. What would you like to do?",
    suggestions: ["Find a product", "Technical support", "Browse catalog"],
    links: [{ label: "Browse All Products", href: "/products" }],
  };
}

function handleProductDiscovery(text: string, state: ConversationState, lower: string): ResponseResult {
  const isSkip = /not sure|don't know|skip|any|doesn't matter|no preference/i.test(lower);
  const newAttrs = isSkip ? {} : extractAttributes(text);
  const industry = state.industry || extractIndustry(text);
  const application = state.application || extractApplication(text);
  const mergedAttrs = { ...state.attributes, ...newAttrs };

  const currentSkipped = [...(state.skippedQuestions || [])];
  const questionBeingAnswered = state.step === 3 ? "voltage" : state.step === 4 ? "pins" : state.step === 5 ? "environment" : state.step === 6 ? "temp" : null;
  if (isSkip && questionBeingAnswered && !currentSkipped.includes(questionBeingAnswered)) {
    currentSkipped.push(questionBeingAnswered);
  }

  const updatedState: ConversationState = {
    ...state,
    useCase: "product-discovery",
    industry: industry,
    application: application,
    attributes: mergedAttrs,
    skippedQuestions: currentSkipped,
  };

  const filtered = filterProducts(updatedState);
  updatedState.narrowedProducts = filtered;

  const hasVoltage = !!mergedAttrs.voltage || currentSkipped.includes("voltage");
  const hasPins = !!mergedAttrs.pinCount || currentSkipped.includes("pins");
  const hasIP = !!mergedAttrs.ipRating || currentSkipped.includes("environment");
  const hasTemp = !!mergedAttrs.tempRange || currentSkipped.includes("temp");
  const hasEnv = !!mergedAttrs.environment || currentSkipped.includes("environment");
  const hasConnectors = filtered.some(p => p.category === "connectors") ||
    ENHANCED_CATALOG.filter(p => industry ? p.industry.some(i => i.includes(industry.toLowerCase())) : false).some(p => p.category === "connectors");

  if (!industry && state.step <= 1) {
    return {
      content: "To find the best product for you, could you tell me what industry or application area you're working in?",
      suggestions: ["Automotive / EV", "Industrial Automation", "Data Communications", "HVAC / Building", "Military / Defense"],
      stateUpdates: { ...updatedState, step: 2 },
    };
  }

  if (industry && !hasVoltage && hasConnectors) {
    const industryLabel = industry === "ev" ? "EV and battery management" : industry;
    return {
      content: `Great — ${industryLabel}${application ? ` / ${application}` : ""} applications! To narrow down the right product, what voltage rating do you need? This helps me match the right insulation and clearance specs.`,
      suggestions: ["Up to 75V DC", "Up to 250V AC", "Up to 400V AC", "Not sure yet"],
      stateUpdates: { ...updatedState, step: 3 },
    };
  }

  if (industry && !hasPins && hasConnectors) {
    return {
      content: `${industry ? `For ${industry} applications, we` : "We"} have connectors ranging from 2-pin to 23-pin configurations. How many signal/power pins do you need?`,
      suggestions: ["2-4 pins", "8-12 pins", "16+ pins", "Not sure yet"],
      stateUpdates: { ...updatedState, step: 4 },
    };
  }

  if (industry && !hasIP && !hasEnv) {
    return {
      content: "What kind of environment will this be installed in? This helps me recommend the right sealing and ruggedization level.",
      suggestions: ["Sealed / Outdoor (IP67+)", "Indoor / Panel mount", "Underhood / High vibration", "Clean room / Lab"],
      stateUpdates: { ...updatedState, step: 5 },
    };
  }

  if (industry && !hasTemp) {
    return {
      content: "One last question — what temperature range does the product need to handle? This affects material selection and rating.",
      suggestions: ["-40°C to +85°C (standard)", "-40°C to +125°C (extended)", "-40°C to +150°C (high temp)", "Not sure"],
      stateUpdates: { ...updatedState, step: 6 },
    };
  }

  if (filtered.length === 0) {
    return {
      content: `I couldn't find an exact match with those specifications in our current catalog, but here are the closest options from our ${industry || "product"} range. Let me know if any of these could work, or if you'd like to adjust your requirements.`,
      productCards: ENHANCED_CATALOG.filter(p => industry ? p.industry.some(i => i.includes(industry.toLowerCase())) : true).slice(0, 3).map(p => ({
        name: p.name, sku: p.sku, id: p.id,
        specs: Object.fromEntries(Object.entries(p.specs).slice(0, 5)),
      })),
      links: [{ label: "Browse All Products", href: "/products" }],
      suggestions: ["Adjust requirements", "Browse full catalog", "Start over"],
      stateUpdates: updatedState,
    };
  }

  const topProducts = filtered.slice(0, 3);
  const recText = filtered.length === 1
    ? `Based on your requirements${industry ? ` in the ${industry} space` : ""}${application ? ` for ${application}` : ""}, I recommend the **${topProducts[0].name}**. This is an excellent fit because:`
    : `Based on your requirements${industry ? ` in the ${industry} space` : ""}${application ? ` for ${application}` : ""}, here ${filtered.length === 2 ? "are my top 2 recommendations" : "are my top recommendations"}:`;

  const highlights: string[] = [];
  if (hasVoltage) highlights.push(`✓ Voltage rating meets your ${mergedAttrs.voltage} requirement`);
  if (hasPins) highlights.push(`✓ ${mergedAttrs.pinCount}+ pin count available`);
  if (hasIP) highlights.push(`✓ Environmentally sealed (${mergedAttrs.ipRating === "sealed" ? "IP67+" : mergedAttrs.ipRating})`);
  if (hasTemp) highlights.push(`✓ Rated for ${mergedAttrs.tempRange === "high" ? "high temperature" : "extreme cold"} environments`);
  if (hasEnv) highlights.push(`✓ Designed for ${mergedAttrs.environment} conditions`);

  const highlightText = highlights.length > 0 ? "\n\n" + highlights.join("\n") : "";

  return {
    content: recText + highlightText,
    productCards: topProducts.map(p => ({
      name: p.name, sku: p.sku, id: p.id,
      specs: Object.fromEntries(Object.entries(p.specs).slice(0, 5)),
      highlight: p === topProducts[0] ? "Best Match" : undefined,
    })),
    links: topProducts.map(p => ({ label: `View ${p.name}`, href: `/products/${p.id}` })),
    suggestions: ["Get technical details", "View datasheet", "Compare alternatives", "Start over"],
    stateUpdates: { ...updatedState, currentProduct: topProducts[0] },
  };
}

function handleTechnicalSupport(text: string, state: ConversationState, lower: string): ResponseResult {
  let product = state.currentProduct || findProductByName(text);
  const techType = state.techSupportType || detectTechSupportType(text);

  if (!product) {
    const possibleProducts = ENHANCED_CATALOG.filter(p =>
      p.keywords.some(k => k.length > 3 && lower.includes(k))
    );

    if (possibleProducts.length > 1) {
      return {
        content: "I found a few products that might match. Which one are you asking about?",
        disambiguation: possibleProducts.slice(0, 4).map(p => `${p.name} (${p.sku})`),
        stateUpdates: { ...state, useCase: "technical-support", step: 1 },
      };
    }

    if (possibleProducts.length === 1) {
      product = possibleProducts[0];
    } else {
      return {
        content: "I'd like to help! Could you tell me the product name or part number you need support for?",
        suggestions: ["DEUTSCH DT connector", "AMPSEAL 16 connector", "M12 connector", "Pressure transducer", "Vibration sensor"],
        stateUpdates: { ...state, useCase: "technical-support", step: 1 },
      };
    }
  }

  if (!techType) {
    return {
      content: `I can help with the **${product.name}** (${product.sku}). What do you need?`,
      suggestions: ["View datasheet & CAD files", "Troubleshooting help", "Installation tips", "Check compatibility"],
      links: [{ label: `View product page`, href: `/products/${product.id}` }],
      stateUpdates: { ...state, useCase: "technical-support", currentProduct: product, step: 2 },
    };
  }

  if (techType === "datasheet") {
    return {
      content: `Here are the technical documents available for the **${product.name}** (${product.sku}):`,
      links: [
        { label: `📄 Datasheet — ${product.name}`, href: product.datasheetUrl },
        { label: `📐 CAD / 3D Model — ${product.name}`, href: product.cadUrl },
        { label: `View full product page`, href: `/products/${product.id}` },
      ],
      productCards: [{
        name: product.name, sku: product.sku, id: product.id,
        specs: product.specs,
      }],
      suggestions: ["Troubleshooting help", "Installation tips", "Find a similar product", "Start over"],
      stateUpdates: { ...state, currentProduct: product, techSupportType: null },
    };
  }

  if (techType === "troubleshoot") {
    const issue = detectProblem(text, product);
    if (issue) {
      return {
        content: `Here's a step-by-step troubleshooting guide for "${issue.problem}" with the **${product.name}**:`,
        troubleshootingSteps: issue.steps,
        links: [
          { label: `📄 View full datasheet`, href: product.datasheetUrl },
          { label: `View product page`, href: `/products/${product.id}` },
        ],
        suggestions: product.commonIssues.length > 1
          ? ["Another issue with this product", "Installation tips", "View datasheet", "Start over"]
          : ["Installation tips", "View datasheet", "Find a replacement", "Start over"],
        stateUpdates: { ...state, currentProduct: product, techSupportType: null },
      };
    }

    if (product.commonIssues.length > 0) {
      return {
        content: `Here are the most common issues we see with the **${product.name}**. Which one matches your situation?`,
        disambiguation: product.commonIssues.map(i => i.problem.charAt(0).toUpperCase() + i.problem.slice(1)),
        suggestions: [...product.commonIssues.map(i => i.problem.charAt(0).toUpperCase() + i.problem.slice(1)), "Something else"],
        stateUpdates: { ...state, currentProduct: product, step: 3 },
      };
    }

    return {
      content: `I don't have specific troubleshooting data for the **${product.name}** yet, but here are some general tips:\n\n1. Check all connections are fully seated\n2. Verify correct orientation and keying\n3. Inspect for physical damage or contamination\n4. Confirm electrical ratings match your application\n\nFor detailed support, I recommend checking the datasheet:`,
      links: [
        { label: `📄 Datasheet — ${product.name}`, href: product.datasheetUrl },
      ],
      suggestions: ["Installation tips", "View datasheet", "Contact support", "Start over"],
      stateUpdates: { ...state, currentProduct: product, techSupportType: null },
    };
  }

  if (techType === "installation") {
    if (product.installationTips.length > 0) {
      const steps: TroubleshootingStep[] = product.installationTips.map((tip, i) => ({
        step: i + 1,
        title: `Tip ${i + 1}`,
        detail: tip,
      }));
      return {
        content: `Here are the key installation tips for the **${product.name}** (${product.sku}):`,
        troubleshootingSteps: steps,
        links: [
          { label: `📄 Full datasheet with installation details`, href: product.datasheetUrl },
          { label: `📐 CAD / dimensional drawing`, href: product.cadUrl },
        ],
        suggestions: ["Troubleshooting help", "View datasheet", "Start over"],
        stateUpdates: { ...state, currentProduct: product, techSupportType: null },
      };
    }
    return {
      content: `For installation details on the **${product.name}**, please refer to the datasheet which includes dimensional drawings and mounting instructions:`,
      links: [
        { label: `📄 Datasheet`, href: product.datasheetUrl },
        { label: `📐 CAD / 3D Model`, href: product.cadUrl },
      ],
      suggestions: ["Troubleshooting help", "Find a product", "Start over"],
      stateUpdates: { ...state, currentProduct: product, techSupportType: null },
    };
  }

  if (techType === "compatibility") {
    const sameCategory = ENHANCED_CATALOG.filter(p => p.category === product!.category && p.id !== product!.id);
    const alternatives = sameCategory.slice(0, 3);
    return {
      content: `Here are alternative products in the same category as the **${product.name}**. These may be compatible or serve as substitutes depending on your application requirements:`,
      productCards: alternatives.map(p => ({
        name: p.name, sku: p.sku, id: p.id,
        specs: Object.fromEntries(Object.entries(p.specs).slice(0, 4)),
      })),
      links: alternatives.map(p => ({ label: `View ${p.name}`, href: `/products/${p.id}` })),
      suggestions: ["Compare specs", "View datasheet", "Start over"],
      stateUpdates: { ...state, currentProduct: product, techSupportType: null },
    };
  }

  return {
    content: `What would you like to know about the **${product.name}**?`,
    suggestions: ["View datasheet & CAD files", "Troubleshooting help", "Installation tips", "Check compatibility"],
    stateUpdates: { ...state, currentProduct: product },
  };
}

function SuggestionChips({ suggestions, onSelect, disabled }: { suggestions: string[]; onSelect: (s: string) => void; disabled: boolean }) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-2" data-testid="suggestion-chips">
      {suggestions.map((s, i) => (
        <button
          key={i}
          onClick={() => !disabled && onSelect(s)}
          disabled={disabled}
          className="text-[10px] px-2.5 py-1 rounded-full border border-[#167a87]/30 text-[#167a87] bg-[#167a87]/5 hover:bg-[#167a87]/15 hover:border-[#167a87]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          data-testid={`chip-suggestion-${i}`}
        >
          {s}
        </button>
      ))}
    </div>
  );
}

function DisambiguationList({ options, onSelect, disabled }: { options: string[]; onSelect: (s: string) => void; disabled: boolean }) {
  return (
    <div className="mt-2 space-y-1" data-testid="disambiguation-list">
      {options.map((opt, i) => (
        <button
          key={i}
          onClick={() => !disabled && onSelect(opt)}
          disabled={disabled}
          className="flex items-center gap-1.5 w-full text-left text-[10px] px-2.5 py-1.5 rounded-md border border-[#f28d00]/30 bg-[#f28d00]/5 hover:bg-[#f28d00]/15 hover:border-[#f28d00]/50 transition-all disabled:opacity-50"
          data-testid={`option-disambig-${i}`}
        >
          <ChevronRight className="h-2.5 w-2.5 text-[#f28d00] flex-shrink-0" />
          {opt}
        </button>
      ))}
    </div>
  );
}

function ProductCardDisplay({ card }: { card: ProductCard }) {
  return (
    <div className="mt-2 border rounded-md p-2 bg-accent/30 relative" data-testid={`product-card-${card.sku}`}>
      {card.highlight && (
        <span className="absolute -top-2 right-2 text-[8px] px-1.5 py-0.5 rounded-full bg-[#167a87] text-white font-medium">
          {card.highlight}
        </span>
      )}
      <p className="text-[10px] font-semibold text-foreground">{card.name}</p>
      <p className="text-[9px] text-muted-foreground mb-1.5">SKU: {card.sku}</p>
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
        {Object.entries(card.specs).map(([key, value]) => (
          <div key={key} className="flex justify-between text-[9px]">
            <span className="text-muted-foreground">{key}:</span>
            <span className="font-medium text-foreground ml-1">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TroubleshootingStepDisplay({ steps }: { steps: TroubleshootingStep[] }) {
  return (
    <div className="mt-2 space-y-2" data-testid="troubleshooting-steps">
      {steps.map((s) => (
        <div key={s.step} className="flex gap-2 text-[10px]" data-testid={`step-${s.step}`}>
          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#167a87] text-white flex items-center justify-center text-[9px] font-bold mt-0.5">
            {s.step}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground">{s.title}</p>
            <p className="text-muted-foreground leading-relaxed">{s.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AIChatbot() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [conversationState, setConversationState] = useState<ConversationState>(createInitialState());
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm the TE Connectivity AI assistant. I can help you discover the right product for your application or provide technical support for products you're already using. What would you like to do?",
      suggestions: ["Find a product", "Technical support", "Browse catalog"],
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const conversationStateRef = useRef(conversationState);
  conversationStateRef.current = conversationState;

  const handleSend = useCallback((text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: messageText };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const currentState = conversationStateRef.current;
      const response = processMessage(messageText, currentState, user);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.content,
        links: response.links,
        productCards: response.productCards,
        troubleshootingSteps: response.troubleshootingSteps,
        suggestions: response.suggestions,
        disambiguation: response.disambiguation,
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);

      if (response.stateUpdates) {
        setConversationState(prev => ({ ...prev, ...response.stateUpdates }));
      }
    }, 600 + Math.random() * 500);
  }, [input, user]);

  const lastMessage = messages[messages.length - 1];

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
          <Card className="flex flex-col h-[520px] max-h-[70vh] shadow-2xl overflow-hidden">
            <div className="bg-[#2e4957] text-white p-3 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#f28d00] flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">TE AI Assistant</p>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="secondary" className="text-[8px] bg-white/20 text-white border-0">
                      <Sparkles className="h-2 w-2 mr-0.5" />
                      {t("ai.badge")}
                    </Badge>
                    {conversationState.useCase && (
                      <span className="text-[8px] opacity-60">
                        {conversationState.useCase === "product-discovery" ? "• Product Discovery" : "• Technical Support"}
                      </span>
                    )}
                  </div>
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
                  <div className={`max-w-[85%] ${msg.role === "user" ? "bg-[#f28d00] text-white" : "bg-background border"} rounded-lg p-2.5`}>
                    <p className="text-xs leading-relaxed whitespace-pre-line">
                      {msg.content.split(/(\*\*[^*]+\*\*)/).map((part, i) => {
                        if (part.startsWith("**") && part.endsWith("**")) {
                          return <strong key={i}>{part.slice(2, -2)}</strong>;
                        }
                        return part;
                      })}
                    </p>

                    {msg.productCards && msg.productCards.length > 0 && (
                      <div className="space-y-2">
                        {msg.productCards.map((card) => (
                          <ProductCardDisplay key={card.sku} card={card} />
                        ))}
                      </div>
                    )}

                    {msg.troubleshootingSteps && msg.troubleshootingSteps.length > 0 && (
                      <TroubleshootingStepDisplay steps={msg.troubleshootingSteps} />
                    )}

                    {msg.links && msg.links.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {msg.links.map((link, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              if (link.href.startsWith("http")) {
                                window.open(link.href, "_blank");
                              } else {
                                navigate(link.href);
                                setIsOpen(false);
                              }
                            }}
                            className="flex items-center gap-1 text-[10px] text-[#167a87] hover:underline w-full text-left"
                            data-testid={`chatbot-link-${i}`}
                          >
                            <ExternalLink className="h-2.5 w-2.5 flex-shrink-0" />
                            {link.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {msg.disambiguation && msg.disambiguation.length > 0 && (
                      <DisambiguationList
                        options={msg.disambiguation}
                        onSelect={(s) => handleSend(s)}
                        disabled={isTyping}
                      />
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="h-3 w-3" />
                    </div>
                  )}
                </div>
              ))}

              {lastMessage?.role === "assistant" && lastMessage.suggestions && lastMessage.suggestions.length > 0 && !isTyping && (
                <SuggestionChips
                  suggestions={lastMessage.suggestions}
                  onSelect={(s) => handleSend(s)}
                  disabled={isTyping}
                />
              )}

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
                  placeholder={conversationState.useCase === "product-discovery" ? "Describe your requirements..." : conversationState.useCase === "technical-support" ? "Describe your issue..." : "Ask about products, support..."}
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
