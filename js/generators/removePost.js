import { unlinkSync, existsSync, rmSync } from 'fs';
import { join } from 'path';
import { removePostTimestamp } from '../utils/buildTimestamps.js';

/**
 * Removes a post and its associated files
 * @param {string} postId - Post ID to remove
 * @param {Object} config - The build configuration object
 */
export function removePost(postId, config) {
  const { paths } = config;
  
  // Remove HTML file
  const htmlPath = join(paths.outputDir, paths.postsDir, `${postId}.html`);
  if (existsSync(htmlPath)) {
    unlinkSync(htmlPath);
    console.log(`✓ Removed ${htmlPath}`);
  } else {
    console.log(`⚠ Post HTML file not found: ${htmlPath}`);
  }
  
  // Remove assets directory
  const assetsPath = join(paths.outputDir, paths.postsDir, 'assets', postId);
  if (existsSync(assetsPath)) {
    rmSync(assetsPath, { recursive: true, force: true });
    console.log(`✓ Removed assets directory: ${assetsPath}`);
  }
  
  // Remove from timestamps
  removePostTimestamp(postId);
  console.log(`✓ Removed timestamp for ${postId}`);
  
  console.log(`\n✓ Post "${postId}" removed successfully`);
}

