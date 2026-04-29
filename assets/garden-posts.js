window.GARDEN_STAGE_INFO = {
  rare: { label: "Long post", group: "longPosts", visual: "flower", notebookKind: "bloom-rare" },
  bloom: { label: "Long post", group: "longPosts", visual: "flower", notebookKind: "bloom" },
  pad: { label: "Note", group: "notes", visual: "pad", notebookKind: "pad" },
  young: { label: "Scattered thought", group: "scatteredThoughts", visual: "pad", notebookKind: "pad-small" },
  draft: { label: "Scattered thought", group: "scatteredThoughts", visual: "seed", notebookKind: "seed" }
};

window.GARDEN_KIND_INFO = {
  longPost: { label: "Long post", defaultStage: "bloom" },
  note: { label: "Note", defaultStage: "pad" },
  scatteredThought: { label: "Scattered thought", defaultStage: "young" }
};

window.GARDEN_SETTINGS = {
  title: "Garden of Thoughts",
  introTitle: "A pond that fills slowly.",
  introText: "Each item in the pond is a piece of writing. Seeds are unfinished drafts, lily pads are notes, and flowers are longer posts that feel more complete."
};

const AUTO_POND_SLOTS = {
  flower: [
    { x: 48, y: 56, size: 84, rot: -13, drift: 7.6, delay: 0.4 },
    { x: 34, y: 36, size: 74, rot: 10, drift: 6.9, delay: 0.6 },
    { x: 64, y: 31, size: 78, rot: -8, drift: 8.1, delay: 0.2 },
    { x: 59, y: 68, size: 82, rot: 7, drift: 7.2, delay: 0.8 }
  ],
  pad: [
    { x: 27, y: 64, size: 50, rot: 16, drift: 6.4, delay: 0.3 },
    { x: 72, y: 44, size: 46, rot: -24, drift: 6.8, delay: 0.9 },
    { x: 40, y: 30, size: 42, rot: 28, drift: 6.1, delay: 0.5 },
    { x: 78, y: 65, size: 44, rot: 12, drift: 6.7, delay: 1.1 },
    { x: 20, y: 45, size: 40, rot: -18, drift: 6.2, delay: 0.1 }
  ],
  seed: [
    { x: 80, y: 70, size: 22, rot: 0, drift: 7.2, delay: 0.3 },
    { x: 18, y: 26, size: 22, rot: 0, drift: 7.0, delay: 0.9 },
    { x: 86, y: 38, size: 22, rot: 0, drift: 7.7, delay: 0.5 },
    { x: 15, y: 80, size: 22, rot: 0, drift: 7.1, delay: 1.1 }
  ]
};

let gardenContentPromise = null;

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "untitled";
}

function splitBody(body) {
  if (Array.isArray(body)) return body.filter(Boolean);
  return String(body || "")
    .split(/\n\s*\n/)
    .map((part) => part.replace(/\s+/g, " ").trim())
    .filter(Boolean);
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

  const rawAttributes = text.slice(4, end).split("\n");
  const attributes = {};
  rawAttributes.forEach((line) => {
    if (!line.trim() || line.trim().startsWith("#")) return;
    const sep = line.indexOf(":");
    if (sep === -1) return;
    const key = line.slice(0, sep).trim();
    const value = line.slice(sep + 1).trim();
    attributes[key] = parseScalar(value);
  });

  return {
    attributes,
    body: text.slice(end + 5).trim()
  };
}

function inferKind(post) {
  if (post.kind && window.GARDEN_KIND_INFO[post.kind]) return post.kind;
  if (post.stage === "pad") return "note";
  if (post.stage === "young" || post.stage === "draft") return "scatteredThought";
  return "longPost";
}

function inferStage(post, kind) {
  if (post.stage && window.GARDEN_STAGE_INFO[post.stage]) return post.stage;
  if (post.status === "draft") return "draft";
  return (window.GARDEN_KIND_INFO[kind] || window.GARDEN_KIND_INFO.note).defaultStage;
}

function pondVisual(stage) {
  const info = window.GARDEN_STAGE_INFO[stage] || window.GARDEN_STAGE_INFO.pad;
  return info.visual || "pad";
}

