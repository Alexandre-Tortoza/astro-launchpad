import rss from "@astrojs/rss";
import { contentProvider } from "../lib/content";
import type { APIContext } from "astro";

export async function GET(context: APIContext) {
  const [posts, siteSettings] = await Promise.all([
    contentProvider.getBlogPosts(),
    contentProvider.getSiteSettings(),
  ]);

  return rss({
    title: siteSettings.siteName,
    description:
      siteSettings.tagline ??
      siteSettings.defaultSeo?.description ??
      `${siteSettings.siteName} blog`,
    site: context.site ?? "https://example.com",
    items: posts.map((post) => ({
      title: post.title,
      pubDate: new Date(post.date),
      description: post.excerpt,
      link: `/blog/${post.slug}`,
    })),
    customData: `<language>en-us</language>`,
  });
}
