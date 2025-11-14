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

