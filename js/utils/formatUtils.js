/**
 * Utility functions for formatting dates and HTML
 * Works in both browser and Node.js environments
 */

/**
 * Formats a date string to a human-readable format
 * @param {string} dateString - ISO date string (e.g., "2025-10-09")
 * @returns {string} Formatted date (e.g., "October 9, 2025")
 */
export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

/**
 * Gets a relative time string (e.g., "2 days ago", "1 month ago")
 * @param {string} dateString - ISO date string (e.g., "2025-10-09")
 * @returns {string} Relative time string
 */
export function getRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'today';
  } else if (diffDays === 1) {
    return '1 day ago';
  } else if (diffDays < 30) {
    return `${diffDays} days ago`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  } else {
    const years = Math.floor(diffDays / 365);
    return years === 1 ? '1 year ago' : `${years} years ago`;
  }
}

/**
 * Escapes HTML special characters to prevent XSS attacks
 * Works in both browser and Node.js environments
 * @param {string} text - Text to escape
 * @returns {string} Escaped HTML string
 */
export function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

