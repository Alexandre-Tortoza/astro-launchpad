# Client guide

This guide is for website owners and content editors who use Directus to update their Astro Launchpad site. No coding required.

## Accessing the CMS

Your developer will give you a URL for your CMS, for example `https://cms.yoursite.com`. Open it in your browser and sign in with the email and password your developer provided.

## Editing pages

1. In the left sidebar click **Pages**.
2. Click the page you want to edit (e.g. _Home_).
3. Scroll to **Sections** and click on any section to expand it.
4. Edit the text fields, then click **Save** (top-right).
5. Your changes appear on the site after the next build (usually automatic within a few minutes).

### What you can change in a section

| Field                       | Example                                   |
| --------------------------- | ----------------------------------------- |
| Title, eyebrow, description | Any text                                  |
| Button labels and links     | CTA text, URLs                            |
| Images                      | Upload a replacement via the image picker |
| Section visibility          | Show or hide a section                    |

## Editing blog posts

1. In the left sidebar click **Blog Posts**.
2. Click an existing post to edit, or click **+ New** to create one.
3. Fill in the title, content, excerpt, and cover image.
4. Set **Status** to _Published_ when the post is ready to go live.
5. Click **Save**.

## Changing images

Click any image field to open the file picker. You can:

- Upload a new image from your computer
- Select an existing image from the media library

Use images at least 1200 px wide for best quality. Avoid very large files (keep under 2 MB where possible).

## Editing SEO fields

Each page and post has optional SEO fields:

- **SEO Title** — shown in search results (recommended length: 50–60 characters)
- **SEO Description** — snippet under the title (recommended: 120–160 characters)
- **OG Image** — image used when shared on social media

Leave these blank to use the site's default title and description.

## Editing site settings

Click **Site Settings** in the sidebar to update:

- Site name
- Logo and favicon
- Social links (GitHub, Twitter, etc.)
- Default SEO title and description

## What NOT to change

Please do not modify the following — they control the layout and can break the site:

- Section **type** field
- Section **order** field (re-order sections through the visual handle instead)
- Any field that contains code or class names
- Database roles or permissions

If you are unsure whether an edit is safe, contact your developer first.

## After saving

Most changes go live automatically within a few minutes after save. If you need the site to update immediately, ask your developer to trigger a manual rebuild.

## Getting help

If something looks wrong or you need to make a change that is not covered here, contact your developer. Include:

1. Which page or post is affected
2. What you were trying to change
3. A screenshot if possible
