const homeContent = {
  'headless-header': [
    {
      componentName: 'SiteHeader',
      fields: {
        Logo: { value: {} },
        CTAText: { value: 'Get Started' },
        CTALink: { value: { href: '/Products', text: 'Get Started' } },
      },
    },
  ],
  'headless-main': [
    {
      componentName: 'Hero',
      fields: {
        Heading: { value: 'Intelligent Solutions for Tomorrow' },
        Subheading: {
          value:
            '<p>Empowering businesses with cutting-edge AI technology and innovative solutions that drive growth and transform industries.</p>',
        },
        BackgroundImage: { value: {} },
        CTAText: { value: 'Explore Our Solutions' },
        CTALink: { value: { href: '/', text: 'Explore Our Solutions' } },
      },
    },
    {
      componentName: 'FeatureCard',
      fields: {
        Icon: { value: {} },
        Title: { value: 'AI-Powered Analytics' },
        Description: {
          value:
            '<p>Transform raw data into actionable insights with our advanced machine learning algorithms and real-time analytics platform.</p>',
        },
        Link: { value: { href: '/', text: 'Learn More' } },
      },
    },
    {
      componentName: 'FeatureCard',
      fields: {
        Icon: { value: {} },
        Title: { value: 'Cloud Infrastructure' },
        Description: {
          value:
            '<p>Scalable, secure cloud solutions designed for enterprise workloads. Deploy globally with confidence and reliability.</p>',
        },
        Link: { value: { href: '/', text: 'Learn More' } },
      },
    },
    {
      componentName: 'FeatureCard',
      fields: {
        Icon: { value: {} },
        Title: { value: 'Cybersecurity' },
        Description: {
          value:
            '<p>Protect your digital assets with our enterprise-grade security solutions, powered by AI threat detection and response.</p>',
        },
        Link: { value: { href: '/', text: 'Learn More' } },
      },
    },
    {
      componentName: 'ContentBlock',
      fields: {
        Heading: { value: 'Building the Future of Technology' },
        Body: {
          value:
            '<p>At NovaTech, we believe technology should empower people and organizations to achieve more. Our team of engineers and researchers is dedicated to developing solutions that are not only powerful but also accessible and intuitive.</p><p>With over a decade of experience in AI, cloud computing, and cybersecurity, we partner with businesses of all sizes to navigate the digital landscape.</p>',
        },
        Image: { value: {} },
        ImagePosition: { value: 'right' },
      },
    },
    {
      componentName: 'Testimonial',
      fields: {
        Quote: {
          value:
            "<p>NovaTech's AI analytics platform transformed how we understand our customers. We've seen a 40% increase in customer retention since implementing their solutions.</p>",
        },
        AuthorName: { value: 'Sarah Chen' },
        AuthorTitle: { value: 'VP of Digital Strategy, Meridian Corp' },
        AuthorPhoto: { value: {} },
      },
    },
    {
      componentName: 'CTABanner',
      fields: {
        Heading: { value: 'Ready to Transform Your Business?' },
        Description: {
          value:
            '<p>Join hundreds of forward-thinking companies already using NovaTech to drive innovation and growth.</p>',
        },
        PrimaryButtonText: { value: 'Start Free Trial' },
        PrimaryButtonLink: { value: { href: '/', text: 'Start Free Trial' } },
        SecondaryButtonText: { value: 'Contact Sales' },
        SecondaryButtonLink: { value: { href: '/', text: 'Contact Sales' } },
      },
    },
  ],
  'headless-footer': [
    {
      componentName: 'SiteFooter',
      fields: {
        Logo: { value: {} },
        Copyright: { value: '\u00A9 2026 NovaTech. All rights reserved.' },
      },
    },
  ],
};

