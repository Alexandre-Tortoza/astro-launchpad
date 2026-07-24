import { z } from "zod";

const ctaLinkSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
  variant: z.enum(["primary", "secondary", "ghost"]).optional(),
});

const imageAssetSchema = z.object({
  src: z.string().min(1),
  alt: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
});

export const heroSchema = z.object({
  title: z.string().min(1),
  eyebrow: z.string().optional(),
  description: z.string().optional(),
  primaryCta: ctaLinkSchema.optional(),
  secondaryCta: ctaLinkSchema.optional(),
  image: imageAssetSchema.optional(),
  trustText: z.string().optional(),
});

const featureItemSchema = z.object({
  title: z.string().min(1),
  icon: z.string().optional(),
  description: z.string().optional(),
  link: ctaLinkSchema.optional(),
});

export const featuresSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  items: z.array(featureItemSchema).min(1),
});

export const ctaBlockSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  cta: ctaLinkSchema,
  backgroundStyle: z.enum(["default", "brand", "dark"]).optional(),
});

const faqItemSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
});

export const faqSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  items: z.array(faqItemSchema).min(1),
});

const testimonialItemSchema = z.object({
  quote: z.string().min(1),
  author: z.string().min(1),
  role: z.string().min(1),
  company: z.string().optional(),
  avatar: imageAssetSchema.optional(),
});

export const testimonialsSchema = z.object({
  title: z.string().optional(),
  items: z.array(testimonialItemSchema).min(1),
});

const pricingTierSchema = z.object({
  planName: z.string().min(1),
  price: z.string().min(1),
  description: z.string().optional(),
  features: z.array(z.string()),
  cta: ctaLinkSchema,
  highlighted: z.boolean().optional(),
});

export const pricingSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  items: z.array(pricingTierSchema).min(1),
});

const statItemSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  description: z.string().optional(),
});

export const statsSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  items: z.array(statItemSchema).min(1),
});

const logoItemSchema = z.object({
  src: z.string().min(1),
  alt: z.string(),
  url: z.string().optional(),
});

export const logoCloudSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  items: z.array(logoItemSchema).min(1),
});

const footerLinkSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
});
const footerLinkGroupSchema = z.object({
  label: z.string().min(1),
  links: z.array(footerLinkSchema),
});
const socialLinkSchema = z.object({
  platform: z.string().min(1),
  href: z.string().min(1),
});

export const footerSchema = z.object({
  linkGroups: z.array(footerLinkGroupSchema).optional(),
  socialLinks: z.array(socialLinkSchema).optional(),
  copyright: z.string().optional(),
  newsletter: z
    .object({ label: z.string().min(1), placeholder: z.string().optional() })
    .optional(),
});
