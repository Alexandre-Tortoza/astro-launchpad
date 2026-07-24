/**
 * Directus seed script — populates all collections from seed/data.json.
 *
 * Usage:
 *   DIRECTUS_URL=http://localhost:8055 DIRECTUS_TOKEN=<token> npx tsx seed/seed.ts
 *
 * Prerequisites:
 *   - Directus is running (docker compose up -d)
 *   - Schema has been applied (npx directus schema apply ./schema/snapshot.json)
 *   - A static API token with admin or appropriate write access has been created
 */

import {
  createDirectus,
  rest,
  staticToken,
  createItem,
  createItems,
  updateSingleton,
  readSingleton,
} from "@directus/sdk";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const DIRECTUS_URL = process.env["DIRECTUS_URL"] ?? "http://localhost:8055";
const DIRECTUS_TOKEN = process.env["DIRECTUS_TOKEN"];

if (!DIRECTUS_TOKEN) {
  console.error("Error: DIRECTUS_TOKEN environment variable is required.");
  console.error(
    "  Create a static token in Directus: Settings → Access Tokens",
  );
  process.exit(1);
}

const client = createDirectus(DIRECTUS_URL)
  .with(rest())
  .with(staticToken(DIRECTUS_TOKEN));

// Load seed data
const dataPath = join(__dirname, "data.json");
const data = JSON.parse(readFileSync(dataPath, "utf-8")) as SeedData;

interface SeedData {
  site_settings: Record<string, unknown>;
  navigation_items: Array<Record<string, unknown>>;
  authors: Array<Record<string, unknown>>;
  categories: Array<Record<string, unknown>>;
  tags: Array<Record<string, unknown>>;
  pages: Array<Record<string, unknown>>;
  sections: Array<Record<string, unknown> & { page_id: string }>;
  blog_posts: Array<
    Record<string, unknown> & {
      id: string;
      categories?: string[];
      tags?: string[];
    }
  >;
  redirects: Array<Record<string, unknown>>;
}

async function step(label: string, fn: () => Promise<void>) {
  process.stdout.write(`  ${label}... `);
  await fn();
  console.log("done");
}

async function seed() {
  console.log(`\nSeeding Directus at ${DIRECTUS_URL}\n`);

  // 1. Site settings (singleton — PATCH creates or updates)
  await step("site_settings", async () => {
    try {
      await client.request(readSingleton("site_settings" as never, {}));
      await client.request(
        updateSingleton("site_settings" as never, data.site_settings as never),
      );
    } catch {
      // Singleton row doesn't exist yet — create it
      await client.request(
        createItem("site_settings" as never, data.site_settings as never),
      );
    }
  });

  // 2. Navigation items
  await step("navigation_items", async () => {
    await client.request(
      createItems("navigation_items" as never, data.navigation_items as never),
    );
  });

  // 3. Taxonomy — must precede blog_posts and junction inserts
  await step("authors", async () => {
    await client.request(
      createItems("authors" as never, data.authors as never),
    );
  });

  await step("categories", async () => {
    await client.request(
      createItems("categories" as never, data.categories as never),
    );
  });

  await step("tags", async () => {
    await client.request(createItems("tags" as never, data.tags as never));
  });

  // 4. Pages — must precede sections
  await step("pages", async () => {
    await client.request(createItems("pages" as never, data.pages as never));
  });

  // 5. Sections — linked to pages via page_id
  await step("sections", async () => {
    // Strip any helper fields not in the DB schema
    const rows = data.sections.map(({ ...s }) => s);
    await client.request(createItems("sections" as never, rows as never));
  });

  // 6. Blog posts and their M2M junctions
  await step("blog_posts", async () => {
    for (const post of data.blog_posts) {
      const { categories, tags, ...postFields } = post;

      await client.request(
        createItem("blog_posts" as never, postFields as never),
      );

      if (categories && categories.length > 0) {
        const junctions = categories.map((categoryId) => ({
          blog_posts_id: post.id,
          categories_id: categoryId,
        }));
        await client.request(
          createItems("blog_posts_categories" as never, junctions as never),
        );
      }

      if (tags && tags.length > 0) {
        const junctions = tags.map((tagId) => ({
          blog_posts_id: post.id,
          tags_id: tagId,
        }));
        await client.request(
          createItems("blog_posts_tags" as never, junctions as never),
        );
      }
    }
  });

  // 7. Redirects
  await step("redirects", async () => {
    await client.request(
      createItems("redirects" as never, data.redirects as never),
    );
  });

  console.log("\nSeed complete.\n");
}

seed().catch((err: unknown) => {
  console.error("\nSeed failed:", err);
  process.exit(1);
});