const productsContent = {
  'headless-header': homeContent['headless-header'],
  'headless-main': [
    {
      componentName: 'ProductHero',
      fields: {
        Heading: { value: 'NovaTech AI Platform' },
        Tagline: {
          value:
            '<p>The all-in-one AI platform that transforms how enterprises build, deploy, and scale intelligent applications. From predictive analytics to automated workflows, NovaTech powers the next generation of business innovation.</p>',
        },
        PrimaryButtonText: { value: 'Start Free Trial' },
        PrimaryButtonLink: { value: { href: '/', text: 'Start Free Trial' } },
        SecondaryButtonText: { value: 'Watch Demo' },
        SecondaryButtonLink: { value: { href: '/', text: 'Watch Demo' } },
      },
    },
    {
      componentName: 'ProductFeature',
      fields: {
        Title: { value: 'Predictive Analytics Engine' },
        Description: {
          value:
            '<p>Harness the power of machine learning to forecast trends and make data-driven decisions in real time. Our analytics engine processes millions of data points per second.</p><p>Built-in anomaly detection, natural language querying, and customizable dashboards make complex data accessible to every team member.</p>',
        },
        Image: { value: {} },
        ImagePosition: { value: 'right' },
        Badge: { value: 'Analytics' },
      },
    },
    {
      componentName: 'ProductFeature',
      fields: {
        Title: { value: 'Cloud-Native Architecture' },
        Description: {
          value:
            '<p>Deploy anywhere with our cloud-agnostic infrastructure. NovaTech adapts to AWS, Azure, or Google Cloud with zero vendor lock-in.</p><p>Auto-scaling, load balancing, and multi-region redundancy ensure 99.99% uptime guaranteed.</p>',
        },
        Image: { value: {} },
        ImagePosition: { value: 'left' },
        Badge: { value: 'Infrastructure' },
      },
    },
    {
      componentName: 'ProductFeature',
      fields: {
        Title: { value: 'Enterprise-Grade Security' },
        Description: {
          value:
            '<p>Military-grade encryption, zero-trust architecture, and AI-powered threat detection protect your data and applications.</p><p>SOC 2 Type II certified, GDPR compliant, and HIPAA ready.</p>',
        },
        Image: { value: {} },
        ImagePosition: { value: 'right' },
        Badge: { value: 'Security' },
      },
    },
    {
      componentName: 'PricingTable',
      fields: {
        Heading: { value: 'Simple, Transparent Pricing' },
        Description: {
          value:
            '<p>Choose the plan that fits your business. All plans include core features, API access, and support.</p>',
        },
        Tier1Name: { value: 'Starter' },
        Tier1Price: { value: '$49/mo' },
        Tier1Features: {
          value:
            '<ul><li>Up to 10,000 API calls/month</li><li>5 team members</li><li>Basic analytics dashboard</li><li>Community support</li><li>99.9% uptime SLA</li></ul>',
        },
        Tier1ButtonText: { value: 'Get Started' },
        Tier1ButtonLink: { value: { href: '/', text: 'Get Started' } },
        Tier2Name: { value: 'Professional' },
        Tier2Price: { value: '$149/mo' },
        Tier2Features: {
          value:
            '<ul><li>Up to 100,000 API calls/month</li><li>25 team members</li><li>Advanced analytics and ML</li><li>Priority support</li><li>99.95% uptime SLA</li><li>Custom integrations</li></ul>',
        },
        Tier2ButtonText: { value: 'Start Free Trial' },
        Tier2ButtonLink: { value: { href: '/', text: 'Start Free Trial' } },
        Tier3Name: { value: 'Enterprise' },
        Tier3Price: { value: 'Custom' },
        Tier3Features: {
          value:
            '<ul><li>Unlimited API calls</li><li>Unlimited team members</li><li>Full platform access</li><li>Dedicated account manager</li><li>99.99% uptime SLA</li><li>On-premise option</li></ul>',
        },
        Tier3ButtonText: { value: 'Contact Sales' },
        Tier3ButtonLink: { value: { href: '/', text: 'Contact Sales' } },
      },
    },
    {
      componentName: 'CTABanner',
      fields: {
        Heading: { value: 'Get Started Today' },
        Description: {
          value:
            '<p>Join over 500 enterprises using NovaTech to accelerate their AI transformation. Start your free 14-day trial.</p>',
        },
        PrimaryButtonText: { value: 'Start Free Trial' },
        PrimaryButtonLink: { value: { href: '/', text: 'Start Free Trial' } },
        SecondaryButtonText: { value: 'Schedule a Demo' },
        SecondaryButtonLink: { value: { href: '/', text: 'Schedule a Demo' } },
      },
    },
  ],
  'headless-footer': homeContent['headless-footer'],
};

const defaultContent = homeContent;

export function getDefaultContent(routePath?: string) {
  if (routePath?.toLowerCase() === '/products' || routePath?.toLowerCase()?.endsWith('/products')) {
    return productsContent;
  }
  return homeContent;
}

export default defaultContent;
