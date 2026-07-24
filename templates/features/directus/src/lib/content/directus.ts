import {
  createDirectus,
  rest,
  staticToken,
  readItems,
  readSingleton,
} from "@directus/sdk";
import type {
  ContentProvider,
  Page,
  BlogPost,
  SiteSettings,
  SeoMeta,
  NavLink,
} from "./types";
import type { PageSection } from "../../types/blocks";

// Directus collection shapes — mirrors the schema in schema/snapshot.json
interface LaunchpadSchema {
  pages: {
    id: string;
    status: string;
    slug: string;
    title: string;
    seo_title: string | null;
    seo_description: string | null;
    seo_og_image: string | null;
  };
  sections: {
    id: string;
    page_id: string;
    section_id: string;
    type: string;
    order: number;
    payload: Record<string, unknown>;
    status: string;
  };
  blog_posts: {
    id: string;
    status: string;
    slug: string;
    title: string;
    date_published: string | null;
    excerpt: string | null;
    content: string | null;
    cover_image: string | null;
    // Deep-fetched variants are cast via BlogPostWithRelations below
    author_id: string | null;
    tags: unknown[];
  };
  site_settings: {
    id: number;
    site_name: string;
    tagline: string | null;
    default_seo_title: string | null;
    default_seo_description: string | null;
    default_seo_og_image: string | null;
  };
  navigation_items: {
    id: string;
    sort: number | null;
    label: string;
    href: string;
    group: string;
    platform: string | null;
  };
  // Remaining collections — defined for completeness, not directly queried here
  authors: {
    id: string;
    status: string;
    name: string;
    slug: string;
    bio: string | null;
    avatar: string | null;
  };
  categories: { id: string; name: string; slug: string };
  tags: { id: string; name: string; slug: string };
  redirects: {
    id: string;
    status: string;
    from_path: string;
    to_path: string;
    status_code: number;
  };
  blog_posts_categories: {
    id: number;
    blog_posts_id: string;
    categories_id: string;
  };
  blog_posts_tags: { id: number; blog_posts_id: string; tags_id: string };
}

// Resolved shape after deep-fetching author and tag relations
type BlogPostWithRelations = Omit<
  LaunchpadSchema["blog_posts"],
  "author_id" | "tags"
> & {
  author_id: { name: string } | null;
  tags: Array<{ tags_id: { name: string } | null }>;
};

let _client: ReturnType<typeof createDirectus<LaunchpadSchema>> | null = null;

