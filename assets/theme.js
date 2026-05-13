(function () {
  const STORAGE_KEY = "srija-theme";
  const root = document.documentElement;

  function storedTheme() {
    try {
      const value = window.localStorage.getItem(STORAGE_KEY);
      return value === "dark" || value === "light" ? value : null;
    } catch (_) {
      return null;
    }
  }

  function currentTheme() {
    return storedTheme() || "light";
  }

  function setButtonState(theme) {
    const nextTheme = theme === "dark" ? "light" : "dark";
    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      button.dataset.themeState = theme;
      button.setAttribute("aria-label", "Switch to " + nextTheme + " mode");
      button.title = "Switch to " + nextTheme + " mode";
    });
  }

  function applyTheme(theme) {
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    setButtonState(theme);
  }

  function saveTheme(theme) {
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch (_) {}
    applyTheme(theme);
  }

  function toggleTheme() {
    const nextTheme = (root.dataset.theme || currentTheme()) === "dark" ? "light" : "dark";
    saveTheme(nextTheme);
  }

  function initThemeControls() {
    applyTheme(currentTheme());
    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      if (button.dataset.themeBound === "true") return;
      button.dataset.themeBound = "true";
      button.addEventListener("click", toggleTheme);
    });
  }

  applyTheme(currentTheme());

  window.SrijaTheme = {
    apply: applyTheme,
    init: initThemeControls,
    toggle: toggleTheme
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initThemeControls);
  } else {
    initThemeControls();
  }
})();
