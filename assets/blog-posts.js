// Loads blog posts from content/blog/posts/*.md (listed in posts.txt) and
// shares the "tokenized" helpers used by blog.html, post.html and the
// notebook preview in index.html.

window.BLOG_KINDS = {
  research: { token: "research", label: "Research update", plural: "research updates" },
  reflection: { token: "reflection", label: "Reflection", plural: "reflections" },
  misc: { token: "misc", label: "Misc", plural: "misc posts" }
};

// What I am working on, reading and listening to right now. Shown in the notebook sidebar
// and on the blog page; update it here only.
window.SRIJA_NOW = [
  { id: "working", emoji: "🔬", label: "Currently working on", items: ["Why models learn to fool their LLM judges during RL"] },
  { id: "reading", emoji: "📖", label: "Currently reading", items: [
    "<em>Foundation</em> series, Isaac Asimov",
    '<a href="https://situational-awareness.ai/" target="_blank" rel="noopener"><em>Situational Awareness</em></a>, Leopold Aschenbrenner'
  ] },
  { id: "listening", emoji: "🎧", label: "Currently listening to", items: ['<a href="https://music.youtube.com/watch?v=-UGbOqadHb0" target="_blank" rel="noopener"><em>Ladies and Gentlemen We Are Floating in Space</em></a>, Spiritualized'] }
];

window.nowBoxesHTML = function nowBoxesHTML(boxClass, ids) {
  return window.SRIJA_NOW.filter((item) => !ids || ids.includes(item.id)).map((item) =>
    `<div class="${boxClass}"><div class="label"><span class="emoji">${item.emoji}</span>${item.label}</div>${item.items.map((line) => `<div class="book">${line}</div>`).join("")}</div>`).join("");
};

// Older kind names map onto the current ones.
const LEGACY_KINDS = { take: "reflection", reading: "misc", longPost: "reflection", note: "reflection", scatteredThought: "reflection" };

// Pastel backgrounds that tokens cycle through.
window.BLOG_TOKEN_COLORS = ["#ffd6e0", "#c9f2e3", "#ffe6b3", "#d9e4ff", "#e8d9ff", "#ffd9c2", "#d6f5c9"];

// Titles are split with a real tokenizer (o200k_base, the one GPT-4o uses),
// loaded in the background from a CDN. Until it arrives, or if it fails to
// load, a rough stand-in splits words at common endings and punctuation.
const REAL_TOKENIZER_URL = "https://cdn.jsdelivr.net/npm/gpt-tokenizer@3.4.0/dist/o200k_base.js";
let realTokenizer = null;

window.realTokenizerReady = new Promise((resolve) => {
  if (typeof document === "undefined") return resolve(false);
  const load = () => {
    const script = document.createElement("script");
    script.src = REAL_TOKENIZER_URL;
    script.async = true;
    script.onload = () => {
      realTokenizer = window.GPTTokenizer_o200k_base || null;
      resolve(!!realTokenizer);
    };
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  };
  if (document.readyState === "complete") load();
  else window.addEventListener("load", load);
});

const TOKEN_SUFFIXES = ["ments", "ment", "tion", "sion", "ness", "ally", "able", "ible", "ing", "ity", "ism", "ist", "ize", "ed", "ly"];

function roughSplitWord(word) {
  const [, before, core, after] = word.match(/^([^A-Za-z0-9]*)(.*?)([^A-Za-z0-9]*)$/);
  let pieces = [core];
  if (/^[A-Za-z]+$/.test(core) && core.length > 6) {
    const suffix = TOKEN_SUFFIXES.find((suf) => core.length - suf.length >= 4 && core.toLowerCase().endsWith(suf));
    if (suffix) pieces = [core.slice(0, -suffix.length), core.slice(-suffix.length)];
    else if (core.length > 8) pieces = [core.slice(0, Math.ceil(core.length / 2)), core.slice(Math.ceil(core.length / 2))];
  }
  return [before, ...pieces, after].filter(Boolean);
}

