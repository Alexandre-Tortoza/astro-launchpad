---
title: Why content belongs behind a provider
date: 2026-07-23
excerpt: A small boundary keeps visual components independent from storage details.
author: Astro Launchpad Team
tags:
  - architecture
  - cms
---

# Why content belongs behind a provider

Page components ask a `ContentProvider` for data. Block components receive already-loaded payloads and never need to know whether that data came from Markdown, a CMS, or an API.
