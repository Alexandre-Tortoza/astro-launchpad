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
export { DirectusContentProvider } from "./directus";

import { MockContentProvider } from "./mock";
import { MarkdownContentProvider } from "./markdown";
import { DirectusContentProvider } from "./directus";

export const mockProvider = new MockContentProvider();
export const markdownProvider = new MarkdownContentProvider();
export const directusProvider = new DirectusContentProvider();
export const contentProvider = directusProvider;
