import type { ContentProvider, Page, BlogPost, SiteSettings } from "./types";
import type { PageSection } from "../../types/blocks";

const homePageSections: PageSection[] = [
  {
    id: "1",
    type: "hero",
    order: 1,
    payload: {
      title: "Launch editable landing pages at startup speed",
      eyebrow: "Astro Launchpad",
      description:
        "An open source starter and CLI for fast, editable landing pages with Astro, CMS adapters, reusable blocks, and AI-assisted workflows.",
      primaryCta: { label: "Get started", href: "#", variant: "primary" },
      secondaryCta: {
        label: "View on GitHub",
        href: "#",
        variant: "secondary",
      },
      trustText: "Free and open source. MIT license.",
    },
  },
  {
    id: "2",
    type: "logo_cloud",
    order: 2,
    payload: {
      title: "Trusted by teams using",
      items: [
        { src: "/placeholder-logo.svg", alt: "Astro" },
        { src: "/placeholder-logo.svg", alt: "Directus" },
        { src: "/placeholder-logo.svg", alt: "Tailwind CSS" },
        { src: "/placeholder-logo.svg", alt: "Docker" },
      ],
    },
  },
  {
    id: "3",
    type: "features",
    order: 3,
    payload: {
      title: "Everything you need to launch fast",
      description: "Batteries included, but nothing forced on you.",
      items: [
        {
          icon: "⚡",
          title: "CLI scaffolding",
          description:
            "Generate a complete site with one command. Choose your stack interactively.",
        },
        {
          icon: "🧩",
          title: "Reusable blocks",
          description:
            "Hero, Features, Pricing, FAQ and more — typed, validated, and ready to use.",
        },
        {
          icon: "📦",
          title: "CMS-agnostic content layer",
          description:
            "Swap between Markdown and Directus without touching your components.",
        },
        {
          icon: "🐳",
          title: "Docker included",
          description:
            "Run your full stack locally with a single `docker compose up`.",
        },
        {
          icon: "🤖",
          title: "ai-kit",
          description:
            "Prompts, skills, and schemas to accelerate content, SEO, and review.",
        },
        {
          icon: "🎨",
          title: "Design tokens",
          description:
            "Control colors, typography, spacing, and motion from a single config.",
        },
      ],
    },
  },
  {
    id: "4",
    type: "stats",
    order: 4,
    payload: {
      title: "Built for real projects",
      items: [
        { value: "< 5 min", label: "Time to first page" },
        {
          value: "100",
          label: "Lighthouse score target",
          description: "Performance by default",
        },
        { value: "9", label: "Core blocks included" },
        { value: "6", label: "Preset templates" },
      ],
    },
  },
  {
    id: "5",
    type: "testimonials",
    order: 5,
    payload: {
      title: "What developers say",
      items: [
        {
          quote:
            "Astro Launchpad cut our site setup from two days to under an hour. The CMS abstraction is a game changer.",
          author: "Ana Souza",
          role: "Freelance Developer",
          company: "Independent",
        },
        {
          quote:
            "We use it as a base for every client project. The blocks are clean and the Docker setup just works.",
          author: "Lucas Ferreira",
          role: "Lead Engineer",
          company: "Pixel Studio",
        },
        {
          quote:
            "Love that I can switch between Markdown and Directus without rewriting a single component.",
          author: "Marina Costa",
          role: "Full-stack Developer",
        },
      ],
    },
  },
  {
    id: "6",
    type: "pricing",
    order: 6,
    payload: {
      title: "Simple, honest pricing",
      description:
        "Astro Launchpad is free and open source. These tiers are for illustration.",
      items: [
        {
          planName: "Community",
          price: "Free",
          description: "Perfect for personal projects and open source work.",
          features: [
            "All core blocks",
            "Markdown adapter",
            "MIT license",
            "Community support",
          ],
          cta: { label: "Get started free", href: "#", variant: "secondary" },
          highlighted: false,
        },
        {
          planName: "Pro",
          price: "$49 / mo",
          description: "For agencies and teams shipping multiple client sites.",
          features: [
            "Everything in Community",
            "Directus + Sanity adapters",
            "All presets",
            "Priority support",
            "ai-kit included",
          ],
          cta: { label: "Start free trial", href: "#", variant: "primary" },
          highlighted: true,
        },
      ],
    },
  },
  {
    id: "7",
    type: "faq",
    order: 7,
    payload: {
      title: "Frequently asked questions",
      items: [
        {
          question: "Do I need a CMS to use Astro Launchpad?",
          answer:
            "No. You can use plain Markdown files as your content source. A CMS (Directus, Sanity, etc.) is entirely optional and added via a feature pack.",
        },
        {
          question: "Can I use Tailwind CSS?",
          answer:
            "Yes. Tailwind is a feature pack you opt into during project generation. The base template uses semantic HTML and CSS variables.",
        },
        {
          question: "Is this locked to any hosting provider?",
          answer:
            "No. Astro Launchpad generates a standard Astro project. You can deploy anywhere Astro supports — Vercel, Netlify, Cloudflare, Docker, and more.",
        },
        {
          question: "What is ai-kit?",
          answer:
            "ai-kit is an optional set of Markdown prompts, skill files, and JSON schemas that help you generate copy, review SEO, model CMS content, and document your project for AI coding agents.",
        },
      ],
    },
  },
  {
    id: "8",
    type: "cta",
    order: 8,
    payload: {
      title: "Ready to launch?",
      description:
        "Scaffold your first Astro Launchpad site in under a minute.",
      cta: {
        label: "pnpm create astro-launchpad",
        href: "#",
        variant: "primary",
      },
      backgroundStyle: "brand",
    },
  },
  {
    id: "9",
    type: "footer",
    order: 9,
    payload: {
      linkGroups: [
        {
          label: "Product",
          links: [
            { label: "Getting started", href: "#" },
            { label: "Documentation", href: "#" },
            { label: "Roadmap", href: "#" },
          ],
        },
        {
          label: "Community",
          links: [
            { label: "GitHub", href: "#" },
            { label: "Contributing", href: "#" },
            { label: "Code of Conduct", href: "#" },
          ],
        },
      ],
      socialLinks: [
        { platform: "GitHub", href: "#" },
        { platform: "Twitter", href: "#" },
      ],
      copyright: `© ${new Date().getFullYear()} Astro Launchpad. MIT License.`,
    },
  },
  // Intentionally invalid — exercises the dev error banner in SectionRenderer
  {
    id: "invalid-demo",
    type: "hero",
    order: 99,
    payload: { title: "" },
  },
];

