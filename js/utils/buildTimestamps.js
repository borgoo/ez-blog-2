import { readFileSync, writeFileSync, existsSync, statSync } from 'fs';
import { join } from 'path';

const TIMESTAMPS_FILE = '.build-timestamps.json';

/**
 * Loads build timestamps from file
 * @returns {Object} Object mapping post IDs to their last build timestamp
 */
export function loadTimestamps() {
  if (!existsSync(TIMESTAMPS_FILE)) {
    return {};
  }
  try {
    const content = readFileSync(TIMESTAMPS_FILE, 'utf8');
    return JSON.parse(content);
  } catch (e) {
    console.log('⚠ Could not read timestamps file, starting fresh');
    return {};
  }
}

/**
 * Saves build timestamps to file
 * @param {Object} timestamps - Object mapping post IDs to their last build timestamp
 */
export function saveTimestamps(timestamps) {
  writeFileSync(TIMESTAMPS_FILE, JSON.stringify(timestamps, null, 2), 'utf8');
}

/**
 * Updates the timestamp for a specific post
 * @param {string} postId - Post ID
 * @param {number} timestamp - Timestamp (defaults to current time)
 */
export function updatePostTimestamp(postId, timestamp = Date.now()) {
  const timestamps = loadTimestamps();
  timestamps[postId] = timestamp;
  saveTimestamps(timestamps);
}

/**
 * Gets the last build timestamp for a post
 * @param {string} postId - Post ID
 * @returns {number|null} Timestamp or null if not found
 */
export function getPostTimestamp(postId) {
  const timestamps = loadTimestamps();
  return timestamps[postId] || null;
}

/**
 * Gets the file modification time (mtime) in milliseconds
 * @param {string} filePath - Path to the file
 * @returns {number|null} File modification time or null if file doesn't exist
 */
export function getFileMtime(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }
  try {
    const stats = statSync(filePath);
    return stats.mtimeMs;
  } catch (e) {
    return null;
  }
}

/**
 * Checks if a post needs to be regenerated
 * @param {Object} post - Post object from DB_posts.js
 * @param {string} draftsDir - Directory containing draft files
 * @param {number|null} lastBuildTimestamp - Last build timestamp for this post
 * @returns {boolean} True if post needs regeneration
 */
export function needsRegeneration(post, draftsDir, lastBuildTimestamp) {
  // If no timestamp, it's a new post
  if (!lastBuildTimestamp) {
    return true;
  }

  // Check if updatedDate is newer than last build
  if (post.updatedDate) {
    const updatedDate = new Date(post.updatedDate);
    updatedDate.setHours(23, 59, 59, 999); // Set to end of day to ensure we catch same-day updates
    const updatedTimestamp = updatedDate.getTime();
    if (updatedTimestamp > lastBuildTimestamp) {
      return true;
    }
  }

  // Check if content file was modified after last build
  const contentFilePath = join(draftsDir, post.contentFile);
  const fileMtime = getFileMtime(contentFilePath);
  if (fileMtime && fileMtime > lastBuildTimestamp) {
    return true;
  }

  return false;
}

/**
 * Removes a post from timestamps tracking
 * @param {string} postId - Post ID to remove
 */
export function removePostTimestamp(postId) {
  const timestamps = loadTimestamps();
  delete timestamps[postId];
  saveTimestamps(timestamps);
}

