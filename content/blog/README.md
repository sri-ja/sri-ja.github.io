# Adding a blog post

1. Create a new markdown file in `content/blog/posts/`.
2. Copy the frontmatter from `content/blog/post-template.md`.
3. Add the filename to `content/blog/posts.txt` where you want it to appear.
4. Refresh the blog page (blog.html).

```md
---
title: My new post
kind: reflection
when: May 2026
summary: One-line description for the post list and notebook preview.
status: published
---

First paragraph.

Second paragraph.
```

## Fields

- `title`: post title
- `kind`: `research` (research update), `reflection` (personal thoughts and takes), or `misc` (everything else)
- `when`: date label to show in the UI
- `summary`: short preview text
- `status`: `published` or `draft` (drafts are hidden)

## Optional fields

- `slug`
- `dek`: subtitle under the title on the post page
- `signoff`

The post body supports markdown, including:

- headings (`##`)
- links (`[text](url)`)
- images (`![caption](path)`)
- bold / italics
- bullet and numbered lists
- blockquotes
- inline code and fenced code blocks

## Images

Put image files in `content/blog/images/` and reference them from a post:

```md
![Optional caption](content/blog/images/my-image.png)
```

An image alone on its own line renders as a centered figure with the caption
below it. An image inside a sentence renders inline. Screenshots, phone
photos, and plots all work; keep files reasonably sized (under ~1 MB each)
since GitHub Pages serves them as-is.

## Post List

`content/blog/posts.txt` controls which posts appear and in what order. Put
the newest post first.

```txt
# Newest first. Add one markdown filename per line.
my-new-post.md
introduction.md
```

The blog shows each post as one tokenized line: the kind as a special token
(`<|research|>`, `<|reflection|>`, `<|misc|>`), the `when` date, then the title
split into real tokens (a word's tokens always stay on one line). Titles and
token counts use the o200k_base tokenizer (the one GPT-4o uses) from the
`gpt-tokenizer` package, loaded from a CDN after the page shows; until it loads
the page shows a rough estimate marked with "~". Hovering a token shows its id. Reading time is worked out from the post length.
Older kind names still work: `take` shows as a reflection and `reading` as misc.

While previewing locally, the blog can also discover markdown files from the
directory listing. For the deployed site, keep `posts.txt` updated so GitHub
Pages can load the posts reliably.