// Real tokens as text pieces. A character spread over several byte tokens
// decodes to U+FFFD on its own, so those ids are kept together as one piece.
function realPieces(text) {
  const pieces = [];
  let ids = [];
  realTokenizer.encode(text).forEach((id) => {
    ids.push(id);
    const decoded = realTokenizer.decode(ids);
    if (!decoded.includes("�")) {
      pieces.push({ text: decoded, ids });
      ids = [];
    }
  });
  if (ids.length) pieces.push({ text: realTokenizer.decode(ids), ids });
  return pieces;
}

// One array of pieces per word, so a word never wraps across lines. Like a
// real tokenizer, the space belongs to the start of the next word.
window.tokenizeTitle = function tokenizeTitle(title) {
  const text = String(title || "").trim();
  if (realTokenizer) {
    const words = [];
    realPieces(text).forEach((piece) => {
      if (!words.length || /^\s/.test(piece.text)) words.push([]);
      words[words.length - 1].push(piece);
    });
    return words;
  }
  return text.split(/\s+/).filter(Boolean).map((word, i) => {
    const pieces = roughSplitWord(word).map((piece) => ({ text: piece, ids: null }));
    if (i) pieces[0].text = " " + pieces[0].text;
    return pieces;
  });
};

function escapeText(text) {
  return String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// Inner HTML for a tokenized title. colorStart keeps colors cycling across rows.
window.tokenizedTitleHTML = function tokenizedTitleHTML(title, colorStart) {
  let color = colorStart || 0;
  const html = window.tokenizeTitle(title).map((pieces) => '<span class="word">' + pieces.map((piece) => {
    const hint = piece.ids ? ` title="o200k token ${piece.ids.join(", ")}"` : "";
    return `<span class="tok" style="--tc: var(--t${(color++) % 7})"${hint}>${escapeText(piece.text).replace(/ /g, "&nbsp;")}</span>`;
  }).join("") + "</span>").join("<wbr>");
  return { html, count: color - (colorStart || 0) };
};

// A tokenized title wrapped so it can be re-tokenized once the real tokenizer loads.
window.tokenTitleSpan = function tokenTitleSpan(title, colorStart) {
  const inner = window.tokenizedTitleHTML(title, colorStart);
  return { html: `<span data-tok-title="${escapeText(title)}" data-tok-color="${colorStart || 0}">${inner.html}</span>`, count: inner.count };
};

window.postTokenCount = function postTokenCount(post) {
  return realTokenizer ? realTokenizer.encode(post.plain).length : post.tokens;
};

window.tokenLabel = function tokenLabel(n) {
  return (realTokenizer ? "" : "~") + window.formatTokens(n) + " tokens";
};

// Swap estimates for real tokens everywhere on the page.
window.upgradeTokens = async function upgradeTokens(root) {
  const scope = root || document;
  scope.querySelectorAll("[data-tok-title]").forEach((el) => {
    el.innerHTML = window.tokenizedTitleHTML(el.dataset.tokTitle, Number(el.dataset.tokColor) || 0).html;
    el.querySelectorAll(".tok").forEach((tok) => tok.classList.add("on"));
  });
  const posts = await window.getBlogPosts();
  scope.querySelectorAll("[data-tok-slug]").forEach((el) => {
    const post = posts.find((p) => p.slug === el.dataset.tokSlug);
    if (post) el.textContent = window.tokenLabel(window.postTokenCount(post));
  });
  scope.querySelectorAll("[data-tok-total]").forEach((el) => {
    el.textContent = window.tokenLabel(posts.reduce((sum, p) => sum + window.postTokenCount(p), 0)) + " written";
  });
};

window.realTokenizerReady.then((ok) => { if (ok) window.upgradeTokens(); });

window.formatTokens = function formatTokens(n) {
  return n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : String(n);
};

window.blogPostHref = function blogPostHref(post) {
  return "post.html?slug=" + encodeURIComponent(post.slug);
};

let blogContentPromise = null;

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "untitled";
}

