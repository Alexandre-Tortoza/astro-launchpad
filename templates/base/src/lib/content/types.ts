import type { PageSection } from '../../types/blocks';

export type SeoMeta = {
  title?: string;
  description?: string;
  ogImage?: string;
};

export type Page = {
  slug: string;
  title: string;
  sections: PageSection[];
  seo?: SeoMeta;
};

export type BlogPost = {
  slug: string;
  title: string;
  date: string;
  excerpt?: string;
  content: string;
  author?: string;
  tags?: string[];
  coverImage?: string;
};

export type NavLink = {
  label: string;
  href: string;
};

export type SiteSettings = {
  siteName: string;
  tagline?: string;
  nav: NavLink[];
  socialLinks?: { platform: string; href: string }[];
  defaultSeo?: SeoMeta;
};

export interface ContentProvider {
  getPage(slug: string): Promise<Page | null>;
  getPages(): Promise<Page[]>;
  getBlogPost(slug: string): Promise<BlogPost | null>;
  getBlogPosts(): Promise<BlogPost[]>;
  getSiteSettings(): Promise<SiteSettings>;
}
