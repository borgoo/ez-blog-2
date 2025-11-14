import { loadPublishablePostsFromUrl } from './utils/postsLoader.js';
import { formatDate, getRelativeTime, escapeHtml } from './utils/formatUtils.js';

const POSTS_PER_PAGE = 10;

class BlogHomepage {
  constructor() {
    this.postsContainer = document.getElementById('posts-container');
    this.allPosts = [];
    this.displayedPosts = 0;
    this.postsPerPage = POSTS_PER_PAGE;
    this.loadPosts();
  }

  async loadPosts() {
    try {
      this.allPosts = await loadPublishablePostsFromUrl('posts/data/DB_posts.js');
      this.renderPosts();
    } catch (error) {
      this.renderError(error.message);
    }
  }

  renderPosts() {
    if (this.allPosts.length === 0) {
      this.postsContainer.innerHTML = '<p class="loading">No posts available yet.</p>';
      return;
    }

    const postsToShow = this.allPosts.slice(0, this.displayedPosts + this.postsPerPage);
    this.displayedPosts = postsToShow.length;

    const postsHTML = postsToShow.map((post, index) => 
      this.createPostPreview(post, index === 0)
    ).join('');

    const hasMorePosts = this.displayedPosts < this.allPosts.length;
    const loadMoreButton = hasMorePosts ? `
      <div class="load-more">
        <button id="load-more-btn" class="load-more__button">Load more</button>
      </div>
    ` : '';

    this.postsContainer.innerHTML = postsHTML + loadMoreButton;

    if (hasMorePosts) {
      const loadMoreBtn = document.getElementById('load-more-btn');
      if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => this.renderPosts());
      }
    }
  }

  createPostPreview(post) {
    const createdDate = formatDate(post.createdDate);
    const createdRelative = getRelativeTime(post.createdDate);
    const updatedDate = post.updatedDate == null ? formatDate(post.createdDate) : formatDate(post.updatedDate);
    const updatedRelative = post.updatedDate ? getRelativeTime(post.updatedDate) : null;
    const showUpdated = post.createdDate !== post.updatedDate;

    return `
      <article class="posts__item">
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
            <span>${escapeHtml(post.authorNickname)}</span>
          </span>
        </div>
        <h2 class="post__title">
          <a href="posts/${post.id}.html" class="post__title">
            ${escapeHtml(post.title)}
          </a>
        </h2>
        <p class="post__subtitle">${escapeHtml(post.subtitle)}</p>
        <p class="post__abstract">${escapeHtml(post.abstract)}</p>
        <a href="posts/${post.id}.html" class="read-more">Read more</a>
      </article>
    `;
  }

  renderError(message) {
    this.postsContainer.innerHTML = `
      <div class="error">
        <p>Error loading posts: ${escapeHtml(message)}</p>
      </div>
    `;
  }
}


document.addEventListener('DOMContentLoaded', () => {
  new BlogHomepage();
});

