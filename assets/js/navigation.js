/* ==========================================================================
   NAVIGATION.JS
   Builds and injects the global header, primary navigation, and footer
   from a single source of truth (SITE.categories). Because there is no
   backend, no templating engine, and no build step, this is how the site
   avoids duplicating header/footer markup across 10,000+ static HTML
   files: every page just includes two empty mount points —

     <div id="site-header"></div>
     ... page content ...
     <div id="site-footer"></div>

   — and this script fills them in. Updating the nav or footer site-wide
   means editing this one file, not 10,000 HTML files.

   Also handles: mobile drawer menu, sticky header shadow-on-scroll,
   breadcrumb rendering, and the scroll-to-top button.
   ========================================================================== */

const SITE = {
  name: "UtilityHub",
  url: "https://example.com", // TODO: replace with the real production domain
  description: "Fast, free, browser-based calculators and everyday tools.",

  /**
   * Single source of truth for the site taxonomy. Mirrors the top-level
   * folder structure decided in Phase 1. Every page (nav, footer,
   * homepage category grid, breadcrumbs, search index) reads from here.
   */
  categories: [
    { name: "Calculators", slug: "calculators", icon: "calculator", description: "Everyday math, health, and life calculators." },
    { name: "Converters", slug: "converters", icon: "swap", description: "Convert units, currencies, and measurements." },
    { name: "Developer Tools", slug: "developer-tools", icon: "code", description: "Formatters, encoders, and utilities for developers." },
    { name: "Text Tools", slug: "text-tools", icon: "text", description: "Word counters, case converters, and text utilities." },
    { name: "Image Tools", slug: "image-tools", icon: "image", description: "Compress, resize, and convert images in your browser." },
    { name: "PDF Tools", slug: "pdf-tools", icon: "pdf", description: "Merge, split, and convert PDF files for free." },
    { name: "Finance", slug: "finance", icon: "finance", description: "Loan, mortgage, and investment calculators." },
    { name: "Health", slug: "health", icon: "health", description: "BMI, calorie, and wellness calculators." },
  ],

  social: [
    { name: "Twitter / X", url: "https://twitter.com/", icon: "twitter" },
    { name: "Facebook", url: "https://facebook.com/", icon: "facebook" },
    { name: "YouTube", url: "https://youtube.com/", icon: "youtube" },
    { name: "GitHub", url: "https://github.com/", icon: "github" },
  ],
};

