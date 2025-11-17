import { readdirSync, statSync, copyFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';

/**
 * Recursively copies assets from source directory to destination directory
 * @param {string} sourceDir - Source directory path
 * @param {string} destDir - Destination directory path
 */
export function copyAssets(sourceDir, destDir) {
  if (!existsSync(sourceDir)) {
    console.log(`⚠ Source directory does not exist: ${sourceDir}`);
    return;
  }

  if (!existsSync(destDir)) {
    mkdirSync(destDir, { recursive: true });
    console.log(`✓ Created directory: ${destDir}`);
  }

  function copyRecursive(src, dest) {
    const entries = readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = join(src, entry.name);
      const destPath = join(dest, entry.name);

      if (entry.isDirectory()) {

        if (!existsSync(destPath)) {
          mkdirSync(destPath, { recursive: true });
        }
        copyRecursive(srcPath, destPath);
      } else {
        copyFileSync(srcPath, destPath);
        console.log(`✓ Copied: ${entry.name}`);
      }
    }
  }

  console.log(`\nCopying assets from ${sourceDir} to ${destDir}...`);
  copyRecursive(sourceDir, destDir);
  console.log(`✓ Assets copied successfully\n`);
}

/**
 * Copies assets for a specific post
 * @param {string} postId - Post ID
 * @param {string} assetsSourceDir - Source directory for assets (e.g., buildable-drafts/assets/)
 * @param {string} assetsOutputDir - Output directory for assets (e.g., posts/assets/)
 */
export function copyPostAssets(postId, assetsSourceDir, assetsOutputDir) {
  const postAssetsSource = join(assetsSourceDir, postId);
  const postAssetsDest = join(assetsOutputDir, postId);

  if (!existsSync(postAssetsSource)) {
    // No assets for this post, skip silently
    return;
  }

  if (!existsSync(assetsOutputDir)) {
    mkdirSync(assetsOutputDir, { recursive: true });
  }

  function copyRecursive(src, dest) {
    if (!existsSync(dest)) {
      mkdirSync(dest, { recursive: true });
    }

    const entries = readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = join(src, entry.name);
      const destPath = join(dest, entry.name);

      if (entry.isDirectory()) {
        if (!existsSync(destPath)) {
          mkdirSync(destPath, { recursive: true });
        }
        copyRecursive(srcPath, destPath);
      } else {
        copyFileSync(srcPath, destPath);
      }
    }
  }

  copyRecursive(postAssetsSource, postAssetsDest);
  console.log(`✓ Copied assets for post: ${postId}`);
}

