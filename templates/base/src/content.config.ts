import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const seoSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  ogImage: z.string().min(1).optional(),
});

const sectionSchema = z.object({
  id: z.string().min(1),
  type: z.enum([
    "hero",
    "features",
    "cta",
    "faq",
    "testimonials",
    "pricing",
    "stats",
    "logo_cloud",
    "footer",
  ]),
  order: z.number(),
  payload: z.record(z.string(), z.unknown()),
});

const pages = defineCollection({
  loader: glob({ base: "./src/content/pages", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string().min(1),
    sections: z.array(sectionSchema),
    seo: seoSchema.optional(),
  }),
});

const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string().min(1),
    date: z.coerce.date(),
    excerpt: z.string().min(1).optional(),
    author: z.string().min(1).optional(),
    tags: z.array(z.string().min(1)).optional(),
    coverImage: z.string().min(1).optional(),
    status: z.enum(["draft", "published"]).default("published"),
  }),
});

const settings = defineCollection({
  loader: glob({ base: "./src/content/settings", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    siteName: z.string().min(1),
    tagline: z.string().min(1).optional(),
    nav: z.array(
      z.object({ label: z.string().min(1), href: z.string().min(1) }),
    ),
    socialLinks: z
      .array(z.object({ platform: z.string().min(1), href: z.string().min(1) }))
      .optional(),
    defaultSeo: seoSchema.optional(),
  }),
});

export const collections = { pages, blog, settings };
