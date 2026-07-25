import type { Core } from "@strapi/strapi";
import { createHash, createHmac } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export default {
  async register() {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await ensureAdmin(strapi);
    await ensureApiToken(strapi);
    await ensurePublicPermissions(strapi);
    await seedContent(strapi);
  },
};

async function ensureAdmin(strapi: Core.Strapi) {
  const existing = await strapi
    .service("admin::user")
    // @ts-expect-error — service typing is loose
    .findOne({ where: { email: process.env["STRAPI_ADMIN_EMAIL"] } });
  if (existing) return;

  const password = process.env["STRAPI_ADMIN_PASSWORD"];
  const email = process.env["STRAPI_ADMIN_EMAIL"];
  if (!email || !password) return;

  const superAdminRole = await strapi
    .service("admin::role")
    // @ts-expect-error — getSuperAdmin not in typed admin::role interface
    .getSuperAdmin();

  await strapi.service("admin::user").create({
    email,
    password,
    firstname: "Admin",
    lastname: "",
    roles: [superAdminRole.id],
    isActive: true,
    registrationToken: null,
  });
  strapi.log.info(`[launchpad] Admin user created: ${email}`);
}

function hashToken(salt: string, token: string): string {
  const saltHash = createHash("sha256").update(salt).digest("hex");
  return createHmac("sha512", saltHash).update(token).digest("hex");
}

async function ensureApiToken(strapi: Core.Strapi) {
  const plainToken = process.env["STRAPI_TOKEN"];
  const salt = process.env["API_TOKEN_SALT"];
  if (!plainToken || !salt) return;

  const accessKey = hashToken(salt, plainToken);
  const existing = await strapi.db
    .query("admin::api-token")
    // @ts-expect-error — DB query type for admin::api-token is untyped
    .findOne({ where: { accessKey } });

  if (existing) return;

  // Remove any stale token with the same name first
  await strapi.db.query("admin::api-token").deleteMany({
    // @ts-expect-error — DB query type for admin::api-token is untyped
    where: { name: "launchpad-read" },
  });

  await strapi.db.query("admin::api-token").create({
    data: {
      name: "launchpad-read",
      description: "Read-only token for Astro Launchpad",
      type: "read-only",
      accessKey,
    },
  });
  strapi.log.info("[launchpad] API token provisioned");
}

async function ensurePublicPermissions(strapi: Core.Strapi) {
  const publicRole = await strapi
    .service("users-permissions::role")
    // @ts-expect-error — findOne not in typed users-permissions::role interface
    .findOne({ type: "public" });
  if (!publicRole) return;

  const collections = [
    "api::page.page",
    "api::blog-post.blog-post",
    "api::author.author",
    "api::category.category",
    "api::tag.tag",
    "api::navigation-item.navigation-item",
    "api::redirect.redirect",
    "api::site-setting.site-setting",
  ];
  const findActions = ["find", "findOne"];

  for (const uid of collections) {
    for (const action of findActions) {
      const actionKey = `${uid}.${action}`;
      // @ts-expect-error — DB query type for plugin::users-permissions is untyped
      const existing = await strapi.db
        .query("plugin::users-permissions.permission")
        .findOne({
          where: { action: actionKey, role: publicRole.id },
        });
      if (!existing) {
        await strapi.db.query("plugin::users-permissions.permission").create({
          data: { action: actionKey, role: publicRole.id, enabled: true },
        });
      }
    }
  }
}

async function seedContent(strapi: Core.Strapi) {
  const existing = await strapi.documents("api::page.page").count({});
  if (existing > 0) return;

  const dataPath = join(import.meta.dirname, "../seed/data.json");
  const raw = JSON.parse(await readFile(dataPath, "utf8")) as SeedData;

  // Authors
  const authorMap: Record<string, string> = {};
  for (const author of raw.authors) {
    const doc = await strapi.documents("api::author.author").create({
      data: {
        name: author.name,
        slug: author.slug,
        bio: author.bio,
      },
      status: "published",
    });
    authorMap[author.slug] = doc.documentId;
  }

  // Tags
  const tagMap: Record<string, string> = {};
  for (const tag of raw.tags) {
    const doc = await strapi.documents("api::tag.tag").create({
      data: { name: tag.name, slug: tag.slug },
    });
    tagMap[tag.slug] = doc.documentId;
  }

  // Categories
  for (const cat of raw.categories) {
    await strapi.documents("api::category.category").create({
      data: { name: cat.name, slug: cat.slug },
    });
  }

  // Pages
  for (const page of raw.pages) {
    await strapi.documents("api::page.page").create({
      data: {
        slug: page.slug,
        title: page.title,
        seo_title: page.seo_title,
        seo_description: page.seo_description,
        sections: page.sections,
      },
      status: "published",
    });
  }

  // Blog posts
  for (const post of raw.blog_posts) {
    await strapi.documents("api::blog-post.blog-post").create({
      data: {
        slug: post.slug,
        title: post.title,
        date_published: post.date_published,
        excerpt: post.excerpt,
        content: post.content,
        author: authorMap[post.author_slug]
          ? { connect: [{ documentId: authorMap[post.author_slug] }] }
          : undefined,
        tags: post.tag_slugs
          ?.filter((s) => tagMap[s])
          .map((s) => ({ documentId: tagMap[s] }))
          ? {
              connect: post.tag_slugs
                .filter((s) => tagMap[s])
                .map((s) => ({ documentId: tagMap[s] })),
            }
          : undefined,
      },
      status: "published",
    });
  }

  // Navigation items
  for (const item of raw.navigation_items) {
    await strapi.documents("api::navigation-item.navigation-item").create({
      data: {
        label: item.label,
        href: item.href,
        group: item.group,
        platform: item.platform,
        sort: item.sort,
      },
      status: "published",
    });
  }

  // Site settings (single type — upsert)
  await strapi.documents("api::site-setting.site-setting").update({
    data: raw.site_settings,
  });

  strapi.log.info("[launchpad] Demo content seeded");
}

interface SeedData {
  authors: Array<{ name: string; slug: string; bio?: string }>;
  tags: Array<{ name: string; slug: string }>;
  categories: Array<{ name: string; slug: string }>;
  pages: Array<{
    slug: string;
    title: string;
    seo_title?: string;
    seo_description?: string;
    sections: Array<{
      section_id: string;
      type: string;
      order: number;
      payload: Record<string, unknown>;
    }>;
  }>;
  blog_posts: Array<{
    slug: string;
    title: string;
    date_published?: string;
    excerpt?: string;
    content?: string;
    author_slug: string;
    tag_slugs?: string[];
  }>;
  navigation_items: Array<{
    label: string;
    href: string;
    group: string;
    platform?: string;
    sort: number;
  }>;
  site_settings: {
    site_name: string;
    tagline?: string;
    default_seo_title?: string;
    default_seo_description?: string;
  };
}
