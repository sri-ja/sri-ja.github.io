# Adding a garden post

1. Create a new markdown file in `content/garden/posts/`.
2. Copy the frontmatter from `content/garden/post-template.md`.
3. Add the filename to `content/garden/posts.txt` where you want it to appear.
4. Refresh the garden.

```md
---
title: My new post
kind: note
when: May 2026
summary: One-line description for the branch and notebook preview.
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

The post body supports markdown, including:

- headings (`##`)
- links (`[text](url)`)
- bold / italics
- bullet and numbered lists
- blockquotes
- inline code and fenced code blocks

## Post List

`content/garden/posts.txt` controls which posts appear and in what order. Put
the newest post first.

```txt
# Newest first. Add one markdown filename per line.
my-new-post.md
introduction.md
```

The branch uses the post kind for its symbol:

- `longPost`: flower
- `note`: leaf
- `scatteredThought`: seed

While previewing locally, the garden can also discover markdown files from the
directory listing. For the deployed site, keep `posts.txt` updated so GitHub
Pages can load the posts reliably.
