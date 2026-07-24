import { getCollection, type CollectionEntry } from "astro:content";
import type { BlogPost, ContentProvider, Page, SiteSettings } from "./types";

function toPage(entry: CollectionEntry<"pages">): Page {
  return {
    slug: entry.id,
    title: entry.data.title,
    sections: entry.data.sections,
    seo: entry.data.seo,
  };
}

function toBlogPost(entry: CollectionEntry<"blog">): BlogPost {
  return {
    slug: entry.id,
    title: entry.data.title,
    date: entry.data.date.toISOString(),
    excerpt: entry.data.excerpt,
    content: entry.body ?? "",
    author: entry.data.author,
    tags: entry.data.tags,
    coverImage: entry.data.coverImage,
  };
}

export class MarkdownContentProvider implements ContentProvider {
  async getPage(slug: string): Promise<Page | null> {
    const pages = await getCollection("pages");
    const page = pages.find((entry) => entry.id === slug);
    return page ? toPage(page) : null;
  }

  async getPages(): Promise<Page[]> {
    const pages = await getCollection("pages");
    return pages
      .map(toPage)
      .sort((left, right) => left.slug.localeCompare(right.slug));
  }

  async getBlogPost(slug: string): Promise<BlogPost | null> {
    const posts = await getCollection("blog");
    const post = posts.find((entry) => entry.id === slug);
    return post ? toBlogPost(post) : null;
  }

  async getBlogPosts(): Promise<BlogPost[]> {
    const posts = await getCollection("blog");
    return posts
      .map(toBlogPost)
      .sort((left, right) => right.date.localeCompare(left.date));
  }

  async getSiteSettings(): Promise<SiteSettings> {
    const settings = await getCollection("settings");
    const siteSettings = settings.find((entry) => entry.id === "site");

    if (!siteSettings) {
      throw new Error("Missing src/content/settings/site.md");
    }

    return siteSettings.data;
  }
}
