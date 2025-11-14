import { readFileSync } from 'fs';
import { rmSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

// Load configuration
const config = JSON.parse(readFileSync('build.config.json', 'utf8'));

console.log('Starting cleanup process...\n');

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

// Note: We do NOT remove ./assets in root as it may contain other assets

console.log('\n✓ Cleanup completed successfully!');

