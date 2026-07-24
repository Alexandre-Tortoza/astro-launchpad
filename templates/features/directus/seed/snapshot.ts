import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const directusUrl = process.env["DIRECTUS_URL"] ?? "http://localhost:8055";
const token = process.env["DIRECTUS_TOKEN"];

if (!token) {
  console.error("Error: DIRECTUS_TOKEN environment variable is required.");
  process.exit(1);
}

const response = await fetch(`${directusUrl}/schema/snapshot`, {
  headers: { Authorization: `Bearer ${token}` },
});

if (!response.ok) {
  throw new Error(
    `Directus schema snapshot failed: ${response.status} ${response.statusText}`,
  );
}

const output = resolve("schema/snapshot.json");
await writeFile(output, `${JSON.stringify(await response.json(), null, 2)}\n`);
console.log(`Schema snapshot written to ${output}`);
