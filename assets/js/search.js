/* ==========================================================================
   SEARCH.JS
   Site-wide, client-side search over every tool page.

   Data source: `window.SITE_TOOLS`, an array of:
     { title: "BMI Calculator", url: "/health/bmi-calculator.html",
       category: "Health", keywords: "body mass index weight height" }

   That array is generated once (a build script/manifest, added in a later
   phase) as the catalog of tools grows past a few pages. This module is
   deliberately data-source agnostic: it works against whatever
   `window.SITE_TOOLS` contains, and degrades gracefully (empty results,
   no errors) if that manifest hasn't been loaded on a given page yet.

   Because the catalog can eventually hold 10,000+ entries, matching is a
   simple, fast substring/keyword scorer — no heavy fuzzy-search library,
   keeping this dependency-free per the project's "vanilla JS only" rule.
   ========================================================================== */

const Search = (() => {
  const MAX_RESULTS = 8;

  function getIndex() {
    return Array.isArray(window.SITE_TOOLS) ? window.SITE_TOOLS : [];
  }

  /**
   * Scores a tool entry against a lowercase query. Higher is better.
   * Title-start match > title contains > keyword contains. Returns 0 (no
   * match) to exclude the entry entirely.
   */
  function score(entry, query) {
    const title = (entry.title || "").toLowerCase();
    const keywords = (entry.keywords || "").toLowerCase();

    if (title.startsWith(query)) return 3;
    if (title.includes(query)) return 2;
    if (keywords.includes(query)) return 1;
    return 0;
  }

  function search(query) {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return getIndex()
      .map((entry) => ({ entry, points: score(entry, q) }))
      .filter((result) => result.points > 0)
      .sort((a, b) => b.points - a.points)
      .slice(0, MAX_RESULTS)
      .map((result) => result.entry);
  }

  function renderResults(panel, results, query) {
    if (!results.length) {
      panel.innerHTML = query
        ? `<div class="search-box__empty">No tools found for &ldquo;${Utils.escapeHTML(query)}&rdquo;</div>`
        : "";
      panel.classList.toggle("is-open", Boolean(query));
      return;
    }

    panel.innerHTML = results
      .map(
        (tool, index) => `
        <a class="search-box__result${index === 0 ? " is-active" : ""}"
           href="${Utils.escapeHTML(tool.url)}" role="option" data-index="${index}">
          <span class="search-box__result-title">${Utils.escapeHTML(tool.title)}</span>
          <span class="search-box__result-category">${Utils.escapeHTML(tool.category || "")}</span>
        </a>`
      )
      .join("");

    panel.classList.add("is-open");
  }

  function initSearchBox(input, panel) {
    let activeIndex = 0;
    let currentResults = [];

    const runSearch = Utils.debounce(() => {
      currentResults = search(input.value);
      activeIndex = 0;
      renderResults(panel, currentResults, input.value.trim());
    }, 150);

    input.addEventListener("input", runSearch);

    input.addEventListener("focus", () => {
      if (input.value.trim()) panel.classList.add("is-open");
    });

    input.addEventListener("keydown", (event) => {
      const options = Utils.qsa(".search-box__result", panel);
      if (!options.length) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        activeIndex = Utils.clamp(activeIndex + 1, 0, options.length - 1);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        activeIndex = Utils.clamp(activeIndex - 1, 0, options.length - 1);
      } else if (event.key === "Enter") {
        const active = options[activeIndex];
        if (active) window.location.href = active.getAttribute("href");
        return;
      } else if (event.key === "Escape") {
        panel.classList.remove("is-open");
        return;
      } else {
        return;
      }

      options.forEach((opt, i) => opt.classList.toggle("is-active", i === activeIndex));
      options[activeIndex].scrollIntoView({ block: "nearest" });
    });

    document.addEventListener("click", (event) => {
      if (!panel.contains(event.target) && event.target !== input) {
        panel.classList.remove("is-open");
      }
    });
  }

  function init() {
    // The header is injected by navigation.js, so wait one tick to make
    // sure #site-search-input / #site-search-results exist in the DOM.
    const input = document.getElementById("site-search-input");
    const panel = document.getElementById("site-search-results");
    if (input && panel) initSearchBox(input, panel);
  }

  return { init, search };
})();
