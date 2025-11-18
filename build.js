import { readFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { generateIndexHtml } from './js/generators/generateIndex.js';
import { generateAllPosts } from './js/generators/generateAllPosts.js';
import { copyAssets } from './js/generators/copyAssets.js';
import { generateRobots } from './js/generators/generateRobots.js';
import { generateSitemap } from './js/generators/generateSitemap.js';
import { removePost } from './js/generators/removePost.js';

// Parse command line arguments
const args = process.argv.slice(2);
const indexOnly = args.includes('--index-only') || args.includes('-i');

// Check for --id flag
const idIndex = args.findIndex(arg => arg === '--id' || arg === '-id');
const forceId = idIndex !== -1 && args[idIndex + 1] ? args[idIndex + 1] : null;

// Check for --remove flag
const removeIndex = args.findIndex(arg => arg === '--remove' || arg === '-r');
const removeId = removeIndex !== -1 && args[removeIndex + 1] ? args[removeIndex + 1] : null;

// Check for --remove-all flag
const removeAll = args.includes('--remove-all') || args.includes('-ra');

// Validate arguments - check for unknown parameters
const validFlags = ['--index-only', '-i', '--id', '-id', '--remove', '-r', '--remove-all', '-ra'];
const usedIndices = new Set();
if (indexOnly) {
  usedIndices.add(args.indexOf('--index-only') !== -1 ? args.indexOf('--index-only') : args.indexOf('-i'));
}
if (idIndex !== -1) {
  usedIndices.add(idIndex);
  usedIndices.add(idIndex + 1); // The value after --id
}
if (removeIndex !== -1) {
  usedIndices.add(removeIndex);
  usedIndices.add(removeIndex + 1); // The value after --remove
}
if (removeAll) {
  usedIndices.add(args.indexOf('--remove-all') !== -1 ? args.indexOf('--remove-all') : args.indexOf('-ra'));
}

// Check for unknown arguments
const unknownArgs = args.filter((arg, index) => !usedIndices.has(index));
if (unknownArgs.length > 0) {
  console.error('\nError: Unknown parameter(s):', unknownArgs.join(', '));
  console.error('\nValid parameters:');
  console.error('  --index-only, -i          Force generation of index.html');
  console.error('  --id <post-id>, -id <post-id>  Force generation of specific post');
  console.error('  --remove <post-id>, -r <post-id>  Remove specific post');
  console.error('  --remove-all, -ra        Remove all generated files');
  process.exit(1);
}

// Load configuration
const config = JSON.parse(readFileSync('build.config.json', 'utf8'));

console.log('Starting build process...\n');

// Handle remove-all (clean all generated files)
if (removeAll) {
  console.log('Mode: Remove all generated files\n');
  
  // Remove index.html
  const indexPath = join(config.paths.outputDir, 'index.html');
  if (existsSync(indexPath)) {
    rmSync(indexPath);
    console.log(`✓ Removed ${indexPath}`);
  } else {
    console.log(`⚠ ${indexPath} does not exist`);
  }

  // Remove robots.txt
  const robotsPath = join(config.paths.outputDir, 'robots.txt');
  if (existsSync(robotsPath)) {
    rmSync(robotsPath);
    console.log(`✓ Removed ${robotsPath}`);
  } else {
    console.log(`⚠ ${robotsPath} does not exist`);
  }

  // Remove sitemap.xml
  const sitemapPath = join(config.paths.outputDir, 'sitemap.xml');
  if (existsSync(sitemapPath)) {
    rmSync(sitemapPath);
    console.log(`✓ Removed ${sitemapPath}`);
  } else {
    console.log(`⚠ ${sitemapPath} does not exist`);
  }

  // Remove posts directory (this includes posts/assets)
  const postsDir = join(config.paths.outputDir, config.paths.postsDir);
  if (existsSync(postsDir)) {
    rmSync(postsDir, { recursive: true, force: true });
    console.log(`✓ Removed directory: ${postsDir}`);
  } else {
    console.log(`⚠ ${postsDir} does not exist`);
  }

  // Remove build timestamps file
  const timestampsPath = '.build-timestamps.json';
  if (existsSync(timestampsPath)) {
    rmSync(timestampsPath);
    console.log(`✓ Removed ${timestampsPath}`);
  }

  // Note: We do NOT remove ./assets in root as it may contain other assets

  console.log('\n✓ Cleanup completed successfully!');
  process.exit(0);
}

// Handle post removal
if (removeId) {
  console.log(`Mode: Remove post "${removeId}"\n`);
  removePost(removeId, config);
  console.log('\n✓ Build completed successfully!');
  process.exit(0);
}

// Handle index-only mode (force index generation)
if (indexOnly) {
  console.log('Mode: Index only (forced)\n');
  generateIndexHtml(config);
  console.log('\n✓ Build completed successfully!');
  process.exit(0);
}

// Handle force generation of specific post
if (forceId) {
  console.log(`Mode: Force generation of post "${forceId}"\n`);
  
  // Copy data directory to posts/data
  const postsDataDir = join(config.paths.outputDir, config.paths.postsDir, 'data');
  const dataSourceDir = join(config.paths.draftsDir, 'data');
  copyAssets(dataSourceDir, postsDataDir);
  
  const result = generateAllPosts(config, { incremental: false, forceId });
  
  // Always regenerate index, robots, and sitemap when forcing a post
  if (result.needsRegen || result.generatedCount > 0) {
    generateIndexHtml(config);
    generateRobots(config);
    generateSitemap(config);
  }
  
  console.log('\n✓ Build completed successfully!');
  process.exit(0);
}

// Full incremental build
console.log('Mode: Incremental build\n');

// Copy data directory to posts/data
const postsDataDir = join(config.paths.outputDir, config.paths.postsDir, 'data');
const dataSourceDir = join(config.paths.draftsDir, 'data');
copyAssets(dataSourceDir, postsDataDir);

// Generate posts incrementally (assets will be copied per-post)
const result = generateAllPosts(config, { incremental: true, forceId: null });

// If any posts were generated or need regeneration, update index, robots, and sitemap
if (result.needsRegen || result.generatedCount > 0) {
  console.log(`\n${result.generatedCount} post(s) generated, updating index, robots, and sitemap...`);
  generateIndexHtml(config);
  generateRobots(config);
  generateSitemap(config);
} else {
  console.log('\nNo posts needed regeneration. Skipping index, robots, and sitemap.');
}

console.log('\n✓ Build completed successfully!');