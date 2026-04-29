// Garden posts are defined in one place so the pond view, post page,
// and notebook preview can all stay in sync.
window.GARDEN_POSTS = [
  {
    slug: "introduction",
    title: "Introduction",
    stage: "bloom",
    when: "Apr 2026",
    summary: "Welcome to my blooms, thoughts, and little garden of thoughts.",
    heroLabel: "First bloom",
    pond: {
      x: 48,
      y: 56,
      size: 84,
      rot: -13,
      drift: 7.6,
      delay: 0.4,
      latest: true,
      pad: "classic",
      flower: "lotus"
    },
    content: {
      dek: "Welcome to my blooms, thoughts, and little garden of thoughts.",
      paragraphs: [
        "Hello, and thank you for stumbling upon this corner of the internet.",
        "This is the first bloom in my garden of thoughts: a small introduction before the actual technical posts begin to grow here.",
        "Over time, I want this space to hold notes, ideas, experiments, and things I am still in the middle of figuring out.",
        "For now, welcome to the garden."
      ],
      signoff: "Srija"
    }
  }
];

window.GARDEN_STAGE_INFO = {
  rare: { label: "Long post", group: "longPosts", visual: "flower", notebookKind: "bloom-rare" },
  bloom: { label: "Long post", group: "longPosts", visual: "flower", notebookKind: "bloom" },
  pad: { label: "Note", group: "notes", visual: "pad", notebookKind: "pad" },
  young: { label: "Scattered thought", group: "scatteredThoughts", visual: "pad", notebookKind: "pad-small" },
  draft: { label: "Scattered thought", group: "scatteredThoughts", visual: "seed", notebookKind: "seed" }
};

window.GARDEN_SETTINGS = {
  title: "Garden of Thoughts",
  introTitle: "A pond that fills slowly.",
  introText: "Each item in the pond is a piece of writing. Seeds are unfinished drafts, lily pads are notes, and flowers are longer posts that feel more complete."
};

window.getGardenPosts = function getGardenPosts() {
  return Array.isArray(window.GARDEN_POSTS) ? window.GARDEN_POSTS.slice() : [];
};

window.getGardenPostBySlug = function getGardenPostBySlug(slug) {
  return window.getGardenPosts().find((post) => post.slug === slug) || null;
};

window.getNotebookGardenPreview = function getNotebookGardenPreview(limit) {
  const count = Number.isFinite(limit) ? limit : 3;
  return window.getGardenPosts()
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