function plainTextFromMarkdown(markdown) {
  return String(markdown || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*>\s?/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/[*_~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseScalar(value) {
  const trimmed = String(value || "").trim();
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) return Number(trimmed);
  return trimmed.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
}

function parseFrontmatter(source) {
  const text = String(source || "").replace(/\r/g, "");
  if (!text.startsWith("---\n")) {
    return { attributes: {}, body: text.trim() };
  }
  const end = text.indexOf("\n---\n", 4);
  if (end === -1) {
    return { attributes: {}, body: text.trim() };
  }

  const attributes = {};
  text.slice(4, end).split("\n").forEach((line) => {
    if (!line.trim() || line.trim().startsWith("#")) return;
    const sep = line.indexOf(":");
    if (sep === -1) return;
    attributes[line.slice(0, sep).trim()] = parseScalar(line.slice(sep + 1));
  });

  return { attributes, body: text.slice(end + 5).trim() };
}

function normalizeKind(kind) {
  if (window.BLOG_KINDS[kind]) return kind;
  return LEGACY_KINDS[kind] || "reflection";
}

function normalizePost(post) {
  const body = String(post.body || "").trim();
  const plain = plainTextFromMarkdown(body);
  const words = plain ? plain.split(" ").length : 0;

  return {
    ...post,
    slug: post.slug || slugify(post.title),
    title: post.title || "Untitled",
    kind: normalizeKind(post.kind),
    when: post.when || "Soon",
    summary: post.summary || post.dek || plain.slice(0, 180) || "A post on my blog.",
    minutes: Math.max(1, Math.round(words / 200)),
    plain,
    // rough token count until the real tokenizer loads (about 4 characters per token)
    tokens: Math.max(1, Math.round(plain.length / 4)),
    content: {
      raw: body,
      dek: post.dek || post.summary || "",
      signoff: post.signoff || ""
    }
  };
}

async function fetchJSON(path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) throw new Error("Failed to load " + path);
  return response.json();
}

async function fetchText(path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) throw new Error("Failed to load " + path);
  return response.text();
}

function listMarkdownFilesFromDirectoryIndex(html) {
  const matches = [...String(html || "").matchAll(/href="([^"]+\.md)"/gi)];
  const files = matches.map((match) => decodeURIComponent(match[1]));
  return Array.from(new Set(files)).sort((a, b) => a.localeCompare(b));
}

async function listBlogMarkdownFiles() {
  try {
    const list = await fetchText("content/blog/posts.txt");
    const files = list
      .split(/\r?\n/)
      .map((line) => line.replace(/#.*/, "").trim())
      .filter(Boolean);
    if (files.length) return files;
  } catch (_) {}

  try {
    const manifest = await fetchJSON("content/blog/posts.json");
    const entries = Array.isArray(manifest) ? manifest : (manifest.posts || []);
    const files = entries
      .map((entry) => typeof entry === "string" ? entry : entry.file)
      .filter(Boolean);
    if (files.length) return files;
  } catch (_) {}

  // Local Python servers expose a directory listing, which keeps authoring easy
  // before the manifest has been updated. GitHub Pages uses posts.txt above.
  const directoryHTML = await fetchText("content/blog/posts/");
  return listMarkdownFilesFromDirectoryIndex(directoryHTML);
}

window.loadBlogContent = async function loadBlogContent() {
  if (blogContentPromise) return blogContentPromise;

  blogContentPromise = (async () => {
    const files = await listBlogMarkdownFiles();
    const posts = await Promise.all(files.map(async (file) => {
      const parsed = parseFrontmatter(await fetchText("content/blog/posts/" + file));
      const baseSlug = file.split("/").pop().replace(/\.md$/i, "");
      return normalizePost({
        ...parsed.attributes,
        slug: parsed.attributes.slug || baseSlug,
        body: parsed.body
      });
    }));
    return { posts: posts.filter((post) => post.status !== "draft") };
  })();

  return blogContentPromise;
};

window.getBlogPosts = async function getBlogPosts() {
  return (await window.loadBlogContent()).posts;
};

window.getBlogPostBySlug = async function getBlogPostBySlug(slug) {
  const posts = await window.getBlogPosts();
  return posts.find((post) => post.slug === slug) || null;
};

window.getNotebookBlogPreview = async function getNotebookBlogPreview(limit) {
  const count = Number.isFinite(limit) ? limit : 3;
  const posts = await window.getBlogPosts();
  return posts.slice(0, count).map((post) => ({
    title: post.title,
    date: post.when,
    kind: post.kind,
    type: window.BLOG_KINDS[post.kind].label,
    href: window.blogPostHref(post),
    desc: post.summary
  }));
};
