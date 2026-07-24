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

import { MockContentProvider } from "./mock";
import { MarkdownContentProvider } from "./markdown";

export const mockProvider = new MockContentProvider();
export const markdownProvider = new MarkdownContentProvider();
