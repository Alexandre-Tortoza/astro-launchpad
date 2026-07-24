import { readFile, writeFile } from "node:fs/promises";

const [version, output] = process.argv.slice(2);
if (!version || !output)
  throw new Error("Usage: node scripts/release-notes.mjs <version> <output>");

const changelog = await readFile(
  new URL("../CHANGELOG.md", import.meta.url),
  "utf8",
);
const heading = `## [${version}]`;
const start = changelog.indexOf(heading);
if (start === -1) throw new Error(`No changelog entry found for ${version}.`);

const nextHeading = changelog.indexOf("\n## [", start + heading.length);
const notes = changelog
  .slice(start, nextHeading === -1 ? undefined : nextHeading)
  .trim();
await writeFile(output, `${notes}\n`);
