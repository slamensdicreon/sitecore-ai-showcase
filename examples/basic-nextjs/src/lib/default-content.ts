const defaultContent = {
  'headless-header': [
    {
      componentName: 'SiteHeader',
      fields: {
        Logo: { value: {} },
        CTAText: { value: 'Get Started' },
        CTALink: { value: { href: '/', text: 'Get Started' } },
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

export default defaultContent;
