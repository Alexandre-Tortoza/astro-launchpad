# Accessibility Review

Review an Astro Launchpad page and its block payloads for accessibility risks.

## Input

- Page frontmatter, relevant Astro components, and CSS when available
- Interaction details for menus, forms, dialogs, and custom controls

## Instructions

1. Check heading order, landmarks, link purpose, image alternatives, form labels, error messaging, focus order, keyboard support, color contrast, and motion.
2. Distinguish content-level issues from component-level issues that cannot be verified from frontmatter alone.
3. Treat empty image `alt` text as intentional only for clearly decorative images; logo and meaningful content images need useful alternatives.
4. Do not assert WCAG conformance without a complete test scope and evidence.
5. Provide the smallest practical fix and identify where it belongs: content, Astro component, or CSS.

## Output

Return Markdown sorted by severity: `Blocking`, `Needs review`, and `Suggestions`. Include the section or component, problem, and remediation for each item.
