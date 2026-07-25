export type {
  SeoMeta,
  Page,
  BlogPost,
  NavLink,
  SiteSettings,
  ContentProvider,
} from "./types";
export type { PageSection } from "../../types/blocks";
export { MockContentProvider } from "./mock";
export { MarkdownContentProvider } from "./markdown";
export { StrapiContentProvider } from "./strapi";

import { MockContentProvider } from "./mock";
import { MarkdownContentProvider } from "./markdown";
import { StrapiContentProvider } from "./strapi";

export const mockProvider = new MockContentProvider();
export const markdownProvider = new MarkdownContentProvider();
export const strapiProvider = new StrapiContentProvider();

// A Strapi project is always SSR. Falling back to bundled Markdown in a
// production container would silently publish stale demo content.
export const contentProvider = process.env.STRAPI_TOKEN
  ? strapiProvider
  : import.meta.env.DEV
    ? markdownProvider
    : strapiProvider;
