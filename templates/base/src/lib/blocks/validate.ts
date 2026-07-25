import { z } from "zod";
import type {
  PageSection,
  HeroPayload,
  FeaturesPayload,
  CtaPayload,
  FaqPayload,
  TestimonialsPayload,
  PricingPayload,
  StatsPayload,
  LogoCloudPayload,
  FooterPayload,
} from "../../types/blocks";
import {
  heroSchema,
  featuresSchema,
  ctaBlockSchema,
  faqSchema,
  testimonialsSchema,
  pricingSchema,
  statsSchema,
  logoCloudSchema,
  footerSchema,
} from "./schemas";

type ParsedSection =
  | { type: "hero"; payload: HeroPayload }
  | { type: "features"; payload: FeaturesPayload }
  | { type: "cta"; payload: CtaPayload }
  | { type: "faq"; payload: FaqPayload }
  | { type: "testimonials"; payload: TestimonialsPayload }
  | { type: "pricing"; payload: PricingPayload }
  | { type: "stats"; payload: StatsPayload }
  | { type: "logo_cloud"; payload: LogoCloudPayload }
  | { type: "footer"; payload: FooterPayload };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const schemaMap: Record<string, z.ZodType<any>> = {
  hero: heroSchema,
  features: featuresSchema,
  cta: ctaBlockSchema,
  faq: faqSchema,
  testimonials: testimonialsSchema,
  pricing: pricingSchema,
  stats: statsSchema,
  logo_cloud: logoCloudSchema,
  footer: footerSchema,
};

export function parseSection(section: PageSection): ParsedSection | null {
  const schema = schemaMap[section.type];
  if (!schema) {
    if (import.meta.env.DEV) {
      console.error(
        `[launchpad] Unknown section type "${section.type}" (id: ${section.id})`,
      );
    }
    return null;
  }

  const result = schema.safeParse(section.payload);
  if (!result.success) {
    if (import.meta.env.DEV) {
      console.error(
        `[launchpad] Invalid payload for section "${section.id}" (type: ${section.type}):`,
        z.treeifyError(result.error),
      );
    }
    return null;
  }

  return { type: section.type, payload: result.data } as ParsedSection;
}
