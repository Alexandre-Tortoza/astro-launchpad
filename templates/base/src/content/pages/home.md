---
title: Astro Launchpad
seo:
  title: Astro Launchpad
  description: Launch editable landing pages at startup speed.
sections:
  - id: hero
    type: hero
    order: 1
    payload:
      eyebrow: Astro Launchpad
      title: Launch editable landing pages at startup speed
      description: An open source starter and CLI for fast, editable landing pages with Astro, CMS adapters, reusable blocks, and AI-assisted workflows.
      primaryCta:
        label: Get started
        href: "#"
        variant: primary
      secondaryCta:
        label: View on GitHub
        href: "#"
        variant: secondary
      trustText: Free and open source.
  - id: features
    type: features
    order: 2
    payload:
      title: Everything you need to launch fast
      description: Batteries included, but nothing forced on you.
      items:
        - title: Local Markdown content
          description: Keep pages and posts beside your source code with typed frontmatter.
        - title: Reusable blocks
          description: Compose landing pages from validated, portable block payloads.
        - title: CMS-ready boundary
          description: Replace the provider without making UI components fetch content directly.
  - id: faq
    type: faq
    order: 3
    payload:
      title: Frequently asked questions
      items:
        - question: Where does page content live?
          answer: Page Markdown files live in src/content/pages and use frontmatter for sections.
        - question: Can I replace Markdown later?
          answer: Yes. Pages use the ContentProvider interface, so another provider can supply the same data.
  - id: cta
    type: cta
    order: 4
    payload:
      title: Ready to launch?
      description: Start with local content and add a CMS when your project needs one.
      cta:
        label: Read the documentation
        href: "#"
        variant: primary
      backgroundStyle: brand
  - id: footer
    type: footer
    order: 5
    payload:
      linkGroups:
        - label: Product
          links:
            - label: Getting started
              href: "#"
            - label: Documentation
              href: "#"
      socialLinks:
        - platform: GitHub
          href: "#"
      copyright: Copyright Astro Launchpad.
---

This body is available to the Markdown provider for page formats that need it.
