export const prompts = {
  generateLanding: new URL("../prompts/generate-landing.md", import.meta.url),
  generateSection: new URL("../prompts/generate-section.md", import.meta.url),
  rewriteCopy: new URL("../prompts/rewrite-copy.md", import.meta.url),
  seoReview: new URL("../prompts/seo-review.md", import.meta.url),
  accessibilityReview: new URL(
    "../prompts/accessibility-review.md",
    import.meta.url,
  ),
  cmsModeling: new URL("../prompts/cms-modeling.md", import.meta.url),
} as const;

export const skills = {
  astroLaunchpad: new URL("../skills/astro-launchpad.md", import.meta.url),
  contentModeling: new URL("../skills/content-modeling.md", import.meta.url),
  seo: new URL("../skills/seo.md", import.meta.url),
  accessibility: new URL("../skills/accessibility.md", import.meta.url),
  cmsModeling: new URL("../skills/cms-modeling.md", import.meta.url),
  codex: new URL("../skills/codex.md", import.meta.url),
} as const;

export const schemas = {
  page: new URL("../schemas/page.schema.json", import.meta.url),
  siteSettings: new URL(
    "../schemas/site-settings.schema.json",
    import.meta.url,
  ),
  blogPost: new URL("../schemas/blog-post.schema.json", import.meta.url),
} as const;

export const examples = {
  landingPage: new URL("../examples/saas-landing.md", import.meta.url),
  heroSection: new URL("../examples/hero-section.json", import.meta.url),
  siteSettings: new URL("../examples/site-settings.json", import.meta.url),
  cmsModel: new URL("../examples/cms-model.json", import.meta.url),
} as const;
