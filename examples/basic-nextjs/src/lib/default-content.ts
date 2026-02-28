const homeContent = {
  'headless-header': [
    {
      componentName: 'SiteHeader',
      fields: {
        Logo: { value: {} },
        CTAText: { value: 'Products' },
        CTALink: { value: { href: '/Products', text: 'Products' } },
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
        CTALink: { value: { href: '/Solutions', text: 'Explore Our Solutions' } },
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

const solutionsContent = {
  'headless-header': homeContent['headless-header'],
  'headless-main': [
    {
      componentName: 'SolutionsHero',
      fields: {
        Heading: { value: 'Solutions Built for Your Industry' },
        Tagline: {
          value:
            '<p>From financial services to healthcare, NovaTech delivers AI-powered solutions tailored to the unique challenges of your industry. Drive efficiency, reduce risk, and unlock new revenue streams.</p>',
        },
        CTAText: { value: 'Request a Demo' },
        CTALink: { value: { href: '/', text: 'Request a Demo' } },
      },
    },
    {
      componentName: 'SolutionCard',
      fields: {
        Title: { value: 'Financial Services' },
        Description: {
          value:
            '<p>Automate risk assessment, detect fraud in real time, and deliver personalized financial products with AI-driven insights that keep you ahead of market shifts.</p>',
        },
        Metrics: { value: '<p>60% faster fraud detection · $2.3M avg. annual savings</p>' },
        Icon: { value: {} },
        Link: { value: { href: '/', text: 'Learn More' } },
        LinkText: { value: 'Learn More' },
      },
    },
    {
      componentName: 'SolutionCard',
      fields: {
        Title: { value: 'Healthcare & Life Sciences' },
        Description: {
          value:
            '<p>Accelerate clinical decision-making, streamline patient workflows, and ensure regulatory compliance with intelligent automation and predictive analytics.</p>',
        },
        Metrics: { value: '<p>35% reduction in diagnostic time · HIPAA compliant</p>' },
        Icon: { value: {} },
        Link: { value: { href: '/', text: 'Learn More' } },
        LinkText: { value: 'Learn More' },
      },
    },
    {
      componentName: 'SolutionCard',
      fields: {
        Title: { value: 'Manufacturing & Supply Chain' },
        Description: {
          value:
            '<p>Predict equipment failures before they happen, optimize production schedules, and gain end-to-end supply chain visibility with real-time IoT analytics.</p>',
        },
        Metrics: { value: '<p>45% fewer unplanned downtimes · 28% inventory cost reduction</p>' },
        Icon: { value: {} },
        Link: { value: { href: '/', text: 'Learn More' } },
        LinkText: { value: 'Learn More' },
      },
    },
    {
      componentName: 'SolutionCard',
      fields: {
        Title: { value: 'Retail & E-Commerce' },
        Description: {
          value:
            '<p>Deliver hyper-personalized shopping experiences, optimize pricing in real time, and forecast demand with precision to maximize revenue and customer lifetime value.</p>',
        },
        Metrics: { value: '<p>3.2x increase in conversion rate · 40% higher AOV</p>' },
        Icon: { value: {} },
        Link: { value: { href: '/', text: 'Learn More' } },
        LinkText: { value: 'Learn More' },
      },
    },
    {
      componentName: 'ValueProposition',
      fields: {
        Heading: { value: 'Why NovaTech?' },
        Description: {
          value:
            '<p>Trusted by industry leaders worldwide to deliver measurable results at scale.</p>',
        },
        Stat1Value: { value: '500+' },
        Stat1Label: { value: 'Enterprise Clients' },
        Stat2Value: { value: '99.99%' },
        Stat2Label: { value: 'Platform Uptime' },
        Stat3Value: { value: '40%' },
        Stat3Label: { value: 'Average ROI Increase' },
      },
    },
    {
      componentName: 'CaseStudy',
      fields: {
        Heading: { value: 'Proven Results' },
        CompanyName: { value: 'Meridian Financial Group' },
        Quote: {
          value:
            '<p>NovaTech\'s AI platform completely transformed our risk assessment process. What used to take our analysts days now happens in minutes, with greater accuracy and deeper insights than we ever thought possible.</p>',
        },
        AuthorName: { value: 'Sarah Chen' },
        AuthorTitle: { value: 'Chief Technology Officer' },
        Metric1Value: { value: '60%' },
        Metric1Label: { value: 'Faster Risk Assessment' },
        Metric2Value: { value: '$4.2M' },
        Metric2Label: { value: 'Annual Cost Savings' },
        Metric3Value: { value: '99.7%' },
        Metric3Label: { value: 'Detection Accuracy' },
        Logo: { value: {} },
      },
    },
    {
      componentName: 'CTABanner',
      fields: {
        Heading: { value: 'Ready to See NovaTech in Action?' },
        Description: {
          value:
            '<p>Schedule a personalized demo with our solutions team and discover how NovaTech can transform your business.</p>',
        },
        PrimaryButtonText: { value: 'Request a Demo' },
        PrimaryButtonLink: { value: { href: '/', text: 'Request a Demo' } },
        SecondaryButtonText: { value: 'Talk to Sales' },
        SecondaryButtonLink: { value: { href: '/', text: 'Talk to Sales' } },
      },
    },
  ],
  'headless-footer': homeContent['headless-footer'],
};

const defaultContent = homeContent;

export function getDefaultContent(routePath?: string) {
  const normalized = routePath?.toLowerCase();
  if (normalized === '/products' || normalized?.endsWith('/products')) {
    return productsContent;
  }
  if (normalized === '/solutions' || normalized?.endsWith('/solutions')) {
    return solutionsContent;
  }
  return homeContent;
}

export default defaultContent;
