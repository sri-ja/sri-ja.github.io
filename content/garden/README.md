# Adding a garden post

1. Create a new markdown file in `content/garden/posts/`.
2. Write a small frontmatter block at the top.
3. Refresh the garden. The post is discovered automatically.

```md
---
title: My new post
kind: note
when: May 2026
summary: One-line description for the garden and notebook preview.
status: published
---

First paragraph.

Second paragraph.
```

## Fields

- `title`: post title
- `kind`: `longPost`, `note`, or `scatteredThought`
- `when`: date label to show in the UI
- `summary`: short preview text
- `status`: `published` or `draft`

## Optional fields

- `slug`
- `dek`
- `signoff`
- `latest: true`
- `pad`: `classic`, `young`, `deep`, or `round`
- `flower`: currently decorative, only used for flowered posts

The post body supports markdown, including:

- headings (`##`)
- links (`[text](url)`)
- bold / italics
- bullet and numbered lists
- blockquotes
- inline code and fenced code blocks

There is no post manifest anymore. If a `.md` file exists in `content/garden/posts/`, the garden will load it automatically.
