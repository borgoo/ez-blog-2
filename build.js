import { readFileSync } from 'fs';
import { join } from 'path';
import { generateIndexHtml } from './js/generators/generateIndex.js';
import { generateAllPosts } from './js/generators/generateAllPosts.js';
import { copyAssets } from './js/generators/copyAssets.js';
import { generateRobots } from './js/generators/generateRobots.js';
import { generateSitemap } from './js/generators/generateSitemap.js';

// Parse command line arguments
const args = process.argv.slice(2);
const indexOnly = args.includes('--index-only') || args.includes('-i');

// Load configuration
const config = JSON.parse(readFileSync('build.config.json', 'utf8'));

console.log('Starting build process...\n');

if (indexOnly) {
  console.log('Mode: Index only\n');
  generateIndexHtml(config);
} else {
  // Full build
  // Copy assets to posts/assets/images (for post-specific assets)
  // Structure: posts/assets/images/{id}/...
  const postsAssetsDir = join(config.paths.outputDir, config.paths.postsDir, 'assets', 'images');
  copyAssets(config.paths.assetsSourceDir, postsAssetsDir);
  
  // Copy data directory to posts/data
  const postsDataDir = join(config.paths.outputDir, config.paths.postsDir, 'data');
  const dataSourceDir = join(config.paths.draftsDir, 'data');
  copyAssets(dataSourceDir, postsDataDir);
  
  generateIndexHtml(config);
  generateAllPosts(config);
  
  generateRobots(config);
  generateSitemap(config);
}

console.log('\n✓ Build completed successfully!');
