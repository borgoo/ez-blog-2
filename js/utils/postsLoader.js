/**
 * Utility functions for loading and filtering publishable posts
 */

/**
 * Filters and sorts posts to get only publishable ones
 * A post is publishable if:
 * - createdDate <= today
 * - updatedDate (if exists) <= today (posts with future updatedDate are not shown in index)
 * Sorts by updatedDate (or createdDate if no updatedDate) in descending order (newest first)
 * 
 * @param {Array} posts - Array of post objects
 * @param {Date} [referenceDate] - Optional reference date (defaults to today)
 * @returns {Array} Filtered and sorted array of publishable posts
 */
export function getPublishablePosts(posts, referenceDate = null) {
  const today = referenceDate || new Date();
  today.setHours(0, 0, 0, 0);

  const publishablePosts = posts.filter(post => {
    if (!post.createdDate) {
      return false; // Skip posts without createdDate
    }
    
    // Check createdDate
    const postDate = new Date(post.createdDate);
    postDate.setHours(0, 0, 0, 0);
    if (postDate > today) {
      return false; // Post not yet published
    }
    
    // Check updatedDate - if it exists and is in the future, don't show in index
    if (post.updatedDate) {
      const updatedDate = new Date(post.updatedDate);
      updatedDate.setHours(0, 0, 0, 0);
      if (updatedDate > today) {
        return false; // Post with future updatedDate should not appear in index
      }
    }
    
    return true;
  });

  publishablePosts.sort((a, b) => {
    const dateA = new Date(a.updatedDate || a.createdDate);
    const dateB = new Date(b.updatedDate || b.createdDate);
    return dateB - dateA;
  });

  return publishablePosts;
}

/**
 * Loads posts from DB_posts.js file (Node.js version)
 * @param {string} postsDbPath - Path to the DB_posts.js file
 * @param {Function} readFileSync - Node.js readFileSync function
 * @returns {Array} Array of all posts
 */
export function loadPostsFromFile(postsDbPath, readFileSync) {
  const content = readFileSync(postsDbPath, 'utf8');
  // DB_posts.js is a JavaScript file that exports an array
  // We need to extract the JSON array from it
  // It might be just JSON or it might be wrapped in a variable assignment
  try {
    // Try to parse as pure JSON first
    return JSON.parse(content);
  } catch (e) {
    // If it's not pure JSON, try to extract the array
    // Handle cases like: const posts = [...]; or export default [...];
    const match = content.match(/\[[\s\S]*\]/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw new Error('Could not parse posts database file');
  }
}

/**
 * Loads publishable posts from DB_posts.js file (Node.js version)
 * @param {string} postsDbPath - Path to the DB_posts.js file
 * @param {Function} readFileSync - Node.js readFileSync function
 * @param {Date} [referenceDate] - Optional reference date (defaults to today)
 * @returns {Array} Array of publishable posts, sorted by date
 */
export function loadPublishablePostsFromFile(postsDbPath, readFileSync, referenceDate = null) {
  const allPosts = loadPostsFromFile(postsDbPath, readFileSync);
  return getPublishablePosts(allPosts, referenceDate);
}

/**
 * Loads posts from DB_posts.js file (Browser version)
 * @param {string} postsDbUrl - URL to the DB_posts.js file
 * @returns {Promise<Array>} Promise that resolves to array of all posts
 */
export async function loadPostsFromUrl(postsDbUrl) {
  const response = await fetch(postsDbUrl);
  if (!response.ok) {
    throw new Error('Failed to load posts');
  }
  return await response.json();
}

/**
 * Loads publishable posts from DB_posts.js file (Browser version)
 * @param {string} postsDbUrl - URL to the DB_posts.js file
 * @param {Date} [referenceDate] - Optional reference date (defaults to today)
 * @returns {Promise<Array>} Promise that resolves to array of publishable posts, sorted by date
 */
export async function loadPublishablePostsFromUrl(postsDbUrl, referenceDate = null) {
  const allPosts = await loadPostsFromUrl(postsDbUrl);
  return getPublishablePosts(allPosts, referenceDate);
}