function getClient() {
  if (_client) return _client;

  // import.meta.env is available in Astro SSR context
  const url = (import.meta.env as Record<string, string>)["DIRECTUS_URL"];
  const token = (import.meta.env as Record<string, string>)["DIRECTUS_TOKEN"];

  if (!url || !token) {
    throw new Error(
      "[launchpad] DirectusContentProvider requires DIRECTUS_URL and DIRECTUS_TOKEN in your .env file.",
    );
  }

  _client = createDirectus<LaunchpadSchema>(url)
    .with(rest())
    .with(staticToken(token));

  return _client;
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

async function fetchSectionsForPage(pageId: string): Promise<PageSection[]> {
  const rows = await getClient().request(
    readItems("sections", {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filter: { page_id: { _eq: pageId }, status: { _eq: "published" } } as any,
      sort: ["order"],
      fields: ["section_id", "type", "order", "payload"],
    }),
  );

  return rows.map((s) => ({
    id: s.section_id,
    type: s.type as PageSection["type"],
    order: s.order,
    payload: s.payload,
  }));
}

function toPage(raw: LaunchpadSchema["pages"], sections: PageSection[]): Page {
  return {
    slug: raw.slug,
    title: raw.title,
    sections,
    seo: buildSeo(raw.seo_title, raw.seo_description, raw.seo_og_image),
  };
}

function toBlogPost(raw: BlogPostWithRelations): BlogPost {
  const author =
    raw.author_id && typeof raw.author_id === "object"
      ? raw.author_id.name
      : undefined;

  const tags = (raw.tags ?? [])
    .map((t) =>
      t.tags_id && typeof t.tags_id === "object" ? t.tags_id.name : null,
    )
    .filter((n): n is string => n !== null);

  return {
    slug: raw.slug,
    title: raw.title,
    date: raw.date_published ?? new Date().toISOString(),
    excerpt: raw.excerpt ?? undefined,
    content: raw.content ?? "",
    author,
    tags: tags.length > 0 ? tags : undefined,
    coverImage: raw.cover_image ?? undefined,
  };
}

const BLOG_POST_FIELDS = [
  "id",
  "slug",
  "title",
  "date_published",
  "excerpt",
  "content",
  "cover_image",
  "author_id.name",
  "tags.tags_id.name",
] as const;

export class DirectusContentProvider implements ContentProvider {
  async getPage(slug: string): Promise<Page | null> {
    const rows = await getClient().request(
      readItems("pages", {
        filter: { slug: { _eq: slug }, status: { _eq: "published" } },
        fields: [
          "id",
          "slug",
          "title",
          "seo_title",
          "seo_description",
          "seo_og_image",
        ],
        limit: 1,
      }),
    );

    const raw = rows[0];
    if (!raw) return null;

    const sections = await fetchSectionsForPage(raw.id);
    return toPage(raw, sections);
  }

  async getPages(): Promise<Page[]> {
    const rows = await getClient().request(
      readItems("pages", {
        filter: { status: { _eq: "published" } },
        fields: [
          "id",
          "slug",
          "title",
          "seo_title",
          "seo_description",
          "seo_og_image",
        ],
        sort: ["slug"],
      }),
    );

    return Promise.all(
      rows.map(async (raw) => {
        const sections = await fetchSectionsForPage(raw.id);
        return toPage(raw, sections);
      }),
    );
  }

  async getBlogPost(slug: string): Promise<BlogPost | null> {
    const rows = await getClient().request(
      readItems("blog_posts", {
        filter: { slug: { _eq: slug }, status: { _eq: "published" } },
        fields: BLOG_POST_FIELDS as unknown as string[],
        limit: 1,
      }),
    );

    const raw = rows[0];
    if (!raw) return null;

    return toBlogPost(raw as unknown as BlogPostWithRelations);
  }

  async getBlogPosts(): Promise<BlogPost[]> {
    const rows = await getClient().request(
      readItems("blog_posts", {
        filter: { status: { _eq: "published" } },
        sort: ["-date_published"],
        fields: BLOG_POST_FIELDS as unknown as string[],
      }),
    );

    return (rows as unknown as BlogPostWithRelations[]).map(toBlogPost);
  }

  async getSiteSettings(): Promise<SiteSettings> {
    const [settings, navItems] = await Promise.all([
      getClient().request(
        readSingleton("site_settings", {
          fields: [
            "site_name",
            "tagline",
            "default_seo_title",
            "default_seo_description",
            "default_seo_og_image",
          ],
        }),
      ),
      getClient().request(
        readItems("navigation_items", {
          sort: ["sort"],
          fields: ["label", "href", "group", "platform"],
        }),
      ),
    ]);

    const nav: NavLink[] = navItems
      .filter((item) => item.group === "nav")
      .map((item) => ({ label: item.label, href: item.href }));

    const socialLinks = navItems
      .filter((item) => item.group === "social")
      .map((item) => ({
        platform: item.platform ?? item.label,
        href: item.href,
      }));

    return {
      siteName: settings.site_name,
      tagline: settings.tagline ?? undefined,
      nav,
      socialLinks: socialLinks.length > 0 ? socialLinks : undefined,
      defaultSeo: buildSeo(
        settings.default_seo_title,
        settings.default_seo_description,
        settings.default_seo_og_image,
      ),
    };
  }
}
