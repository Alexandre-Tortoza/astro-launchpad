import { existsSync, readFileSync } from "node:fs";

const envPath = ".env";
const env = existsSync(envPath)
  ? Object.fromEntries(
      readFileSync(envPath, "utf8")
        .split(/\r?\n/)
        .flatMap((line) => {
          const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
          return match ? [[match[1], match[2]]] : [];
        }),
    )
  : {};
const siteUrl = process.env.PUBLIC_SITE_URL ?? env.PUBLIC_SITE_URL;
const errors = [];

if (!siteUrl || /example\.com|localhost|127\.0\.0\.1/.test(siteUrl)) {
  errors.push(
    "Set PUBLIC_SITE_URL to the production HTTPS URL before deploying.",
  );
}

try {
  const parsed = new URL(siteUrl);
  if (parsed.protocol !== "https:")
    errors.push("PUBLIC_SITE_URL must use HTTPS for production.");
} catch {
  errors.push("PUBLIC_SITE_URL must be a valid absolute URL.");
}

if (errors.length > 0) {
  console.error("Launch readiness check failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Launch readiness check passed.");
