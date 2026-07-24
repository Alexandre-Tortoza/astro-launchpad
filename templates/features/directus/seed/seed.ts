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
  deleteItems,
  updateItem,
  updateSingleton,
  readSingleton,
  readItems,
  readPermissions,
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

async function assertAdministratorAccess() {
  try {
    // System collections are not visible to ordinary content tokens. Check this
    // before creating content so a Directus 11 policy issue fails clearly.
    await client.request(readPermissions({ limit: 1 }));
  } catch (error) {
    throw new Error(
      "DIRECTUS_TOKEN cannot access Directus system permissions. Run `pnpm cms:setup` to apply the schema and repair the administrator access policy before seeding.",
      { cause: error },
    );
  }
}

async function upsertRows(
  collection: string,
  rows: Array<Record<string, unknown>>,
) {
  for (const row of rows) {
    const id = row["id"];
    if (typeof id !== "string" && typeof id !== "number") {
      await client.request(createItem(collection as never, row as never));
      continue;
    }

    const existing = await client.request(
      readItems(
        collection as never,
        {
          fields: ["id"],
          filter: { id: { _eq: id } },
          limit: 1,
        } as never,
      ),
    );
    if ((existing as unknown[]).length > 0) {
      await client.request(
        updateItem(collection as never, id as never, row as never),
      );
    } else {
      await client.request(createItem(collection as never, row as never));
    }
  }
}

async function replaceJunctions(
  collection: string,
  rows: Array<Record<string, string>>,
) {
  const postIds = [...new Set(rows.map((row) => row.blog_posts_id))];
  const existing = await client.request(
    readItems(
      collection as never,
      {
        fields: ["id"],
        filter: { blog_posts_id: { _in: postIds } },
      } as never,
    ),
  );
  const ids = (existing as Array<{ id: number }>).map((row) => row.id);
  if (ids.length > 0)
    await client.request(deleteItems(collection as never, ids as never));
  if (rows.length > 0)
    await client.request(createItems(collection as never, rows as never));
}

async function seed() {
  console.log(`\nSeeding Directus at ${DIRECTUS_URL}\n`);
  await assertAdministratorAccess();

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
    await upsertRows("navigation_items", data.navigation_items);
  });

  // 3. Taxonomy — must precede blog_posts and junction inserts
  await step("authors", async () => {
    await upsertRows("authors", data.authors);
  });

  await step("categories", async () => {
    await upsertRows("categories", data.categories);
  });

  await step("tags", async () => {
    await upsertRows("tags", data.tags);
  });

  // 4. Pages — must precede sections
  await step("pages", async () => {
    await upsertRows("pages", data.pages);
  });

  // 5. Sections — linked to pages via page_id
  await step("sections", async () => {
    // Strip any helper fields not in the DB schema
    const rows = data.sections.map(({ ...s }) => s);
    await upsertRows("sections", rows);
  });

  // 6. Blog posts and their M2M junctions
  await step("blog_posts", async () => {
    const categoryJunctions: Array<Record<string, string>> = [];
    const tagJunctions: Array<Record<string, string>> = [];
    for (const post of data.blog_posts) {
      const { categories, tags, ...postFields } = post;

      await upsertRows("blog_posts", [postFields]);

      if (categories) {
        categoryJunctions.push(
          ...categories.map((categoryId) => ({
            blog_posts_id: post.id,
            categories_id: categoryId,
          })),
        );
      }

      if (tags) {
        tagJunctions.push(
          ...tags.map((tagId) => ({
            blog_posts_id: post.id,
            tags_id: tagId,
          })),
        );
      }
    }
    await replaceJunctions("blog_posts_categories", categoryJunctions);
    await replaceJunctions("blog_posts_tags", tagJunctions);
  });

  // 7. Redirects
  await step("redirects", async () => {
    await upsertRows("redirects", data.redirects);
  });

  console.log("\nSeed complete.\n");
}

seed().catch((err: unknown) => {
  console.error("\nSeed failed:", err);
  process.exit(1);
});