const homePage: Page = {
  slug: "home",
  title: "Astro Launchpad — Block Showcase",
  sections: homePageSections,
  seo: {
    title: "Astro Launchpad — Block Showcase",
    description:
      "An open source starter and CLI for fast, editable landing pages with Astro, CMS adapters, reusable blocks, and AI-assisted workflows.",
  },
};

const siteSettings: SiteSettings = {
  siteName: "Astro Launchpad",
  tagline: "Launch editable landing pages at startup speed",
  nav: [
    { label: "Docs", href: "#" },
    { label: "GitHub", href: "#" },
  ],
  socialLinks: [
    { platform: "GitHub", href: "#" },
    { platform: "Twitter", href: "#" },
  ],
  defaultSeo: {
    title: "Astro Launchpad",
    description:
      "An open source starter and CLI for fast, editable landing pages with Astro, CMS adapters, reusable blocks, and AI-assisted workflows.",
  },
};

export class MockContentProvider implements ContentProvider {
  async getPage(slug: string): Promise<Page | null> {
    if (slug === "home") return homePage;
    return null;
  }

  async getPages(): Promise<Page[]> {
    return [homePage];
  }

  async getBlogPost(_slug: string): Promise<BlogPost | null> {
    return null;
  }

  async getBlogPosts(): Promise<BlogPost[]> {
    return [];
  }

  async getSiteSettings(): Promise<SiteSettings> {
    return siteSettings;
  }
}
