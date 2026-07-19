/* ==========================================================================
   THEME.JS
   Dark / Light mode engine.

   Behavior:
     1. On first visit (no stored preference), the theme follows the OS-level
        `prefers-color-scheme`.
     2. As soon as the user toggles the theme manually, that choice is saved
        to localStorage and takes permanent precedence over system preference.
     3. If the user changes their OS theme later and has never manually
        toggled on this site, the site continues to follow the OS setting.

   IMPORTANT — avoiding a "flash of wrong theme":
   This file runs after the DOM/CSS is parsed, which is fine for wiring up
   the toggle button, but the *initial* theme should be applied before first
   paint. Every page should include this tiny inline snippet at the very
   top of <head>, before style.css loads:

     <script>
       (function () {
         var KEY = "site-theme";
         var stored = localStorage.getItem(KEY);
         var theme = stored || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
         document.documentElement.setAttribute("data-theme", theme);
       })();
     </script>

   This module then takes over for the interactive toggle + persistence.
   ========================================================================== */

const Theme = (() => {
  const STORAGE_KEY = "site-theme";
  const THEME_ATTR = "data-theme";
  const media = window.matchMedia("(prefers-color-scheme: dark)");

  /**
   * Returns "dark" or "light" — from localStorage if the user has chosen
   * explicitly, otherwise from the OS-level preference.
   */
  function getPreferredTheme() {
    const stored = Utils.storageGet(STORAGE_KEY);
    if (stored === "dark" || stored === "light") return stored;
    return media.matches ? "dark" : "light";
  }

  /**
   * Applies a theme to the document and updates the toggle button's
   * accessible state + the browser chrome color.
   * @param {"dark"|"light"} theme
   */
  function applyTheme(theme) {
    document.documentElement.setAttribute(THEME_ATTR, theme);

    const meta = Utils.qs('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute(
        "content",
        theme === "dark" ? "#0B1420" : "#FFFFFF"
      );
    }

    Utils.qsa(".theme-toggle").forEach((btn) => {
      btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
      btn.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      );
    });
  }

  /**
   * Toggles between dark/light and persists the explicit user choice.
   */
  function toggleTheme() {
    const current = document.documentElement.getAttribute(THEME_ATTR) === "dark" ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    Utils.storageSet(STORAGE_KEY, next);
    applyTheme(next);
  }

  /**
   * Wires up every .theme-toggle button on the page (header injects one,
   * but a page could legitimately add another, e.g. in a mobile drawer).
   */
  function initThemeToggle() {
    // Ensure the attribute set by the inline anti-flash snippet is in sync
    // with the toggle button's ARIA state as soon as the DOM is ready.
    applyTheme(getPreferredTheme());

    document.addEventListener("click", (event) => {
      const btn = event.target.closest(".theme-toggle");
      if (btn) toggleTheme();
    });

    // Follow OS changes live, but only while the user hasn't made an
    // explicit choice on this site.
    media.addEventListener("change", (event) => {
      if (Utils.storageGet(STORAGE_KEY)) return; // explicit choice wins
      applyTheme(event.matches ? "dark" : "light");
    });
  }

  return {
    getPreferredTheme,
    applyTheme,
    toggleTheme,
    initThemeToggle,
  };
})();
