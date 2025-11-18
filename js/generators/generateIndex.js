import { writeFileSync } from 'fs';
import { join } from 'path';
import { generateHeader, generateFooter } from '../utils/templateUtils.js';

/**
 * Generates the static index.html page based on the configuration
 * @param {Object} config - The build configuration object
 */
export function generateIndexHtml(config) {
  const { blog, meta, structuredData, paths } = config;
  
  const html = `<!DOCTYPE html>
<html lang="${meta.language}">
<head>
  <meta charset="${meta.charset}">
  <meta name="viewport" content="${meta.viewport}">
  
  <!-- Primary Meta Tags -->
  <title>${meta.title}</title>

  <meta name="title" content="${meta.title}">
  <meta name="description" content="${meta.description}">
  <meta name="author" content="${meta.author}">
  <meta name="keywords" content="${meta.keywords}">
  <meta name="robots" content="${meta.robots}">
  <meta name="language" content="${meta.language}">
  <meta name="revisit-after" content="${meta.revisitAfter}">
  
  <!-- Canonical URL -->
  <link rel="canonical" href="${meta.canonical}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="${meta.openGraph.type}">
  <meta property="og:url" content="${meta.openGraph.url}">
  <meta property="og:title" content="${meta.openGraph.title}">
  <meta property="og:description" content="${meta.openGraph.description}">
  <meta property="og:site_name" content="${meta.openGraph.siteName}">
  
  <!-- Twitter -->
  <meta property="twitter:card" content="${meta.twitter.card}">
  <meta property="twitter:url" content="${meta.twitter.url}">
  <meta property="twitter:title" content="${meta.twitter.title}">
  <meta property="twitter:description" content="${meta.twitter.description}">
  
  <link rel="icon" type="image/x-icon" href="${meta.favicon}">
  
  <link rel="stylesheet" href="${meta.headerStylesheet}">
  <link rel="stylesheet" href="${meta.stylesheet}">
  <script src="${meta.themeInitScript}"></script>

</head>
<body>
${generateHeader(config, { isHomepage: true })}

  <main class="container">
    <div id="posts-container" class="posts">
      <div class="skeleton skeleton-item">
        <div class="skeleton-meta">
          <div class="skeleton-meta-item"></div>
          <div class="skeleton-meta-item"></div>
          <div class="skeleton-meta-item"></div>
        </div>
        <div class="skeleton-title"></div>
        <div class="skeleton-subtitle"></div>
        <div class="skeleton-abstract"></div>
        <div class="skeleton-abstract"></div>
        <div class="skeleton-abstract"></div>
        <div class="skeleton-read-more"></div>
      </div>
      <div class="skeleton skeleton-item">
        <div class="skeleton-meta">
          <div class="skeleton-meta-item"></div>
          <div class="skeleton-meta-item"></div>
          <div class="skeleton-meta-item"></div>
        </div>
        <div class="skeleton-title"></div>
        <div class="skeleton-subtitle"></div>
        <div class="skeleton-abstract"></div>
        <div class="skeleton-abstract"></div>
        <div class="skeleton-abstract"></div>
        <div class="skeleton-read-more"></div>
      </div>
      <div class="skeleton skeleton-item">
        <div class="skeleton-meta">
          <div class="skeleton-meta-item"></div>
          <div class="skeleton-meta-item"></div>
          <div class="skeleton-meta-item"></div>
        </div>
        <div class="skeleton-title"></div>
        <div class="skeleton-subtitle"></div>
        <div class="skeleton-abstract"></div>
        <div class="skeleton-abstract"></div>
        <div class="skeleton-abstract"></div>
        <div class="skeleton-read-more"></div>
      </div>
    </div>
  </main>

${generateFooter(config)}

  <!-- Structured Data (JSON-LD) -->
  <script type="application/ld+json">
  ${JSON.stringify(structuredData, null, 2)}
  </script>

  <script src="${meta.themeScript}"></script>
  <script type="module" src="${meta.mainScript}"></script>
</body>
</html>
`;

  const outputPath = join(paths.outputDir, 'index.html');
  writeFileSync(outputPath, html, 'utf8');
  console.log(`✓ Generated ${outputPath}`);
}

