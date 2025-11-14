import { escapeHtml } from './formatUtils.js';

/**
 * Generates the header HTML for blog pages
 * @param {Object} config - The build configuration object
 * @param {Object} options - Options for header customization
 * @param {boolean} options.isHomepage - Whether this is the homepage
 * @param {boolean} options.showGoBack - Whether to show "Go back" link
 * @returns {string} Header HTML
 */
export function generateHeader(config, options = {}) {
  const { isHomepage = false, showGoBack = false } = options;
  const { blog, meta } = config;
  const logoPath = meta.logo;

  if (isHomepage) {
    return `
  <header class="header">
    <div class="header__content">
      <div class="header__logo-container">
        <a href="${meta.logoLink}" class="header__logo-icon-link">
          <img src="${logoPath}" alt="${escapeHtml(blog.author.name)}" class="header__logo-icon">
        </a>
        <div class="header__logo-wrapper-home">
          <a href="${meta.blogLogoLink}" class="header__logo header__logo--animated"><span class="first-letter">E</span>z &nbsp;<span class="first-letter">b</span>log</a>
          <a href="${meta.blogLogoLink}" class="header__title header__title--static">Blog</a>
        </div>
      </div>
      <div class="header__controls">
        <button id="theme-toggle" class="header__theme-toggle" aria-label="Toggle theme">🌙</button>
      </div>
    </div>
  </header>`;
  } else {
    return `
  <header class="header">
    <div class="header__content">
      <div class="header__logo-container">
        <a href="${meta.logoLink}" class="header__logo-icon-link">
          <img src="../${logoPath}" alt="${escapeHtml(blog.author.name)}" class="header__logo-icon">
        </a>
        <a href="${meta.blogLogoLink}" class="header__title">Blog</a>
      </div>
      <div class="header__controls">
        ${showGoBack ? `<a href="../${meta.blogLogoLink}" class="go-back"> Go back</a>` : ''}
        <button id="theme-toggle" class="header__theme-toggle" aria-label="Toggle theme">🌙</button>
      </div>
    </div>
  </header>`;
  }
}

/**
 * Generates the footer HTML for blog pages
 * @param {Object} config - The build configuration object
 * @returns {string} Footer HTML
 */
export function generateFooter(config) {
  const { blog, ezBlogGitHubRepo } = config;

  return `
  <footer class="footer">
    <a href="mailto:${blog.author.email}">Mail me</a>
    <a href="${blog.author.github}" target="_blank">Github</a>
    <a href="${blog.author.linkedin}" target="_blank">LinkedIn</a>
    <a href="${blog.author.website}" target="_blank">Website</a>
    <a href="${ezBlogGitHubRepo}" target="_blank">&copy; 2025 EZ Blog 2.0.</a>
  </footer>`;
}