const Navigation = (() => {
  /** Resolves the correct relative prefix ("./", "../", "../../") so the
   *  same injected markup works whether the page lives at the root or
   *  inside a category folder. Each page sets `window.PAGE_ROOT` before
   *  loading navigation.js (e.g. "../" from /calculators/bmi.html). */
  function rootPath() {
    return typeof window.PAGE_ROOT === "string" ? window.PAGE_ROOT : "./";
  }

  function headerTemplate() {
    const root = rootPath();
    const navLinks = SITE.categories
      .map(
        (cat) => `
        <li>
          <a class="site-nav__link" href="${root}${cat.slug}/index.html">${cat.name}</a>
        </li>`
      )
      .join("");

    return `
      <div class="container site-header__bar">
        <a class="site-logo" href="${root}index.html" aria-label="${SITE.name} home">
          <span class="site-logo__mark" aria-hidden="true"></span>
          ${SITE.name}
        </a>

        <nav class="site-nav" id="site-nav" aria-label="Primary">
          <ul class="site-nav__list">${navLinks}</ul>
        </nav>

        <div class="site-header__search cluster" style="flex:1; max-width:360px;">
          <div class="search-box">
            <div class="search-box__field">
              <svg class="search-box__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/><path d="m20 20-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              <input type="search" class="search-box__input" id="site-search-input"
                     placeholder="Search 10,000+ tools..." aria-label="Search tools"
                     autocomplete="off">
            </div>
            <div class="search-box__results" id="site-search-results" role="listbox"></div>
          </div>
        </div>

        <button class="theme-toggle" type="button" aria-pressed="false" aria-label="Switch to dark mode">
          <svg class="icon-sun" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          <svg class="icon-moon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
        </button>

        <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="Open menu">
          <span class="nav-toggle__icon" aria-hidden="true"></span>
        </button>
      </div>`;
  }

  function footerTemplate() {
    const root = rootPath();
    const year = new Date().getFullYear();

    const categoryLinks = SITE.categories
      .map((cat) => `<li><a href="${root}${cat.slug}/index.html">${cat.name}</a></li>`)
      .join("");

    const socialLinks = SITE.social
      .map(
        (s) => `
        <a class="site-footer__social-link" href="${s.url}" rel="noopener" target="_blank" aria-label="${s.name}">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/></svg>
        </a>`
      )
      .join("");

    return `
      <div class="container site-footer__top">
        <div class="site-footer__brand">
          <a class="site-logo" href="${root}index.html">
            <span class="site-logo__mark" aria-hidden="true"></span>
            ${SITE.name}
          </a>
          <p class="site-footer__tagline">${SITE.description}</p>
          <div class="site-footer__socials">${socialLinks}</div>
        </div>

        <div>
          <div class="site-footer__heading">Tool Categories</div>
          <ul class="site-footer__list">${categoryLinks}</ul>
        </div>

        <div>
          <div class="site-footer__heading">Company</div>
          <ul class="site-footer__list">
            <li><a href="${root}about.html">About</a></li>
            <li><a href="${root}contact.html">Contact</a></li>
            <li><a href="${root}privacy.html">Privacy Policy</a></li>
          </ul>
        </div>

        <div>
          <div class="site-footer__heading">Legal</div>
          <ul class="site-footer__list">
            <li><a href="${root}privacy.html#disclaimer">Disclaimer</a></li>
            <li><a href="${root}privacy.html">Terms &amp; Privacy</a></li>
          </ul>
        </div>
      </div>

      <div class="container site-footer__bottom">
        <span>&copy; ${year} ${SITE.name}. All rights reserved.</span>
        <span>Built with HTML, CSS &amp; JavaScript — no tracking beyond standard analytics.</span>
      </div>`;
  }

  function injectHeader() {
    const mount = document.getElementById("site-header");
    if (!mount) return;
    mount.classList.add("site-header");
    mount.innerHTML = headerTemplate();
  }

  function injectFooter() {
    const mount = document.getElementById("site-footer");
    if (!mount) return;
    mount.classList.add("site-footer");
    mount.innerHTML = footerTemplate();
  }

  /** Highlights the nav link matching the current page's category. */
  function markActiveNavLink() {
    const links = Utils.qsa(".site-nav__link");
    const path = window.location.pathname;
    links.forEach((link) => {
      const linkPath = new URL(link.href, window.location.origin).pathname;
      if (path === linkPath || path.startsWith(linkPath.replace("index.html", ""))) {
        link.setAttribute("aria-current", "page");
      }
    });
  }

  function initMobileMenu() {
    const toggle = Utils.qs(".nav-toggle");
    const nav = Utils.qs("#site-nav");
    if (!toggle || !nav) return;

    const closeMenu = () => {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
      nav.classList.remove("is-open");
      document.body.style.overflow = "";
    };

    const openMenu = () => {
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close menu");
      nav.classList.add("is-open");
      document.body.style.overflow = "hidden";
    };

    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      isOpen ? closeMenu() : openMenu();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });

    // Close the drawer automatically once the viewport grows past mobile.
    window.addEventListener(
      "resize",
      Utils.debounce(() => {
        if (window.innerWidth >= 900) closeMenu();
      }, 150)
    );
  }

  function initStickyHeader() {
    const header = Utils.qs(".site-header");
    if (!header) return;

    const onScroll = Utils.throttle(() => {
      header.classList.toggle("is-scrolled", window.scrollY > 4);
    }, 100);

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /**
   * Renders breadcrumbs into any element with [data-breadcrumbs].
   * Each page defines its own trail before this script runs:
   *
   *   window.PAGE_BREADCRUMB = [
   *     { label: "Calculators", href: "../calculators/index.html" },
   *     { label: "BMI Calculator" } // current page — no href
   *   ];
   *
   * "Home" is always prepended automatically. Structured data (BreadcrumbList
   * JSON-LD) is generated separately in the SEO phase from this same array.
   */
  function initBreadcrumbs() {
    const mount = Utils.qs("[data-breadcrumbs]");
    if (!mount) return;

    const root = rootPath();
    const trail = Array.isArray(window.PAGE_BREADCRUMB) ? window.PAGE_BREADCRUMB : [];
    const items = [{ label: "Home", href: `${root}index.html` }, ...trail];

    const listItems = items
      .map((item, index) => {
        const isLast = index === items.length - 1;
        if (isLast || !item.href) {
          return `<li aria-current="page">${Utils.escapeHTML(item.label)}</li>`;
        }
        return `<li><a href="${item.href}">${Utils.escapeHTML(item.label)}</a></li>`;
      })
      .join("");

    mount.innerHTML = `<ol class="breadcrumbs__list">${listItems}</ol>`;
  }

  function initScrollToTop() {
    let btn = Utils.qs(".scroll-top-btn");
    if (!btn) {
      btn = document.createElement("button");
      btn.className = "scroll-top-btn";
      btn.type = "button";
      btn.setAttribute("aria-label", "Back to top");
      btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      document.body.appendChild(btn);
    }

    const onScroll = Utils.throttle(() => {
      btn.classList.toggle("is-visible", window.scrollY > 480);
    }, 100);

    window.addEventListener("scroll", onScroll, { passive: true });
    btn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function init() {
    injectHeader();
    injectFooter();
    markActiveNavLink();
    initMobileMenu();
    initStickyHeader();
    initBreadcrumbs();
    initScrollToTop();
  }

  return {
    init,
    injectHeader,
    injectFooter,
    initBreadcrumbs,
  };
})();
