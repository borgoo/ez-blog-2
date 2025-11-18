import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { loadPublishablePostsFromFile, loadPostsFromFile, getPublishablePosts } from '../utils/postsLoader.js';
import { formatDate, getRelativeTime, escapeHtml } from '../utils/formatUtils.js';
import { generateHeader, generateFooter } from '../utils/templateUtils.js';
import { loadTimestamps, updatePostTimestamp, needsRegeneration } from '../utils/buildTimestamps.js';
import { copyPostAssets } from './copyAssets.js';

// ANSI color codes for console output
const RED = '\x1b[31m';
const RESET = '\x1b[0m';

/**
 * Generates static HTML pages for all publishable posts
 * @param {Object} config - The build configuration object
 * @param {Object} options - Generation options
 * @param {boolean} options.incremental - If true, only generate new/edited posts
 * @param {string|null} options.forceId - If provided, force generation of this specific post ID
 * @returns {Object} Object with generated count and whether any posts were generated
 */
export function generateAllPosts(config, options = {}) {
  const { paths } = config;
  const { incremental = false, forceId = null } = options;

  // Load all posts to check for future-dated ones
  const allPosts = loadPostsFromFile(paths.postsDb, readFileSync);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check for future-dated posts and display warnings
  const futurePosts = allPosts.filter(post => {
    if (!post.createdDate) {
      return false;
    }
    const postDate = new Date(post.createdDate);
    postDate.setHours(0, 0, 0, 0);
    return postDate > today;
  });

  if (futurePosts.length > 0) {
    console.log(`\n${RED}⚠ WARNING: The following post(s) will NOT be published (date > current date):${RESET}`);
    futurePosts.forEach(post => {
      console.log(`${RED}  - "${post.title}" (ID: ${post.id}, Date: ${post.createdDate})${RESET}`);
    });
    console.log('');
  }

  // Get only publishable posts for generation
  const posts = getPublishablePosts(allPosts);
  
  console.log(`Found ${posts.length} publishable post(s)`);

  const postsOutputDir = join(paths.outputDir, paths.postsDir);
  if (!existsSync(postsOutputDir)) {
    mkdirSync(postsOutputDir, { recursive: true });
    console.log(`✓ Created directory: ${postsOutputDir}`);
  }

  // Load timestamps if doing incremental build
  const timestamps = incremental ? loadTimestamps() : {};
  let generatedCount = 0;
  let needsRegen = false;

  posts.forEach(post => {
    const lastBuildTimestamp = timestamps[post.id] || null;
    const shouldGenerate = forceId === post.id || 
                          !incremental || 
                          needsRegeneration(post, paths.draftsDir, lastBuildTimestamp);

    if (shouldGenerate) {
      // Copy assets for this post
      const postsAssetsDir = join(paths.outputDir, paths.postsDir, 'assets');
      copyPostAssets(post.id, paths.assetsSourceDir, postsAssetsDir);
      
      // Check if preview image exists in source (it will be copied with assets)
      const previewImageSourcePath = join(paths.assetsSourceDir, post.id, 'preview.webp');
      const hasPreviewImage = existsSync(previewImageSourcePath);
      
      const html = generatePostHtml(post, config, paths.draftsDir, paths, hasPreviewImage);
      const outputPath = join(postsOutputDir, `${post.id}.html`);
      
      const outputDir = dirname(outputPath);
      if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
      }
      
      writeFileSync(outputPath, html, 'utf8');
      updatePostTimestamp(post.id);
      console.log(`✓ Generated ${outputPath}`);
      generatedCount++;
      needsRegen = true;
    } else {
      console.log(`❑ Skipped ${post.id} (no changes detected)`);
    }
  });

  return {
    generatedCount,
    needsRegen
  };
}

function generatePostHtml(post, config, draftsDir, paths, hasPreviewImage = false) {
  
  const contentFilePath = join(draftsDir, post.contentFile);
  const postContent = readFileSync(contentFilePath, 'utf8');
  
  const createdDate = formatDate(post.createdDate);
  const createdRelative = getRelativeTime(post.createdDate);
  const updatedDate = post.updatedDate ? formatDate(post.updatedDate) : createdDate;
  const updatedRelative = post.updatedDate ? getRelativeTime(post.updatedDate) : null;
  const showUpdated = post.updatedDate && post.createdDate !== post.updatedDate;
  
  // Generate preview image URL if it exists
  const previewImageUrl = hasPreviewImage 
    ? `${config.blog.baseUrl}posts/assets/${post.id}/preview.webp`
    : null;
  
  const postHtml = `
    <header class="post__header">
      <h1>${escapeHtml(post.title)}</h1>
      <p class="post__subtitle">${escapeHtml(post.subtitle)}</p>
      <div class="post__meta">
        <span class="post__meta-item">
          <time datetime="${post.createdDate}">${createdDate} (${createdRelative})</time>
        </span>
        ${showUpdated ? `
          <span class="post__meta-item">
            <span>Updated: ${updatedDate} (${updatedRelative})</span>
          </span>
        ` : ''}
        <span class="post__meta-item">
          <span>${escapeHtml(post.authorNickname || post.author)}</span>
        </span>
      </div>
    </header>
    <div class="post__content">
      ${postContent}
    </div>
    <div class="post__footer">
      <a href="../${config.meta.blogLogoLink}" class="go-back"> Go back</a>
    </div>
  `;

  const html = `<!DOCTYPE html>
<html lang="${config.meta.language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Primary Meta Tags -->
  <title>${escapeHtml(post.title)} - ${config.blog.title}</title>
  <link rel="icon" type="image/x-icon" href="../${config.meta.favicon}">
  <meta name="title" content="${escapeHtml(post.title)} - ${config.blog.title}">
  <meta name="description" content="${escapeHtml(post.abstract || post.subtitle)}">
  <meta name="author" content="${escapeHtml(post.author || config.blog.author.name)}">
  
  <!-- Canonical URL -->
  <link rel="canonical" href="${config.blog.baseUrl}posts/${post.id}.html">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="${config.blog.baseUrl}posts/${post.id}.html">
  <meta property="og:title" content="${escapeHtml(post.title)} - ${config.blog.title}">
  <meta property="og:description" content="${escapeHtml(post.abstract || post.subtitle)}">
  <meta property="og:site_name" content="${config.blog.title}">
  ${previewImageUrl ? `<meta property="og:image" content="${previewImageUrl}">` : ''}
  <meta property="article:published_time" content="${post.createdDate}">
  ${post.updatedDate ? `<meta property="article:modified_time" content="${post.updatedDate}">` : ''}
  <meta property="article:author" content="${escapeHtml(post.author || config.blog.author.name)}">
  
  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="${config.blog.baseUrl}posts/${post.id}.html">
  <meta property="twitter:title" content="${escapeHtml(post.title)} - ${config.blog.title}">
  <meta property="twitter:description" content="${escapeHtml(post.abstract || post.subtitle)}">
  ${previewImageUrl ? `<meta property="twitter:image" content="${previewImageUrl}">` : ''}
  
  <link rel="stylesheet" href="../${config.meta.headerStylesheet}">
  <link rel="stylesheet" href="../${config.meta.stylesheet}">
  <script src="../${config.meta.themeInitScript}"></script>

</head>
<body>
${generateHeader(config, { isHomepage: false, showGoBack: true })}

  <main class="container">
    <article id="article-${post.id}">
      ${postHtml}
    </article>
  </main>

${generateFooter(config)}
  
  <script src="../${config.meta.themeScript}"></script>
  <script src="../${config.meta.simpleSliderScript}"></script>
</body>
</html>`;

  return html;
}