import { Link } from "wouter";
import { Globe, MapPin, Phone, Mail, ChevronRight } from "lucide-react";

function TELogoFooter() {
  return (
    <svg viewBox="0 0 120 48" className="h-10 w-auto" aria-label="TE Connectivity">
      <rect x="0" y="0" width="48" height="48" rx="4" fill="#f28d00" />
      <text x="24" y="34" textAnchor="middle" fontFamily="Montserrat, Arial, sans-serif" fontWeight="800" fontStyle="italic" fontSize="28" fill="white">TE</text>
      <line x1="56" y1="14" x2="110" y2="14" stroke="#f28d00" strokeWidth="3" strokeLinecap="round" />
      <line x1="56" y1="24" x2="100" y2="24" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <line x1="56" y1="34" x2="90" y2="34" stroke="#167a87" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

const footerLinks = {
  products: [
    { label: "Connectors", href: "/products?category=connectors" },
    { label: "Sensors", href: "/products?category=sensors" },
    { label: "Relays & Contactors", href: "/products?category=relays" },
    { label: "Wire & Cable", href: "/products?category=wire-cable" },
    { label: "Circuit Protection", href: "/products?category=circuit-protection" },
    { label: "Terminal Blocks", href: "/products?category=terminal-blocks" },
  ],
  solutions: [
    { label: "Transportation", href: "/solutions/transportation" },
    { label: "Industrial", href: "/solutions/industrial" },
    { label: "Communications", href: "/solutions/communications" },
    { label: "Energy", href: "/solutions/energy" },
    { label: "Medical", href: "/solutions/medical" },
  ],
  resources: [
    { label: "Innovation", href: "/innovation" },
    { label: "Technical Resources", href: "/products" },
    { label: "Sample & Buy", href: "/products" },
    { label: "Design Tools", href: "/innovation" },
  ],
  support: [
    { label: "Contact Us", href: "#" },
    { label: "Find a Distributor", href: "#" },
    { label: "Request a Sample", href: "#" },
    { label: "FAQs", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-[#04215d] text-white" data-testid="site-footer">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
        <div className="py-12 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <TELogoFooter />
            <p className="mt-4 text-sm text-white/70 leading-relaxed font-body max-w-xs">
              EVERY CONNECTION COUNTS
            </p>
            <div className="mt-6 flex flex-col gap-3 text-sm text-white/60">
              <a href="#" className="flex items-center gap-2 hover:text-[#f28d00] transition-colors" data-testid="footer-phone">
                <Phone className="h-4 w-4" />
                <span>1-800-522-6752</span>
              </a>
              <a href="#" className="flex items-center gap-2 hover:text-[#f28d00] transition-colors" data-testid="footer-email">
                <Mail className="h-4 w-4" />
                <span>customer.care@te.com</span>
              </a>
              <a href="#" className="flex items-center gap-2 hover:text-[#f28d00] transition-colors" data-testid="footer-locations">
                <MapPin className="h-4 w-4" />
                <span>Find Locations</span>
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-heading font-bold text-sm tracking-wider uppercase mb-4 text-white/90" data-testid="footer-heading-products">
              Products
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.products.map((link) => (
                <li key={link.label}>
                  <Link href={link.href}>
                    <span className="text-sm text-white/60 hover:text-[#f28d00] transition-colors cursor-pointer flex items-center gap-1 group" data-testid={`footer-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}>
                      <ChevronRight className="h-3 w-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-bold text-sm tracking-wider uppercase mb-4 text-white/90" data-testid="footer-heading-solutions">
              Solutions
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.solutions.map((link) => (
                <li key={link.label}>
                  <Link href={link.href}>
                    <span className="text-sm text-white/60 hover:text-[#f28d00] transition-colors cursor-pointer flex items-center gap-1 group" data-testid={`footer-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}>
                      <ChevronRight className="h-3 w-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-bold text-sm tracking-wider uppercase mb-4 text-white/90" data-testid="footer-heading-resources">
              Resources
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link href={link.href}>
                    <span className="text-sm text-white/60 hover:text-[#f28d00] transition-colors cursor-pointer flex items-center gap-1 group" data-testid={`footer-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}>
                      <ChevronRight className="h-3 w-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 md:col-span-1">
            <h3 className="font-heading font-bold text-sm tracking-wider uppercase mb-4 text-white/90" data-testid="footer-heading-support">
              Support
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-white/60 hover:text-[#f28d00] transition-colors flex items-center gap-1 group" data-testid={`footer-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}>
                    <ChevronRight className="h-3 w-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-white/40">
            <Globe className="h-3.5 w-3.5" />
            <span data-testid="footer-region">United States (English)</span>
          </div>
          <p className="text-xs text-white/40" data-testid="footer-copyright">
            © {new Date().getFullYear()} TE Connectivity. All Rights Reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-white/40">
            <a href="#" className="hover:text-white/70 transition-colors" data-testid="footer-link-privacy">Privacy Policy</a>
            <a href="#" className="hover:text-white/70 transition-colors" data-testid="footer-link-terms">Terms of Use</a>
            <a href="#" className="hover:text-white/70 transition-colors" data-testid="footer-link-cookies">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
