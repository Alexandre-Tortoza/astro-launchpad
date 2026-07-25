import type {
  ContentProvider,
  Page,
  BlogPost,
  SiteSettings,
  SeoMeta,
  NavLink,
} from "./types";
import type { PageSection } from "../../types/blocks";

function getConfig() {
  const url = process.env["STRAPI_URL"];
  const token = process.env["STRAPI_TOKEN"];
  if (!url || !token) {
    throw new Error(
      "[launchpad] StrapiContentProvider requires STRAPI_URL and STRAPI_TOKEN in your .env file.",
    );
  }
  return { url, token };
}

async function strapiGet<T>(
  path: string,
  params: Record<string, string> = {},
): Promise<T> {
  const { url, token } = getConfig();
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${url}${path}${query ? `?${query}` : ""}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Strapi ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

interface StrapiList<T> {
  data: T[];
}
interface StrapiSingle<T> {
  data: T;
}

interface RawSection {
  section_id: string;
  type: string;
  order: number;
  payload: Record<string, unknown>;
}

interface RawPage {
  documentId: string;
  slug: string;
  title: string;
  seo_title: string | null;
  seo_description: string | null;
  seo_og_image: string | null;
  sections: RawSection[];
}

interface RawBlogPost {
  documentId: string;
  slug: string;
  title: string;
  date_published: string | null;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  author: { name: string } | null;
  tags: Array<{ name: string }>;
}

interface RawSiteSettings {
  site_name: string;
  tagline: string | null;
  default_seo_title: string | null;
  default_seo_description: string | null;
  default_seo_og_image: string | null;
}

interface RawNavItem {
  label: string;
  href: string;
  group: string;
  platform: string | null;
  sort: number | null;
}

function buildSeo(
  title: string | null,
  description: string | null,
  ogImage: string | null,
): SeoMeta | undefined {
  if (!title && !description && !ogImage) return undefined;
  return {
    title: title ?? undefined,
    description: description ?? undefined,
    ogImage: ogImage ?? undefined,
  };
}

function toPage(raw: RawPage): Page {
  const sections: PageSection[] = (raw.sections ?? []).map((s) => ({
    id: s.section_id,
    type: s.type as PageSection["type"],
    order: s.order,
    payload: s.payload,
  }));
  sections.sort((a, b) => a.order - b.order);
  return {
    slug: raw.slug,
    title: raw.title,
    sections,
    seo: buildSeo(raw.seo_title, raw.seo_description, raw.seo_og_image),
  };
}

function toBlogPost(raw: RawBlogPost): BlogPost {
  return {
    slug: raw.slug,
    title: raw.title,
    date: raw.date_published ?? new Date().toISOString(),
    excerpt: raw.excerpt ?? undefined,
    content: raw.content ?? "",
    author: raw.author?.name,
    tags:
      raw.tags && raw.tags.length > 0 ? raw.tags.map((t) => t.name) : undefined,
    coverImage: raw.cover_image ?? undefined,
  };
}

export class StrapiContentProvider implements ContentProvider {
  async getPage(slug: string): Promise<Page | null> {
    const res = await strapiGet<StrapiList<RawPage>>("/api/pages", {
      "filters[slug][$eq]": slug,
      "populate[sections][sort]": "order:asc",
      status: "published",
    });
    const raw = res.data[0];
    return raw ? toPage(raw) : null;
  }

  async getPages(): Promise<Page[]> {
    const res = await strapiGet<StrapiList<RawPage>>("/api/pages", {
      "populate[sections][sort]": "order:asc",
      "sort[0]": "slug:asc",
      status: "published",
    });
    return res.data.map(toPage);
  }

  async getBlogPost(slug: string): Promise<BlogPost | null> {
    const res = await strapiGet<StrapiList<RawBlogPost>>("/api/blog-posts", {
      "filters[slug][$eq]": slug,
      "populate[author][fields][0]": "name",
      "populate[tags][fields][0]": "name",
      status: "published",
    });
    const raw = res.data[0];
    return raw ? toBlogPost(raw) : null;
  }

  async getBlogPosts(): Promise<BlogPost[]> {
    const res = await strapiGet<StrapiList<RawBlogPost>>("/api/blog-posts", {
      "populate[author][fields][0]": "name",
      "populate[tags][fields][0]": "name",
      "sort[0]": "date_published:desc",
      status: "published",
    });
    return res.data.map(toBlogPost);
  }

  async getSiteSettings(): Promise<SiteSettings> {
    const [settings, navRes] = await Promise.all([
      strapiGet<StrapiSingle<RawSiteSettings>>("/api/site-setting"),
      strapiGet<StrapiList<RawNavItem>>("/api/navigation-items", {
        "sort[0]": "sort:asc",
        status: "published",
      }),
    ]);

    const s = settings.data;
    const nav: NavLink[] = navRes.data
      .filter((item) => item.group === "nav")
      .map((item) => ({ label: item.label, href: item.href }));

    const socialLinks = navRes.data
      .filter((item) => item.group === "social")
      .map((item) => ({
        platform: item.platform ?? item.label,
        href: item.href,
      }));

    return {
      siteName: s.site_name,
      tagline: s.tagline ?? undefined,
      nav,
      socialLinks: socialLinks.length > 0 ? socialLinks : undefined,
      defaultSeo: buildSeo(
        s.default_seo_title,
        s.default_seo_description,
        s.default_seo_og_image,
      ),
    };
  }
}
