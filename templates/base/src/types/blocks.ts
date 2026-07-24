// Shared primitives

export type CtaLink = {
  label: string;
  href: string;
  variant?: 'primary' | 'secondary' | 'ghost';
};

export type ImageAsset = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
};

// Section envelope

export type SectionType =
  | 'hero'
  | 'features'
  | 'cta'
  | 'faq'
  | 'testimonials'
  | 'pricing'
  | 'stats'
  | 'logo_cloud'
  | 'footer';

export type PageSection = {
  id: string;
  type: SectionType;
  order: number;
  payload: Record<string, unknown>;
};

// Block payload interfaces

export type HeroPayload = {
  title: string;
  eyebrow?: string;
  description?: string;
  primaryCta?: CtaLink;
  secondaryCta?: CtaLink;
  image?: ImageAsset;
  trustText?: string;
};

export type FeatureItem = {
  title: string;
  icon?: string;
  description?: string;
  link?: CtaLink;
};

export type FeaturesPayload = {
  title: string;
  description?: string;
  items: FeatureItem[];
};

export type CtaPayload = {
  title: string;
  description?: string;
  cta: CtaLink;
  backgroundStyle?: 'default' | 'brand' | 'dark';
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type FaqPayload = {
  title?: string;
  description?: string;
  items: FaqItem[];
};

export type TestimonialItem = {
  quote: string;
  author: string;
  role: string;
  company?: string;
  avatar?: ImageAsset;
};

export type TestimonialsPayload = {
  title?: string;
  items: TestimonialItem[];
};

export type PricingTier = {
  planName: string;
  price: string;
  description?: string;
  features: string[];
  cta: CtaLink;
  highlighted?: boolean;
};

export type PricingPayload = {
  title?: string;
  description?: string;
  items: PricingTier[];
};

export type StatItem = {
  label: string;
  value: string;
  description?: string;
};

export type StatsPayload = {
  title?: string;
  description?: string;
  items: StatItem[];
};

export type LogoItem = {
  src: string;
  alt: string;
  url?: string;
};

export type LogoCloudPayload = {
  title?: string;
  description?: string;
  items: LogoItem[];
};

export type FooterLink = { label: string; href: string };
export type FooterLinkGroup = { label: string; links: FooterLink[] };
export type SocialLink = { platform: string; href: string };

export type FooterPayload = {
  linkGroups?: FooterLinkGroup[];
  socialLinks?: SocialLink[];
  copyright?: string;
  newsletter?: { label: string; placeholder?: string };
};
