/**
 * AURA & SOLACE - Wellness Journal & Blog Scripts
 * Handles dynamic article listing, search/filter, blog details rendering, 
 * reading progress bar, table of contents scrollspy, and interactive comments.
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Check whether we are on blog.html or blog-details.html
  if (document.getElementById('blog-articles-grid')) {
    initBlogListing();
  }

  if (document.getElementById('article-content-container')) {
    initBlogDetails();
  }
});

// ==========================================
// 1. BLOG LISTING PAGE (blog.html)
// ==========================================
let currentCategory = 'all';
let currentSearch = '';

async function initBlogListing() {
  const grid = document.getElementById('blog-articles-grid');
  const countEl = document.getElementById('articles-count');
  const searchInput = document.getElementById('blog-search-input');
  const categoryPills = document.querySelectorAll('.blog-cat-pill');

  async function loadArticles() {
    if (!grid) return;
    grid.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="spinner-border text-warning" role="status">
          <span class="visually-hidden">Loading articles...</span>
        </div>
      </div>
    `;

    try {
      const articles = await API.getBlogArticles(currentCategory, currentSearch);

      if (countEl) {
        countEl.textContent = `${articles.length} Article${articles.length === 1 ? '' : 's'} Found`;
      }

      if (!articles || articles.length === 0) {
        grid.innerHTML = `
          <div class="col-12 text-center py-5">
            <div class="p-5 rounded-4 bg-light border">
              <i class="bi bi-journal-x fs-1 text-muted mb-3 d-block"></i>
              <h4 class="fw-bold text-dark">No Articles Found</h4>
              <p class="text-secondary small mb-4">No wellness notes matched your current search or category filter.</p>
              <button class="btn btn-aura-primary" onclick="resetBlogFilters()">Reset Filters</button>
            </div>
          </div>
        `;
        return;
      }

      grid.innerHTML = articles.map(article => `
        <div class="col-md-6 col-lg-4 d-flex">
          <article class="aura-blog-card w-100 d-flex flex-column">
            <div class="blog-card-media">
              <a href="blog-details.html?id=${article.id}">
                <img src="${article.image}" alt="${article.title}" class="blog-card-img" loading="lazy">
              </a>
              <span class="blog-card-badge">${article.category}</span>
            </div>
            <div class="blog-card-body d-flex flex-column flex-grow-1 p-4">
              <div class="d-flex align-items-center gap-2 text-muted small mb-2">
                <span><i class="bi bi-calendar3 me-1"></i>${article.date}</span>
                <span>•</span>
                <span><i class="bi bi-clock me-1"></i>${article.read_time}</span>
              </div>
              <h3 class="h5 fw-bold mb-3">
                <a href="blog-details.html?id=${article.id}" class="blog-title-link">
                  ${article.title}
                </a>
              </h3>
              <p class="text-secondary small mb-4 flex-grow-1 line-clamp-3">
                ${article.summary}
              </p>
              <div class="d-flex align-items-center justify-content-between pt-3 border-top mt-auto">
                <div class="d-flex align-items-center gap-2">
                  <img src="${article.author_avatar}" alt="${article.author}" class="rounded-circle" style="width: 32px; height: 32px; object-fit: cover;">
                  <span class="small fw-semibold text-dark text-truncate" style="max-width: 130px;">${article.author}</span>
                </div>
                <a href="blog-details.html?id=${article.id}" class="btn btn-sm btn-outline-warning rounded-pill px-3">
                  Read <i class="bi bi-arrow-right ms-1"></i>
                </a>
              </div>
            </div>
          </article>
        </div>
      `).join('');
    } catch (err) {
      console.error("Error loading blog articles:", err);
      grid.innerHTML = `<div class="col-12 text-center text-danger py-4">Error loading articles.</div>`;
    }
  }

  // Category Pills Click
  categoryPills.forEach(pill => {
    pill.addEventListener('click', (e) => {
      e.preventDefault();
      categoryPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentCategory = pill.getAttribute('data-category') || 'all';
      loadArticles();
    });
  });

  // Search Input Debounce & Form Submit
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        currentSearch = e.target.value.trim();
        loadArticles();
      }, 250);
    });
  }

  window.triggerBlogSearch = () => {
    if (searchInput) {
      currentSearch = searchInput.value.trim();
      loadArticles();
      const articlesSection = document.getElementById('articles-count') || document.getElementById('blog-articles-grid');
      if (articlesSection) {
        articlesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const searchForm = document.getElementById('blog-search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      window.triggerBlogSearch();
    });
  }

  window.resetBlogFilters = () => {
    currentCategory = 'all';
    currentSearch = '';
    if (searchInput) searchInput.value = '';
    categoryPills.forEach(p => {
      if (p.getAttribute('data-category') === 'all') p.classList.add('active');
      else p.classList.remove('active');
    });
    loadArticles();
  };

  // Initial load
  loadArticles();
}

// ==========================================
// 2. BLOG DETAILS PAGE (blog-details.html)
// ==========================================
async function initBlogDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const articleId = urlParams.get('id') || 1;

  try {
    const article = await API.getBlogArticleById(articleId);
    if (!article) return;

    // Set page title
    document.title = `${article.title} | Aura & Solace Wellness Journal`;

    // Populate Breadcrumbs & Meta
    const metaCat = document.getElementById('article-category-badge');
    if (metaCat) metaCat.textContent = article.category;

    const titleEl = document.getElementById('article-title');
    if (titleEl) titleEl.textContent = article.title;

    const subEl = document.getElementById('article-subtitle');
    if (subEl) subEl.textContent = article.subtitle;

    const authorNameEl = document.getElementById('article-author-name');
    if (authorNameEl) authorNameEl.textContent = article.author;

    const authorRoleEl = document.getElementById('article-author-role');
    if (authorRoleEl) authorRoleEl.textContent = article.author_role;

    const authorAvatarEl = document.getElementById('article-author-avatar');
    if (authorAvatarEl) {
      authorAvatarEl.src = article.author_avatar;
      authorAvatarEl.alt = article.author;
    }

    const dateEl = document.getElementById('article-date');
    if (dateEl) dateEl.textContent = article.date;

    const readTimeEl = document.getElementById('article-read-time');
    if (readTimeEl) readTimeEl.textContent = article.read_time;

    const heroImg = document.getElementById('article-hero-image');
    if (heroImg) {
      heroImg.src = article.image;
      heroImg.alt = article.title;
    }

    // Populate Main Content
    const contentContainer = document.getElementById('article-content-container');
    if (contentContainer) {
      contentContainer.innerHTML = article.content;
    }

    // Populate Tags
    const tagsContainer = document.getElementById('article-tags-container');
    if (tagsContainer && article.tags) {
      tagsContainer.innerHTML = article.tags.map(t => `
        <span class="badge bg-light text-secondary border px-3 py-2 rounded-pill me-2 mb-2 font-accent">
          #${t}
        </span>
      `).join('');
    }

    // Init Reading Progress Bar
    initReadingProgressBar();

    // Init Comments
    loadComments(article.id);
    initCommentForm(article.id);

    // Init Share Buttons
    initShareButtons(article);

    // Load Related Articles
    loadRelatedArticles(article.id, article.category);

  } catch (err) {
    console.error("Error initializing blog details:", err);
  }
}

// Reading Progress Bar
function initReadingProgressBar() {
  const progressBar = document.getElementById('reading-progress-bar');
  if (!progressBar) return;

  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight <= 0) return;
    const progress = (window.scrollY / totalHeight) * 100;
    progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  }, { passive: true });
}

// Social Share Handlers
function initShareButtons(article) {
  const shareUrl = encodeURIComponent(window.location.href);
  const shareTitle = encodeURIComponent(article.title);

  const twitterBtn = document.getElementById('share-twitter');
  if (twitterBtn) {
    twitterBtn.href = `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`;
  }

  const fbBtn = document.getElementById('share-facebook');
  if (fbBtn) {
    fbBtn.href = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
  }

  const liBtn = document.getElementById('share-linkedin');
  if (liBtn) {
    liBtn.href = `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`;
  }

  const copyBtn = document.getElementById('share-copy-link');
  if (copyBtn) {
    copyBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href).then(() => {
          Toast.success("Article link copied to clipboard!");
        });
      } else {
        Toast.info("URL: " + window.location.href);
      }
    });
  }
}

// Load Comments for Article
async function loadComments(articleId) {
  const listEl = document.getElementById('comments-list');
  const countEl = document.getElementById('comments-count-badge');
  if (!listEl) return;

  try {
    const comments = await API.getBlogComments(articleId);
    if (countEl) countEl.textContent = comments.length;

    if (comments.length === 0) {
      listEl.innerHTML = `
        <div class="p-4 bg-light rounded-4 text-center text-muted">
          <p class="mb-0">No comments yet. Be the first to share your reflections!</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = comments.map(c => `
      <div class="comment-item p-4 rounded-4 bg-white border mb-3 shadow-sm">
        <div class="d-flex align-items-center justify-content-between mb-2">
          <div class="d-flex align-items-center gap-2">
            <div class="comment-avatar-circle">
              ${c.avatar_initials || 'SG'}
            </div>
            <div>
              <div class="fw-bold text-dark">${c.author_name}</div>
              <div class="small text-muted">${c.created_at}</div>
            </div>
          </div>
          <span class="badge bg-light text-muted border small">Verified Community</span>
        </div>
        <p class="text-secondary mb-0 mt-2 small lh-base">
          ${c.message}
        </p>
      </div>
    `).join('');
  } catch (err) {
    console.error("Error loading comments:", err);
  }
}

// Comment Form Submission
function initCommentForm(articleId) {
  const form = document.getElementById('blog-comment-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('comment-author-name');
    const emailInput = document.getElementById('comment-author-email');
    const msgInput = document.getElementById('comment-message');

    if (!nameInput.value.trim() || !msgInput.value.trim()) {
      Toast.error("Please provide both your name and comment message.");
      return;
    }

    const commentData = {
      name: nameInput.value.trim(),
      email: emailInput ? emailInput.value.trim() : '',
      message: msgInput.value.trim()
    };

    try {
      const res = await API.addBlogComment(articleId, commentData);
      if (res.success) {
        Toast.success("Thank you! Your comment has been posted.");
        form.reset();
        loadComments(articleId);
      }
    } catch (err) {
      Toast.error("Could not post comment. Please try again.");
    }
  });
}

// Related Articles
async function loadRelatedArticles(currentId, category) {
  const container = document.getElementById('related-articles-container');
  if (!container) return;

  try {
    const all = await API.getBlogArticles();
    const filtered = all.filter(a => a.id !== currentId).slice(0, 3);

    container.innerHTML = filtered.map(a => `
      <div class="col-md-4">
        <div class="aura-blog-card h-100 d-flex flex-column">
          <div class="blog-card-media">
            <a href="blog-details.html?id=${a.id}">
              <img src="${a.image}" alt="${a.title}" class="blog-card-img" style="height: 180px;">
            </a>
            <span class="blog-card-badge">${a.category}</span>
          </div>
          <div class="p-3 d-flex flex-column flex-grow-1">
            <div class="small text-muted mb-1">${a.read_time} • ${a.date}</div>
            <h5 class="fw-bold fs-6 mb-2">
              <a href="blog-details.html?id=${a.id}" class="blog-title-link text-dark">
                ${a.title}
              </a>
            </h5>
            <a href="blog-details.html?id=${a.id}" class="mt-auto small fw-semibold text-warning">
              Read Article <i class="bi bi-arrow-right"></i>
            </a>
          </div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error("Error loading related articles:", err);
  }
}
