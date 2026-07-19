/* ==========================================================================
   UTILS.JS
   Small, dependency-free helper functions reused across the whole site.
   Every future tool page (calculators, converters, etc.) can rely on these
   instead of re-implementing them. Exposed on a single global namespace,
   `Utils`, to avoid polluting the global scope with dozens of functions.
   ========================================================================== */

const Utils = (() => {
  /**
   * Shorthand query selector.
   * @param {string} selector
   * @param {ParentNode} [scope]
   * @returns {Element|null}
   */
  function qs(selector, scope = document) {
    return scope.querySelector(selector);
  }

  /**
   * Shorthand query selector returning a real array (not a NodeList).
   * @param {string} selector
   * @param {ParentNode} [scope]
   * @returns {Element[]}
   */
  function qsa(selector, scope = document) {
    return Array.from(scope.querySelectorAll(selector));
  }

  /**
   * Debounce: delays invoking `fn` until `wait` ms have passed since the
   * last call. Used for search input and scroll/resize handlers.
   * @param {Function} fn
   * @param {number} wait
   * @returns {Function}
   */
  function debounce(fn, wait = 200) {
    let timerId;
    return function debounced(...args) {
      clearTimeout(timerId);
      timerId = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  /**
   * Throttle: ensures `fn` runs at most once every `limit` ms.
   * Used for high-frequency scroll listeners (sticky header, scroll-to-top).
   * @param {Function} fn
   * @param {number} limit
   * @returns {Function}
   */
  function throttle(fn, limit = 150) {
    let inThrottle = false;
    return function throttled(...args) {
      if (inThrottle) return;
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => { inThrottle = false; }, limit);
    };
  }

  /**
   * Copies a string to the clipboard, with a graceful fallback for
   * browsers/contexts where the async Clipboard API is unavailable.
   * @param {string} text
   * @returns {Promise<boolean>} resolves true on success
   */
  async function copyToClipboard(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      // Fallback: hidden textarea + execCommand for older/insecure contexts
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand("copy");
      document.body.removeChild(textarea);
      return success;
    } catch (err) {
      console.error("Utils.copyToClipboard failed:", err);
      return false;
    }
  }

  /**
   * Triggers the browser print dialog for the current page.
   */
  function printPage() {
    window.print();
  }

  /**
   * Shares content via the native Web Share API when available, otherwise
   * falls back to copying the URL to the clipboard.
   * @param {{title?: string, text?: string, url?: string}} data
   * @returns {Promise<"shared"|"copied"|"failed">}
   */
  async function shareContent(data = {}) {
    const payload = {
      title: data.title || document.title,
      text: data.text || "",
      url: data.url || window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(payload);
        return "shared";
      } catch (err) {
        // User cancelled the share sheet — not an error we need to surface.
        if (err.name === "AbortError") return "failed";
      }
    }

    const copied = await copyToClipboard(payload.url);
    return copied ? "copied" : "failed";
  }

  /**
   * Formats a number with locale-aware thousands separators.
   * @param {number} num
   * @param {number} [decimals]
   * @returns {string}
   */
  function formatNumber(num, decimals = 2) {
    if (typeof num !== "number" || Number.isNaN(num)) return "";
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    });
  }

  /**
   * Safe localStorage getter — never throws (private browsing, quota, etc.).
   * @param {string} key
   * @returns {string|null}
   */
  function storageGet(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (err) {
      return null;
    }
  }

  /**
   * Safe localStorage setter — never throws.
   * @param {string} key
   * @param {string} value
   * @returns {boolean}
   */
  function storageSet(key, value) {
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch (err) {
      return false;
    }
  }

  /**
   * Clamp a number between a min and max.
   */
  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * Escapes HTML special characters to prevent injection when inserting
   * user-provided or dynamic strings into innerHTML.
   * @param {string} str
   * @returns {string}
   */
  function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = String(str ?? "");
    return div.innerHTML;
  }

  return {
    qs,
    qsa,
    debounce,
    throttle,
    copyToClipboard,
    printPage,
    shareContent,
    formatNumber,
    storageGet,
    storageSet,
    clamp,
    escapeHTML,
  };
})();