function autoPondFor(stage, slotIndex) {
  const visual = pondVisual(stage);
  const options = AUTO_POND_SLOTS[visual] || AUTO_POND_SLOTS.pad;
  const choice = options[slotIndex % options.length];
  const cycle = Math.floor(slotIndex / options.length);
  return {
    x: choice.x + ((cycle % 2 === 0 ? 1 : -1) * cycle * 2),
    y: choice.y + ((cycle % 2 === 0 ? -1 : 1) * cycle * 2),
    size: choice.size,
    rot: choice.rot + (cycle * 3),
    drift: choice.drift,
    delay: choice.delay + (cycle * 0.15)
  };
}

function normalizePond(post, stage, slotIndex) {
  const defaults = autoPondFor(stage, slotIndex);
  const pond = {
    ...defaults,
    ...(post.pond || {}),
    ...(post.pad ? { pad: post.pad } : {}),
    ...(post.flower ? { flower: post.flower } : {})
  };
  pond.pad = pond.pad || (
    stage === "young" ? "young" :
    stage === "pad" ? "round" :
    stage === "rare" ? "deep" :
    "classic"
  );
  pond.flower = pond.flower || "lotus";
  pond.latest = !!(post.latest || pond.latest);
  return pond;
}

function normalizePost(post, index, counts) {
  const kind = inferKind(post);
  const stage = inferStage(post, kind);
  const visual = pondVisual(stage);
  const slotIndex = counts[visual]++;
  const rawBody = String(post.body || "").trim();
  const paragraphs = splitBody(rawBody);
  const summary = post.summary || post.dek || plainTextFromMarkdown(rawBody).slice(0, 180) || paragraphs[0] || "A note from the garden.";

  return {
    ...post,
    slug: post.slug || slugify(post.title),
    title: post.title || "Untitled",
    kind,
    stage,
    when: post.when || "Soon",
    summary,
    heroLabel: post.heroLabel || (window.GARDEN_KIND_INFO[kind] || window.GARDEN_KIND_INFO.note).label,
    pond: normalizePond(post, stage, slotIndex),
    content: {
      raw: rawBody,
      dek: post.dek || summary,
      paragraphs,
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

window.loadGardenContent = async function loadGardenContent() {
  if (gardenContentPromise) return gardenContentPromise;

  gardenContentPromise = (async () => {
    const settings = { ...window.GARDEN_SETTINGS };
    const directoryHTML = await fetchText("content/garden/posts/");
    const files = listMarkdownFilesFromDirectoryIndex(directoryHTML);
    const counts = { flower: 0, pad: 0, seed: 0 };
    const rawPosts = await Promise.all(files.map(async (file, index) => {
      const text = await fetchText("content/garden/posts/" + file);
      const parsed = parseFrontmatter(text);
      const baseSlug = file.split("/").pop().replace(/\.md$/i, "");
      return normalizePost({
        ...parsed.attributes,
        slug: parsed.attributes.slug || baseSlug,
        body: parsed.body
      }, index, counts);
    }));

    return { settings, posts: rawPosts };
  })();

  return gardenContentPromise;
};

window.getGardenPosts = async function getGardenPosts() {
  return (await window.loadGardenContent()).posts;
};

window.getGardenSettings = async function getGardenSettings() {
  return (await window.loadGardenContent()).settings;
};

window.getGardenPostBySlug = async function getGardenPostBySlug(slug) {
  const posts = await window.getGardenPosts();
  return posts.find((post) => post.slug === slug) || null;
};

window.getNotebookGardenPreview = async function getNotebookGardenPreview(limit) {
  const count = Number.isFinite(limit) ? limit : 3;
  const posts = await window.getGardenPosts();
  return posts
    .filter((post) => post.stage !== "draft")
    .slice(0, count)
    .map((post) => {
      const stageInfo = window.GARDEN_STAGE_INFO[post.stage] || window.GARDEN_STAGE_INFO.bloom;
      return {
        title: post.title,
        date: post.when,
        kind: stageInfo.notebookKind,
        href: "garden-post.html?slug=" + encodeURIComponent(post.slug),
        desc: post.summary
      };
    });
};
