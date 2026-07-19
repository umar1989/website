/* ==========================================================================
   COMMON.JS
   The single entry point every page loads last. Boots every shared module
   (theme, navigation, search) and wires up generic, data-attribute-driven
   components (copy / print / share buttons, FAQ accordion) so that future
   tool pages get them "for free" just by using the right markup —
   no per-page JavaScript required.

   Expected load order in <head>/<body> of every page:
     1. Inline anti-flash theme snippet (see theme.js header comment)
     2. css/variables.css, css/style.css, css/responsive.css
     3. js/utils.js
     4. js/theme.js
     5. js/navigation.js
     6. js/search.js
     7. js/common.js   <-- this file, runs last and calls the others' init()
   ========================================================================== */

(function () {
  "use strict";

  /**
   * Generic copy-to-clipboard handler.
   * Markup contract:
   *   <button class="action-btn copy-btn" data-copy-target="#result">Copy</button>
   * `data-copy-target` may point to any element; its textContent (or
   * .value for inputs/textareas) is copied.
   */
  function initCopyButtons() {
    document.addEventListener("click", async (event) => {
      const btn = event.target.closest("[data-copy-target]");
      if (!btn) return;

      const target = document.querySelector(btn.getAttribute("data-copy-target"));
      if (!target) return;

      const text = "value" in target ? target.value : target.textContent;
      const success = await Utils.copyToClipboard(text.trim());

      if (success) {
        const originalLabel = btn.innerHTML;
        btn.classList.add("is-success");
        btn.innerHTML = "Copied!";
        setTimeout(() => {
          btn.classList.remove("is-success");
          btn.innerHTML = originalLabel;
        }, 1800);
      }
    });
  }

  /**
   * Generic print handler.
   * Markup contract: <button class="action-btn print-btn">Print</button>
   */
  function initPrintButtons() {
    document.addEventListener("click", (event) => {
      if (event.target.closest(".print-btn")) Utils.printPage();
    });
  }

  /**
   * Generic share handler. Uses the native share sheet on supported
   * devices, otherwise opens/toggles a fallback link menu.
   * Markup contract:
   *   <div class="share-menu">
   *     <button class="action-btn share-btn">Share</button>
   *     <div class="share-menu__panel" data-share-panel>...</div>
   *   </div>
   */
  function initShareButtons() {
    document.addEventListener("click", async (event) => {
      const btn = event.target.closest(".share-btn");
      if (btn) {
        const result = await Utils.shareContent({});
        if (result === "copied") {
          const panel = btn.closest(".share-menu")?.querySelector("[data-share-panel]");
          if (!panel) {
            const originalLabel = btn.innerHTML;
            btn.innerHTML = "Link copied!";
            setTimeout(() => { btn.innerHTML = originalLabel; }, 1800);
          }
        }
        return;
      }

      // Toggle fallback panel (only reached on devices without navigator.share
      // where the panel is present in the markup).
      const panel = event.target.closest("[data-share-panel]");
      if (!panel) {
        Utils.qsa(".share-menu__panel.is-open").forEach((p) => p.classList.remove("is-open"));
      }
    });
  }

  /**
   * FAQ accordion. Works for any number of independent .faq blocks per page.
   * Markup contract:
   *   <div class="faq">
   *     <div class="faq-item">
   *       <button class="faq-item__question" aria-expanded="false" aria-controls="faq-1">
   *         Question text
   *         <svg class="faq-item__icon">...</svg>
   *       </button>
   *       <div class="faq-item__answer" id="faq-1">
   *         <div class="faq-item__answer-inner">Answer text</div>
   *       </div>
   *     </div>
   *   </div>
   */
  function initFAQAccordion() {
    document.addEventListener("click", (event) => {
      const question = event.target.closest(".faq-item__question");
      if (!question) return;

      const answer = document.getElementById(question.getAttribute("aria-controls"));
      const isOpen = question.getAttribute("aria-expanded") === "true";

      question.setAttribute("aria-expanded", String(!isOpen));
      if (answer) {
        answer.style.maxHeight = isOpen ? "0px" : `${answer.scrollHeight}px`;
      }
    });
  }

  /**
   * Boots every shared module once the DOM is ready. Order matters:
   * navigation must inject the header/footer before search.js looks for
   * the search input inside it.
   */
  function init() {
    Theme.initThemeToggle();
    Navigation.init();
    Search.init();
    initCopyButtons();
    initPrintButtons();
    initShareButtons();
    initFAQAccordion();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
